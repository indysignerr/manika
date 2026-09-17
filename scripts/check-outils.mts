/**
 * Diagnostic de la chaîne d'outils — MANIKA.LAB
 *
 * Le site dépend de services branchés les uns aux autres : sans domaine pas
 * d'authentification e-mail, sans authentification la prospection part en
 * indésirables, sans clé Resend le formulaire de compte pro jette les leads.
 * Chaque maillon tombe en silence — ce script les interroge et dit lequel.
 *
 * Tout est en LECTURE SEULE. Rien n'est créé, aucun e-mail n'est envoyé :
 * le test du formulaire utilise le champ piège anti-robot, qui fait répondre
 * 200 à la Function sans enregistrer quoi que ce soit.
 *
 *   npm run check:outils
 *   npm run check:outils -- --domaine=manikalab.com --site=https://manikalab.com
 *
 * Les clés vivent dans Cloudflare Pages (Settings → Environment variables).
 * Pour un diagnostic depuis le poste, les recopier dans .env.local — voir
 * .env.local.example et docs/OUTILS.md.
 */
import { fetchAllProducts, loadEnv, storeDomain } from "./lib/shopify.mts";

/** ⚠️ Doit rester aligné sur la révision utilisée dans functions/lead.js. */
const KLAVIYO_REVISION = "2026-07-15";

/**
 * Sélecteurs DKIM connus. Le DNS ne permet pas de lister tous les sélecteurs
 * d'un domaine : on interroge ceux des outils branchés, un par un.
 */
const DKIM_SELECTEURS: Record<string, string> = {
  "IONOS (boîtes mail)": "s1-ionos._domainkey",
  Resend: "resend._domainkey",
};

type Etat = "ok" | "attention" | "absent";
type Ligne = { etape: string; outil: string; etat: Etat; detail: string; action: string };

const SYMBOLE: Record<Etat, string> = { ok: "✓", attention: "!", absent: "·" };

const arg = (nom: string) =>
  process.argv.find((a) => a.startsWith(`--${nom}=`))?.split("=").slice(1).join("=") ?? "";

/* ── DNS par DNS-over-HTTPS : aucune dépendance, même réponse que dig ── */

async function dns(nom: string, type: "A" | "TXT" | "CNAME" | "MX"): Promise<string[]> {
  const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(nom)}&type=${type}`, {
    headers: { accept: "application/dns-json" },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { Answer?: { data: string }[] };
  // Les TXT reviennent entre guillemets, éventuellement en plusieurs morceaux.
  return (json.Answer ?? []).map((a) => a.data.replace(/^"|"$/g, "").replace(/" "/g, ""));
}

/* ── Vérifications ── */

async function verifierShopify(): Promise<Ligne> {
  const base = { etape: "0", outil: "Shopify" };
  if (!storeDomain()) {
    return { ...base, etat: "absent", detail: "jeton Storefront absent", action: "Renseigner .env.local" };
  }
  try {
    const produits = await fetchAllProducts<{ availableForSale: boolean; priceRange: { minVariantPrice: { amount: string } } }>(
      `availableForSale priceRange { minVariantPrice { amount } }`
    );
    const vendables = produits.filter(
      (p) => p.availableForSale && Number(p.priceRange.minVariantPrice.amount) > 0
    ).length;
    return {
      ...base,
      etat: vendables ? "attention" : "absent",
      detail: `${produits.length} produits, ${vendables} vendables`,
      action: vendables === produits.length ? "—" : "Prix et stock à saisir (npm run audit:shopify)",
    };
  } catch (e) {
    return { ...base, etat: "absent", detail: String((e as Error).message).slice(0, 60), action: "Vérifier le jeton" };
  }
}

async function verifierDomaine(domaine: string): Promise<Ligne> {
  const base = { etape: "1", outil: "Nom de domaine" };
  if (!domaine) {
    return { ...base, etat: "absent", detail: "aucun domaine fourni", action: "Choisir et acheter le domaine (~10 €/an)" };
  }
  const a = await dns(domaine, "A");
  const cname = await dns(domaine, "CNAME");
  const resolu = a.length || cname.length;

  // « Ne résout pas » cache deux situations opposées : un domaine acheté mais
  // pas encore pointé, ou un domaine que personne n'a acheté. Le registre
  // (RDAP) tranche — et le second cas est urgent si le site l'affiche déjà.
  if (!resolu && domaine.endsWith(".com")) {
    const rdap = await fetch(`https://rdap.verisign.com/com/v1/domain/${domaine}`);
    if (rdap.status === 404) {
      return {
        ...base,
        etat: "absent",
        detail: `${domaine} N'EST PAS ENREGISTRÉ`,
        action: "L'acheter maintenant : n'importe qui peut le prendre",
      };
    }
  }

  return {
    ...base,
    etat: resolu ? "ok" : "absent",
    detail: resolu ? `${domaine} → ${[...a, ...cname][0]}` : `${domaine} ne résout pas`,
    action: resolu ? "—" : "Ajouter le domaine dans Cloudflare Pages → Custom domains",
  };
}

async function verifierAuthEmail(domaine: string): Promise<Ligne[]> {
  const base = { etape: "2", outil: "SPF / DKIM / DMARC" };
  if (!domaine) {
    return [{ ...base, etat: "absent", detail: "dépend du domaine", action: "Passer l'étape 1 d'abord" }];
  }

  const [txt, dmarc, ...dkims] = await Promise.all([
    dns(domaine, "TXT"),
    dns(`_dmarc.${domaine}`, "TXT"),
    // TXT suit les CNAME : on obtient la clé publique, qu'elle soit posée
    // directement ou déléguée au fournisseur (cas d'IONOS).
    ...Object.values(DKIM_SELECTEURS).map((sel) => dns(`${sel}.${domaine}`, "TXT")),
  ]);

  const spf = txt.find((t) => t.startsWith("v=spf1"));
  const politique = dmarc.find((t) => t.startsWith("v=DMARC1"))?.match(/p=(\w+)/)?.[1];
  const dkimAbsents = Object.keys(DKIM_SELECTEURS).filter((_, i) => !dkims[i].length);

  const manquants = [
    !spf && "SPF",
    ...dkimAbsents.map((outil) => `DKIM ${outil}`),
    !politique && "DMARC",
  ].filter(Boolean);

  return [
    {
      ...base,
      etat: manquants.length ? (!spf && !politique ? "absent" : "attention") : "ok",
      detail: manquants.length ? `manque ${manquants.join(", ")}` : `SPF, DKIM, DMARC (p=${politique})`,
      action: manquants.length
        ? "Ajouter les enregistrements DNS (docs/OUTILS.md, étape 2)"
        : politique === "none"
          ? "Passer p=none → p=quarantine une fois les envois stables"
          : "—",
    },
  ];
}

async function verifierResend(domaine: string): Promise<Ligne> {
  const base = { etape: "3", outil: "Resend" };
  const cle = process.env.RESEND_API_KEY;
  if (!cle) {
    return { ...base, etat: "absent", detail: "RESEND_API_KEY absente", action: "Créer la clé, la poser dans Cloudflare Pages" };
  }

  const res = await fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${cle}` } });

  // La clé recommandée est limitée à l'envoi (« Sending access ») : elle n'a
  // pas le droit de lister les domaines et Resend répond 401. C'est le bon
  // réglage, pas une panne — on vérifie alors le domaine par le DNS.
  if (res.status === 401) {
    const corps = (await res.json().catch(() => ({}))) as { name?: string };
    if (corps.name === "restricted_api_key") {
      const [dkim, envoi] = domaine
        ? await Promise.all([dns(`resend._domainkey.${domaine}`, "TXT"), dns(`send.${domaine}`, "CNAME")])
        : [[], []];
      const dnsOk = dkim.length > 0 && envoi.length > 0;
      return {
        ...base,
        etat: dnsOk ? "ok" : "attention",
        detail: dnsOk ? "clé d'envoi valide, DNS Resend en place" : "clé d'envoi valide, DNS Resend incomplet",
        action: dnsOk ? "—" : "Vérifier le domaine dans Resend (send + resend._domainkey)",
      };
    }
  }
  if (!res.ok) {
    return { ...base, etat: "absent", detail: `API ${res.status}`, action: "Clé invalide ou révoquée" };
  }

  const { data = [] } = (await res.json()) as { data?: { name: string; status: string }[] };
  const verifies = data.filter((d) => d.status === "verified");
  const expediteur = process.env.LEAD_FROM_EMAIL?.match(/@([^>\s]+)/)?.[1];

  if (!data.length) {
    return { ...base, etat: "attention", detail: "clé valide, aucun domaine", action: "Ajouter le domaine d'envoi dans Resend" };
  }
  if (expediteur && !verifies.some((d) => expediteur.endsWith(d.name))) {
    return {
      ...base,
      etat: "attention",
      detail: `LEAD_FROM_EMAIL sur « ${expediteur} », non vérifié`,
      action: "Vérifier ce domaine dans Resend, sinon tout envoi est refusé",
    };
  }
  return {
    ...base,
    etat: verifies.length ? "ok" : "attention",
    detail: data.map((d) => `${d.name} (${d.status})`).join(", "),
    action: verifies.length ? "—" : "Terminer la vérification DNS dans Resend",
  };
}

async function verifierKlaviyo(): Promise<Ligne> {
  const base = { etape: "4", outil: "Klaviyo" };
  const cle = process.env.KLAVIYO_API_KEY;
  if (!cle) {
    return { ...base, etat: "absent", detail: "KLAVIYO_API_KEY absente", action: "Créer la clé privée (3 scopes, cf. docs)" };
  }

  const res = await fetch("https://a.klaviyo.com/api/lists/", {
    headers: { Authorization: `Klaviyo-API-Key ${cle}`, accept: "application/json", revision: KLAVIYO_REVISION },
  });
  if (res.status === 403) {
    return { ...base, etat: "attention", detail: "403 — scopes insuffisants", action: "Ajouter profiles:write, lists:write ET subscriptions:write" };
  }
  if (!res.ok) {
    return { ...base, etat: "absent", detail: `API ${res.status}`, action: "Clé invalide" };
  }

  const { data = [] } = (await res.json()) as { data?: { id: string; attributes: { name: string } }[] };
  const listeId = process.env.KLAVIYO_LIST_ID;
  const liste = data.find((l) => l.id === listeId);

  if (!listeId) {
    return {
      ...base,
      etat: "attention",
      detail: `clé valide, ${data.length} liste(s)`,
      action: `Poser KLAVIYO_LIST_ID (${data.map((l) => `${l.attributes.name}=${l.id}`).join(", ") || "aucune liste"})`,
    };
  }
  return {
    ...base,
    etat: liste ? "ok" : "attention",
    detail: liste ? `liste « ${liste.attributes.name} »` : `liste ${listeId} introuvable`,
    action: liste ? "—" : "Corriger KLAVIYO_LIST_ID",
  };
}

/**
 * Ping du formulaire en production. On envoie le champ piège rempli : la
 * Function répond 200 et s'arrête avant toute destination — aucun lead créé,
 * aucun e-mail envoyé. C'est le seul test de bout en bout sans effet de bord.
 */
async function verifierFormulaire(site: string): Promise<Ligne> {
  const base = { etape: "3·4", outil: "Formulaire /lead" };
  if (!site) {
    return { ...base, etat: "absent", detail: "aucune URL fournie", action: "Relancer avec -- --site=https://…" };
  }
  try {
    const res = await fetch(`${site.replace(/\/$/, "")}/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant: "newsletter", email: "diagnostic@example.com", website: "piège" }),
    });
    if (res.ok) return { ...base, etat: "ok", detail: "Function déployée et joignable", action: "—" };
    if (res.status === 503) {
      return { ...base, etat: "attention", detail: "503 — aucune destination configurée", action: "Poser les clés dans Cloudflare Pages" };
    }
    return { ...base, etat: "attention", detail: `HTTP ${res.status}`, action: "Voir les logs de la Function" };
  } catch {
    return { ...base, etat: "absent", detail: "injoignable", action: "Vérifier le déploiement Cloudflare Pages" };
  }
}

/** Outils sans API de contrôle : on rappelle seulement où on en est. */
const MANUELS: Ligne[] = [
  { etape: "5", outil: "Vérification du fichier", etat: "absent", detail: "27 751 contacts non nettoyés", action: "MillionVerifier, pack 50 000 à 89 $ — avant le premier envoi" },
  { etape: "6", outil: "lemlist", etat: "absent", detail: "prospection non démarrée", action: "~75 €/mois — après les étapes 1 à 5" },
  { etape: "7", outil: "Meta Business Suite", etat: "absent", detail: "—", action: "Gratuit — publications, puis Lead Ads" },
  { etape: "8", outil: "ManyChat", etat: "absent", detail: "—", action: "Gratuit — une fois qu'il y a du volume en messages privés" },
];

async function main() {
  loadEnv();
  const domaine = arg("domaine") || process.env.SITE_DOMAIN || "";
  const site = arg("site") || process.env.SITE_URL || (domaine ? `https://${domaine}` : "");

  const lignes: Ligne[] = [
    await verifierShopify(),
    await verifierDomaine(domaine),
    ...(await verifierAuthEmail(domaine)),
    await verifierResend(domaine),
    await verifierFormulaire(site),
    await verifierKlaviyo(),
    ...MANUELS,
  ];

  const l = (s: string, n: number) => s.padEnd(n).slice(0, n);
  console.log("\nCHAÎNE D'OUTILS — MANIKA.LAB\n");
  console.log(`  ${l("ÉT.", 5)}${l("OUTIL", 26)}${l("ÉTAT", 40)}PROCHAINE ACTION`);
  console.log("  " + "─".repeat(118));
  for (const x of lignes) {
    console.log(`${SYMBOLE[x.etat]} ${l(x.etape, 5)}${l(x.outil, 26)}${l(x.detail, 40)}${x.action}`);
  }

  const prets = lignes.filter((x) => x.etat === "ok").length;
  console.log(`\n  ${prets}/${lignes.length} maillons en place. L'ordre compte : chaque étape débloque la suivante.\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
