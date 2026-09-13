/**
 * POST /lead — réception des demandes (compte pro, contact, newsletter).
 *
 * Cloudflare Pages Function. Le site étant en static export, c'est le seul
 * endroit où un lead peut être traité côté serveur.
 *
 * ⚠️ `onRequest` (catch-all) et JAMAIS `onRequestPost` : Cloudflare Pages ghoste
 *    les signatures par méthode de façon aléatoire (404 alors que la Function
 *    est bien déployée). On filtre la méthode nous-mêmes.
 *
 * Destinations, activées par variable d'environnement (Pages → Settings → Env vars) :
 *   RESEND_API_KEY + LEAD_TO_EMAIL + LEAD_FROM_EMAIL → notification email
 *   KLAVIYO_API_KEY                                   → profil + évènement
 *   KLAVIYO_LIST_ID                                   → abonnement à la liste
 *
 * ⚠️ CONSENTEMENT — deux choses distinctes, à ne jamais confondre :
 *    · l'accord de TRAITEMENT de la demande (obligatoire, case du formulaire) ;
 *    · l'opt-in MARKETING (`optinMarketing`, facultatif, décoché par défaut).
 *    Sans opt-in marketing, le profil est créé dans Klaviyo — on a besoin du
 *    salon pour la segmentation et les messages transactionnels — mais il
 *    n'est PAS abonné à la liste de diffusion. Abonner un salon parce qu'il a
 *    demandé l'ouverture d'un compte serait une prospection non consentie.
 *
 * Si AUCUNE destination n'est configurée, on renvoie 503 avec un message clair :
 * mieux vaut un formulaire qui dit « indisponible » qu'un formulaire qui affiche
 * « merci ! » en jetant le lead.
 */

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { Allow: "POST, OPTIONS" } });
  }
  if (request.method !== "POST") {
    return json({ message: "Méthode non autorisée." }, 405);
  }

  let p;
  try {
    p = await request.json();
  } catch {
    return json({ message: "Requête illisible." }, 400);
  }

  // Piège à robots : on répond 200 sans rien faire.
  if (p.website) return json({ ok: true });

  const errors = validate(p);
  if (errors.length) return json({ message: errors.join(" ") }, 422);

  const targets = [];
  if (env.RESEND_API_KEY && env.LEAD_TO_EMAIL) targets.push(sendEmail(env, p));
  if (env.KLAVIYO_API_KEY) targets.push(sendKlaviyo(env, p));

  if (!targets.length) {
    return json(
      {
        message:
          "Le service d'envoi n'est pas encore configuré.",
      },
      503
    );
  }

  const results = await Promise.allSettled(targets);
  // Un seul canal suffit à considérer le lead capturé.
  if (results.some((r) => r.status === "fulfilled")) return json({ ok: true });

  const reason = results.find((r) => r.status === "rejected")?.reason;
  console.error("lead: toutes les destinations ont échoué", reason);
  return json({ message: "Envoi impossible pour le moment." }, 502);
}

/* ── validation (miroir de src/lib/lead.ts — ne jamais faire confiance au client) ── */

function validSiret(raw = "") {
  const s = String(raw).replace(/\s/g, "");
  if (!/^\d{14}$/.test(s)) return false;
  if (s.startsWith("356000000")) return true;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let d = Number(s[i]) * (i % 2 === 0 ? 2 : 1);
    if (d > 9) d -= 9;
    sum += d;
  }
  return sum % 10 === 0;
}

const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());

/**
 * Les exigences dépendent du type de demande : un compte pro doit prouver son
 * SIRET, une inscription newsletter n'a qu'un email.
 */
function validate(p) {
  const e = [];
  if (!validEmail(p.email)) e.push("Email invalide.");

  if (p.variant === "newsletter") {
    // Une inscription à la diffusion SANS consentement marketing n'a pas de sens.
    if (!p.optinMarketing) e.push("Votre accord est nécessaire pour recevoir nos communications.");
    return e;
  }

  if (p.variant === "contact") {
    if (!p.contact?.trim()) e.push("Nom manquant.");
    if (!p.message?.trim()) e.push("Message vide.");
    return e;
  }

  // "pro" : qualification professionnelle complète.
  if (!p.salon?.trim()) e.push("Nom du salon manquant.");
  if (!validSiret(p.siret)) e.push("SIRET invalide.");
  if (!p.contact?.trim()) e.push("Nom du contact manquant.");
  if (!p.telephone?.trim()) e.push("Téléphone manquant.");
  if (!p.ville?.trim()) e.push("Ville manquante.");
  return e;
}

/* ── destinations ── */

const LIBELLE = {
  pro: "Ouverture compte pro",
  contact: "Message de contact",
  newsletter: "Inscription newsletter",
};

async function sendEmail(env, p) {
  const type = LIBELLE[p.variant] || "Demande";
  const sujet = p.salon ? `${type} — ${p.salon} (${p.ville})` : `${type} — ${p.email}`;

  const rows = [
    ["Type", type],
    ["Salon", p.salon],
    ["SIRET", p.siret],
    ["Contact", p.contact],
    ["Email", p.email],
    ["Téléphone", p.telephone],
    ["Ville", p.ville],
    ["Sujet", p.sujet],
    ["Message", p.message],
    // Les champs absents du variant courant sont retirés juste après.
  ].filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "");

  const html =
    `<h2 style="font-family:system-ui">${escapeHtml(sujet)}</h2>` +
    `<table style="font-family:system-ui;border-collapse:collapse">` +
    rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 14px 6px 0;color:#666">${escapeHtml(k)}</td>` +
          `<td style="padding:6px 0"><strong>${escapeHtml(String(v))}</strong></td></tr>`
      )
      .join("") +
    `</table>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.LEAD_FROM_EMAIL || "MANIKA.LAB <onboarding@resend.dev>",
      to: String(env.LEAD_TO_EMAIL).split(",").map((s) => s.trim()),
      reply_to: p.email,
      subject: sujet,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return true;
}

/* ── Klaviyo ─────────────────────────────────────────────────────────────
   Klaviyo fige le comportement de l'API sur l'en-tête `revision` : une
   révision ancienne continue de fonctionner mais finit par être retirée.
   Dernière stable vérifiée le 12/08/2026.

   Scopes requis sur la clé privée (doc API vérifiée le 14/09/2026) :
   profiles:write (profil), events:write (évènements), puis lists:write ET
   subscriptions:write pour l'abonnement — le job les exige tous les deux.
   Un scope d'abonnement manquant donne un 403 SILENCIEUX : le profil et
   l'évènement partent quand même, seul l'abonnement échoue.

   ⚠️ Klaviyo n'a AUCUNE région de données européenne : hébergement
      états-unien couvert par le Data Privacy Framework et des clauses
      contractuelles types. Le DPA doit être signé côté Klaviyo.
   ──────────────────────────────────────────────────────────────────────── */

const KLAVIYO_REVISION = "2026-07-15";

const enTetesKlaviyo = (env) => ({
  Authorization: `Klaviyo-API-Key ${env.KLAVIYO_API_KEY}`,
  "Content-Type": "application/json",
  accept: "application/json",
  revision: KLAVIYO_REVISION,
});

/** Nom de l'évènement déclencheur, côté Klaviyo (Flows → Metric). */
const METRIQUE = {
  pro: "Demande de compte pro",
  contact: "Message de contact",
  newsletter: "Inscription newsletter",
};

/**
 * Les attributs d'un profil. La segmentation visée est B2B : on retient ce
 * qui distingue un salon (SIRET, ville, statut du compte), pas des critères
 * grand public.
 */
/**
 * Klaviyo n'accepte un numéro qu'au format E.164 et rejette TOUT le profil
 * sinon. « 06 12 34 56 78 » devient donc « +33612345678 ». Si le numéro ne
 * rentre pas dans ce moule, on ne l'envoie pas comme `phone_number` — il
 * reste disponible en propriété libre.
 */
function telephoneE164(brut) {
  const n = String(brut || "").replace(/[^\d+]/g, "");
  if (/^\+\d{8,15}$/.test(n)) return n;
  // Préfixe international composé « 00 », habituel sur les cartes de visite.
  if (/^00\d{8,15}$/.test(n)) return `+${n.slice(2)}`;
  if (/^0\d{9}$/.test(n)) return `+33${n.slice(1)}`;
  if (/^33\d{9}$/.test(n)) return `+${n}`;
  return null;
}

function profilKlaviyo(p) {
  const tel = telephoneE164(p.telephone);
  return {
    email: p.email,
    ...(p.contact ? { first_name: p.contact } : {}),
    ...(p.salon ? { organization: p.salon } : {}),
    ...(tel ? { phone_number: tel } : {}),
    ...(p.ville ? { location: { city: p.ville, country: "France" } } : {}),
    properties: {
      origine: p.variant,
      // Le compte n'est validé qu'à la main par les gérantes, dans Shopify.
      // scripts/sync-klaviyo-pro.mts fait passer ce statut à « valide ».
      statut_compte: p.variant === "pro" ? "demande" : "prospect",
      optin_marketing: Boolean(p.optinMarketing),
      ...(p.siret ? { siret: String(p.siret).replace(/\s/g, "") } : {}),
      ...(p.telephone ? { telephone: p.telephone } : {}),
      ...(p.ville ? { ville: p.ville } : {}),
      ...(p.message ? { dernier_message: p.message } : {}),
    },
  };
}

/**
 * Crée le profil, ou le met à jour s'il existe déjà.
 *
 * Klaviyo répond 409 sur un doublon et donne l'identifiant existant dans
 * `errors[0].meta.duplicate_profile_id` : on enchaîne alors sur un PATCH.
 * Renvoie l'identifiant du profil.
 */
async function upsertProfil(env, p) {
  const corps = {
    data: { type: "profile", attributes: profilKlaviyo(p) },
  };

  const res = await fetch("https://a.klaviyo.com/api/profiles/", {
    method: "POST",
    headers: enTetesKlaviyo(env),
    body: JSON.stringify(corps),
  });

  if (res.ok) {
    const d = await res.json();
    return d?.data?.id ?? null;
  }

  if (res.status === 409) {
    const d = await res.json().catch(() => null);
    const id = d?.errors?.[0]?.meta?.duplicate_profile_id;
    if (!id) throw new Error(`Klaviyo 409 sans duplicate_profile_id: ${JSON.stringify(d)}`);

    const maj = await fetch(`https://a.klaviyo.com/api/profiles/${id}/`, {
      method: "PATCH",
      headers: enTetesKlaviyo(env),
      body: JSON.stringify({ data: { type: "profile", id, attributes: profilKlaviyo(p) } }),
    });
    if (!maj.ok) throw new Error(`Klaviyo PATCH ${maj.status}: ${await maj.text()}`);
    return id;
  }

  throw new Error(`Klaviyo POST profil ${res.status}: ${await res.text()}`);
}

/** Abonne à la liste de diffusion — UNIQUEMENT sur opt-in marketing explicite. */
async function abonnerListe(env, p) {
  const res = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/", {
    method: "POST",
    headers: enTetesKlaviyo(env),
    body: JSON.stringify({
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          // Trace du consentement : Klaviyo conserve la date et la source.
          custom_source: `Site MANIKA.LAB — ${METRIQUE[p.variant] || p.variant}`,
          profiles: {
            data: [
              {
                type: "profile",
                attributes: {
                  email: p.email,
                  subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
                },
              },
            ],
          },
        },
        relationships: { list: { data: { type: "list", id: env.KLAVIYO_LIST_ID } } },
      },
    }),
  });
  if (!res.ok) throw new Error(`Klaviyo abonnement ${res.status}: ${await res.text()}`);
  return true;
}

/**
 * Enregistre l'évènement. C'est LUI qui déclenche les scénarios Klaviyo
 * (accusé de réception, relance à J+45…) : un profil seul ne déclenche rien.
 */
async function envoyerEvenement(env, p) {
  const nom = METRIQUE[p.variant] || "Demande site";
  const res = await fetch("https://a.klaviyo.com/api/events/", {
    method: "POST",
    headers: enTetesKlaviyo(env),
    body: JSON.stringify({
      data: {
        type: "event",
        attributes: {
          properties: {
            origine: p.variant,
            ...(p.salon ? { salon: p.salon } : {}),
            ...(p.ville ? { ville: p.ville } : {}),
            ...(p.siret ? { siret: String(p.siret).replace(/\s/g, "") } : {}),
            ...(p.sujet ? { sujet: p.sujet } : {}),
            optin_marketing: Boolean(p.optinMarketing),
          },
          metric: { data: { type: "metric", attributes: { name: nom } } },
          profile: { data: { type: "profile", attributes: { email: p.email } } },
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`Klaviyo évènement ${res.status}: ${await res.text()}`);
  return true;
}

async function sendKlaviyo(env, p) {
  // Le profil d'abord : l'évènement et l'abonnement s'y rattachent.
  await upsertProfil(env, p);

  const suite = [envoyerEvenement(env, p)];
  // L'abonnement n'a lieu QUE si la personne l'a explicitement demandé.
  if (p.optinMarketing && env.KLAVIYO_LIST_ID) suite.push(abonnerListe(env, p));

  await Promise.all(suite);
  return true;
}

/* ── utils ── */

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}
