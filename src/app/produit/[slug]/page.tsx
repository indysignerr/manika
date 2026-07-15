import { notFound } from "next/navigation";
import { products, bySlug } from "@/lib/products";
import ProductView from "@/components/ProductView";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = bySlug(params.slug);
  return {
    title: p ? `${p.name} — MANIKA.LAB` : "MANIKA.LAB",
    description: p?.desc,
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const product = bySlug(params.slug);
  if (!product) notFound();
  return <ProductView product={product} />;
}
