import type { Metadata } from "next";
import { Jost, Marcellus } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/components/cart-context";
import { PrixProvider } from "@/lib/prix";
import { catalogTous } from "@/lib/catalog";
import { marquesDuCatalogue, universDuCatalogue } from "@/lib/taxonomie";

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // L'arborescence du menu est dérivée du catalogue au build (métachamps
  // `manika.*`), pas écrite à la main : une marque ou un rayon ajouté dans
  // Shopify apparaît tout seul. `catalogTous` est mémoïsé pour ne pas
  // relancer une requête par page.
  const produits = await catalogTous();
  const navigation = {
    univers: universDuCatalogue(produits),
    marques: marquesDuCatalogue(produits),
  };

  return (
    <html lang="fr" className={`${jost.variable} ${marcellus.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Les tarifs ne sont jamais dans le build : ils sont demandés à la
            passerelle après chargement, et seulement pour un compte pro. */}
        <PrixProvider>
          <CartProvider>
            <Header navigation={navigation} />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </PrixProvider>
      </body>
    </html>
  );
}
