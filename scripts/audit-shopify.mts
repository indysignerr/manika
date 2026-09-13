/**
 * Audit des données de la boutique — MANIKA.LAB
 *
 * La synthèse de projet liste ce qui bloque la mise en vente : produits sans
 * prix, produits indisponibles, fautes de frappe, doublons de collections.
 * Ces chiffres étaient relevés à la main ; ce script les régénère à la demande
 * pour relancer les gérantes sur une liste à jour plutôt que sur un souvenir.
 *
 * Lecture seule (jeton Storefront) : il ne corrige rien, il constate.
 *
 *   npm run audit:shopify
 *
 * Sortie : rapport console + scripts/out/audit-shopify.md (envoyable tel quel).
 */
import { writeFileSync } from "node:fs";
import { fetchAllProducts, loadEnv, storefront, storeDomain } from "./lib/shopify.mts";
import { MARQUES } from "./lib/referentiel.mts";

type Produit = {
  handle: string;
  title: string;
  vendor: string;
  availableForSale: boolean;
  featuredImage: { url: string } | null;
  priceRange: { minVariantPrice: { amount: string } };
};

type Collection = { handle: string; title: string; products: { nodes: { id: string }[] } };

/**
 * Fautes relevées dans le catalogue. Le motif sert à retrouver les produits
 * concernés, la correction à dire aux gérantes quoi taper.
 */
const FAUTES: { motif: RegExp; correction: string }[] = [
  { motif: /od[yi]dant/i, correction: "Oxydant" },
  { motif: /pallett/i, correction: "Palettes" },
];

/**
 * Graphies toutes deux défendables : on ne signale que si les DEUX coexistent
 * dans le catalogue — sinon on enverrait corriger 34 fiches écrites
 * « shampoing », qui est correct, au nom d'une préférence.
 */
const ORTHOGRAPHES_CONCURRENTES: [RegExp, RegExp][] = [
  [/shampoing/i, /shampooing/i],
  [/ammoniaque/i, /amoniaque/i],
  [/oxydant/i, /oxidant/i],
];

/** Les colorations sont nommées de quatre façons différentes — à unifier. */
const NOMMAGE_COLORATION = /^(teinture|couleur|pigment|colorant|coloration)\b/i;

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

/** Collections dont le handle ne diffère que par un suffixe numérique Shopify. */
function doublonsDeCollections(collections: Collection[]) {
  const parBase = new Map<string, Collection[]>();
  for (const c of collections) {
    const base = c.handle.replace(/-\d+$/, "");
    parBase.set(base, [...(parBase.get(base) ?? []), c]);
  }
  return [...parBase.entries()].filter(([, liste]) => liste.length > 1);
}

async function main() {
  loadEnv();

  const produits = await fetchAllProducts<Produit>(
    `handle title vendor availableForSale
     featuredImage { url }
     priceRange { minVariantPrice { amount } }`
  );

  const { collections } = await storefront<{ collections: { nodes: Collection[] } }>(
    `{ collections(first: 250) { nodes { handle title products(first: 1) { nodes { id } } } } }`
  );

  const n = produits.length;
  const sansPrix = produits.filter((p) => Number(p.priceRange.minVariantPrice.amount) === 0);
  const indisponibles = produits.filter((p) => !p.availableForSale);
  const sansImage = produits.filter((p) => !p.featuredImage);
  const vendorsInconnus = produits.filter((p) => !(p.vendor?.toUpperCase() in MARQUES));
  const suzishen = produits.filter((p) => /suzishen/i.test(p.vendor) || /suzishen/i.test(p.title));

  const fautes = FAUTES.map((f) => ({ ...f, produits: produits.filter((p) => f.motif.test(p.title)) })).filter(
    (f) => f.produits.length
  );

  const incoherences = ORTHOGRAPHES_CONCURRENTES.map(([a, b]) => ({
    a: produits.filter((p) => a.test(p.title)),
    b: produits.filter((p) => b.test(p.title)),
    motifs: [a, b] as const,
  })).filter((x) => x.a.length && x.b.length);

  const nommages = new Map<string, number>();
  for (const p of produits) {
    const m = p.title.match(NOMMAGE_COLORATION);
    if (m) nommages.set(m[1].toLowerCase(), (nommages.get(m[1].toLowerCase()) ?? 0) + 1);
  }

  const doublons = doublonsDeCollections(collections.nodes);
  const vides = collections.nodes.filter((c) => !c.products.nodes.length);

  /* ── Console ── */
  const ligne = (libelle: string, nb: number, sur = n) =>
    `${libelle.padEnd(34)} ${String(nb).padStart(4)}/${sur}  ${"█".repeat(Math.round(pct(nb, sur) / 5)).padEnd(20, "·")} ${pct(nb, sur)}%`;

  console.log(`\nBoutique ${storeDomain()} — ${n} produits, ${collections.nodes.length} collections\n`);
  console.log(ligne("Sans prix (0 €)", sansPrix.length));
  console.log(ligne("Indisponibles à la vente", indisponibles.length));
  console.log(ligne("Sans image", sansImage.length));
  console.log(ligne("Marque hors référentiel", vendorsInconnus.length));
  console.log(`\nCollections en double : ${doublons.length} · collections vides : ${vides.length}`);
  if (fautes.length) {
    console.log("\nFautes de frappe :");
    for (const f of fautes) console.log(`   · ${f.produits.length} produit(s) → « ${f.correction} »`);
  }
  for (const i of incoherences) {
    console.log(
      `\nDeux graphies coexistent : ${i.motifs[0].source} (${i.a.length}) / ${i.motifs[1].source} (${i.b.length})`
    );
  }
  if (nommages.size > 1) {
    console.log(
      `\nNommage des colorations, ${nommages.size} variantes : ` +
        [...nommages].map(([mot, nb]) => `${mot} (${nb})`).join(", ")
    );
  }

  /* ── Rapport envoyable ── */
  const liste = (items: { handle: string; title: string }[], max = 40) =>
    items.slice(0, max).map((p) => `- ${p.title} — \`${p.handle}\``).join("\n") +
    (items.length > max ? `\n- … et ${items.length - max} autres` : "");

  const md = `# Audit du catalogue — ${new Date().toLocaleDateString("fr-FR")}

Boutique \`${storeDomain()}\` · ${n} produits · ${collections.nodes.length} collections.
Relevé automatique, en lecture seule. Chaque point ci-dessous se corrige dans l'admin Shopify.

## 1. Ce qui empêche de vendre

| Point | Produits | Part du catalogue |
|---|---:|---:|
| Sans prix (0 €) | ${sansPrix.length} | ${pct(sansPrix.length, n)} % |
| Indisponibles à la vente | ${indisponibles.length} | ${pct(indisponibles.length, n)} % |
| Sans image | ${sansImage.length} | ${pct(sansImage.length, n)} % |

Un produit sans prix **ou** indisponible ne peut pas être acheté, même si sa fiche est parfaite.

### Produits sans prix
${sansPrix.length ? liste(sansPrix) : "_Aucun._"}

### Produits indisponibles
${indisponibles.length ? liste(indisponibles) : "_Aucun._"}

### Produits sans image
${sansImage.length ? liste(sansImage) : "_Aucun._"}

## 2. Erreurs de saisie

${
  fautes.length
    ? fautes
        .map(
          (f) => `**À écrire « ${f.correction} »** — ${f.produits.length} produit(s) :\n${liste(f.produits, 10)}`
        )
        .join("\n\n")
    : "_Aucune faute connue détectée._"
}

${
  incoherences.length
    ? incoherences
        .map(
          (i) =>
            `**Deux graphies coexistent** : \`${i.motifs[0].source}\` (${i.a.length} produits) et ` +
            `\`${i.motifs[1].source}\` (${i.b.length} produits) — à unifier.`
        )
        .join("\n\n")
    : ""
}

${
  nommages.size > 1
    ? `**Nommage des colorations** — ${nommages.size} formulations coexistent : ` +
      [...nommages].map(([mot, nb]) => `${mot} (${nb})`).join(", ") +
      ". À unifier sur un seul mot, sinon les rayons et la recherche se dispersent."
    : ""
}

## 3. Collections

${
  doublons.length
    ? doublons
        .map(([base, liste]) => `- **${base}** : ${liste.map((c) => `\`${c.handle}\``).join(" + ")} — à fusionner`)
        .join("\n")
    : "_Aucun doublon._"
}

${vides.length ? `Collections vides (rayon affiché sans produit) :\n${vides.map((c) => `- \`${c.handle}\``).join("\n")}` : ""}

## 4. Marques

${
  vendorsInconnus.length
    ? `${vendorsInconnus.length} produit(s) portent une marque absente du référentiel :\n` +
      liste(vendorsInconnus, 20)
    : "_Toutes les marques du catalogue sont au référentiel._"
}

${
  suzishen.length
    ? `⚠️ **${suzishen.length} produit(s) portent encore « Suzishen »** — ce nom ne doit plus apparaître publiquement, il est réattribué à Manika.\n${liste(suzishen, 10)}`
    : ""
}
`;

  const out = "scripts/out/audit-shopify.md";
  writeFileSync(out, md, "utf8");
  console.log(`\n✓ Rapport écrit : ${out}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
