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
import type { IndexEntry } from "@/lib/search";

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

/**
 * TOUT le catalogue, mappé. C'est la source des pages d'arborescence
 * (univers, rayons, marques) : celles-ci ne reposent pas sur des collections
 * Shopify mais sur les métachamps portés par les produits.
 */
let _tous: Promise<Product[]> | null = null;

export async function catalogTous(): Promise<Product[]> {
  // Mémoïsé pour toute la durée du build : l'en-tête en a besoin sur CHAQUE
  // page, et `fetch` en POST n'est pas mis en cache par Next. Sans ça, 249
  // pages = 249 requêtes Shopify identiques.
  _tous ??= chargerTous();
  return _tous;
}

async function chargerTous(): Promise<Product[]> {
  if (isShopifyConfigured()) {
    try {
      return (await getAllProducts(250)).map(toSiteProduct);
    } catch (e) {
      console.error("[catalog] tous", e);
    }
  }
  return localProducts;
}

/**
 * L'index de recherche, construit au BUILD et embarqué dans les pages qui en
 * ont besoin (recherche et commande rapide).
 *
 * ⚠️ AUCUN PRIX ici : ce fichier part dans le navigateur de tout le monde.
 *    Les identifiants de variante, eux, ne sont pas des secrets — ils servent
 *    à remplir le panier.
 */
export async function catalogIndex(): Promise<IndexEntry[]> {
  const produits = await catalogTous();
  return produits.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    image: p.image,
    available: p.available !== false,
    variantes: p.sizes.map((s) => ({
      id: s.variantId,
      label: s.label,
      dispo: s.available !== false,
    })),
  }));
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

/**
 * VENTES COMPLÉMENTAIRES — les règles du document, à la lettre.
 *
 * « Sur une fiche COLORATION, proposer si possible : oxydant compatible,
 *   gants, bol, pinceau, presse-tube, palette, papier aluminium,
 *   balance/minuteur si pertinent. »
 *
 * L'ordre des tableaux EST l'ordre de priorité d'affichage. On prend au plus
 * un produit par type, pour ne pas proposer quatre paires de gants.
 */
const COMPLEMENTS: Record<string, string[]> = {
  Coloration: [
    "Oxydant", "Gants", "Bols", "Pinceaux", "Presse-tubes",
    "Palettes coloration", "Papier aluminium", "Balances", "Minuteurs",
  ],
  "Retouche racines": ["Gants", "Pinceaux", "Bols"],
  Décoloration: ["Oxydant", "Papier aluminium", "Gants", "Bols", "Pinceaux", "Balances"],
  Oxydant: ["Coloration", "Bols", "Pinceaux", "Gants"],
  Shampooing: ["Après-shampooing", "Masque"],
  "Après-shampooing": ["Shampooing", "Masque"],
  Masque: ["Shampooing", "Après-shampooing"],
};

const valeur = (p: Product, cle: string) => p.facettes?.[cle]?.[0] ?? null;

/**
 * Les compléments d'une fiche produit.
 *
 * À défaut de règle pour ce type, on retombe sur « d'autres produits de la
 * même gamme » — ce que le document demande pour les shampooings. La gamme
 * n'étant pas encore saisie dans Shopify, la même MARQUE dans le même univers
 * en tient lieu.
 */
export async function catalogComplements(produit: Product, n = 4): Promise<Product[]> {
  const tous = (await catalogTous()).filter((p) => p.slug !== produit.slug);
  const type = valeur(produit, "type");
  const marque = valeur(produit, "marque");
  const gamme = valeur(produit, "gamme");
  const univers = valeur(produit, "univers");

  const choisis: Product[] = [];
  const pris = new Set<string>();

  /** Le meilleur candidat d'un type : même gamme d'abord, puis même marque. */
  const meilleur = (t: string) => {
    const candidats = tous.filter((p) => valeur(p, "type") === t && !pris.has(p.slug));
    if (!candidats.length) return null;
    const note = (p: Product) =>
      (gamme && valeur(p, "gamme") === gamme ? 4 : 0) +
      (marque && valeur(p, "marque") === marque ? 2 : 0) +
      (p.available !== false ? 1 : 0);
    return candidats.sort((a, b) => note(b) - note(a))[0];
  };

  for (const t of COMPLEMENTS[type ?? ""] ?? []) {
    if (choisis.length >= n) break;
    const c = meilleur(t);
    if (c) {
      choisis.push(c);
      pris.add(c.slug);
    }
  }

  // Complément de remplissage : la même gamme, sinon la même marque.
  if (choisis.length < n) {
    const memeFamille = tous
      .filter((p) => !pris.has(p.slug))
      .filter((p) =>
        gamme
          ? valeur(p, "gamme") === gamme
          : marque && valeur(p, "marque") === marque && valeur(p, "univers") === univers
      )
      .sort((a, b) => Number(b.available !== false) - Number(a.available !== false));
    for (const p of memeFamille) {
      if (choisis.length >= n) break;
      choisis.push(p);
      pris.add(p.slug);
    }
  }

  return choisis.slice(0, n);
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
