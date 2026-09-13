import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { catalogTous } from "@/lib/catalog";
import { rayonsDuCatalogue, universDuCatalogue, filtrerParFacette } from "@/lib/taxonomie";
import CatalogueView from "@/components/CatalogueView";

/**
 * Un RAYON = un type de produit (Colorations, Oxydants, Shampooings…).
 *
 * C'est ce que le document appelle une « collection » : une véritable
 * intention d'achat. Tout le reste (marque, contenance, nuance, jetable…)
 * est un FILTRE sur cette page, jamais une page de plus.
 */
export async function generateStaticParams() {
  const rayons = rayonsDuCatalogue(await catalogTous());
  return rayons.map((r) => ({ rayon: r.slug }));
}

async function trouver(slug: string) {
  const produits = await catalogTous();
  const rayon = rayonsDuCatalogue(produits).find((r) => r.slug === slug);
  if (!rayon) return null;
  const dedans = filtrerParFacette(produits, "type", slug);
  // L'univers d'appartenance sert au fil d'ariane et aux rayons voisins.
  const univers = universDuCatalogue(produits).find((u) =>
    u.rayons.some((x) => x.slug === slug)
  );
  return { rayon, dedans, univers };
}

export async function generateMetadata({ params }: { params: { rayon: string } }): Promise<Metadata> {
  const r = await trouver(params.rayon);
  return {
    title: r ? `${r.rayon.valeur} — MANIKA.LAB` : "Boutique — MANIKA.LAB",
    description: r
      ? `${r.rayon.n} références ${r.rayon.valeur.toLowerCase()} pour les salons, toutes marques. Tarifs professionnels HT.`
      : undefined,
  };
}

export default async function Page({ params }: { params: { rayon: string } }) {
  const r = await trouver(params.rayon);
  if (!r) notFound();

  const filAriane = [
    { label: "Boutique", href: "/boutique/" },
    ...(r.univers ? [{ label: r.univers.valeur, href: `/univers/${r.univers.slug}/` }] : []),
    { label: r.rayon.valeur },
  ];

  return (
    <CatalogueView
      filAriane={filAriane}
      titre={r.rayon.valeur}
      intro={`${r.rayon.n} références, toutes marques confondues. Affinez par marque, contenance ou caractéristique technique.`}
      produits={r.dedans}
      liens={(r.univers?.rayons ?? []).map((x) => ({
        label: x.valeur,
        href: `/rayon/${x.slug}/`,
        n: x.n,
        actif: x.slug === r.rayon.slug,
      }))}
      liensLabel={r.univers ? `Rayons ${r.univers.valeur}` : "Rayons"}
    />
  );
}
