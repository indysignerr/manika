import { products, Product } from "@/lib/products";

/**
 * Recentrage du 10/08/2026 : la maison se concentre sur la coloration et les
 * produits qui gravitent autour. Les univers Mobilier et Outils électriques
 * ont été retirés à cette date.
 */
export type Univers = "Femme" | "Barber";

export type Collection = {
  slug: string; // = handle de la collection Shopify
  univers: Univers;
  label: string;
  tagline: string;
  // Appartenance provisoire (6 produits actuels). Sera remplacé par les
  // collections Shopify réelles une fois la boutique branchée.
  productSlugs: string[];
};

export const UNIVERS: Univers[] = ["Femme", "Barber"];

/**
 * ⚠️ L'ORDRE DE CE TABLEAU EST L'ORDRE AFFICHÉ partout (méga-menu, vitrine,
 *    pages catégorie). Il est imposé par la cliente : pour chaque univers,
 *    Coloration → Consommables → Soins → Coiffage. Ne pas trier ailleurs.
 *
 * ⚠️ `barber-coloration` et `barber-soins` n'existent PAS encore côté Shopify.
 *    Tant qu'elles ne sont pas créées avec exactement ces handles, les deux
 *    rayons s'affichent vides. Voir GUIDE-SHOPIFY.md.
 */
export const collections: Collection[] = [
  // ── Femme ──
  {
    slug: "femme-coloration",
    univers: "Femme",
    label: "Coloration",
    tagline: "Végétale, bio vegan & sans ammoniaque",
    productSlugs: [],
  },
  {
    slug: "femme-consommables",
    univers: "Femme",
    label: "Consommables",
    tagline: "Gants, bols, pinceaux & papier",
    productSlugs: [],
  },
  {
    slug: "femme-soins",
    univers: "Femme",
    label: "Soins",
    tagline: "Shampoings, masques & après-coloration",
    productSlugs: [],
  },
  {
    slug: "femme-coiffage",
    univers: "Femme",
    label: "Coiffage",
    tagline: "Texture, brillance & fixation",
    productSlugs: [],
  },

  // ── Barber ──
  {
    slug: "barber-coloration",
    univers: "Barber",
    label: "Coloration",
    tagline: "Coloration homme & barbe",
    productSlugs: [],
  },
  {
    slug: "barber-consommables",
    univers: "Barber",
    label: "Consommables",
    tagline: "Serviettes, capes & accessoires",
    productSlugs: [],
  },
  {
    slug: "barber-soins",
    univers: "Barber",
    label: "Soins",
    tagline: "Shampoings, soins barbe & rasage",
    productSlugs: [],
  },
  {
    slug: "barber-coiffage",
    univers: "Barber",
    label: "Coiffage",
    tagline: "Cires, pâtes & sprays de finition",
    productSlugs: [],
  },
];

export const collectionBySlug = (slug: string) =>
  collections.find((c) => c.slug === slug);

export const productsInCollection = (slug: string): Product[] => {
  const c = collectionBySlug(slug);
  if (!c) return [];
  return c.productSlugs.map((s) => products.find((p) => p.slug === s)).filter(Boolean) as Product[];
};

export const collectionsByUnivers = (u: Univers) =>
  collections.filter((c) => c.univers === u);
