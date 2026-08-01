export type Product = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  price: number;
  sizes: { label: string; delta: number; variantId?: string }[];
  desc: string;
  usage: string;
  inci: string;
  image: string;
  hair: string[];
  need: string[];
  badge?: string;
  available?: boolean;
};

// Catalogue 100 % piloté par Shopify (voir src/lib/catalog.ts + shopify.ts).
// Plus aucun produit local : si Shopify n'est pas configuré, la boutique est
// simplement vide (aucun produit de démonstration).
export const products: Product[] = [];

export const bySlug = (slug: string) => products.find((p) => p.slug === slug);

export const fmt = (n: number) => n.toFixed(2).replace(".", ",") + " €";

// Prix non encore renseigné dans Shopify (0) → libellé provisoire élégant.
export const fmtPrice = (n: number) => (n > 0 ? fmt(n) : "Prix à venir");

export const HAIR_TYPES = ["Tous types", "Colorés", "Abîmés", "Secs"];
export const NEEDS = ["Coloration", "Réparation", "Hydratation", "Coiffage", "Brillance"];

export const FREE_SHIPPING = 60;
