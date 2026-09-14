import type { MetadataRoute } from "next";
import { catalogTous, catalogAllHandles } from "@/lib/catalog";
import { marquesDuCatalogue, rayonsDuCatalogue, universDuCatalogue } from "@/lib/taxonomie";
import { MAISON } from "@/lib/legal";

/**
 * Sitemap — généré au BUILD à partir du catalogue réel.
 *
 * Il n'existait pas (404 en ligne) alors que robots.txt le référençait, et
 * sous un domaine qui n'est pas le bon. Les 296 pages du site n'étaient donc
 * déclarées nulle part.
 *
 * ⚠️ Pas de `/apercu` ici : c'est une porte de service, pas une page.
 */
const BASE = `https://${MAISON.domaine}`;

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const maintenant = new Date();
  const produits = await catalogTous();
  const handles = await catalogAllHandles();

  const page = (
    chemin: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly"
  ) => ({ url: `${BASE}${chemin}`, lastModified: maintenant, changeFrequency, priority });

  return [
    page("/", 1),
    page("/boutique/", 0.9),
    page("/marques/", 0.8),
    page("/commande-rapide/", 0.8),
    page("/promotions/", 0.6),
    page("/devenir-client-pro/", 0.9),
    page("/rituels/", 0.6, "monthly"),
    page("/ingredients/", 0.6, "monthly"),
    page("/a-propos/", 0.5, "monthly"),
    page("/contact/", 0.5, "monthly"),
    page("/recherche/", 0.4, "monthly"),
    page("/cgv/", 0.3, "yearly"),
    page("/mentions-legales/", 0.3, "yearly"),
    page("/politique-de-confidentialite/", 0.3, "yearly"),
    ...universDuCatalogue(produits).map((u) => page(`/univers/${u.slug}/`, 0.8)),
    ...rayonsDuCatalogue(produits).map((r) => page(`/rayon/${r.slug}/`, 0.8)),
    ...marquesDuCatalogue(produits).map((m) => page(`/marques/${m.slug}/`, 0.7)),
    ...handles.map((h) => page(`/produit/${h}/`, 0.7)),
  ];
}
