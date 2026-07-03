import type { Metadata } from "next";
import Link from "next/link";
import { bySlug, fmt } from "@/lib/products";
import BottleVisual from "@/components/BottleVisual";
import Reveal from "@/components/Reveal";
import RituelBundle from "@/components/RituelBundle";

export const metadata: Metadata = {
  title: "Les rituels — MANIKA Hair Cosmetics",
  description:
    "Le protocole MANIKA en trois gestes : nourrir, réparer, sublimer. Un rituel capillaire complet, transmis et perfectionné en Provence.",
};

const RITUELS = [
  {
    num: "01",
    title: "Nourrir",
    slug: "huile-precieuse",
    duration: "30 min · 1× par semaine",
    desc: "Le bain d'huiles avant-shampoing est le geste fondateur. Sept huiles vierges imprègnent la fibre à cœur et la préparent à recevoir les soins suivants.",
    steps: [
      "Sur cheveux secs, imprégner les longueurs mèche par mèche",
      "Envelopper dans une serviette chaude pour ouvrir les écailles",
      "Laisser poser 30 minutes — ou toute une nuit pour un rituel profond",
    ],
    bg: "bg-ivory-2",
    numColor: "text-taupe",
  },
  {
    num: "02",
    title: "Réparer",
    slug: "baume-ambre",
    duration: "10 min · 1 à 2× par semaine",
    desc: "Après le shampoing doux, la kératine végétale comble les brèches de la fibre. Dix minutes suffisent — au-delà, le soin n'apporte plus rien : nous l'avons mesuré.",
    steps: [
      "Essorer soigneusement — le soin ne se dilue pas dans l'eau",
      "Appliquer des mi-longueurs aux pointes, jamais à la racine",
      "Rincer à l'eau tiède, finir par un jet frais pour resserrer les écailles",
    ],
    bg: "bg-ivory-3",
    numColor: "text-rose",
  },
  {
    num: "03",
    title: "Sublimer",
    slug: "elixir-racines",
    duration: "2 min · chaque soir",
    desc: "Le geste quotidien. Six gouttes d'élixir massées du bout des doigts activent la microcirculation et scellent la brillance. C'est le rituel qui transforme sur la durée.",
    steps: [
      "Le soir, sur cuir chevelu sec, déposer 6 gouttes raie par raie",
      "Masser 2 minutes en cercles lents, sans frotter",
      "Ne pas rincer — l'élixir travaille pendant la nuit",
    ],
    bg: "bg-[#EFE3D6]",
    numColor: "text-bronze",
  },
];

export default function Page() {
  return (
    <div className="pt-32 md:pt-36">
      {/* Héro */}
      <section className="relative overflow-hidden pb-16 md:pb-20">
        <div className="pointer-events-none absolute -right-20 -top-28 w-[440px] opacity-[0.08]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/motif.png" alt="" />
        </div>
        <div className="container-luxe">
          <Reveal>
            <p className="kicker">Le protocole MANIKA</p>
            <h1 className="heading mt-4 max-w-2xl text-4xl leading-[1.1] md:text-6xl">
              Trois gestes,
              <br />
              une <em className="font-serif normal-case italic tracking-normal text-bronze">transformation</em>
            </h1>
            <p className="mt-8 max-w-lg text-[15px] font-light leading-relaxed text-ink/80">
              Un rituel n&apos;est pas une routine. C&apos;est un ordre précis, des durées mesurées,
              et des gestes qui comptent autant que les formules. Voici le protocole complet —
              huit semaines pour une chevelure transformée.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-9 flex gap-2">
              {RITUELS.map((r) => (
                <a
                  key={r.num}
                  href={`#rituel-${r.num}`}
                  className="rounded-[2px] border border-taupe/60 px-5 py-2.5 text-[10px] uppercase tracking-wide2 text-copper transition-colors hover:border-copper"
                  data-cursor
                >
                  {r.num} · {r.title}
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Les trois rituels */}
      {RITUELS.map((r, idx) => {
        const product = bySlug(r.slug)!;
        const reversed = idx % 2 === 1;
        return (
          <section key={r.num} id={`rituel-${r.num}`} className={`${r.bg} py-20 md:py-28`}>
            <div className="container-luxe grid items-center gap-12 md:grid-cols-2 md:gap-16">
              <Reveal className={reversed ? "md:order-2" : ""}>
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[3px] bg-ivory">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/motif.png"
                    alt=""
                    className="absolute left-1/2 top-1/2 w-2/3 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
                  />
                  <Link href={`/produit/${r.slug}/`} aria-label={product.name} data-cursor>
                    <BottleVisual
                      variant={product.variant}
                      name={product.name}
                      category={product.category}
                      className="h-[40svh] max-h-[380px] transition-transform duration-700 hover:-translate-y-3"
                    />
                  </Link>
                  <span className="absolute bottom-4 left-1/2 w-max -translate-x-1/2 rounded-[2px] border border-taupe/60 bg-ivory/80 px-3 py-1.5 text-[9px] uppercase tracking-wide2 text-copper backdrop-blur-sm">
                    {r.duration}
                  </span>
                </div>
              </Reveal>

              <Reveal delay={0.12} className={reversed ? "md:order-1" : ""}>
                <span className={`block font-display text-[5.5rem] font-extralight leading-none md:text-[8rem] ${r.numColor}`}>
                  {r.num}
                </span>
                <h2 className="heading mt-2 text-3xl md:text-4xl">{r.title}</h2>
                <p className="mt-5 max-w-md text-[14px] font-light leading-relaxed text-ink/80">
                  {r.desc}
                </p>

                <ol className="mt-8 max-w-md">
                  {r.steps.map((step, i) => (
                    <li key={i} className="flex gap-4 border-b border-taupe/50 py-4 last:border-b-0">
                      <span className="font-display text-lg font-extralight text-bronze">{i + 1}</span>
                      <span className="text-[13px] font-light leading-relaxed text-ink/80">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <Link href={`/produit/${r.slug}/`} className="btn-primary" data-cursor>
                    {product.name} — {fmt(product.price)}
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>
        );
      })}

      {/* Le rituel complet */}
      <section className="bg-copper py-20 text-ivory md:py-24">
        <div className="container-luxe grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <p className="text-[10px] uppercase tracking-wide3 text-ivory/75">L&apos;essentiel</p>
            <h2 className="heading mt-3 text-3xl !text-ivory md:text-4xl">Le rituel complet</h2>
            <p className="mt-5 max-w-md text-[14px] font-light leading-relaxed text-ivory/80">
              Les trois gestes réunis — huile, baume et élixir. Et comme le coffret dépasse 60 €,
              la livraison est offerte.
            </p>
            <div className="mt-8">
              <RituelBundle />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="flex items-end justify-center gap-6">
              {RITUELS.map((r) => {
                const p = bySlug(r.slug)!;
                return (
                  <Link key={r.slug} href={`/produit/${r.slug}/`} aria-label={p.name} data-cursor>
                    <BottleVisual
                      variant={p.variant}
                      className="h-36 transition-transform duration-500 hover:-translate-y-2 md:h-48"
                    />
                  </Link>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
