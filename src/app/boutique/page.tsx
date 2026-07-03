import type { Metadata } from "next";
import BoutiqueView from "@/components/BoutiqueView";

export const metadata: Metadata = {
  title: "Boutique — MANIKA Hair Cosmetics",
  description:
    "Shampoings, masques, sérums et huiles capillaires naturels. Formules douces à base d'actifs végétaux, sulfates et silicones exclus.",
};

export default function Page() {
  return <BoutiqueView />;
}
