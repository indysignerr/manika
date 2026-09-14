import type { Product } from "@/lib/products";
import { MAISON } from "@/lib/legal";

/**
 * Données structurées schema.org.
 *
 * ⚠️ AUCUN PRIX. Un `Product` complet attend une `offers` avec son montant —
 *    or le catalogue est fermé : publier le prix dans le JSON-LD reviendrait
 *    à le remettre dans le HTML, et Google l'afficherait dans ses résultats.
 *    On décrit donc le produit sans offre. Les résultats enrichis seront plus
 *    pauvres ; c'est le prix assumé du catalogue réservé aux professionnels.
 *
 * ⚠️ Pas d'`aggregateRating` non plus : la boutique n'a aucun avis réel, et en
 *    inventer serait exactement ce qu'on a retiré de la fiche produit.
 */
const BASE = `https://${MAISON.domaine}`;

const balise = (donnees: object) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(donnees) }}
  />
);

export function ProduitJsonLd({ produit }: { produit: Product }) {
  const marque = produit.facettes?.marque?.[0];
  return balise({
    "@context": "https://schema.org",
    "@type": "Product",
    name: produit.name,
    ...(produit.desc ? { description: produit.desc.slice(0, 400) } : {}),
    ...(produit.image && !produit.image.includes("logo-mark") ? { image: produit.image } : {}),
    ...(marque ? { brand: { "@type": "Brand", name: marque } } : {}),
    ...(produit.category ? { category: produit.category } : {}),
    url: `${BASE}/produit/${produit.slug}/`,
  });
}

export function FilAriane({ items }: { items: { nom: string; chemin: string }[] }) {
  return balise({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.nom,
      item: `${BASE}${it.chemin}`,
    })),
  });
}
