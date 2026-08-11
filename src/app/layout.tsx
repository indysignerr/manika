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
  title: "MANIKA.LAB — Coloration professionnelle pour salons",
  description:
    "Trois gammes de coloration professionnelle : végétale, bio vegan et sans ammoniaque, avec oxydants et consommables. Tarifs HT, sans minimum de commande, compte pro sur SIRET.",
  openGraph: {
    title: "MANIKA.LAB — Coloration professionnelle pour salons",
    description:
      "Végétale, bio vegan, sans ammoniaque : testez la couleur avec un lot d'échantillons à prix coûtant, déduit de votre première commande.",
    locale: "fr_FR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: "MANIKA.LAB",
  description:
    "Fournisseur des salons de coiffure, spécialiste de la coloration professionnelle : végétale, bio vegan et sans ammoniaque.",
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
