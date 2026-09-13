/**
 * Écrit dans Shopify les métachamps dérivés.
 *
 * La source est le CSV produit par derive-metafields.mts : c'est le fichier
 * relu et validé, on ne recalcule rien ici — ce qui garantit que ce qui part
 * en boutique est exactement ce qui a été inspecté.
 *
 *   source .env.local && npx tsx scripts/push-metafields.mts           (simulation)
 *   source .env.local && npx tsx scripts/push-metafields.mts --apply   (écriture réelle)
 */
import { readFileSync } from "node:fs";
import { admin } from "./shopify-admin.mts";

const APPLIQUER = process.argv.includes("--apply");
const CSV = "scripts/out/metafields-manika.csv";
const LOT = 25; // plafond de metafieldsSet

/** Découpe une ligne CSV en tenant compte des guillemets. */
function cellules(ligne: string): string[] {
  const out: string[] = [];
  let cur = "", quote = false;
  for (let i = 0; i < ligne.length; i++) {
    const c = ligne[i];
    if (quote) {
      if (c === '"' && ligne[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') quote = false;
      else cur += c;
    } else if (c === '"') quote = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

const SET = /* GraphQL */ `
  mutation Set($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { key }
      userErrors { field message code }
    }
  }
`;

async function main() {
  const brut = readFileSync(CSV, "utf8").replace(/^﻿/, "");
  const lignes = brut.trim().split("\n");
  const entete = cellules(lignes[0]);
  // « Metafield: manika.marque [single_line_text_field] » -> « marque »
  const cles = entete.map((h) => h.match(/manika\.([a-z_]+)/)?.[1] ?? h);

  const donnees = lignes.slice(1).map((l) => {
    const c = cellules(l);
    return Object.fromEntries(cles.map((k, i) => [k, c[i] ?? ""]));
  });
  console.log(`\n${donnees.length} produits lus depuis ${CSV}`);

  // handle -> gid
  const gids = new Map<string, string>();
  let cursor: string | null = null;
  do {
    const d: any = await admin(
      `query($c:String){ products(first:250, after:$c){ nodes{ id handle } pageInfo{ hasNextPage endCursor } } }`,
      { c: cursor }
    );
    for (const p of d.products.nodes) gids.set(p.handle, p.id);
    cursor = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
  } while (cursor);
  console.log(`${gids.size} produits trouvés dans la boutique`);

  // construction des écritures — on ignore les valeurs vides
  const ecritures: { ownerId: string; namespace: string; key: string; type: string; value: string }[] = [];
  const introuvables: string[] = [];
  const parChamp: Record<string, number> = {};

  for (const row of donnees) {
    const gid = gids.get(row.Handle);
    if (!gid) { introuvables.push(row.Handle); continue; }
    for (const k of cles) {
      if (k === "Handle") continue;
      const v = (row[k] ?? "").trim();
      if (!v) continue;
      ecritures.push({ ownerId: gid, namespace: "manika", key: k, type: "single_line_text_field", value: v });
      parChamp[k] = (parChamp[k] ?? 0) + 1;
    }
  }

  console.log(`\n${ecritures.length} valeurs à écrire :`);
  for (const [k, n] of Object.entries(parChamp).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${String(n).padStart(4)}  manika.${k}`);
  }
  if (introuvables.length) console.log(`\n⚠ ${introuvables.length} handles absents de la boutique : ${introuvables.slice(0, 3).join(", ")}…`);

  if (!APPLIQUER) {
    console.log(`\nSIMULATION — rien n'a été écrit.`);
    console.log(`Relancer avec --apply pour appliquer.\n`);
    return;
  }

  console.log(`\nÉcriture en cours…`);
  let ok = 0, ko = 0;
  for (let i = 0; i < ecritures.length; i += LOT) {
    const lot = ecritures.slice(i, i + LOT);
    const d: any = await admin(SET, { metafields: lot });
    const errs = d.metafieldsSet.userErrors;
    if (errs?.length) {
      ko += errs.length;
      console.log(`   ✗ ${errs[0].code ?? ""} ${errs[0].message}`);
    }
    ok += d.metafieldsSet.metafields?.length ?? 0;
    process.stdout.write(`\r   ${Math.min(i + LOT, ecritures.length)}/${ecritures.length}`);
  }
  console.log(`\n\n✓ ${ok} valeurs écrites${ko ? ` · ${ko} erreurs` : ""}\n`);
}

main().catch((e) => { console.error("\n" + e.message); process.exit(1); });
