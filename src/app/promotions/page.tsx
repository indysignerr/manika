import type { Metadata } from "next";
import PromotionsView from "@/components/PromotionsView";
import { catalogTous } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Promotions — MANIKA.LAB",
  description:
    "Les références dont le tarif professionnel est temporairement réduit. Réservé aux salons enregistrés.",
};

export default async function Page() {
  const produits = await catalogTous();
  return <PromotionsView produits={produits} />;
}
