import type { Metadata } from "next";
import BoutiqueLanding from "@/components/BoutiqueLanding";
import { catalogCounts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Boutique — MANIKA.LAB",
  description:
    "Coloration, soin, coiffage et consommables — pour la clientèle Femme et Barber. La gamme capillaire professionnelle MANIKA.LAB.",
};

export default async function Page() {
  const counts = await catalogCounts();
  return <BoutiqueLanding counts={counts} />;
}
