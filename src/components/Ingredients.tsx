"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { bySlug, fmt } from "@/lib/products";
import ProductImage from "@/components/ProductImage";

const INGREDIENTS = [
  {
    name: "Kératine hydrolysée",
    role: "Reconstruit la fibre en profondeur",
    detail: "Comble les brèches ouvertes par la couleur et la chaleur, redonne force et densité.",
  },
  {
    name: "Acide hyaluronique",
    role: "Hydrate au cœur du cheveu",
    detail: "Retient l'eau dans la fibre, la gonfle et lisse les écailles pour une brillance miroir.",
  },
  {
    name: "Huile d'argan",
    role: "Nourrit et scelle la brillance",
    detail: "Pressée à froid, elle discipline la longueur sans jamais l'alourdir.",
  },
];

const featured = bySlug("shampoing-keratine")!;

const Leaf = ({ active }: { active: boolean }) => (
  <svg
    viewBox="0 0 40 40"
    className={`leaf h-11 w-11 ${active ? "" : "opacity-40"}`}
    fill="none"
    stroke="#8A5F2A"
    strokeWidth="1.3"
    aria-hidden="true"
  >
    <path d="M20 36 Q18 24 20 12 Q21 6 20 4" />
    <path d="M20 26 Q12 24 10 16 Q16 18 20 21" />
    <path d="M20 18 Q28 16 30 8 Q24 10 20 13" />
  </svg>
);

export default function Ingredients() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      setActive(2);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // Pas de pin GSAP : le produit reste fixe via position: sticky.
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          setActive(Math.min(2, Math.floor(self.progress * 3)));
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const content = (
    <div className="container-luxe grid items-center gap-12 md:grid-cols-[0.8fr_1.2fr]">
      <div className="hidden flex-col items-center gap-6 md:flex">
        <div className="w-full max-w-[320px] overflow-hidden rounded-[4px] shadow-[0_24px_50px_rgba(107,66,48,0.16)]">
          <div className="aspect-[4/5]">
            <ProductImage product={featured} />
          </div>
        </div>
        <p className="text-[9px] uppercase tracking-wide3 text-taupe-deep">
          Le produit reste — les actifs défilent
        </p>
      </div>

      <div>
        <p className="kicker">La composition</p>
        <h2 className="heading mt-3 text-3xl md:text-4xl">
          Trois actifs,
          <br />
          zéro compromis
        </h2>

        <div className="mt-10">
          {INGREDIENTS.map((ing, i) => {
            const isActive = i === active;
            return (
              <div
                key={ing.name}
                className={`grid grid-cols-[52px_1fr_auto] items-center gap-5 border-b border-taupe/50 py-6 transition-all duration-700 ${
                  isActive ? "ing-active opacity-100" : "opacity-35"
                } ${i === INGREDIENTS.length - 1 ? "border-b-0" : ""}`}
              >
                <Leaf active={isActive} />
                <div>
                  <h3 className="heading text-[15px] tracking-luxe">{ing.name}</h3>
                  <p className="mt-1 text-[12px] font-light text-ink/75">{ing.role}</p>
                  <p
                    className={`overflow-hidden text-[11px] font-light italic text-bronze transition-all duration-700 ${
                      isActive ? "mt-2 max-h-12 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    {ing.detail}
                  </p>
                </div>
                <span className="text-[10px] tracking-wide2 text-taupe-deep">
                  0{i + 1}<span className="opacity-50">/03</span>
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-9 flex items-center gap-6">
          <Link href={`/produit/${featured.slug}/`} className="btn-primary" data-cursor>
            Découvrir le Shampoing — {fmt(featured.price)}
          </Link>
          <Link
            href="/ingredients/"
            className="text-[10px] uppercase tracking-wide2 text-copper underline-offset-4 hover:underline"
            data-cursor
          >
            Tous les actifs →
          </Link>
        </div>
      </div>
    </div>
  );

  if (reduced) {
    return (
      <section id="ingredients" className="flex min-h-[100svh] items-center bg-ivory-2 py-20">
        {content}
      </section>
    );
  }

  return (
    <section ref={root} id="ingredients" className="bg-ivory-2" style={{ height: "260vh" }}>
      <div className="sticky top-0 flex min-h-[100svh] items-center py-20">{content}</div>
    </section>
  );
}
