/**
 * Client API Admin Shopify — échange de jeton + requêtes GraphQL.
 *
 * L'app « Site Manika » est une app du Dev Dashboard : elle ne délivre pas de
 * jeton permanent mais un jeton de 24 h, obtenu par client credentials grant.
 * On le met en cache le temps du process.
 */
/**
 * ⚠️ Lecture PARESSEUSE des variables d'environnement.
 *
 * Les lire au chargement du module ne marche pas : les imports ES sont
 * évalués AVANT le corps du module importateur, donc avant son `loadEnv()`.
 * Le script se retrouvait à annoncer des identifiants absents alors qu'ils
 * étaient bien dans .env.local.
 */
const DOMAIN = () => process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const ID = () => process.env.SHOPIFY_CLIENT_ID;
const SECRET = () => process.env.SHOPIFY_CLIENT_SECRET;
export const API = "2025-07";

let cache: { token: string; expire: number } | null = null;

export async function adminToken(): Promise<string> {
  if (cache && Date.now() < cache.expire) return cache.token;
  if (!ID() || !SECRET())
    throw new Error("SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET absents de .env.local");

  const res = await fetch(`https://${DOMAIN()}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: ID()!,
      client_secret: SECRET()!,
    }),
  });
  const d = await res.json();
  if (!d.access_token) throw new Error("Échange de jeton refusé : " + JSON.stringify(d));
  // marge de 60 s pour ne jamais présenter un jeton expiré
  cache = { token: d.access_token, expire: Date.now() + (d.expires_in - 60) * 1000 };
  return cache.token;
}

export async function admin<T = any>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const token = await adminToken();
  const res = await fetch(`https://${DOMAIN()}/admin/api/${API}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error("Admin API : " + JSON.stringify(json.errors).slice(0, 400));
  return json.data as T;
}
