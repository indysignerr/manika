"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { bySlug, fmt } from "@/lib/products";
import BottleVisual from "@/components/BottleVisual";

const PANELS = [
  {
    num: "01",
    title: "Nourrir",
    text: "Bain d'huiles précieuses avant le shampoing. Trente minutes de pause, une fibre restaurée en profondeur.",
    slug: "huile-precieuse",
    bg: "bg-ivory-2",
    numColor: "text-taupe",
  },
  {
    num: "02",
    title: "Réparer",
    text: "Masque à la kératine végétale, posé dix minutes. La fibre altérée se referme, la douceur revient.",
    slug: "baume-ambre",
    bg: "bg-ivory-3",
    numColor: "text-rose",
  },
  {
    num: "03",
    title: "Sublimer",
    text: "Sérum à l'or végétal en touche finale. Une brillance miroir, sans jamais alourdir la matière.",
    slug: "elixir-racines",
    bg: "bg-[#EFE3D6]",
    numColor: "text-bronze",
  },
];

export default function Rituels() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const getDistance = () => track.current!.scrollWidth - window.innerWidth;
      gsap.to(track.current, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => "+=" + getDistance(),
          pin: true,
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="rituels" className="overflow-hidden" aria-label="Les trois rituels MANIKA">
      <div
        ref={track}
        className={reduced ? "flex flex-col" : "flex h-[100svh] w-max"}
      >
        {PANELS.map((panel) => {
          const product = bySlug(panel.slug)!;
          return (
            <article
              key={panel.num}
              className={`flex w-screen shrink-0 items-center ${panel.bg} ${
                reduced ? "min-h-[80svh] py-20" : "h-full"
              }`}
            >
              <div className="container-luxe grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <span className={`block font-display text-[7rem] font-extralight leading-none md:text-[11rem] ${panel.numColor}`}>
                    {panel.num}
                  </span>
                  <h3 className="heading mt-2 text-4xl md:text-5xl">{panel.title}</h3>
                  <p className="mt-6 max-w-md text-[14px] font-light leading-relaxed text-ink/80">
                    {panel.text}
                  </p>
                  <Link
                    href={`/produit/${panel.slug}/`}
                    className="mt-8 inline-flex items-center gap-3 text-[11px] uppercase tracking-wide2 text-copper transition-opacity hover:opacity-60"
                    data-cursor
                  >
                    {product.name} — {fmt(product.price)}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
                <Link
                  href={`/produit/${panel.slug}/`}
                  className="mx-auto hidden md:block"
                  aria-label={product.name}
                  data-cursor
                >
                  <BottleVisual
                    variant={product.variant}
                    name={product.name}
                    className="h-[40svh] max-h-[380px] transition-transform duration-700 hover:-translate-y-3"
                  />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
