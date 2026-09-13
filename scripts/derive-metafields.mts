/**
 * Pré-remplissage des métafields produit — MANIKA.LAB
 *
 * L'arborescence validée repose sur 8 champs structurés par produit. Aucun
 * n'existe dans la boutique (0 tag, 0 métafield, 0 SKU) : ce script déduit
 * tout ce qui est déductible du titre, du vendor et des variantes, pour que
 * la saisie manuelle se limite à ce qui ne l'est pas (BESOIN et GAMME).
 *
 * Sortie : un rapport de couverture + un CSV importable dans Shopify
 * (Produits → Importer), qui ne demande AUCUN jeton Admin.
 *
 *   npx tsx scripts/derive-metafields.mts
 */
import { parseTeinte } from "../src/lib/nuancier";
import { writeFileSync } from "node:fs";

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

/* ── Référentiels issus du document d'arborescence ────────────────── */

/** Orthographes Shopify → marque canonique. À arbitrer avec la cliente. */
const MARQUES: Record<string, string> = {
  TASSEL: "Tassel",
  BIOPYGMA: "Biopygma",
  "MANIKA LAB": "Manika",
  DOUSSE: "Dousse",
  EUROSTIL: "Eurostil",
  NEUTHROSUN: "Neuthrosun",
  VASSO: "Vasso",
  RAGNAR: "Ragnar",
  "CAPTAIN COOK": "Captain Cook",
  // Suzishen ne doit plus apparaître publiquement : ses 3 produits sont
  // réattribués à la marque maison.
  SUZISHEN: "Manika",
  "NUTRI HAIR": "Nutri Hair",
};

const UNIVERS = {
  COLORATION: "Coloration & Technique",
  SOINS: "Soins capillaires",
  ACCESSOIRES: "Accessoires coloration",
  MATERIEL: "Matériel & consommables",
  // Absent du document d'arborescence, mais 27 produits en dépendent.
  COIFFAGE: "Coiffage",
} as const;

/**
 * TYPE de produit → univers + motifs de détection.
 * ⚠️ L'ORDRE COMPTE : « après-shampooing » doit être testé avant
 *    « shampooing », « poudre décolorante » avant « poudre ».
 */
const TYPES: { type: string; univers: string; rx: RegExp }[] = [
  { type: "Après-shampooing", univers: UNIVERS.SOINS, rx: /apr[eè]s[-\s]?shamp|conditionn|d[ée]m[eê]l/i },
  { type: "Décoloration", univers: UNIVERS.COLORATION, rx: /d[ée]color|blondiss|d[ée]capage|poudre\s+d[ée]col/i },
  { type: "Décapant couleur", univers: UNIVERS.COLORATION, rx: /d[ée]capant|color\s*reset|effaceur/i },
  { type: "Nettoyant coloration", univers: UNIVERS.COLORATION, rx: /nettoyant|t[aâ]che/i },
  { type: "Protecteur coloration", univers: UNIVERS.COLORATION, rx: /protect/i },
  { type: "Retouche racines", univers: UNIVERS.COLORATION, rx: /retouche|racine/i },
  { type: "Oxydant", univers: UNIVERS.COLORATION, rx: /ox[yi]dant|oxyg[ée]nant|o[dx]ydant|\bvol\b/i },
  { type: "Coloration", univers: UNIVERS.COLORATION, rx: /colorant|coloration|nuancier|carta/i },
  { type: "Fibres capillaires", univers: UNIVERS.SOINS, rx: /fibre/i },
  { type: "Masque", univers: UNIVERS.SOINS, rx: /masque/i },
  { type: "Shampooing", univers: UNIVERS.SOINS, rx: /shamp/i },
  { type: "Papier aluminium", univers: UNIVERS.ACCESSOIRES, rx: /aluminium|feuilles?\s+pour\s+m[eè]ches|papier\s+m[eè]ch/i },
  { type: "Presse-tubes", univers: UNIVERS.ACCESSOIRES, rx: /presse[-\s]?tube/i },
  { type: "Palettes coloration", univers: UNIVERS.ACCESSOIRES, rx: /pal+ett?e/i },
  { type: "Bandes de mèches", univers: UNIVERS.ACCESSOIRES, rx: /bandes?\s+de\s+m[eè]ches/i },
  { type: "Bols", univers: UNIVERS.ACCESSOIRES, rx: /\bbol\b|\bbols\b/i },
  { type: "Pinceaux", univers: UNIVERS.ACCESSOIRES, rx: /pinceau/i },
  { type: "Balances", univers: UNIVERS.ACCESSOIRES, rx: /balance/i },
  { type: "Minuteurs", univers: UNIVERS.ACCESSOIRES, rx: /minuteur|timer|sablier/i },
  { type: "Gants", univers: UNIVERS.MATERIEL, rx: /\bgants?\b/i },
  { type: "Serviettes", univers: UNIVERS.MATERIEL, rx: /serviette/i },
  { type: "Capes", univers: UNIVERS.MATERIEL, rx: /\bcapes?\b|peignoir|blouse/i },
  { type: "Brosses", univers: UNIVERS.MATERIEL, rx: /brosse/i },
  { type: "Peignes", univers: UNIVERS.MATERIEL, rx: /peigne/i },
  { type: "Papier cou", univers: UNIVERS.MATERIEL, rx: /papier\s+(de\s+)?(cou|col)|rouleaux?\s+de\s+col/i },
  { type: "Tondeuses & lames", univers: UNIVERS.MATERIEL, rx: /tondeuse|\blame\b|sabot/i },
  { type: "Hygiène & protection", univers: UNIVERS.MATERIEL, rx: /d[ée]sinfect|prot[eè]ge|bact[ée]ricide|alcool/i },
  { type: "Vaporisateurs", univers: UNIVERS.MATERIEL, rx: /vaporisateur|pulv[ée]risateur/i },

  // ── Coiffage (univers ajout\u00e9) ──
  { type: "Cires & pâtes", univers: UNIVERS.COIFFAGE, rx: /\bcire\b|\bwax\b|p[aâ]te\s+coiff|pommade/i },
  { type: "Poudres texturantes", univers: UNIVERS.COIFFAGE, rx: /poudre\s+(textur|volumis|coiff)/i },
  { type: "Sprays & laques", univers: UNIVERS.COIFFAGE, rx: /spray|laque|fixateur|fixant/i },
  { type: "Gels & mousses", univers: UNIVERS.COIFFAGE, rx: /\bgel\b|mousse|activateur\s+de\s+boucles/i },
  { type: "Huiles & sérums", univers: UNIVERS.COIFFAGE, rx: /huile|s[ée]rum|\boil\b/i },
];

/** Repli quand le titre ne dit rien : le productType grossier de Shopify. */
const UNIVERS_PAR_PRODUCTTYPE: Record<string, string> = {
  COLORATION: UNIVERS.COLORATION,
  SOINS: UNIVERS.SOINS,
  CONSOMMABLES: UNIVERS.MATERIEL,
  COIFFAGE: UNIVERS.COIFFAGE,
};

/* ── Extraction ───────────────────────────────────────────────────── */

const detecterType = (titre: string) => TYPES.find((t) => t.rx.test(titre)) ?? null;

/** Contenance : 250 ml, 1L, 20g, 100 unités… */
function format(titre: string): string | null {
  const m = titre.match(/(\d+(?:[.,]\d+)?)\s*(ml|cl|l|gr|g|kg|unit[ée]s?|pi[eè]ces?|feuilles?)\b/i);
  if (!m) return null;
  const unite = m[2].toLowerCase().replace(/^gr$/, "g").replace(/^l$/, "L");
  return `${m[1].replace(",", ".")} ${unite}`;
}

/** Volume d'oxydant : 10 vol, 20 Vol, 30VOL… */
function volumeOxydant(titre: string): string | null {
  const m = titre.match(/(\d{1,2})\s*vol\b/i);
  return m ? `${m[1]} Vol` : null;
}

/** Présence d'ammoniaque annoncée dans le titre. */
function ammoniaque(titre: string): string | null {
  if (/sans\s+ammoni/i.test(titre)) return "Sans ammoniaque";
  if (/avec\s+ammoni|\bammoni/i.test(titre)) return "Avec ammoniaque";
  return null;
}

/** Consommable jetable ou réutilisable, quand le titre le dit. */
function jetable(titre: string, type: string | null): string | null {
  if (!type || !["Gants", "Serviettes", "Capes"].includes(type)) return null;
  if (/jetable|usage\s+unique/i.test(titre)) return "Jetable";
  if (/r[ée]utilisable|lavable|tissu|coton|microfibre/i.test(titre)) return "Réutilisable";
  return null;
}

/* ── Programme ────────────────────────────────────────────────────── */

type Row = Record<string, string>;

async function main() {
  if (!DOMAIN || !TOKEN) throw new Error("Variables Shopify absentes — source .env.local d'abord.");

  const res = await fetch(`https://${DOMAIN}/api/2025-07/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": TOKEN },
    body: JSON.stringify({
      query: `{ products(first:250){ nodes {
        handle title vendor productType
        variants(first:100){ nodes { title } }
      } } }`,
    }),
  });
  const { data, errors } = await res.json();
  if (errors) throw new Error(JSON.stringify(errors));
  const produits = data.products.nodes as {
    handle: string; title: string; vendor: string; productType: string;
    variants: { nodes: { title: string }[] };
  }[];

  const rows: Row[] = [];
  const manquants: Record<string, string[]> = { type: [], univers: [] };

  for (const p of produits) {
    const t = detecterType(p.title);
    const univers = t?.univers ?? UNIVERS_PAR_PRODUCTTYPE[p.productType] ?? "";

    // Familles de teintes présentes — permet de filtrer « colorations ayant du cendré »
    const teintes = p.variants.nodes
      .map((v) => parseTeinte(v.title))
      .filter((x) => x.hauteur !== null);
    const reflets = [...new Set(teintes.map((x) => x.refletLabel))].sort();
    const hauteurs = [...new Set(teintes.map((x) => x.hauteur!))].sort((a, b) => a - b);

    if (!t) manquants.type.push(p.title);
    if (!univers) manquants.univers.push(p.title);

    rows.push({
      Handle: p.handle,
      marque: MARQUES[p.vendor] ?? p.vendor ?? "",
      univers,
      type: t?.type ?? "",
      format: format(p.title) ?? "",
      volume_oxydant: volumeOxydant(p.title) ?? "",
      ammoniaque: ammoniaque(p.title) ?? "",
      jetable: jetable(p.title, t?.type ?? null) ?? "",
      reflets: reflets.join(", "),
      hauteurs_ton: hauteurs.join(", "),
      besoin: "", // saisie manuelle
      gamme: "",  // saisie manuelle
    });
  }

  /* Rapport de couverture */
  const champs = ["marque", "univers", "type", "format", "volume_oxydant", "ammoniaque", "jetable", "reflets"];
  const n = rows.length;
  console.log(`\n${n} produits analysés\n`);
  console.log("CHAMP              REMPLI   COUVERTURE");
  console.log("─".repeat(44));
  let cumul = 0;
  for (const c of champs) {
    const k = rows.filter((r) => r[c]).length;
    if (["marque", "univers", "type"].includes(c)) cumul += k;
    const pct = Math.round((k / n) * 100);
    const barre = "█".repeat(Math.round(pct / 5)).padEnd(20, "·");
    console.log(`${c.padEnd(17)} ${String(k).padStart(4)}/${n}  ${barre} ${pct}%`);
  }
  console.log(`\nChamps structurants (marque+univers+type) : ${Math.round((cumul / (n * 3)) * 100)}% remplis automatiquement`);
  console.log(`À saisir à la main : besoin, gamme — soit ${n * 2} valeurs sur ${n * 10} au total.\n`);

  if (manquants.type.length) {
    console.log(`⚠️  ${manquants.type.length} produits sans TYPE détecté (à classer à la main) :`);
    manquants.type.slice(0, 12).forEach((t) => console.log("   ·", t.slice(0, 72)));
    if (manquants.type.length > 12) console.log(`   … et ${manquants.type.length - 12} autres`);
  }

  /* CSV importable dans Shopify — aucun jeton Admin requis */
  const TYPE_CSV: Record<string, string> = {
    marque: "single_line_text_field", univers: "single_line_text_field",
    type: "single_line_text_field", format: "single_line_text_field",
    volume_oxydant: "single_line_text_field", ammoniaque: "single_line_text_field",
    jetable: "single_line_text_field", reflets: "single_line_text_field",
    hauteurs_ton: "single_line_text_field", besoin: "single_line_text_field",
    gamme: "single_line_text_field",
  };
  const cols = Object.keys(rows[0]);
  const entete = cols.map((c) => (c === "Handle" ? "Handle" : `Metafield: manika.${c} [${TYPE_CSV[c]}]`));
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const csv = [entete.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");

  const out = "scripts/out/metafields-manika.csv";
  writeFileSync(out, "﻿" + csv, "utf8");
  console.log(`\n✓ CSV écrit : ${out}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
