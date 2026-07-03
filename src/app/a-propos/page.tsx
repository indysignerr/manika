import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";

export const metadata: Metadata = {
  title: "À propos — MANIKA Hair Cosmetics",
  description:
    "L'apothicaire du cheveu. Née d'un rituel transmis de génération en génération, MANIKA formule des soins capillaires naturels en Provence.",
};

const VALUES = [
  {
    num: "01",
    title: "Transparence radicale",
    text: "Chaque INCI est publié, expliqué, justifié. Si un ingrédient n'a pas de raison d'être, il n'entre pas dans la formule.",
  },
  {
    num: "02",
    title: "Récolte à la main",
    text: "Romarin, ortie, lavandin — cueillis au lever du jour dans un rayon de 40 km autour de l'atelier, au rythme des saisons.",
  },
  {
    num: "03",
    title: "Formulation artisanale",
    text: "Petites cuvées numérotées, macérations lentes, zéro sous-traitance. L'atelier est ouvert aux visites chaque premier samedi du mois.",
  },
];

const STATS = [
  { value: "98 %", label: "d'origine naturelle" },
  { value: "7", label: "huiles vierges pressées à froid" },
  { value: "40 km", label: "rayon de récolte maximal" },
  { value: "0", label: "compromis sur la formule" },
];

const Leaf = () => (
  <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="#8A5F2A" strokeWidth="1.3" aria-hidden="true">
    <path d="M20 36 Q18 24 20 12 Q21 6 20 4" />
    <path d="M20 26 Q12 24 10 16 Q16 18 20 21" />
    <path d="M20 18 Q28 16 30 8 Q24 10 20 13" />
  </svg>
);

export default function Page() {
  return (
    <div className="pt-32 md:pt-36">
      {/* Héro éditorial */}
      <section className="relative overflow-hidden pb-20">
        <div className="pointer-events-none absolute -right-20 -top-28 w-[460px] opacity-[0.08]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/motif.png" alt="" />
        </div>
        <div className="container-luxe">
          <Reveal>
            <p className="kicker">La maison</p>
            <h1 className="heading mt-4 max-w-2xl text-4xl leading-[1.1] md:text-6xl">
              L&apos;apothicaire
              <br />
              du <em className="font-serif normal-case italic tracking-normal text-bronze">cheveu</em>
            </h1>
            <p className="mt-8 max-w-lg text-[15px] font-light leading-relaxed text-ink/80">
              MANIKA est née d&apos;un carnet de recettes transmis de génération en génération, entre
              les collines de Provence. Nous n&apos;avons rien inventé — nous avons écouté, mesuré,
              et retiré tout le superflu.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Valeurs */}
      <section className="bg-ivory-2 py-24">
        <div className="container-luxe">
          <Reveal className="text-center">
            <p className="kicker">Ce qui ne se négocie pas</p>
            <h2 className="heading mt-3 text-3xl md:text-4xl">Trois engagements</h2>
          </Reveal>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.num} delay={i * 0.12} className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-ivory">
                  <Leaf />
                </div>
                <p className="kicker mt-6">Engagement {v.num}</p>
                <h3 className="heading mt-3 text-xl">{v.title}</h3>
                <p className="mx-auto mt-4 max-w-xs text-[13px] font-light leading-relaxed text-ink/75">
                  {v.text}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Manifeste */}
      <section className="py-28">
        <div className="container-luxe max-w-3xl text-center">
          <Reveal>
            <p className="kicker">Manifeste</p>
            <blockquote className="mt-8 font-serif text-2xl italic leading-relaxed text-copper md:text-[2rem]">
              « La beauté ne se fabrique pas en laboratoire. Elle se cultive, se récolte et se
              transmet — comme tout ce qui pousse. »
            </blockquote>
            <p className="mt-8 text-[10px] uppercase tracking-wide3 text-taupe">
              Fondatrice, MANIKA — Provence
            </p>
          </Reveal>
        </div>
      </section>

      {/* Chiffres */}
      <section className="border-y border-taupe/40 py-16">
        <div className="container-luxe grid grid-cols-2 gap-10 text-center md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <p className="font-display text-5xl font-extralight text-copper md:text-6xl">{s.value}</p>
              <p className="mt-3 text-[10px] uppercase tracking-wide2 text-taupe">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Atelier */}
      <section className="py-24 md:py-32">
        <div className="container-luxe grid items-center gap-14 md:grid-cols-2">
          <Reveal className="md:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-gradient-to-br from-ivory-2 via-ivory-3 to-[#EFE3D6]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/motif.png"
                alt="Motif botanique MANIKA"
                className="absolute left-1/2 top-1/2 w-3/5 -translate-x-1/2 -translate-y-1/2 opacity-90"
              />
              <div className="absolute inset-x-0 bottom-0 bg-copper-deep/80 px-6 py-4 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wide3 text-ivory/80">
                  L&apos;atelier — visites le 1er samedi du mois
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="md:order-1">
            <p className="kicker">L&apos;atelier</p>
            <h2 className="heading mt-4 text-3xl leading-[1.15] md:text-[2.6rem]">
              Là où tout
              <br />
              se <em className="font-serif normal-case italic tracking-normal text-bronze">compose</em>
            </h2>
            <p className="mt-7 max-w-md text-[14px] font-light leading-relaxed text-ink/80">
              Un ancien moulin réhabilité, des cuves de macération en cuivre, et une règle
              affichée à l&apos;entrée : « si tu ne peux pas prononcer l&apos;ingrédient, il ne
              rentre pas ». Les cuvées sont numérotées à la main, chaque flacon garde la trace de
              sa récolte.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Magnetic>
                <Link href="/contact/" className="btn-primary" data-cursor>
                  Visiter l&apos;atelier
                </Link>
              </Magnetic>
              <Link href="/#ingredients" className="btn-ghost" data-cursor>
                Les actifs
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-ivory-2 py-24 text-center">
        <div className="container-luxe">
          <Reveal>
            <h2 className="heading text-3xl md:text-4xl">Prête pour le rituel ?</h2>
            <p className="mx-auto mt-4 max-w-sm text-[13px] font-light text-ink/75">
              Trois gestes, une chevelure transformée. La récolte d&apos;automne est en édition
              limitée.
            </p>
            <div className="mt-9">
              <Magnetic>
                <Link href="/boutique/" className="btn-primary" data-cursor>
                  Découvrir la collection
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
