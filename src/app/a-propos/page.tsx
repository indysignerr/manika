import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";

export const metadata: Metadata = {
  title: "À propos — MANIKA.LAB",
  description:
    "MANIKA.LAB met la qualité du salon en flacon : coloration vegan, kératine reconstructrice et coiffage de précision, formulés en Italie.",
};

const VALUES = [
  {
    num: "01",
    title: "Transparence radicale",
    text: "Chaque INCI est publié, expliqué, justifié. Si un ingrédient n'a pas de raison d'être, il n'entre pas dans la formule.",
  },
  {
    num: "02",
    title: "Fabriqué en Italie",
    text: "Formulé et conditionné dans un laboratoire italien aux standards professionnels. Contrôle qualité à chaque lot.",
  },
  {
    num: "03",
    title: "Éprouvé en salon",
    text: "Chaque produit est testé par des coiffeurs avant son lancement. La qualité du salon, transposée chez vous.",
  },
];

const STATS = [
  { value: "100 %", label: "formules vegan" },
  { value: "0", label: "ammoniaque, ni SLES" },
  { value: "Italie", label: "fabrication" },
  { value: "6", label: "produits, une routine complète" },
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
        <div className="pointer-events-none absolute -right-20 -top-28 w-[460px] opacity-[0.06]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-mark.png" alt="" />
        </div>
        <div className="container-luxe">
          <Reveal>
            <p className="kicker">La maison</p>
            <h1 className="heading mt-4 max-w-2xl text-4xl leading-[1.1] md:text-6xl">
              Le laboratoire
              <br />
              du <em className="font-serif normal-case italic tracking-normal text-bronze">cheveu</em>
            </h1>
            <p className="mt-8 max-w-lg text-[15px] font-light leading-relaxed text-ink/80">
              MANIKA.LAB est né d&apos;une conviction simple : la qualité d&apos;un salon ne devrait
              pas s&apos;arrêter à la porte du salon. Nous formulons en Italie des produits de niveau
              professionnel — et nous les rendons accessibles.
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
              « La qualité d&apos;un salon ne devrait pas être un privilège. On l&apos;a mise en
              flacon, sans en retirer une once d&apos;exigence. »
            </blockquote>
            <p className="mt-8 text-[10px] uppercase tracking-wide3 text-taupe-deep">
              L&apos;équipe MANIKA.LAB
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
              <p className="mt-3 text-[10px] uppercase tracking-wide2 text-taupe-deep">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Laboratoire */}
      <section className="py-24 md:py-32">
        <div className="container-luxe grid items-center gap-14 md:grid-cols-2">
          <Reveal className="md:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-gradient-to-br from-ivory-2 via-ivory-3 to-[#EFE3D6]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-mark.png"
                alt="MANIKA.LAB"
                className="absolute left-1/2 top-1/2 w-3/5 -translate-x-1/2 -translate-y-1/2 opacity-90"
              />
              <div className="absolute inset-x-0 bottom-0 bg-copper-deep/80 px-6 py-4 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wide3 text-ivory/80">
                  Laboratoire partenaire — Italie
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="md:order-1">
            <p className="kicker">Le laboratoire</p>
            <h2 className="heading mt-4 text-3xl leading-[1.15] md:text-[2.6rem]">
              Là où tout
              <br />
              se <em className="font-serif normal-case italic tracking-normal text-bronze">décide</em>
            </h2>
            <p className="mt-7 max-w-md text-[14px] font-light leading-relaxed text-ink/80">
              Nos formules naissent dans un laboratoire italien spécialisé en cosmétique capillaire
              professionnelle. Sourcing d&apos;actifs, dosages, contrôle qualité lot par lot : la
              même rigueur que les marques de salon, la transparence en plus.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Magnetic>
                <Link href="/contact/" className="btn-primary" data-cursor>
                  Nous écrire
                </Link>
              </Magnetic>
              <Link href="/ingredients/" className="btn-ghost" data-cursor>
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
            <h2 className="heading text-3xl md:text-4xl">Prêt à changer de routine ?</h2>
            <p className="mx-auto mt-4 max-w-sm text-[13px] font-light text-ink/75">
              Colorer, réparer, coiffer — la qualité salon, en trois gestes et six produits.
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
