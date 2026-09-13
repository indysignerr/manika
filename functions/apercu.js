/**
 * GET /apercu?cle=<APERCU_SECRET>            → active le mode aperçu
 * GET /apercu?cle=<...>&role=pro|visiteur    → active et choisit le rôle
 * GET /apercu?off=1                          → désactive
 *
 * ⚠️ `onRequest` et jamais `onRequestGet` : Cloudflare Pages ghote les
 *    signatures par méthode de façon aléatoire (404 sur une Function pourtant
 *    déployée).
 */
import { creerJeton } from "./_lib/apercu.js";

const cookieAttrs = "Path=/; Secure; SameSite=Lax";

export async function onRequest({ request, env }) {
  const url = new URL(request.url);

  if (url.searchParams.get("off")) {
    return new Response(null, {
      status: 302,
      headers: [
        ["Location", "/"],
        ["Set-Cookie", `manika_apercu=; ${cookieAttrs}; HttpOnly; Max-Age=0`],
        ["Set-Cookie", `manika_apercu_ui=; ${cookieAttrs}; Max-Age=0`],
        ["Set-Cookie", `manika_role=; ${cookieAttrs}; Max-Age=0`],
      ],
    });
  }

  if (!env.APERCU_SECRET) {
    return texte("Mode aperçu non configuré : la variable APERCU_SECRET est absente.", 503);
  }
  if (url.searchParams.get("cle") !== env.APERCU_SECRET) {
    // Même réponse qu'une page inexistante : on ne révèle pas que /apercu existe.
    return texte("Not found", 404);
  }

  const role = url.searchParams.get("role") === "pro" ? "pro" : "visiteur";
  const jeton = await creerJeton(env.APERCU_SECRET);
  const maxAge = 8 * 3600;

  return new Response(null, {
    status: 302,
    headers: [
      ["Location", url.searchParams.get("vers") || "/"],
      // signé, inaccessible au JavaScript : c'est lui qui fait autorité
      ["Set-Cookie", `manika_apercu=${jeton}; ${cookieAttrs}; HttpOnly; Max-Age=${maxAge}`],
      // simple marqueur lisible, pour que l'interface affiche le sélecteur
      ["Set-Cookie", `manika_apercu_ui=1; ${cookieAttrs}; Max-Age=${maxAge}`],
      // rôle simulé — sans valeur s'il n'est pas accompagné du jeton signé
      ["Set-Cookie", `manika_role=${role}; ${cookieAttrs}; Max-Age=${maxAge}`],
    ],
  });
}

const texte = (t, status) =>
  new Response(t, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
