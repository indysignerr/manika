/**
 * Détoure TOUS les visuels produit et les renvoie dans Shopify.
 *
 *   npx tsx scripts/detourer-visuels.mts              # simulation, écrit les PNG en local
 *   npx tsx scripts/detourer-visuels.mts --reel       # envoie dans Shopify
 *   npx tsx scripts/detourer-visuels.mts --reel -n 3  # sur les 3 premiers seulement
 *
 * Pourquoi
 * ────────
 * Les visuels fournisseurs sont des captures posées sur un aplat presque
 * blanc, mais d'une teinte différente à chaque fois. Sur l'ivoire des cartes,
 * chaque vignette forme donc un rectangle d'un blanc légèrement distinct :
 * l'effet patchwork relevé à l'audit du 13/09.
 *
 * Toutes les images de chaque produit sont traitées, pas seulement la
 * principale — et les photos de VARIANTES sont réaffectées à leur version
 * nettoyée, sans quoi les pastilles du nuancier garderaient leur fond blanc.
 *
 * RÉVERSIBLE : on AJOUTE les images nettoyées et on les place en tête.
 * Les originales restent attachées au produit — revenir en arrière, c'est
 * remettre les anciennes en tête ou supprimer les nouvelles.
 *
 * Sécurité : un détourage qui efface moins de 20 % ou plus de 95 % de l'image
 * est refusé — dans le premier cas le fond n'a pas été trouvé, dans le second
 * le produit lui-même a été mangé.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { admin } from "./shopify-admin.mts";
import { loadEnv } from "./lib/shopify.mts";
// @ts-expect-error — module JS sans déclarations
import { detourer } from "./lib/detourer.mjs";

loadEnv();

const REEL = process.argv.includes("--reel");
const iN = process.argv.indexOf("-n");
const LIMITE = iN !== -1 ? Number(process.argv[iN + 1]) : Infinity;
const DOSSIER = "scripts/out/visuels";

const PLANCHER = 0.2;
const PLAFOND = 0.95;

type Media = { id: string; image: { url: string; width: number; height: number } | null };
type Variante = { id: string; image: { url: string } | null };
type Produit = { id: string; handle: string; title: string; media: Media[]; variants: Variante[] };

async function produits(): Promise<Produit[]> {
  const out: Produit[] = [];
  let apres: string | null = null;
  for (;;) {
    const d: any = await admin(
      /* GraphQL */ `query P($apres: String) {
        products(first: 100, after: $apres) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id handle title
            media(first: 100) { nodes { ... on MediaImage { id image { url width height } } } }
            variants(first: 100) { nodes { id image { url } } }
          }
        }
      }`,
      { apres }
    );
    for (const n of d.products.nodes)
      out.push({
        ...n,
        media: n.media.nodes.filter((m: any) => m?.image),
        variants: n.variants.nodes,
      });
    if (!d.products.pageInfo.hasNextPage) break;
    apres = d.products.pageInfo.endCursor;
  }
  return out;
}

/** Dépose le fichier sur le stockage temporaire Shopify et renvoie son URL. */
async function televerser(png: Buffer, nom: string): Promise<string> {
  const d: any = await admin(
    /* GraphQL */ `mutation Staged($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { message }
      }
    }`,
    { input: [{ filename: nom, mimeType: "image/png", httpMethod: "POST", resource: "IMAGE" }] }
  );
  const err = d.stagedUploadsCreate.userErrors?.[0];
  if (err) throw new Error(`stagedUploadsCreate: ${err.message}`);
  const cible = d.stagedUploadsCreate.stagedTargets[0];

  const form = new FormData();
  for (const p of cible.parameters) form.append(p.name, p.value);
  form.append("file", new Blob([new Uint8Array(png)], { type: "image/png" }), nom);
  const rep = await fetch(cible.url, { method: "POST", body: form });
  if (!rep.ok) throw new Error(`dépôt ${rep.status}: ${(await rep.text()).slice(0, 200)}`);

  return cible.resourceUrl;
}

/** Attache l'image au produit et la place en première position. */
async function attacher(produitId: string, url: string, alt: string) {
  const d: any = await admin(
    /* GraphQL */ `mutation Ajout($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { ... on MediaImage { id } }
        mediaUserErrors { message }
      }
    }`,
    { productId: produitId, media: [{ originalSource: url, mediaContentType: "IMAGE", alt }] }
  );
  const err = d.productCreateMedia.mediaUserErrors?.[0];
  if (err) throw new Error(`productCreateMedia: ${err.message}`);
  return d.productCreateMedia.media[0]?.id as string;
}

/**
 * Rebranche une variante sur son image nettoyée.
 *
 * Une variante n'affiche qu'un média : ajouter le nouveau ne suffit pas, il
 * faut détacher l'ancien. L'image d'origine reste attachée au PRODUIT, elle
 * n'est que détachée de la variante.
 */
/**
 * Shopify traite les images de façon asynchrone et refuse de rattacher un
 * média « non prêt » à une variante. On patiente donc jusqu'au statut READY.
 */
async function attendrePret(mediaId: string, essais = 20) {
  for (let i = 0; i < essais; i++) {
    const d: any = await admin(
      /* GraphQL */ `query Etat($ids: [ID!]!) { nodes(ids: $ids) { ... on MediaImage { status } } }`,
      { ids: [mediaId] }
    );
    const etat = d.nodes?.[0]?.status;
    if (etat === "READY") return true;
    if (etat === "FAILED") throw new Error("Shopify n'a pas pu traiter l'image");
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("image encore en traitement après 30 s");
}

async function reaffecterVariante(produitId: string, varianteId: string, ancienMediaId: string, nouveauMediaId: string) {
  await admin(
    /* GraphQL */ `mutation Detacher($productId: ID!, $variantMedia: [ProductVariantDetachMediaInput!]!) {
      productVariantDetachMedia(productId: $productId, variantMedia: $variantMedia) {
        userErrors { message }
      }
    }`,
    { productId: produitId, variantMedia: [{ variantId: varianteId, mediaIds: [ancienMediaId] }] }
  );
  const d: any = await admin(
    /* GraphQL */ `mutation Attacher($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
      productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) {
        userErrors { message }
      }
    }`,
    { productId: produitId, variantMedia: [{ variantId: varianteId, mediaIds: [nouveauMediaId] }] }
  );
  const err = d.productVariantAppendMedia.userErrors?.[0];
  if (err) throw new Error(`variante: ${err.message}`);
}

async function placerEnTete(produitId: string, mediaIds: string[]) {
  const d: any = await admin(
    /* GraphQL */ `mutation Ordre($id: ID!, $moves: [MoveInput!]!) {
      productReorderMedia(id: $id, moves: $moves) { userErrors { message } }
    }`,
    { id: produitId, moves: mediaIds.map((id, i) => ({ id, newPosition: String(i) })) }
  );
  const err = d.productReorderMedia.userErrors?.[0];
  if (err) throw new Error(`productReorderMedia: ${err.message}`);
}

async function main() {
  mkdirSync(DOSSIER, { recursive: true });
  const liste = (await produits()).filter((p) => p.media.length).slice(0, LIMITE);
  console.log(`${liste.length} produits avec visuel.${REEL ? "" : "  SIMULATION (ajouter --reel pour envoyer)"}\n`);

  let ok = 0, refus = 0, erreurs = 0, deja = 0, variantes = 0;

  for (const p of liste) {
    /**
     * Le nom du fichier nettoyé DÉRIVE de celui de l'original — c'est ce qui
     * rend le script réellement idempotent.
     *
     * ⚠️ Une première version nommait d'après le handle du produit : à la
     *    relance, elle ne reconnaissait pas qu'un original avait déjà sa
     *    version nettoyée et la recréait. 232 doublons à supprimer.
     */
    const souche = (url: string) =>
      (url.split("/").pop() ?? "").split("?")[0].replace(/\.[a-z0-9]+$/i, "");

    const nettoyees = p.media.filter((m) => m.image?.url.includes("-detoure"));
    const parNom = new Set(nettoyees.map((m) => souche(m.image!.url).replace(/-detoure$/, "")));

    /**
     * Reconnaissance de repli par DIMENSIONS : le détourage conserve la taille
     * de l'image. Les premières séries ont été envoyées sous un autre nom —
     * sans ce repli, une relance les recréerait toutes en double.
     */
    const parTaille = new Set(nettoyees.map((m) => `${m.image!.width}x${m.image!.height}`));

    const aFaire = p.media.filter(
      (m) =>
        m.image &&
        !m.image.url.includes("-detoure") &&
        !parNom.has(souche(m.image.url)) &&
        !parTaille.has(`${m.image.width}x${m.image.height}`)
    );

    if (!aFaire.length) {
      deja += nettoyees.length;
      continue;
    }

    /** ancien media id → nouveau, pour rebrancher les variantes ensuite. */
    const correspondance = new Map<string, string>();
    const nouveaux: string[] = [];

    for (const m of aFaire) {
      const nom = `${souche(m.image!.url)}-detoure.png`;
      try {
        const buf = Buffer.from(await (await fetch(m.image!.url)).arrayBuffer());
        const { png, partEffacee, fond } = await detourer(buf);

        if (partEffacee < PLANCHER || partEffacee > PLAFOND) {
          refus++;
          console.log(`  ~ ${p.title.slice(0, 42).padEnd(44)} ${nom.slice(-22).padEnd(24)} ${Math.round(partEffacee * 100)} % — fond rgb(${fond})`);
          continue;
        }

        writeFileSync(`${DOSSIER}/${nom}`, png);
        if (REEL) {
          const url = await televerser(png, nom);
          const nouveauId = await attacher(p.id, url, p.title);
          correspondance.set(m.id, nouveauId);
          nouveaux.push(nouveauId);
        }
        ok++;
      } catch (e) {
        erreurs++;
        console.log(`  ✗ ${p.title.slice(0, 42).padEnd(44)} ${e instanceof Error ? e.message : e}`);
      }
    }

    if (REEL && nouveaux.length) {
      try {
        await placerEnTete(p.id, nouveaux);

        // Les variantes qui pointaient sur une image nettoyée la reprennent.
        for (const v of p.variants) {
          if (!v.image) continue;
          const ancien = aFaire.find((m) => m.image!.url === v.image!.url);
          const nouveauId = ancien && correspondance.get(ancien.id);
          if (!ancien || !nouveauId) continue;
          await attendrePret(nouveauId);
          await reaffecterVariante(p.id, v.id, ancien.id, nouveauId);
          variantes++;
        }
      } catch (e) {
        erreurs++;
        console.log(`  ✗ ${p.title.slice(0, 42).padEnd(44)} réordonnancement — ${e instanceof Error ? e.message : e}`);
      }
    }

    console.log(`  ✓ ${p.title.slice(0, 42).padEnd(44)} ${aFaire.length} image(s)${REEL ? " — envoyées" : ""}`);
  }

  console.log(`\n${ok} image(s) traitée(s), ${deja} déjà faite(s), ${refus} ignorée(s), ${erreurs} en erreur.`);
  if (variantes) console.log(`${variantes} variante(s) rebranchée(s) sur leur image nettoyée.`);
  console.log(`PNG écrits dans ${DOSSIER}/`);
  if (!REEL) console.log("Rien n'a été envoyé à Shopify — relancer avec --reel.");
}

main().catch((e) => { console.error(e); process.exit(1); });
