/**
 * Supprime les images détourées en double.
 *
 *   npx tsx scripts/dedoublonner-visuels.mts           # simulation
 *   npx tsx scripts/dedoublonner-visuels.mts --reel    # supprime
 *
 * Pourquoi elles existent
 * ───────────────────────
 * detourer-visuels.mts a d'abord été lancé sur la seule image principale,
 * puis relancé sur TOUTES les images. Son garde-fou ignore les fichiers déjà
 * nommés « -detoure », mais pas les ORIGINAUX dont ils proviennent : au second
 * passage il a donc re-détouré les mêmes originaux, créant un doublon par
 * produit déjà traité.
 *
 * Prudence
 * ────────
 * On ne supprime que des images dont l'empreinte SHA-256 est IDENTIQUE, jamais
 * des images seulement de même taille. Et jamais une image à laquelle une
 * variante est rattachée.
 */
import { createHash } from "node:crypto";
import { admin } from "./shopify-admin.mts";
import { loadEnv } from "./lib/shopify.mts";

loadEnv();
const REEL = process.argv.includes("--reel");

type Media = { id: string; image: { url: string; width: number; height: number } | null };
type Produit = { id: string; title: string; media: Media[]; variants: { image: { url: string } | null }[] };

async function produits(): Promise<Produit[]> {
  const out: Produit[] = [];
  let apres: string | null = null;
  for (;;) {
    const d: any = await admin(
      /* GraphQL */ `query P($apres: String) {
        products(first: 100, after: $apres) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id title
            media(first: 100) { nodes { ... on MediaImage { id image { url width height } } } }
            variants(first: 100) { nodes { image { url } } }
          }
        }
      }`,
      { apres }
    );
    for (const n of d.products.nodes)
      out.push({ ...n, media: n.media.nodes.filter((m: any) => m?.image), variants: n.variants.nodes });
    if (!d.products.pageInfo.hasNextPage) break;
    apres = d.products.pageInfo.endCursor;
  }
  return out;
}

const empreinte = async (url: string) =>
  createHash("sha256").update(Buffer.from(await (await fetch(url)).arrayBuffer())).digest("hex");

async function supprimer(produitId: string, mediaIds: string[]) {
  const d: any = await admin(
    /* GraphQL */ `mutation Suppr($productId: ID!, $mediaIds: [ID!]!) {
      productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
        deletedMediaIds
        mediaUserErrors { message }
      }
    }`,
    { productId: produitId, mediaIds }
  );
  const err = d.productDeleteMedia.mediaUserErrors?.[0];
  if (err) throw new Error(err.message);
  return d.productDeleteMedia.deletedMediaIds?.length ?? 0;
}

async function main() {
  const liste = await produits();
  console.log(`${liste.length} produits.${REEL ? "" : "  SIMULATION (ajouter --reel pour supprimer)"}\n`);

  let supprimees = 0, produitsTouches = 0, erreurs = 0;

  for (const p of liste) {
    const net = p.media.filter((m) => m.image!.url.includes("-detoure"));
    if (net.length < 2) continue;

    // Une image rattachée à une variante ne doit jamais disparaître.
    const urlsVariantes = new Set(p.variants.map((v) => v.image?.url).filter(Boolean) as string[]);

    const parEmpreinte = new Map<string, Media[]>();
    for (const m of net) {
      const h = await empreinte(m.image!.url);
      (parEmpreinte.get(h) ?? parEmpreinte.set(h, []).get(h)!).push(m);
    }

    const aSupprimer: string[] = [];
    for (const groupe of parEmpreinte.values()) {
      if (groupe.length < 2) continue;
      // On garde la première (celle qui est en tête de galerie), sauf si une
      // variante pointe sur une autre — alors c'est celle-là qu'on garde.
      const garde = groupe.find((m) => urlsVariantes.has(m.image!.url)) ?? groupe[0];
      for (const m of groupe) if (m.id !== garde.id && !urlsVariantes.has(m.image!.url)) aSupprimer.push(m.id);
    }

    if (!aSupprimer.length) continue;
    produitsTouches++;
    supprimees += aSupprimer.length;
    console.log(`  ${REEL ? "✓" : "·"} ${p.title.slice(0, 50).padEnd(52)} ${aSupprimer.length} doublon(s)`);

    if (REEL) {
      try {
        await supprimer(p.id, aSupprimer);
      } catch (e) {
        erreurs++;
        console.log(`    ✗ ${e instanceof Error ? e.message : e}`);
      }
    }
  }

  console.log(`\n${supprimees} doublon(s) ${REEL ? "supprimé(s)" : "à supprimer"} sur ${produitsTouches} produit(s), ${erreurs} erreur(s).`);
}

main().catch((e) => { console.error(e); process.exit(1); });
