import type { Metadata } from "next";
import { Jost, Marcellus } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/components/cart-context";

const jost = Jost({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-jost",
});

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marcellus",
});

export const metadata: Metadata = {
  title: "MANIKA.LAB — Fournisseur des salons de coiffure",
  description:
    "Coloration bio vegan sans ammoniaque, soin, coiffage, mobilier et équipement de salon. Tarifs professionnels HT, sans minimum de commande. Compte pro sur SIRET.",
  openGraph: {
    title: "MANIKA.LAB — Fournisseur des salons de coiffure",
    description:
      "La gamme professionnelle bio des salons. Kit de démarrage sans risque, invendus repris à 90 jours.",
    locale: "fr_FR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: "MANIKA.LAB",
  description:
    "Fournisseur des salons de coiffure : coloration bio vegan, soin, coiffage, mobilier et équipement professionnel.",
  brand: { "@type": "Brand", name: "MANIKA.LAB" },
  // Cible commerciale — signale aux moteurs que la boutique s'adresse aux professionnels.
  audience: { "@type": "BusinessAudience", audienceType: "Salons de coiffure et barbershops" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${jost.variable} ${marcellus.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CartProvider>
          <CustomCursor />
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
