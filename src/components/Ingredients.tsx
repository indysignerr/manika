"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BottleVisual from "@/components/BottleVisual";

const INGREDIENTS = [
  {
    name: "Romarin de Provence",
    role: "Stimule la microcirculation de la racine",
    detail: "Distillé à moins de 40 km de l'atelier, récolté à la main au lever du jour.",
  },
  {
    name: "Ortie sauvage",
    role: "Purifie sans agresser le cuir chevelu",
    detail: "Cueillette sauvage certifiée, séchée à basse température pour préserver les actifs.",
  },
  {
    name: "Argan bio du Maroc",
    role: "Scelle la brillance, nourrit la longueur",
    detail: "Première pression à froid, coopérative féminine partenaire depuis 2019.",
  },
];

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

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(2);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "+=1800",
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          setActive(Math.min(2, Math.floor(self.progress * 3)));
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="ingredients"
      className="flex min-h-[100svh] items-center bg-ivory-2 py-20"
    >
      <div className="container-luxe grid items-center gap-12 md:grid-cols-[0.8fr_1.2fr]">
        <div className="hidden flex-col items-center gap-6 md:flex">
          <div className="floaty">
            <BottleVisual variant="serum" name="Élixir Racines" category="Sérum" className="h-[46svh] max-h-[420px]" />
          </div>
          <p className="text-[9px] uppercase tracking-wide3 text-taupe-deep">
            Le flacon reste — les actifs défilent
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
            <Link href="/produit/elixir-racines/" className="btn-primary" data-cursor>
              Découvrir l&apos;Élixir — 42,00 €
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
    </section>
  );
}
