import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { catalogAllHandles, catalogProduct, catalogFeatured } from "@/lib/catalog";
import ProductView from "@/components/ProductView";
import { PrixProvider } from "@/lib/prix";

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
  const related = (await catalogFeatured(5)).filter((p) => p.slug !== product.slug).slice(0, 4);

  // Les tarifs de cette fiche et des produits associés sont chargés en une
  // seule requête, et seulement si le visiteur y a droit.
  const handles = [product.slug, ...related.map((p) => p.slug)];

  return (
    <PrixProvider handles={handles}>
      <ProductView product={product} related={related} />
    </PrixProvider>
  );
}
