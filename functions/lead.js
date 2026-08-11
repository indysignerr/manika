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
 *   KLAVIYO_API_KEY + KLAVIYO_LIST_ID                → ajout à la liste (flux J+45, relances)
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
  if (env.KLAVIYO_API_KEY && env.KLAVIYO_LIST_ID) targets.push(sendKlaviyo(env, p));

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

  if (p.variant === "newsletter") return e;

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

async function sendKlaviyo(env, p) {
  const res = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs", {
    method: "POST",
    headers: {
      Authorization: `Klaviyo-API-Key ${env.KLAVIYO_API_KEY}`,
      "Content-Type": "application/json",
      accept: "application/json",
      revision: "2024-10-15",
    },
    body: JSON.stringify({
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          profiles: {
            data: [
              {
                type: "profile",
                attributes: {
                  email: p.email,
                  // Champs absents selon le variant (newsletter = email seul).
                  ...(p.salon ? { organization: p.salon } : {}),
                  ...(p.ville ? { location: { city: p.ville } } : {}),
                  properties: {
                    origine: p.variant,
                    ...(p.siret ? { siret: p.siret } : {}),
                    ...(p.contact ? { contact: p.contact } : {}),
                    ...(p.telephone ? { telephone: p.telephone } : {}),
                    ...(p.message ? { message: p.message } : {}),
                  },
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
  if (!res.ok) throw new Error(`Klaviyo ${res.status}: ${await res.text()}`);
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
