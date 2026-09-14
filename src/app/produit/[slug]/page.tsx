import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { catalogAllHandles, catalogProduct, catalogComplements } from "@/lib/catalog";
import ProductView from "@/components/ProductView";
import { ProduitJsonLd, FilAriane } from "@/components/DonneesStructurees";

export async function generateStaticParams() {
  const handles = await catalogAllHandles();
  return handles.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await catalogProduct(params.slug);
  return {
    title: p ? `${p.name} — MANIKA.LAB` : "MANIKA.LAB",
    description: p?.desc?.slice(0, 160),
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const product = await catalogProduct(params.slug);
  if (!product) notFound();
  // Les compléments suivent les règles de ventes complémentaires du document
  // (oxydant + accessoires sur une coloration, après-shampooing sur un
  // shampooing…), pas un simple « produits en avant ».
  const related = await catalogComplements(product, 4);

  // Les tarifs ne sont pas ici : la fiche et les cartes associées les
  // réclament elles-mêmes à la passerelle après chargement.
  return (
    <>
      <ProduitJsonLd produit={product} />
      <FilAriane
        items={[
          { nom: "Accueil", chemin: "/" },
          { nom: "Boutique", chemin: "/boutique/" },
          { nom: product.name, chemin: `/produit/${product.slug}/` },
        ]}
      />
      <ProductView product={product} related={related} />
    </>
  );
}
