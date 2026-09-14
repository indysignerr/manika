/**
 * Fabrique le lien d'accès des salons validés et le dépose dans Klaviyo.
 *
 *   npx tsx scripts/liens-acces.mts            # simulation
 *   npx tsx scripts/liens-acces.mts --reel     # écrit dans Klaviyo
 *
 * Le lien est la PORTE du catalogue fermé : sans lui, un salon validé dans
 * Shopify reste un visiteur sur le site. Il est déposé sur le profil Klaviyo
 * du salon dans la propriété `lien_acces`, que l'email « Compte pro validé »
 * insère avec {{ person.lien_acces }}.
 *
 * ⚠️ Ce lien vaut accès aux tarifs : il ne s'envoie qu'à l'adresse du salon,
 *    jamais en clair ailleurs. Il est révocable — retirer l'étiquette
 *    `pro-valide` dans Shopify coupe l'accès en quelques minutes, même si le
 *    salon a déjà ouvert sa session.
 */
import { createHmac } from "node:crypto";
import { admin } from "./shopify-admin.mts";
import { loadEnv } from "./lib/shopify.mts";
import { MAISON } from "../src/lib/legal.ts";

loadEnv();

const REEL = process.argv.includes("--reel");
const SECRET = process.env.SESSION_SECRET || process.env.APERCU_SECRET;
const CLE_KLAVIYO = process.env.KLAVIYO_API_KEY;
const BASE = process.env.SITE_URL || `https://${MAISON.domaine}`;
const ETIQUETTE = "pro-valide";
const JOURS = 90;

/** Même format que functions/_lib/session.js : idClient.expiration.signature */
function jetonSession(idClient: string): string {
  const charge = `${idClient}.${Date.now() + JOURS * 86400_000}`;
  const sig = createHmac("sha256", SECRET!)
    .update(charge)
    .digest("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${charge}.${sig}`;
}

async function salonsValides() {
  const out: { id: string; email: string; nom: string }[] = [];
  let apres: string | null = null;
  for (;;) {
    const d: any = await admin(
      /* GraphQL */ `query C($apres: String) {
        customers(first: 250, after: $apres) {
          pageInfo { hasNextPage endCursor }
          nodes { id email tags displayName }
        }
      }`,
      { apres }
    );
    for (const c of d.customers.nodes)
      if (c.email && c.tags.includes(ETIQUETTE))
        out.push({ id: c.id, email: c.email, nom: c.displayName || c.email });
    if (!d.customers.pageInfo.hasNextPage) break;
    apres = d.customers.pageInfo.endCursor;
  }
  return out;
}

async function deposerDansKlaviyo(email: string, lien: string) {
  const entetes = {
    Authorization: `Klaviyo-API-Key ${CLE_KLAVIYO}`,
    "Content-Type": "application/json",
    accept: "application/json",
    revision: "2026-07-15",
  };
  const recherche = await fetch(
    `https://a.klaviyo.com/api/profiles/?filter=${encodeURIComponent(`equals(email,"${email}")`)}`,
    { headers: entetes }
  );
  if (!recherche.ok) throw new Error(`Klaviyo recherche ${recherche.status}`);
  const id = (await recherche.json())?.data?.[0]?.id;
  if (!id) return false;

  const maj = await fetch(`https://a.klaviyo.com/api/profiles/${id}/`, {
    method: "PATCH",
    headers: entetes,
    body: JSON.stringify({
      data: { type: "profile", id, attributes: { properties: { lien_acces: lien, statut_compte: "valide" } } },
    }),
  });
  if (!maj.ok) throw new Error(`Klaviyo PATCH ${maj.status}`);
  return true;
}

async function main() {
  if (!SECRET) {
    console.error("SESSION_SECRET (ou APERCU_SECRET) absent de .env.local.");
    process.exit(1);
  }
  const salons = await salonsValides();
  console.log(`${salons.length} salon(s) portant « ${ETIQUETTE} ».${REEL ? "" : "  SIMULATION"}\n`);

  let poses = 0, absents = 0;
  for (const s of salons) {
    const lien = `${BASE}/acces?jeton=${encodeURIComponent(jetonSession(s.id))}`;
    console.log(`  ${s.email.padEnd(34)} ${lien.slice(0, 62)}…`);
    if (REEL && CLE_KLAVIYO) {
      try {
        (await deposerDansKlaviyo(s.email, lien)) ? poses++ : absents++;
      } catch (e) {
        console.log(`    ✗ ${e instanceof Error ? e.message : e}`);
      }
    }
  }

  if (REEL) {
    console.log(`\n${poses} lien(s) déposé(s) dans Klaviyo, ${absents} salon(s) sans profil Klaviyo.`);
    console.log("L'email « Compte pro validé » peut l'insérer avec {{ person.lien_acces }}.");
  } else {
    console.log("\nRien n'a été écrit. Relancer avec --reel.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
