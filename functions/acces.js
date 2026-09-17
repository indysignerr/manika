/**
 * GET /acces?jeton=<…>   → ouvre la session du salon
 * GET /acces?sortie=1    → la referme
 *
 * C'est la porte du catalogue fermé. Le lien est personnel : il est envoyé au
 * salon dans l'email « Compte pro validé », après validation manuelle par les
 * gérantes.
 *
 * ⚠️ `onRequest` (catch-all) et JAMAIS `onRequestGet` : Cloudflare Pages
 *    ghoste les signatures par méthode de façon aléatoire.
 */
import { lireJetonSession, secretSession } from "./_lib/session.js";
import { salonValide } from "./_lib/clients.js";

const COOKIE = "manika_session";
const JOURS = 90;

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (url.searchParams.get("sortie")) {
    return redirige("/", `${COOKIE}=; Path=/; Max-Age=0; Secure; SameSite=Lax; HttpOnly`);
  }

  const jeton = url.searchParams.get("jeton");
  const idClient = await lireJetonSession(jeton, secretSession(env));
  if (!idClient) return page("Lien invalide ou expiré", 400);

  // On vérifie tout de suite que le salon est bien validé : un lien authentique
  // mais dont l'étiquette a été retirée ne doit pas ouvrir de session.
  if (!(await salonValide(env, idClient))) {
    return page("Ce compte professionnel n'est pas (ou plus) validé.", 403);
  }

  return redirige(
    url.searchParams.get("vers") || "/boutique/",
    `${COOKIE}=${jeton}; Path=/; Max-Age=${JOURS * 86400}; Secure; SameSite=Lax; HttpOnly`
  );
}

const redirige = (vers, cookie) =>
  new Response(null, { status: 302, headers: { Location: vers, "Set-Cookie": cookie } });

const page = (message, status) =>
  new Response(
    `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<title>MANIKA.LAB</title></head>
<body style="font-family:system-ui;max-width:34rem;margin:12vh auto;padding:0 1.5rem;color:#4A3428">
<h1 style="font-weight:400;letter-spacing:.08em">MANIKA.LAB</h1>
<p>${message}</p>
<p style="font-size:.9rem;color:#6D6458">Votre lien d'accès est personnel et valable 90 jours.
Écrivez-nous à <a href="mailto:contact@manikalab.com" style="color:#82503C">contact@manikalab.com</a>
pour en recevoir un nouveau.</p>
<p><a href="/" style="color:#82503C">← Retour à l'accueil</a></p>
</body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
