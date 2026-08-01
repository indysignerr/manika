import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { catalogAllHandles, catalogProduct, catalogFeatured } from "@/lib/catalog";
import ProductView from "@/components/ProductView";

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
  return <ProductView product={product} related={related} />;
}
