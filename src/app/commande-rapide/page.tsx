import type { Metadata } from "next";
import CommandeRapideView from "@/components/CommandeRapideView";
import { catalogIndex } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Commande rapide — MANIKA.LAB",
  description:
    "Vous connaissez vos références : teinte, volume d'oxydant, consommable. Saisissez vos quantités et envoyez tout au panier en une fois.",
};

export default async function Page() {
  const index = await catalogIndex();
  return <CommandeRapideView index={index} />;
}
