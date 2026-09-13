/**
 * Synchronise le STATUT DES COMPTES PRO de Shopify vers Klaviyo.
 *
 *   npx tsx scripts/sync-klaviyo-pro.mts [--reel]
 *
 * Pourquoi ce script existe
 * ─────────────────────────
 * La validation d'un salon est un geste MANUEL : les gérantes posent
 * l'étiquette `pro-valide` sur le client dans Shopify. Le site le sait (via
 * /api/role), mais Klaviyo, lui, ne le saura jamais tout seul — or c'est la
 * segmentation la plus utile du dispositif : on n'écrit pas la même chose à
 * un salon validé qu'à un prospect qui n'a pas donné son SIRET.
 *
 * Ce script relit les clients Shopify et met `statut_compte` à jour dans
 * Klaviyo, puis déclenche « Compte pro validé » pour les nouveaux validés —
 * c'est cet évènement qui doit armer le scénario de bienvenue.
 *
 * Par défaut le script est en SIMULATION : il affiche ce qu'il ferait sans
 * rien écrire. Ajouter `--reel` pour appliquer.
 *
 * Prérequis : source .env.local (SHOPIFY_CLIENT_ID/SECRET, KLAVIYO_API_KEY).
 * Scope Shopify : read_customers.
 * Scopes Klaviyo : profiles:READ (retrouver le profil par email),
 *                  profiles:write (poser le statut), events:write.
 */
import { admin } from "./shopify-admin.mts";

const KLAVIYO_REVISION = "2026-07-15";
const CLE = process.env.KLAVIYO_API_KEY;
const REEL = process.argv.includes("--reel");

/** L'étiquette qui fait foi côté Shopify. */
const ETIQUETTE_VALIDE = "pro-valide";

type ClientShopify = { id: string; email: string | null; tags: string[]; displayName: string };

const enTetes = () => ({
  Authorization: `Klaviyo-API-Key ${CLE}`,
  "Content-Type": "application/json",
  accept: "application/json",
  revision: KLAVIYO_REVISION,
});

async function clientsShopify(): Promise<ClientShopify[]> {
  const out: ClientShopify[] = [];
  let apres: string | null = null;

  for (;;) {
    const d: any = await admin(
      /* GraphQL */ `query Clients($apres: String) {
        customers(first: 250, after: $apres) {
          pageInfo { hasNextPage endCursor }
          nodes { id email tags displayName }
        }
      }`,
      { apres }
    );
    out.push(...d.customers.nodes);
    if (!d.customers.pageInfo.hasNextPage) break;
    apres = d.customers.pageInfo.endCursor;
  }
  return out;
}

/** Renvoie l'identifiant du profil Klaviyo pour cet email, ou null. */
async function profilParEmail(email: string): Promise<string | null> {
  const url = `https://a.klaviyo.com/api/profiles/?filter=${encodeURIComponent(
    `equals(email,"${email}")`
  )}`;
  const res = await fetch(url, { headers: enTetes() });
  if (!res.ok) throw new Error(`Klaviyo recherche ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return d?.data?.[0]?.id ?? null;
}

async function majStatut(id: string, statut: string) {
  const res = await fetch(`https://a.klaviyo.com/api/profiles/${id}/`, {
    method: "PATCH",
    headers: enTetes(),
    body: JSON.stringify({
      data: { type: "profile", id, attributes: { properties: { statut_compte: statut } } },
    }),
  });
  if (!res.ok) throw new Error(`Klaviyo PATCH ${res.status}: ${await res.text()}`);
}

async function evenementValidation(email: string, nom: string) {
  const res = await fetch("https://a.klaviyo.com/api/events/", {
    method: "POST",
    headers: enTetes(),
    body: JSON.stringify({
      data: {
        type: "event",
        attributes: {
          properties: { salon: nom },
          metric: { data: { type: "metric", attributes: { name: "Compte pro validé" } } },
          profile: { data: { type: "profile", attributes: { email } } },
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`Klaviyo évènement ${res.status}: ${await res.text()}`);
}

async function main() {
  if (!CLE) {
    console.error("KLAVIYO_API_KEY absente — `source .env.local` puis relancer.");
    process.exit(1);
  }

  const clients = await clientsShopify();
  const valides = clients.filter((c) => c.tags.includes(ETIQUETTE_VALIDE) && c.email);
  const autres = clients.filter((c) => !c.tags.includes(ETIQUETTE_VALIDE) && c.email);

  console.log(`Shopify : ${clients.length} clients — ${valides.length} portent « ${ETIQUETTE_VALIDE} ».`);
  if (!REEL) console.log("SIMULATION (ajouter --reel pour appliquer)\n");

  let majs = 0;
  let absents = 0;

  for (const c of valides) {
    const id = await profilParEmail(c.email!);
    if (!id) {
      absents++;
      console.log(`  ? ${c.email} — aucun profil Klaviyo (le salon n'est pas passé par le site)`);
      continue;
    }
    console.log(`  ✓ ${c.email} → statut_compte = valide` + (REEL ? "" : " (simulé)"));
    if (REEL) {
      await majStatut(id, "valide");
      await evenementValidation(c.email!, c.displayName || c.email!);
    }
    majs++;
  }

  // Un compte retiré de la validation doit aussi redescendre.
  for (const c of autres) {
    const id = await profilParEmail(c.email!);
    if (!id) continue;
    console.log(`  · ${c.email} → statut_compte = demande` + (REEL ? "" : " (simulé)"));
    if (REEL) await majStatut(id, "demande");
    majs++;
  }

  console.log(
    `\n${majs} profil(s) ${REEL ? "mis à jour" : "à mettre à jour"}` +
      (absents ? `, ${absents} salon(s) validé(s) sans profil Klaviyo.` : ".")
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
