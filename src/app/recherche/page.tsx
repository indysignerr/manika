import type { Metadata } from "next";
import SearchView from "@/components/SearchView";
import { isShopifyConfigured, getAllProducts, toSiteProduct } from "@/lib/shopify";
import { products as localProducts } from "@/lib/products";
import type { IndexEntry } from "@/lib/search";

export const metadata: Metadata = {
  title: "Recherche — MANIKA.LAB",
  description:
    "Trouvez une teinte, une référence ou une catégorie dans le catalogue professionnel MANIKA.LAB.",
};

/**
 * L'index est construit au BUILD et embarqué dans la page : le site est en
 * export statique, il n'y a pas de serveur pour répondre à une requête.
 * On n'embarque que le strict nécessaire (pas les descriptions, pas les INCI)
 * pour garder la page légère.
 */
async function construireIndex(): Promise<IndexEntry[]> {
  const produits = isShopifyConfigured()
    ? await getAllProducts(250)
        .then((ps) => ps.map(toSiteProduct))
        .catch((e) => {
          console.error("[recherche] index", e);
          return localProducts;
        })
    : localProducts;

  return produits.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    image: p.image,
    price: p.price,
    available: p.available !== false,
    variantes: p.sizes.map((s) => s.label).filter((l) => !/^unit(é|e)$/i.test(l)),
  }));
}

export default async function Page() {
  const index = await construireIndex();
  return <SearchView index={index} />;
}
