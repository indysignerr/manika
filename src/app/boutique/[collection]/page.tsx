import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { collections, collectionBySlug } from "@/lib/collections";
import CollectionView from "@/components/CollectionView";

export function generateStaticParams() {
  return collections.map((c) => ({ collection: c.slug }));
}

export function generateMetadata({ params }: { params: { collection: string } }): Metadata {
  const c = collectionBySlug(params.collection);
  return {
    title: c ? `${c.label} ${c.univers} — MANIKA.LAB` : "Boutique — MANIKA.LAB",
    description: c ? `${c.label} · ${c.tagline}. Univers ${c.univers} — MANIKA.LAB.` : undefined,
  };
}

export default function Page({ params }: { params: { collection: string } }) {
  const collection = collectionBySlug(params.collection);
  if (!collection) notFound();
  return <CollectionView collection={collection} />;
}
