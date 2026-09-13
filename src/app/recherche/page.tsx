import type { Metadata } from "next";
import SearchView from "@/components/SearchView";
import { catalogIndex } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Recherche — MANIKA.LAB",
  description:
    "Trouvez une teinte, une référence ou une catégorie dans le catalogue professionnel MANIKA.LAB.",
};

export default async function Page() {
  const index = await catalogIndex();
  return <SearchView index={index} />;
}
