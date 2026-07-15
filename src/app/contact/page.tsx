import type { Metadata } from "next";
import ContactView from "@/components/ContactView";

export const metadata: Metadata = {
  title: "Contact — MANIKA.LAB",
  description:
    "Un doute sur le rituel adapté à vos cheveux ? Écrivez-nous — réponse sous 24 h ouvrées.",
};

export default function Page() {
  return <ContactView />;
}
