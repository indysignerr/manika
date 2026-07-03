import type { Metadata } from "next";
import { Jost, Marcellus } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
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
  title: "MANIKA — Hair Cosmetics · Le rituel capillaire botanique",
  description:
    "Cosmétiques capillaires naturels haut de gamme. Sérums, masques et huiles formulés en Provence — 98 % d'origine naturelle.",
  openGraph: {
    title: "MANIKA — Hair Cosmetics",
    description: "Le rituel capillaire botanique. Formulé et conditionné en Provence.",
    locale: "fr_FR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: "MANIKA — Hair Cosmetics",
  description: "Cosmétiques capillaires naturels haut de gamme, formulés en Provence.",
  brand: { "@type": "Brand", name: "MANIKA" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${jost.variable} ${marcellus.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll>
          <CartProvider>
            <CustomCursor />
            <Header />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
