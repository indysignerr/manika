"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { bandeauAnnonce } from "@/lib/pro";
import { AnimatePresence, motion } from "framer-motion";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { shopifyAccountUrl } from "@/lib/shopify";
import type { MarqueVue, UniversVue } from "@/lib/taxonomie";

const accountUrl = shopifyAccountUrl() ?? "/contact/";

/**
 * La navigation vient du CATALOGUE, pas d'une liste écrite ici : le layout
 * la dérive des métachamps Shopify et la passe en props. Ajouter une marque
 * ou un rayon dans Shopify suffit à le faire apparaître au build suivant.
 */
export type Navigation = { univers: UniversVue[]; marques: MarqueVue[] };

/**
 * La navigation éditoriale passe en second rang : sur un catalogue de
 * distributeur, « Ingrédients » et « À propos » ne doivent pas concurrencer
 * les rayons. Le lien NAYUMA vit dans le pied de page et le menu mobile —
 * une marque tierce n'a pas sa place dans la nav principale.
 */
const NAV_EDITO = [
  { label: "Ingrédients", href: "/ingredients/" },
  { label: "À propos", href: "/a-propos/" },
  { label: "Contact", href: "/contact/" },
];

const linkCls =
  "inline-flex min-h-11 items-center whitespace-nowrap text-[11px] uppercase tracking-wide2 text-copper transition-opacity hover:opacity-60";

/** Un onglet de la barre de rayons, avec son méga-menu éventuel. */
const ongletCls =
  "inline-flex min-h-11 items-center whitespace-nowrap text-[10px] uppercase tracking-wide2 text-copper transition-opacity hover:opacity-60";

export default function Header({ navigation }: { navigation: Navigation }) {
  const { univers, marques } = navigation;
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
        {bandeauAnnonce().join(" · ")}
      </div>

      <header
        className={`transition-all duration-500 ${
          scrolled ? "border-b border-taupe/40 bg-ivory/85 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="container-luxe grid grid-cols-[1fr_auto_1fr] items-center gap-6 py-4">
          <div className="flex items-center gap-3">
            <button
              className="-ml-2.5 flex h-11 w-11 items-center justify-center text-copper md:hidden"
              onClick={() => setMenu(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
            {/* La navigation principale vit dans sa propre barre, sous le
                logo : sept entrées de rayons ne tiennent pas à côté d'un
                wordmark centré et d'un champ de recherche. */}
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation secondaire">
              {NAV_EDITO.map((n) => (
                <Link key={n.label} href={n.href} className={linkCls}>
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" aria-label="MANIKA.LAB — Accueil" data-cursor className="inline-flex min-h-11 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/wordmark.png" alt="MANIKA.LAB" className="h-6 w-auto md:h-7" />
          </Link>

          <div className="flex items-center justify-end gap-5 text-copper">
            <Link
              href="/devenir-client-pro/"
              className="hidden whitespace-nowrap rounded-[2px] border border-copper px-5 py-2.5 text-[10px] uppercase tracking-wide2 text-copper transition-colors hover:bg-copper hover:text-ivory lg:inline-flex"
              data-cursor
            >
              Compte pro
            </Link>
            {/* Commande rapide : le geste n°1 d'un salon qui réassortit est de
                chercher une teinte ou une référence, pas de naviguer dans des
                rayons. Le champ est donc permanent à partir du desktop.
                C'est un formulaire GET : il marche même sans JavaScript, et
                /recherche/ relit le paramètre `q` à l'arrivée. */}
            <form
              action="/recherche/"
              role="search"
              className="relative hidden items-center lg:flex"
            >
              <label htmlFor="recherche-entete" className="sr-only">
                Rechercher une teinte, une référence ou un produit
              </label>
              <Search
                size={15}
                strokeWidth={1.5}
                aria-hidden
                className="pointer-events-none absolute left-0 text-bronze"
              />
              <input
                id="recherche-entete"
                type="search"
                name="q"
                placeholder="Teinte, référence…"
                className="w-44 border-b border-taupe/60 bg-transparent py-2 pl-6 pr-2 text-[12px] font-light text-ink placeholder:text-taupe-deep focus:border-copper focus:outline-none xl:w-56"
              />
            </form>
            <Link
              href="/recherche/"
              aria-label="Rechercher un produit"
              title="Rechercher"
              className="flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60 lg:hidden"
            >
              <Search size={17} strokeWidth={1.5} />
            </Link>
            <a
              href={accountUrl}
              aria-label="S'identifier — mon compte"
              title="S'identifier · Mon compte"
              className="hidden h-11 w-11 items-center justify-center transition-opacity hover:opacity-60 md:flex"
            >
              <User size={17} strokeWidth={1.5} />
            </a>
            <button
              onClick={() => setOpen(true)}
              aria-label={`Ouvrir le panier — ${count} article${count > 1 ? "s" : ""}`}
              className="relative -mr-2.5 flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60"
            >
              <ShoppingBag size={17} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-copper text-[9px] text-ivory">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* BARRE DE RAYONS — l'arborescence du document :
            MARQUES | les univers | PROMOTIONS | COMMANDE RAPIDE.
            Chaque univers ouvre ses rayons ; on ne descend jamais plus bas,
            le reste se filtre sur la page. */}
        <nav
          aria-label="Rayons"
          className={`hidden border-t lg:block ${
            scrolled ? "border-taupe/30" : "border-taupe/20"
          }`}
        >
          <div className="container-luxe flex items-center justify-center gap-8 xl:gap-10">
            {/* Nos marques */}
            <div className="group relative">
              <Link href="/marques/" className={ongletCls}>
                Nos marques
              </Link>
              <div className="invisible absolute left-1/2 top-full z-[90] -translate-x-1/2 pt-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="w-[420px] rounded-[4px] border border-taupe/40 bg-ivory/95 p-6 shadow-[0_24px_50px_rgba(107,66,48,0.14)] backdrop-blur-md">
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                    {marques.map((m) => (
                      <li key={m.slug}>
                        <Link
                          href={`/marques/${m.slug}/`}
                          className="flex items-baseline justify-between gap-3 text-[12px] tracking-wide text-copper transition-opacity hover:opacity-60"
                        >
                          {m.valeur}
                          <span className="text-[10px] text-taupe-deep">{m.n}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/marques/"
                    className="mt-5 block border-t border-taupe/40 pt-3.5 text-[10px] uppercase tracking-wide2 text-bronze transition-opacity hover:opacity-60"
                  >
                    Toutes les marques →
                  </Link>
                </div>
              </div>
            </div>

            {/* Un onglet par univers, avec ses rayons */}
            {univers.map((u) => (
              <div key={u.slug} className="group relative">
                <Link href={`/univers/${u.slug}/`} className={ongletCls}>
                  {u.menu}
                </Link>
                {u.rayons.length > 0 && (
                  <div className="invisible absolute left-1/2 top-full z-[90] -translate-x-1/2 pt-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="w-[320px] rounded-[4px] border border-taupe/40 bg-ivory/95 p-6 shadow-[0_24px_50px_rgba(107,66,48,0.14)] backdrop-blur-md">
                      <ul className="space-y-2.5">
                        {u.rayons.map((r) => (
                          <li key={r.slug}>
                            <Link
                              href={`/rayon/${r.slug}/`}
                              className="flex items-baseline justify-between gap-3 text-[12px] tracking-wide text-copper transition-opacity hover:opacity-60"
                            >
                              {r.valeur}
                              <span className="text-[10px] text-taupe-deep">{r.n}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/univers/${u.slug}/`}
                        className="mt-5 block border-t border-taupe/40 pt-3.5 text-[10px] uppercase tracking-wide2 text-bronze transition-opacity hover:opacity-60"
                      >
                        Tout {u.menu.toLowerCase()} →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Link href="/promotions/" className={ongletCls}>
              Promotions
            </Link>
            {/* Mise en avant par le poids et une pastille, pas par le
                rose-gold : ivoire ou rose sur ivoire tombe à 2,7:1. */}
            <Link
              href="/commande-rapide/"
              className={`${ongletCls} flex items-center gap-2 font-medium`}
              data-cursor
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-rose" />
              Commande rapide
            </Link>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[97] flex flex-col overflow-y-auto bg-ivory px-8 pt-6"
          >
            <div className="flex justify-end">
              <button onClick={() => setMenu(false)} aria-label="Fermer le menu" className="p-2 text-copper">
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-7" aria-label="Menu mobile">
              <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <Link
                  href="/devenir-client-pro/"
                  onClick={() => setMenu(false)}
                  className="btn-primary w-full"
                >
                  Devenir client pro
                </Link>
              </motion.div>
              {/* MOBILE — le document l'exige « particulièrement simple » :
                  une seule profondeur. On liste les univers et leurs rayons à
                  plat, sans accordéon à ouvrir puis refermer. */}
              <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <Link
                  href="/commande-rapide/"
                  onClick={() => setMenu(false)}
                  className="flex items-center justify-between border border-rose px-5 py-4 text-[12px] uppercase tracking-wide2 text-bronze"
                >
                  Commande rapide <span aria-hidden>→</span>
                </Link>
              </motion.div>

              <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <Link href="/marques/" onClick={() => setMenu(false)} className="heading text-2xl">
                  Nos marques
                </Link>
                <div className="mt-3 flex flex-wrap gap-2">
                  {marques.map((m) => (
                    <Link
                      key={m.slug}
                      href={`/marques/${m.slug}/`}
                      onClick={() => setMenu(false)}
                      className="rounded-[2px] border border-taupe/60 px-3 py-2 text-[12px] font-light text-copper"
                    >
                      {m.valeur}
                    </Link>
                  ))}
                </div>
              </motion.div>

              {univers.map((u, i) => (
                <motion.div
                  key={u.slug}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.04 * (i + 1) }}
                >
                  <Link
                    href={`/univers/${u.slug}/`}
                    onClick={() => setMenu(false)}
                    className="heading text-2xl"
                  >
                    {u.menu}
                  </Link>
                  {u.rayons.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {u.rayons.map((r) => (
                        <li key={r.slug}>
                          <Link
                            href={`/rayon/${r.slug}/`}
                            onClick={() => setMenu(false)}
                            className="flex items-baseline justify-between gap-3 text-[13px] font-light text-copper"
                          >
                            {r.valeur}
                            <span className="text-[11px] text-taupe-deep">{r.n}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}

              <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <Link href="/promotions/" onClick={() => setMenu(false)} className="heading text-2xl">
                  Promotions
                </Link>
              </motion.div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-taupe/40 pt-6">
                {NAV_EDITO.map((n) => (
                  <Link
                    key={n.label}
                    href={n.href}
                    onClick={() => setMenu(false)}
                    className="text-[12px] uppercase tracking-wide2 text-copper"
                  >
                    {n.label}
                  </Link>
                ))}
              </div>
              <a
                href={accountUrl}
                onClick={() => setMenu(false)}
                className="mt-4 inline-flex items-center gap-2.5 border-t border-taupe/40 pt-6 text-[13px] uppercase tracking-wide2 text-copper"
              >
                <User size={16} strokeWidth={1.5} /> S&apos;identifier
              </a>
              <a
                href="https://nayumatea.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenu(false)}
                className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-[12px] uppercase tracking-wide2 text-bronze"
              >
                Découvrez NAYUMA — thé &amp; rituel capillaire <span aria-hidden>↗</span>
              </a>
            </nav>
            <p className="mt-auto pb-10 pt-8 text-[10px] uppercase tracking-wide3 text-taupe-deep">MANIKA.LAB</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
