"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/components/cart-context";

const NAV = [
  { label: "Boutique", href: "/boutique/" },
  { label: "Rituels", href: "/#rituels" },
  { label: "Ingrédients", href: "/#ingredients" },
  { label: "À propos", href: "/#histoire" },
  { label: "Contact", href: "/#contact" },
];

export default function Header() {
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[85]">
      <div className="bg-copper py-2 text-center text-[9px] uppercase tracking-wide3 text-ivory md:text-[10px]">
        Livraison offerte dès 60 € · Retours gratuits 30 jours · Fabriqué en Provence
      </div>

      <header
        className={`transition-all duration-500 ${
          scrolled ? "border-b border-taupe/40 bg-ivory/85 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="container-luxe grid grid-cols-[1fr_auto_1fr] items-center gap-6 py-4">
          <div className="flex items-center gap-3">
            <button
              className="p-1 text-copper md:hidden"
              onClick={() => setMenu(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
            <nav className="hidden gap-7 md:flex" aria-label="Navigation principale">
              {NAV.slice(0, 3).map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  className="text-[11px] uppercase tracking-wide2 text-copper transition-opacity hover:opacity-60"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" aria-label="MANIKA — Accueil" data-cursor>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/wordmark.png"
              alt="MANIKA — Hair Cosmetics"
              className="h-9 w-auto md:h-10"
            />
          </Link>

          <div className="flex items-center justify-end gap-4 text-copper md:gap-5">
            <nav className="hidden gap-7 md:flex" aria-label="Navigation secondaire">
              {NAV.slice(3).map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  className="text-[11px] uppercase tracking-wide2 text-copper transition-opacity hover:opacity-60"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <button aria-label="Rechercher" className="hidden p-1 transition-opacity hover:opacity-60 md:block">
              <Search size={17} strokeWidth={1.5} />
            </button>
            <button aria-label="Mon compte" className="hidden p-1 transition-opacity hover:opacity-60 md:block">
              <User size={17} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setOpen(true)}
              aria-label={`Ouvrir le panier — ${count} article${count > 1 ? "s" : ""}`}
              className="relative p-1 transition-opacity hover:opacity-60"
            >
              <ShoppingBag size={17} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[9px] text-ivory">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[97] flex flex-col bg-ivory px-8 pt-6"
          >
            <div className="flex justify-end">
              <button onClick={() => setMenu(false)} aria-label="Fermer le menu" className="p-2 text-copper">
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="mt-10 flex flex-col gap-7" aria-label="Menu mobile">
              {NAV.map((n, i) => (
                <motion.div
                  key={n.label}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.08 * i }}
                >
                  <Link
                    href={n.href}
                    onClick={() => setMenu(false)}
                    className="heading text-2xl"
                  >
                    {n.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <p className="mt-auto pb-10 text-[10px] uppercase tracking-wide3 text-taupe">
              MANIKA — Hair Cosmetics
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
