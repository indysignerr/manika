/**
 * Intégration Shopify Storefront API — HEADLESS (squelette).
 *
 * ⚠️ INACTIF tant que les variables d'environnement ne sont pas remplies.
 *    Tant que `isShopifyConfigured()` est false, le site continue d'utiliser
 *    le catalogue local (src/lib/products.ts + src/lib/collections.ts).
 *
 * Sécurité : on n'utilise QUE le jeton Storefront PUBLIC (safe côté front).
 *            Jamais la clé Admin secrète. Le paiement se fait sur le checkout
 *            hébergé Shopify (PCI-DSS) — aucune donnée bancaire ne touche ce site.
 *
 * Valeurs attendues dans .env.local (voir .env.local.example) :
 *   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=votreboutique.myshopify.com
 *   NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 */

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

// Version de l'API Storefront (date-based, à bumper ~1×/an).
export const SHOPIFY_API_VERSION = "2025-07";

export const isShopifyConfigured = (): boolean => Boolean(DOMAIN && TOKEN);

const endpoint = () => `https://${DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

/** Appel générique à l'API Storefront (GraphQL). */
export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  if (!isShopifyConfigured()) {
    throw new Error("Shopify non configuré — renseignez .env.local (domaine + jeton Storefront).");
  }

  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN as string,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error("Shopify Storefront: " + json.errors.map((e) => e.message).join(" · "));
  }
  return json.data as T;
}

/* ────────────────────────────────────────────────────────────────────────
   TYPES — forme brute renvoyée par l'API Storefront
   ──────────────────────────────────────────────────────────────────────── */

export type ShopifyMoney = { amount: string; currencyCode: string };

export type ShopifyVariant = {
  id: string; // gid://shopify/ProductVariant/... — sert au panier/checkout
  title: string; // ex. "50 ml" ou "20 Vol · 6 %"
  availableForSale: boolean;
  price: ShopifyMoney;
  selectedOptions: { name: string; value: string }[];
};

export type ShopifyProduct = {
  id: string;
  handle: string; // = slug de la page produit
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: ShopifyMoney };
  variants: { nodes: ShopifyVariant[] };
};

const PRODUCT_FIELDS = /* GraphQL */ `
  id
  handle
  title
  description
  descriptionHtml
  productType
  tags
  featuredImage { url altText }
  priceRange { minVariantPrice { amount currencyCode } }
  variants(first: 20) {
    nodes {
      id
      title
      availableForSale
      price { amount currencyCode }
      selectedOptions { name value }
    }
  }
`;

/* ────────────────────────────────────────────────────────────────────────
   LECTURE — produits & collections (utilisé au BUILD pour générer les pages)
   ──────────────────────────────────────────────────────────────────────── */

/** Tous les produits (paginé simplement à `first`). */
export async function getAllProducts(first = 100): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>(
    /* GraphQL */ `query Products($first: Int!) { products(first: $first) { nodes { ${PRODUCT_FIELDS} } } }`,
    { first }
  );
  return data.products.nodes;
}

/** Les produits d'une collection, par son handle (ex. "femme-coloration"). */
export async function getCollectionProducts(handle: string, first = 100): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{ collection: { products: { nodes: ShopifyProduct[] } } | null }>(
    /* GraphQL */ `query Collection($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        products(first: $first) { nodes { ${PRODUCT_FIELDS} } }
      }
    }`,
    { handle, first }
  );
  return data.collection?.products.nodes ?? [];
}

/** Un produit par son handle. */
export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(
    /* GraphQL */ `query Product($handle: String!) { product(handle: $handle) { ${PRODUCT_FIELDS} } }`,
    { handle }
  );
  return data.product;
}

/* ────────────────────────────────────────────────────────────────────────
   PANIER & CHECKOUT — côté navigateur (jeton public), redirection sécurisée
   ──────────────────────────────────────────────────────────────────────── */

export type CartLine = { merchandiseId: string; quantity: number }; // merchandiseId = variant gid

const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

/** Crée un panier Shopify et renvoie son URL de checkout hébergé. */
export async function createCart(lines: CartLine[]): Promise<{ id: string; checkoutUrl: string }> {
  const data = await shopifyFetch<{
    cartCreate: { cart: { id: string; checkoutUrl: string } | null; userErrors: { message: string }[] };
  }>(CART_CREATE, { lines });

  const { cart, userErrors } = data.cartCreate;
  if (!cart) throw new Error("Panier Shopify: " + userErrors.map((e) => e.message).join(" · "));
  return cart;
}

/** Crée le panier puis redirige le navigateur vers le checkout Shopify sécurisé. */
export async function redirectToShopifyCheckout(lines: CartLine[]): Promise<void> {
  const cart = await createCart(lines);
  window.location.href = cart.checkoutUrl;
}

/* ────────────────────────────────────────────────────────────────────────
   MAPPER — Shopify → forme `Product` du site (pour réutiliser l'UI actuelle)
   ──────────────────────────────────────────────────────────────────────── */

import type { Product } from "@/lib/products";

/**
 * Convertit un produit Shopify vers le type `Product` du site.
 *
 * TODO (au branchement) : `tagline`, `usage`, `inci`, `hair`, `need` viendront
 * de METAFIELDS Shopify (recommandé) ou des tags. Ici on met des valeurs de
 * repli pour ne rien casser. On conserve le variant.id de chaque taille pour
 * pouvoir construire les lignes de panier (à ajouter dans le type Product :
 * `sizes[].variantId`).
 */
export function toSiteProduct(sp: ShopifyProduct): Product {
  const base = Number(sp.priceRange.minVariantPrice.amount);
  return {
    slug: sp.handle,
    name: sp.title,
    tagline: sp.productType || "",
    category: sp.productType || "Produit",
    price: base,
    sizes: sp.variants.nodes.map((v) => ({
      label: v.title,
      delta: Number(v.price.amount) - base,
    })),
    desc: sp.description,
    usage: "",
    inci: "",
    image: sp.featuredImage?.url ?? "/images/logo-mark.png",
    hair: [],
    need: [],
  };
}
