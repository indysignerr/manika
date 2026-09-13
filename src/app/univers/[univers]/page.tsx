import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { catalogTous } from "@/lib/catalog";
import { universDuCatalogue } from "@/lib/taxonomie";
import CatalogueView from "@/components/CatalogueView";

export async function generateStaticParams() {
  const univers = universDuCatalogue(await catalogTous());
  return univers.map((u) => ({ univers: u.slug }));
}

async function trouver(slug: string) {
  const produits = await catalogTous();
  const univers = universDuCatalogue(produits);
  const u = univers.find((x) => x.slug === slug);
  if (!u) return null;
  return {
    u,
    produits: produits.filter((p) => (p.facettes?.univers ?? []).includes(u.valeur)),
  };
}

export async function generateMetadata({ params }: { params: { univers: string } }): Promise<Metadata> {
  const r = await trouver(params.univers);
  return {
    title: r ? `${r.u.valeur} — MANIKA.LAB` : "Boutique — MANIKA.LAB",
    description: r
      ? `${r.u.n} références ${r.u.valeur.toLowerCase()} pour les salons : ${r.u.rayons
          .map((x) => x.valeur.toLowerCase())
          .slice(0, 6)
          .join(", ")}.`
      : undefined,
  };
}

export default async function Page({ params }: { params: { univers: string } }) {
  const r = await trouver(params.univers);
  if (!r) notFound();

  return (
    <CatalogueView
      filAriane={[{ label: "Boutique", href: "/boutique/" }, { label: r.u.valeur }]}
      titre={r.u.valeur}
      intro={`Tout l'univers ${r.u.valeur.toLowerCase()} — ${r.u.n} références, toutes marques confondues. Entrez par un rayon ou affinez directement.`}
      produits={r.produits}
      liens={r.u.rayons.map((x) => ({ label: x.valeur, href: `/rayon/${x.slug}/`, n: x.n }))}
      liensLabel={`Rayons ${r.u.valeur}`}
    />
  );
}
