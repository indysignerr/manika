import type { Metadata } from "next";
import ContactView from "@/components/ContactView";

export const metadata: Metadata = {
  title: "Contact — MANIKA.LAB",
  description:
    "Une question sur un produit, une teinte, une commande ou votre compte professionnel ? Écrivez à MANIKA.LAB — réponse sous 24 h ouvrées.",
};

export default function Page() {
  return <ContactView />;
}
