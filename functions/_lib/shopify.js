/**
 * Accès Shopify côté SERVEUR uniquement.
 *
 * Le jeton Storefront ne doit plus jamais atteindre le navigateur : c'est la
 * condition du catalogue fermé. Tant qu'il est exposé côté client, n'importe
 * qui peut interroger l'API directement et le verrou ne sert à rien.
 */

const API = "2025-07";

const domaine = (env) => env.SHOPIFY_STORE_DOMAIN || env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

/** Jeton Storefront — variante serveur d'abord, repli sur l'ancienne le temps de la bascule. */
const jetonStorefront = (env) =>
  env.SHOPIFY_STOREFRONT_TOKEN || env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

export async function storefront(env, query, variables = {}, pays) {
  const token = jetonStorefront(env);
  if (!token) throw new Error("Jeton Storefront absent côté serveur");

  const res = await fetch(`https://${domaine(env)}/api/${API}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
      // Prix et disponibilité dans la devise du visiteur
      ...(pays ? { "Shopify-Storefront-Buyer-IP": "" } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error("Storefront : " + JSON.stringify(json.errors).slice(0, 300));
  return json.data;
}

/* ── API Admin : jeton de 24 h obtenu par client credentials ─────────── */

let cache = null;

export async function jetonAdmin(env) {
  if (cache && Date.now() < cache.expire) return cache.token;
  if (!env.SHOPIFY_CLIENT_ID || !env.SHOPIFY_CLIENT_SECRET) {
    throw new Error("SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET absents");
  }
  const res = await fetch(`https://${domaine(env)}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
    }),
  });
  const d = await res.json();
  if (!d.access_token) throw new Error("Échange de jeton Admin refusé");
  cache = { token: d.access_token, expire: Date.now() + (d.expires_in - 120) * 1000 };
  return cache.token;
}

export async function adminGql(env, query, variables = {}) {
  const token = await jetonAdmin(env);
  const res = await fetch(`https://${domaine(env)}/admin/api/${API}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error("Admin : " + JSON.stringify(json.errors).slice(0, 300));
  return json.data;
}

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
