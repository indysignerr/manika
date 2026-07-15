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
  title: "MANIKA.LAB — Cosmétique capillaire professionnelle",
  description:
    "Coloration vegan, soins reconstructeurs à la kératine et coiffage de précision. La gamme capillaire professionnelle MANIKA.LAB, formulée en Italie.",
  openGraph: {
    title: "MANIKA.LAB",
    description: "L'expertise du salon, chez vous. Coloration, soin et coiffage professionnels.",
    locale: "fr_FR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: "MANIKA.LAB",
  description: "Cosmétique capillaire professionnelle : coloration vegan, soins kératine, coiffage.",
  brand: { "@type": "Brand", name: "MANIKA.LAB" },
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
