import type { Metadata } from "next";
import BoutiqueLanding from "@/components/BoutiqueLanding";
import { catalogTous } from "@/lib/catalog";
import { marquesDuCatalogue, universDuCatalogue } from "@/lib/taxonomie";

export const metadata: Metadata = {
  title: "Boutique — MANIKA.LAB",
  description:
    "Le catalogue professionnel MANIKA.LAB : coloration & technique, soins, coiffage, accessoires et consommables. Toutes marques, tarifs HT réservés aux salons.",
};

export default async function Page() {
  const produits = await catalogTous();
  return (
    <BoutiqueLanding
      univers={universDuCatalogue(produits)}
      marques={marquesDuCatalogue(produits)}
      total={produits.length}
    />
  );
}
