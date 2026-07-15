import type { Metadata } from "next";
import BoutiqueView from "@/components/BoutiqueView";

export const metadata: Metadata = {
  title: "Boutique — MANIKA.LAB",
  description:
    "Coloration vegan, shampoing kératine, soin monoï, cires et pâtes de coiffage. La gamme capillaire professionnelle MANIKA.LAB, formulée en Italie.",
};

export default function Page() {
  return <BoutiqueView />;
}
