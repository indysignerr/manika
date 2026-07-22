import type { Metadata } from "next";
import BoutiqueLanding from "@/components/BoutiqueLanding";

export const metadata: Metadata = {
  title: "Boutique — MANIKA.LAB",
  description:
    "Coloration, soin, coiffage et consommables — pour la clientèle Femme et Barber. La gamme capillaire professionnelle MANIKA.LAB, formulée en Italie.",
};

export default function Page() {
  return <BoutiqueLanding />;
}
