import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { catalogTous } from "@/lib/catalog";
import { marquesDuCatalogue, filtrerParFacette, slugifier } from "@/lib/taxonomie";
import { presentationDe } from "@/lib/marques";
import CatalogueView from "@/components/CatalogueView";

/**
 * PAGE DE MARQUE — telle que décrite par le document.
 *
 * Elle ne reproduit PAS l'arborescence générale : elle n'affiche que les
 * familles réellement commercialisées par la marque, et les entrées
 * « Acheter par … » filtrent SUR PLACE. Le parcours reste à deux clics
 * depuis l'accueil : Marques → la marque → (filtre) → produit.
 */
export async function generateStaticParams() {
  const marques = marquesDuCatalogue(await catalogTous());
  return marques.map((m) => ({ marque: m.slug }));
}

async function trouver(slug: string) {
  const produits = await catalogTous();
  const marque = marquesDuCatalogue(produits).find((m) => m.slug === slug);
  if (!marque) return null;
  return { marque, dedans: filtrerParFacette(produits, "marque", slug) };
}

export async function generateMetadata({ params }: { params: { marque: string } }): Promise<Metadata> {
  const r = await trouver(params.marque);
  return {
    title: r ? `${r.marque.valeur} — MANIKA.LAB` : "Nos marques — MANIKA.LAB",
    description: r
      ? `${r.marque.n} références ${r.marque.valeur} distribuées par MANIKA.LAB. Tarifs professionnels HT, réservés aux salons.`
      : undefined,
  };
}

export default async function Page({ params }: { params: { marque: string } }) {
  const r = await trouver(params.marque);
  if (!r) notFound();

  const { marque, dedans } = r;

  // Un résumé factuel à défaut d'un texte de marque fourni par la cliente.
  const universCouverts = [
    ...new Set(dedans.flatMap((p) => p.facettes?.univers ?? [])),
  ];
  const intro =
    presentationDe(marque.valeur) ??
    `${marque.n} référence${marque.n > 1 ? "s" : ""} ${marque.valeur} au catalogue MANIKA.LAB` +
      (universCouverts.length
        ? `, en ${universCouverts.map((u) => u.toLowerCase()).join(", ")}.`
        : ".");

  return (
    <CatalogueView
      filAriane={[
        { label: "Boutique", href: "/boutique/" },
        { label: "Nos marques", href: "/marques/" },
        { label: marque.valeur },
      ]}
      titre={marque.valeur}
      intro={intro}
      produits={dedans}
      // Inutile de proposer « Marque » sur la page d'une marque.
      masquer={["marque"]}
      raccourcis={[
        { cle: "gamme", titre: "Acheter par gamme" },
        { cle: "besoin", titre: "Acheter par besoin" },
        { cle: "type", titre: "Acheter par type" },
      ]}
      vide={`Les produits ${marque.valeur} arrivent au catalogue.`}
    />
  );
}
