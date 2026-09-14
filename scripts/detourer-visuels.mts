/**
 * Détoure les visuels produit et les renvoie dans Shopify.
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
 * RÉVERSIBLE : on AJOUTE l'image nettoyée et on la place en premier.
 * L'originale reste attachée au produit — revenir en arrière, c'est remettre
 * l'ancienne en tête ou supprimer la nouvelle.
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

type Produit = { id: string; handle: string; title: string; media: { id: string; image: { url: string } | null }[] };

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
            media(first: 10) { nodes { ... on MediaImage { id image { url } } } }
          }
        }
      }`,
      { apres }
    );
    for (const n of d.products.nodes) out.push({ ...n, media: n.media.nodes.filter((m: any) => m?.image) });
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

async function placerEnTete(produitId: string, mediaId: string) {
  const d: any = await admin(
    /* GraphQL */ `mutation Ordre($id: ID!, $moves: [MoveInput!]!) {
      productReorderMedia(id: $id, moves: $moves) { userErrors { message } }
    }`,
    { id: produitId, moves: [{ id: mediaId, newPosition: "0" }] }
  );
  const err = d.productReorderMedia.userErrors?.[0];
  if (err) throw new Error(`productReorderMedia: ${err.message}`);
}

async function main() {
  mkdirSync(DOSSIER, { recursive: true });
  const liste = (await produits()).filter((p) => p.media.length).slice(0, LIMITE);
  console.log(`${liste.length} produits avec visuel.${REEL ? "" : "  SIMULATION (ajouter --reel pour envoyer)"}\n`);

  let ok = 0, refus = 0, erreurs = 0, deja = 0;

  for (const p of liste) {
    const nom = `${p.handle}-detoure.png`;

    // Déjà traité : on ne réenvoie pas, sinon on empile les doublons à chaque
    // relance du script.
    if (p.media.some((m) => m.image?.url.includes("-detoure"))) {
      deja++;
      continue;
    }

    const src = p.media[0].image!.url;
    try {
      const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
      const { png, partEffacee, fond } = await detourer(buf);

      if (partEffacee < PLANCHER || partEffacee > PLAFOND) {
        refus++;
        console.log(`  ~ ${p.title.slice(0, 46).padEnd(48)} ignoré — ${Math.round(partEffacee * 100)} % effacé (fond rgb(${fond}))`);
        continue;
      }

      writeFileSync(`${DOSSIER}/${nom}`, png);
      if (REEL) {
        const url = await televerser(png, nom);
        const mediaId = await attacher(p.id, url, p.title);
        await placerEnTete(p.id, mediaId);
      }
      ok++;
      console.log(`  ✓ ${p.title.slice(0, 46).padEnd(48)} ${Math.round(partEffacee * 100)} % effacé${REEL ? " — envoyé" : ""}`);
    } catch (e) {
      erreurs++;
      console.log(`  ✗ ${p.title.slice(0, 46).padEnd(48)} ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log(`\n${ok} traité(s), ${deja} déjà fait(s), ${refus} ignoré(s), ${erreurs} en erreur.`);
  console.log(`PNG écrits dans ${DOSSIER}/`);
  if (!REEL) console.log("Rien n'a été envoyé à Shopify — relancer avec --reel.");
}

main().catch((e) => { console.error(e); process.exit(1); });
