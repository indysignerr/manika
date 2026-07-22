import { products, Product } from "@/lib/products";

export type Univers = "Barber" | "Femme";

export type Collection = {
  slug: string; // = handle de la collection Shopify
  univers: Univers;
  label: string;
  tagline: string;
  // Appartenance provisoire (6 produits actuels). Sera remplacé par les
  // collections Shopify réelles une fois la boutique branchée.
  productSlugs: string[];
};

export const UNIVERS: Univers[] = ["Barber", "Femme"];

export const collections: Collection[] = [
  {
    slug: "barber-coiffage",
    univers: "Barber",
    label: "Coiffage",
    tagline: "Cires, pâtes & sprays de finition",
    productSlugs: ["cire-matifiante", "texture-shine"],
  },
  {
    slug: "barber-consommables",
    univers: "Barber",
    label: "Consommables",
    tagline: "Serviettes, capes & accessoires",
    productSlugs: [],
  },
  {
    slug: "femme-coloration",
    univers: "Femme",
    label: "Coloration",
    tagline: "Colorations vegan & oxydants",
    productSlugs: ["coloration-bio-vegan", "creme-oxydante"],
  },
  {
    slug: "femme-soin",
    univers: "Femme",
    label: "Soin",
    tagline: "Shampoings, masques & monoï",
    productSlugs: ["shampoing-keratine", "soin-monoi"],
  },
  {
    slug: "femme-coiffage",
    univers: "Femme",
    label: "Coiffage",
    tagline: "Texture, brillance & fixation",
    productSlugs: ["texture-shine"],
  },
  {
    slug: "femme-consommables",
    univers: "Femme",
    label: "Consommables",
    tagline: "Accessoires & petit matériel",
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
