/**
 * Accès Shopify Storefront pour les scripts de maintenance.
 *
 * Mutualise ce que `derive-metafields`, `audit-shopify` et `check-outils`
 * faisaient chacun de leur côté : chargement des variables, appel GraphQL et
 * pagination. Le jeton en place est un jeton STOREFRONT (lecture seule) —
 * aucun de ces scripts ne peut donc modifier la boutique.
 */
import { SHOPIFY_API_VERSION } from "../../src/lib/shopify";

/**
 * Charge `.env.local` au lieu d'exiger `source .env.local` avant chaque appel.
 * Le fichier est gitignoré : rien de secret ne transite par le dépôt.
 */
export function loadEnv(): void {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Absent (CI, poste neuf) : on se rabat sur l'environnement du shell.
  }
}

export const storeDomain = () => process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "";

export async function storefront<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const domain = storeDomain();
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
  if (!domain || !token) {
    throw new Error(
      "Variables Shopify absentes — renseignez NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN et " +
        "NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN dans .env.local."
    );
  }

  const res = await fetch(`https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify ${res.status} : ${await res.text()}`);

  const { data, errors } = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (errors?.length) throw new Error("Shopify Storefront : " + errors.map((e) => e.message).join(" · "));
  return data as T;
}

type Page<T> = { products: { nodes: T[]; pageInfo: { hasNextPage: boolean; endCursor: string } } };

/**
 * Tous les produits de la boutique, pagination comprise.
 *
 * ⚠️ `first: 250` est le plafond de l'API : avec 226 produits aujourd'hui et un
 *    catalogue qui grossit, une requête unique casserait sans prévenir.
 *
 * @param selection champs GraphQL à récupérer, injectés dans le nœud produit.
 */
export async function fetchAllProducts<T>(selection: string): Promise<T[]> {
  const nodes: T[] = [];
  let cursor: string | null = null;

  for (;;) {
    const page: Page<T> = await storefront<Page<T>>(
      `query($cursor: String) {
         products(first: 250, after: $cursor) {
           nodes { ${selection} }
           pageInfo { hasNextPage endCursor }
         }
       }`,
      { cursor }
    );
    nodes.push(...page.products.nodes);
    if (!page.products.pageInfo.hasNextPage) break;
    cursor = page.products.pageInfo.endCursor;
  }
  return nodes;
}
