/**
 * Source de données du catalogue — server-only.
 * Utilise Shopify si configuré (.env.local), sinon retombe sur le catalogue
 * local (src/lib/products.ts) : le site ne casse jamais, même sans jeton.
 *
 * À importer UNIQUEMENT dans des server components (pages), jamais dans un
 * composant client — ces fonctions font des fetch au build / au runtime serveur.
 */
import {
  isShopifyConfigured,
  getCollectionProducts,
  getAllProducts,
  getProductByHandle,
  getCollectionsCounts,
  toSiteProduct,
} from "@/lib/shopify";
import { products as localProducts, type Product } from "@/lib/products";
import { collections, productsInCollection as localProductsInCollection } from "@/lib/collections";

/** Produits d'une collection (par handle). */
export async function catalogCollection(handle: string): Promise<Product[]> {
  if (isShopifyConfigured()) {
    try {
      return (await getCollectionProducts(handle)).map(toSiteProduct);
    } catch (e) {
      console.error("[catalog] collection", handle, e);
    }
  }
  return localProductsInCollection(handle);
}

/** Tous les handles produits (pour generateStaticParams). */
export async function catalogAllHandles(): Promise<string[]> {
  if (isShopifyConfigured()) {
    try {
      return (await getAllProducts(250)).map((p) => p.handle);
    } catch (e) {
      console.error("[catalog] handles", e);
    }
  }
  return localProducts.map((p) => p.slug);
}

/** Un produit par handle. */
export async function catalogProduct(handle: string): Promise<Product | null> {
  if (isShopifyConfigured()) {
    try {
      const sp = await getProductByHandle(handle);
      return sp ? toSiteProduct(sp) : null;
    } catch (e) {
      console.error("[catalog] product", handle, e);
    }
  }
  return localProducts.find((p) => p.slug === handle) ?? null;
}

/** Produits mis en avant (accueil). Priorité : image + disponible. */
export async function catalogFeatured(n = 4): Promise<Product[]> {
  if (isShopifyConfigured()) {
    try {
      const all = (await getAllProducts(250)).map(toSiteProduct);
      const scored = all
        .filter((p) => !p.image.includes("logo-mark"))
        .sort((a, b) => Number(b.available) - Number(a.available));
      return (scored.length ? scored : all).slice(0, n);
    } catch (e) {
      console.error("[catalog] featured", e);
    }
  }
  return localProducts.slice(0, n);
}

/** Nombre de produits par collection (vitrine). */
export async function catalogCounts(): Promise<Record<string, number>> {
  if (isShopifyConfigured()) {
    try {
      return await getCollectionsCounts();
    } catch (e) {
      console.error("[catalog] counts", e);
    }
  }
  const out: Record<string, number> = {};
  for (const c of collections) out[c.slug] = localProductsInCollection(c.slug).length;
  return out;
}
