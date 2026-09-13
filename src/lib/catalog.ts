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
/**
 * Sélection mise en avant sur l'accueil.
 *
 * ⚠️ Elle était tirée du catalogue par simple ordre de disponibilité : sous un
 *    héros « techniciens de la couleur », elle affichait un rouleau
 *    d'aluminium et une boîte de gants. On classe désormais par proximité avec
 *    le métier annoncé — la coloration d'abord, les consommables jamais en
 *    vitrine — et on laisse la possibilité d'imposer une sélection à la main.
 *
 * Pour figer la vitrine : renseigner VITRINE avec des handles Shopify.
 */
const VITRINE: string[] = [];

/** Plus le score est haut, plus le produit a sa place en vitrine. */
function scoreVitrine(p: Product): number {
  const univers = (p.facettes.univers ?? []).join(" ").toLowerCase();
  const type = (p.facettes.type ?? []).join(" ").toLowerCase();
  const nom = p.name.toLowerCase();

  let score = 0;
  if (univers.includes("coloration")) score += 100;
  if (univers.includes("soin")) score += 60;
  if (type.includes("coloration")) score += 40;
  // Une gamme de teintes EST le métier annoncé par le héros. Les auxiliaires
  // de technique (nettoyants, protecteurs de taches) sont du réassort.
  if (p.sizes.length > 10) score += 80;
  if (/nettoyant|protecteur|protectrice|tâche|tache|cleaner|protect/.test(nom)) score -= 90;
  // Le consommable est un produit de réassort, pas un produit d'image.
  if (/consommable|matériel|accessoire/.test(univers)) score -= 120;
  if (/gant|aluminium|papier|feuille|pinceau|bol|charlotte|cape|serviette/.test(nom)) score -= 150;
  // Un nuancier est un catalogue, pas un produit à mettre en tête de gondole.
  if (/nuancier/.test(nom)) score -= 60;
  if (p.available) score += 30;
  // Une gamme à variantes montre mieux la profondeur qu'une référence isolée.
  if (p.sizes.length > 4) score += 20;
  return score;
}

export async function catalogFeatured(n = 4): Promise<Product[]> {
  if (isShopifyConfigured()) {
    try {
      const all = (await getAllProducts(250)).map(toSiteProduct);
      const avecImage = all.filter((p) => !p.image.includes("logo-mark"));

      if (VITRINE.length) {
        const choisis = VITRINE.map((h) => avecImage.find((p) => p.slug === h)).filter(
          (p): p is Product => Boolean(p)
        );
        if (choisis.length >= n) return choisis.slice(0, n);
      }

      const classes = [...avecImage].sort((a, b) => scoreVitrine(b) - scoreVitrine(a));
      return (classes.length ? classes : all).slice(0, n);
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
