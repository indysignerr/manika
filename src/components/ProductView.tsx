"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Lock, Truck, PackageCheck, BadgeEuro, Clock, Minus, Plus } from "lucide-react";
import { Product, fmt } from "@/lib/products";
import Prix from "@/components/Prix";
import { useDemandePrix, usePrixEtat, usePrixVariante, usePrix } from "@/lib/prix";
import { useCart } from "@/components/cart-context";
import ProductImage from "@/components/ProductImage";
import ProductCard from "@/components/ProductCard";
import Magnetic from "@/components/Magnetic";
import Reveal from "@/components/Reveal";
import NuancierGrid from "@/components/NuancierGrid";
import { COFFRET, PALIERS, PRO } from "@/lib/pro";
import { parseTeinte } from "@/lib/nuancier";

/**
 * Au-delà de ce nombre de variantes, le sélecteur en pastilles devient
 * illisible : on bascule sur la grille de nuancier (filtres + saisie de
 * quantité par teinte + ajout groupé).
 */
const SEUIL_NUANCIER = 8;

/**
 * Les pastilles de réassurance de la fiche produit.
 *
 * ⚠️ Elles portaient « Expédié sous 24 h » et « Retours 30 jours » écrits en
 *    dur, alors que le délai n'est pas arrêté et que les CGV ne prévoient
 *    aucun retour : le site s'engageait tout seul. On ne montre désormais que
 *    ce qui est réellement décidé dans src/lib/pro.ts.
 */
function reassurancesReelles() {
  const out: { icon: typeof Truck; label: string }[] = [];
  if (PRO.francoDePortHT !== null)
    out.push({ icon: Truck, label: `Livraison offerte dès ${PRO.francoDePortHT} € HT` });
  if (COFFRET.rembourseProchaineCommande)
    out.push({ icon: PackageCheck, label: "Coffret découverte remboursé" });
  if (PRO.delaiExpedition !== null)
    out.push({ icon: Clock, label: `Expédié sous ${PRO.delaiExpedition}` });
  out.push({ icon: BadgeEuro, label: "Tarifs HT réservés aux salons" });
  return out.slice(0, 3);
}

/**
 * Structure imposée par la cliente (point du 10/08) :
 * Description · Conseil aux pros · Ingrédients — et PAS de bloc
 * « Livraison & retours », retiré à sa demande.
 *
 * ⚠️ « Description » N'EST PLUS dans l'accordéon : elle est déjà affichée en
 *    entier juste sous le titre, et la répéter mot pour mot deux fois sur la
 *    même page donnait un doublon visible.
 */
const ACCORDION = (p: Product) =>
  [
    { title: "Conseil aux pros", body: p.usage },
    { title: "Ingrédients", body: p.inci },
  ].filter((i) => i.body && i.body.trim().length > 0);

export default function ProductView({ product, related = [] }: { product: Product; related?: Product[] }) {
  const { add } = useCart();
  const [sizeIndex, setSizeIndex] = useState(Math.max(0, product.sizes.findIndex((s) => s.delta === 0)));
  const [qty, setQty] = useState(1);
  const [openAcc, setOpenAcc] = useState(0);
  const [showBar, setShowBar] = useState(false);

  const size = product.sizes[sizeIndex] ?? product.sizes[0];

  // Le build ne contient aucun montant : le tarif vient de /api/prix, et
  // seulement si le visiteur est un professionnel validé. Les cartes des
  // produits associés réclament les leurs de leur côté.
  useDemandePrix([product.slug]);
  const { role } = usePrixEtat();
  const tarifProduit = usePrix(product.slug);
  const tarifVariante = usePrixVariante(product.slug, size?.variantId);
  const unit = tarifVariante?.prix ?? 0;
  const peutAcheter = role === "pro";

  // Une gamme de coloration : assez de variantes ET des libellés qui se lisent
  // comme des teintes. Sinon (contenances, volumes d'oxydant…), sélecteur normal.
  const estNuancier =
    product.sizes.length >= SEUIL_NUANCIER &&
    product.sizes.filter((s) => parseTeinte(s.label).hauteur !== null).length >=
      product.sizes.length * 0.7;

  const multi = product.sizes.length > 1 && !estNuancier;

  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const addToCart = () => {
    for (let i = 0; i < qty; i++)
      add({
        slug: product.slug,
        size: size.label,
        unit,
        name: product.name,
        image: product.image,
        variantId: size.variantId,
      });
  };

  const crossSell = related.filter((p) => p.slug !== product.slug).slice(0, 4);
  const reassurances = reassurancesReelles();

  return (
    <div className="page-top">
      <div className="container-luxe grid gap-14 pb-20 md:grid-cols-2 md:gap-20">
        {/* Galerie photo */}
        <div className="md:sticky md:top-36 md:self-start">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-ivory-2">
            <ProductImage product={product} eager />
            <span className="absolute bottom-4 left-1/2 w-max -translate-x-1/2 rounded-[2px] border border-taupe/60 bg-ivory/70 px-3 py-1.5 text-[9px] uppercase tracking-wide2 text-copper backdrop-blur-sm">
              {product.tagline || product.category}
            </span>
          </div>
        </div>

        {/* Détails */}
        <div>
          <nav className="text-[10px] uppercase tracking-wide2 text-taupe-deep" aria-label="Fil d'ariane">
            Accueil / Boutique / <span className="text-bronze">{product.name}</span>
          </nav>

          <p className="kicker mt-6">{product.category}</p>
          <h1 className="heading-produit mt-3 text-3xl leading-tight md:text-[2.4rem]">{product.name}</h1>

          {product.desc && (
            <p className="mt-5 max-w-md text-[14px] font-light leading-relaxed text-ink/80">{product.desc}</p>
          )}

          <div className="mt-6 flex items-baseline gap-4">
            <Prix
              handle={product.slug}
              variantId={size?.variantId}
              avecLien
              className="text-3xl font-extralight text-copper"
            />
            <p className="text-[11px] text-taupe-deep">
              Tarif professionnel HT · dégressif par {PALIERS.join(" / ")}
            </p>
          </div>

          {multi && (
            <fieldset className="mt-8">
              <legend className="mb-3 text-[10px] uppercase tracking-wide3 text-copper">Options</legend>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s, i) => (
                  <button
                    key={s.label + i}
                    onClick={() => setSizeIndex(i)}
                    aria-pressed={i === sizeIndex}
                    className={`rounded-[2px] border px-5 py-3 text-[11px] tracking-wider transition-colors ${
                      i === sizeIndex
                        ? "border-copper bg-copper text-ivory"
                        : "border-taupe/60 text-copper hover:border-copper"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {estNuancier ? (
            <p className="mt-8 max-w-md text-[13px] font-light leading-relaxed text-taupe-deep">
              {product.sizes.length} teintes disponibles — composez votre commande dans le nuancier
              ci-dessous.
            </p>
          ) : (
            <div className="mt-8 flex max-w-md gap-3">
              <div className="flex items-center rounded-[2px] border border-taupe/60 text-copper">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Réduire la quantité" className="px-3.5 py-3">
                  <Minus size={13} strokeWidth={1.5} />
                </button>
                <span className="w-7 text-center text-sm" aria-live="polite">{qty}</span>
                <button onClick={() => setQty(qty + 1)} aria-label="Augmenter la quantité" className="px-3.5 py-3">
                  <Plus size={13} strokeWidth={1.5} />
                </button>
              </div>
              <Magnetic className="flex-1">
                <button
                  onClick={addToCart}
                  disabled={!peutAcheter}
                  title={peutAcheter ? undefined : "Réservé aux comptes professionnels validés"}
                  className="btn-primary w-full !py-[15px] disabled:opacity-45"
                  data-cursor
                >
                  {peutAcheter
                    ? `Ajouter au panier${unit > 0 ? ` — ${fmt(unit * qty)}` : ""}`
                    : "Réservé aux professionnels"}
                </button>
              </Magnetic>
            </div>
          )}

          {/* Réassurance — UNIQUEMENT des engagements réellement pris.
              La liste vient de src/lib/pro.ts : rien n'est écrit en dur ici,
              sinon le site promet ce que personne n'a décidé. */}
          {reassurances.length > 0 && (
            <div
              className={`mt-8 grid max-w-md gap-3 text-center ${
                reassurances.length >= 3 ? "grid-cols-3" : "grid-cols-2"
              }`}
            >
              {reassurances.map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-[3px] bg-ivory-2 px-2 py-3.5">
                  <Icon size={16} strokeWidth={1.4} className="mx-auto text-bronze" aria-hidden />
                  <p className="mt-2 text-[9px] uppercase tracking-wider text-copper">{label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 max-w-md border-t border-taupe/50">
            {ACCORDION(product).map((item, i) => (
              <div key={item.title} className="border-b border-taupe/50">
                <button
                  onClick={() => setOpenAcc(openAcc === i ? -1 : i)}
                  aria-expanded={openAcc === i}
                  className="flex w-full items-center justify-between text-left text-[11px] uppercase tracking-wide2 text-copper py-5"
                >
                  {item.title}
                  <ChevronDown
                    size={15}
                    strokeWidth={1.5}
                    className={`transition-transform duration-500 ${openAcc === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openAcc === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="whitespace-pre-line pb-5 text-[13px] font-light leading-relaxed text-ink/75">
                        {item.body}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nuancier — grille de commande multi-teintes */}
      {estNuancier && (
        <section className="border-t border-taupe/40 bg-ivory-2 py-16 md:py-20">
          <div className="container-luxe">
            <NuancierGrid
              slug={product.slug}
              nomGamme={product.name}
              variantes={product.sizes.map((s, i) => ({
                variantId: s.variantId ?? `${product.slug}-${i}`,
                titre: s.label,
                prix: tarifProduit?.variantes.find((v) => v.id === s.variantId)?.prix ?? 0,
                disponible: s.available !== false,
                image: s.image ?? null,
              }))}
            />
          </div>
        </section>
      )}

      {/* Cross-sell */}
      {crossSell.length > 0 && (
        <section className="bg-ivory-2 py-20">
          <div className="container-luxe">
            <Reveal>
              <p className="kicker">Ne repartez pas sans</p>
              <h2 className="heading mt-3 text-2xl md:text-3xl">Pour aller avec</h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-7">
              {crossSell.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.07}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Barre sticky d'achat */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[80] border-t border-ivory/20 bg-copper-deep/95 backdrop-blur-md transition-transform duration-500 ${
          showBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="container-luxe flex items-center justify-between gap-4 py-3">
          <p className="truncate text-[11px] uppercase tracking-wide2 text-ivory">
            {product.name}{multi ? ` · ${size.label}` : ""}
          </p>
          <div className="flex items-center gap-4">
            <Prix
              handle={product.slug}
              variantId={size?.variantId}
              className="text-sm text-ivory"
              classeMasque="text-[11px] font-light text-ivory/85"
            />
            <button
              onClick={addToCart}
              disabled={!peutAcheter}
              title={peutAcheter ? undefined : "Réservé aux comptes professionnels validés"}
              className="rounded-[2px] bg-ivory px-6 py-2.5 text-[10px] uppercase tracking-wide2 text-copper-deep transition-colors hover:bg-ivory-2 disabled:opacity-45 disabled:hover:bg-ivory"
              data-cursor
            >
              <Lock size={11} strokeWidth={1.5} className="mr-2 inline" aria-hidden />
              {peutAcheter ? "Ajouter" : "Compte pro"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
