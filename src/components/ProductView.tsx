"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown, Lock, Truck, Leaf, RotateCcw, Minus, Plus } from "lucide-react";
import { Product, products, fmt } from "@/lib/products";
import { useCart } from "@/components/cart-context";
import BottleVisual from "@/components/BottleVisual";
import ProductCard from "@/components/ProductCard";
import Magnetic from "@/components/Magnetic";
import Reveal from "@/components/Reveal";

const ACCORDION = (p: Product) => [
  { title: "Description", body: p.desc },
  { title: "Ingrédients", body: p.inci },
  { title: "Utilisation", body: p.usage },
  {
    title: "Livraison & retours",
    body: "Expédition sous 24 h depuis la Provence. Livraison offerte dès 60 €. Retours gratuits sous 30 jours, même flacon entamé.",
  },
];

export default function ProductView({ product }: { product: Product }) {
  const { add } = useCart();
  const [sizeIndex, setSizeIndex] = useState(
    Math.max(0, product.sizes.findIndex((s) => s.delta === 0))
  );
  const [qty, setQty] = useState(1);
  const [openAcc, setOpenAcc] = useState(0);
  const [showBar, setShowBar] = useState(false);

  const spinRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const size = product.sizes[sizeIndex];
  const unit = product.price + size.delta;

  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => window.removeEventListener("scroll", onScroll);
    }
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        spinRef.current,
        { rotationY: -14 },
        {
          rotationY: 346,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
          },
        }
      );
    }, rootRef);

    return () => {
      window.removeEventListener("scroll", onScroll);
      ctx.revert();
    };
  }, []);

  const addToCart = () => {
    for (let i = 0; i < qty; i++) add(product.slug, size.label, unit);
  };

  const crossSell = products.filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <div ref={rootRef} className="pt-32 md:pt-36">
      <div className="container-luxe grid gap-14 pb-20 md:grid-cols-2 md:gap-20">
        {/* Galerie — flacon 360° */}
        <div className="md:sticky md:top-36 md:self-start">
          <div
            className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[3px] bg-gradient-to-b from-ivory-2 to-ivory-3"
            style={{ perspective: 900 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/motif.png"
              alt=""
              className="absolute left-1/2 top-1/2 w-2/3 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
            />
            <div ref={spinRef} style={{ transformStyle: "preserve-3d" }} className="floaty">
              <BottleVisual
                variant={product.variant}
                name={product.name}
                category={product.category}
                className="h-[46svh] max-h-[420px] drop-shadow-[0_30px_40px_rgba(107,66,48,0.16)]"
              />
            </div>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-[2px] border border-taupe/60 bg-ivory/70 px-3 py-1.5 text-[9px] uppercase tracking-wide2 text-copper backdrop-blur-sm">
              360° — piloté par votre scroll
            </span>
          </div>
        </div>

        {/* Détails */}
        <div>
          <nav className="text-[10px] uppercase tracking-wide2 text-taupe" aria-label="Fil d'ariane">
            Accueil / Boutique / <span className="text-rose">{product.name}</span>
          </nav>

          <p className="kicker mt-6">{product.category} · Édition automne</p>
          <h1 className="heading mt-3 text-4xl md:text-[2.8rem]">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm tracking-[0.3em] text-rose" aria-label="4,9 sur 5">★★★★★</span>
            <span className="text-[11px] text-taupe">4,9 — 214 avis</span>
          </div>

          <p className="mt-5 max-w-md text-[14px] font-light leading-relaxed text-ink/80">
            {product.desc}
          </p>

          <div className="mt-6 flex items-baseline gap-4">
            <p className="text-3xl font-extralight text-copper">{fmt(unit)}</p>
            <p className="text-[11px] text-taupe">Livraison offerte dès 60 €</p>
          </div>

          {product.stock && (
            <div className="mt-6 max-w-md">
              <div className="mb-2 flex justify-between text-[10px] uppercase tracking-wide2">
                <span className="text-copper">Récolte d&apos;automne — édition limitée</span>
                <span className="text-bronze">Plus que {product.stock} flacons</span>
              </div>
              <div className="h-[3px] rounded-full bg-ivory-3">
                <div
                  className="h-[3px] rounded-full bg-rose"
                  style={{ width: `${Math.round((product.stock / 30) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {product.sizes.length > 1 && (
            <fieldset className="mt-8">
              <legend className="mb-3 text-[10px] uppercase tracking-wide3 text-copper">Taille</legend>
              <div className="flex gap-2">
                {product.sizes.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => setSizeIndex(i)}
                    aria-pressed={i === sizeIndex}
                    className={`rounded-[2px] border px-6 py-3 text-[11px] tracking-wider transition-colors ${
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
              <button onClick={addToCart} className="btn-primary w-full !py-[15px]" data-cursor>
                Ajouter au panier — {fmt(unit * qty)}
              </button>
            </Magnetic>
          </div>

          <div className="mt-8 grid max-w-md grid-cols-3 gap-3 text-center">
            {[
              { icon: Truck, label: "Expédié sous 24 h" },
              { icon: Leaf, label: "98 % naturel" },
              { icon: RotateCcw, label: "Retours 30 jours" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-[3px] bg-ivory-2 px-2 py-3.5">
                <Icon size={16} strokeWidth={1.4} className="mx-auto text-bronze" aria-hidden />
                <p className="mt-2 text-[9px] uppercase tracking-wider text-copper">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 max-w-md border-t border-taupe/50">
            {ACCORDION(product).map((item, i) => (
              <div key={item.title} className="border-b border-taupe/50">
                <button
                  onClick={() => setOpenAcc(openAcc === i ? -1 : i)}
                  aria-expanded={openAcc === i}
                  className="flex w-full items-center justify-between py-4.5 text-left text-[11px] uppercase tracking-wide2 text-copper py-5"
                >
                  {item.title}
                  <ChevronDown
                    size={15}
                    strokeWidth={1.5}
                    className={`transition-transform duration-400 ${openAcc === i ? "rotate-180" : ""}`}
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
                      <p className="pb-5 text-[13px] font-light leading-relaxed text-ink/75">{item.body}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cross-sell */}
      <section className="bg-ivory-2 py-20">
        <div className="container-luxe">
          <Reveal>
            <p className="kicker">Compléter le rituel</p>
            <h2 className="heading mt-3 text-2xl md:text-3xl">Ils se marient bien</h2>
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

      {/* Barre sticky d'achat */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[80] border-t border-ivory/20 bg-copper-deep/95 backdrop-blur-md transition-transform duration-500 ${
          showBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="container-luxe flex items-center justify-between gap-4 py-3">
          <p className="truncate text-[11px] uppercase tracking-wide2 text-ivory">
            {product.name} · {size.label}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ivory">{fmt(unit)}</span>
            <button
              onClick={addToCart}
              className="rounded-[2px] bg-rose px-6 py-2.5 text-[10px] uppercase tracking-wide2 text-ivory transition-colors hover:bg-rose-hover"
              data-cursor
            >
              <Lock size={11} strokeWidth={1.5} className="mr-2 inline" aria-hidden />
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
