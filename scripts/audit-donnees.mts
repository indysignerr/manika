/**
 * Audit qualité des données Shopify — ce qui bloque la mise en vente.
 *
 *   npx tsx scripts/audit-donnees.mts
 *
 * Lecture seule. Produit une liste d'actions précises, destinée aux gérantes :
 * ce qu'il manque, où, et combien de références sont concernées.
 */
import { admin } from "./shopify-admin.mts";
import { loadEnv } from "./lib/shopify.mts";

loadEnv();

type V = { id: string; title: string; price: string; availableForSale: boolean; sku: string | null };
type P = {
  id: string; handle: string; title: string; status: string; vendor: string;
  productType: string; publishedAt: string | null;
  featuredImage: { url: string } | null;
  collections: { nodes: { handle: string }[] };
  variants: { nodes: V[] };
  metafields: { nodes: { key: string; value: string }[] };
};

const CHAMPS = ["marque","univers","type","gamme","besoin","format","jetable","volume_oxydant","ammoniaque","reflets","hauteurs_ton"];

async function tout(): Promise<P[]> {
  const out: P[] = [];
  let apres: string | null = null;
  for (;;) {
    const d: any = await admin(
      /* GraphQL */ `query T($apres: String) {
        products(first: 100, after: $apres) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id handle title status vendor productType publishedAt
            featuredImage { url }
            collections(first: 20) { nodes { handle } }
            variants(first: 100) { nodes { id title price availableForSale sku } }
            # L'API Admin expose les métachamps en CONNEXION (contrairement au
            # Storefront, qui prend une liste d'identifiants).
            metafields(first: 30, namespace: "manika") { nodes { key value } }
          }
        }
      }`,
      { apres }
    );
    out.push(...d.products.nodes);
    if (!d.products.pageInfo.hasNextPage) break;
    apres = d.products.pageInfo.endCursor;
  }
  return out;
}

const mf = (p: P, cle: string) => p.metafields.nodes.find((m) => m.key === cle)?.value ?? null;
const titre = (t: string) => `\n${t}\n${"─".repeat(t.length)}`;

async function main() {
  const ps = await tout();
  const publies = ps.filter((p) => p.publishedAt);

  console.log(`CATALOGUE — ${ps.length} produits (${publies.length} publiés, ${ps.length - publies.length} en brouillon)`);

  /* ── Prix ── */
  console.log(titre("1. PRIX — bloquant pour la vente"));
  const sansPrix = publies.filter((p) => p.variants.nodes.every((v) => Number(v.price) === 0));
  const partiels = publies.filter((p) => p.variants.nodes.some((v) => Number(v.price) === 0) && p.variants.nodes.some((v) => Number(v.price) > 0));
  console.log(`  ${sansPrix.length} produits entièrement à 0 €`);
  console.log(`  ${partiels.length} produits avec CERTAINES variantes à 0 € (le plus traître : la fiche semble tarifée)`);
  for (const p of partiels.slice(0, 8)) {
    const n = p.variants.nodes.filter((v) => Number(v.price) === 0).length;
    console.log(`     · ${p.title.slice(0, 52).padEnd(54)} ${n}/${p.variants.nodes.length} variantes à 0 €`);
  }

  /* ── Disponibilité ── */
  console.log(titre("2. DISPONIBILITÉ"));
  const epuises = publies.filter((p) => p.variants.nodes.every((v) => !v.availableForSale));
  console.log(`  ${epuises.length} produits dont AUCUNE variante n'est disponible`);
  console.log(`  → ils s'affichent sur le site mais ne peuvent pas être commandés`);

  /* ── Métachamps ── */
  console.log(titre("3. CLASSEMENT — pilote le menu et les filtres"));
  for (const c of CHAMPS) {
    const n = publies.filter((p) => mf(p, c)).length;
    const pct = Math.round((n / publies.length) * 100);
    const alerte = c === "besoin" || c === "gamme" ? "  ⚠ pages de marque incomplètes sans lui" : "";
    console.log(`  ${c.padEnd(15)} ${String(n).padStart(3)}/${publies.length}  ${String(pct).padStart(3)} %${alerte}`);
  }
  const sansType = publies.filter((p) => !mf(p, "type"));
  if (sansType.length) {
    console.log(`\n  ${sansType.length} produits SANS type → absents de tous les rayons :`);
    for (const p of sansType.slice(0, 12)) console.log(`     · ${p.title.slice(0, 60)}`);
  }

  /* ── Images ── */
  console.log(titre("4. IMAGES"));
  const sansImage = publies.filter((p) => !p.featuredImage);
  console.log(`  ${sansImage.length} produits sans aucune image`);
  for (const p of sansImage.slice(0, 10)) console.log(`     · ${p.title.slice(0, 60)}`);

  /* ── Fautes de saisie ── */
  console.log(titre("5. FAUTES DE SAISIE dans les titres"));
  const fautes: Record<string, RegExp> = {
    "Odydant (pour Oxydant)": /odydant/i,
    "Pallette (deux L)": /pallette/i,
    "ammonique (pour ammoniaque)": /ammonique/i,
    "semi-permamente": /permamente/i,
    "Espaces avant ponctuation": / [,;:]/,
    "Double espace": /  /,
  };
  for (const [nom, re] of Object.entries(fautes)) {
    const tr = ps.filter((p) => re.test(p.title));
    if (!tr.length) continue;
    console.log(`  ${nom} — ${tr.length}`);
    for (const p of tr.slice(0, 5)) console.log(`     · ${p.title.slice(0, 62)}`);
  }

  /* ── Collections ── */
  console.log(titre("6. COLLECTIONS"));
  const orphelins = publies.filter((p) => !p.collections.nodes.length);
  console.log(`  ${orphelins.length} produits dans AUCUNE collection`);
  for (const p of orphelins.slice(0, 8)) console.log(`     · ${p.title.slice(0, 60)}`);

  /* ── SKU ── */
  console.log(titre("7. RÉFÉRENCES (SKU)"));
  const variantes = publies.flatMap((p) => p.variants.nodes);
  const sansSku = variantes.filter((v) => !v.sku).length;
  console.log(`  ${sansSku}/${variantes.length} variantes sans référence`);
  console.log(`  → la « commande rapide » cherche par nom et par teinte, faute de SKU`);

  console.log(titre("À FAIRE, PAR ORDRE D'URGENCE"));
  console.log(`  1. Saisir les prix — ${sansPrix.length + partiels.length} produits concernés, rien n'est vendable sans eux`);
  console.log(`  2. Remettre en stock ou dépublier les ${epuises.length} produits épuisés`);
  console.log(`  3. Renseigner « besoin » et « gamme » — les pages de marque restent incomplètes`);
  if (sansType.length) console.log(`  4. Classer les ${sansType.length} produits sans type, invisibles dans les rayons`);
  if (sansImage.length) console.log(`  5. Ajouter une image aux ${sansImage.length} produits qui n'en ont pas`);
}

main().catch((e) => { console.error(e); process.exit(1); });
