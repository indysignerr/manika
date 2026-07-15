import type { Metadata } from "next";
import Link from "next/link";
import { bySlug, fmt } from "@/lib/products";
import ProductImage from "@/components/ProductImage";
import Reveal from "@/components/Reveal";
import RituelBundle from "@/components/RituelBundle";

export const metadata: Metadata = {
  title: "Le protocole — MANIKA.LAB",
  description:
    "Le protocole MANIKA.LAB en trois gestes : colorer, réparer, coiffer. La routine professionnelle pour une couleur éclatante et une fibre reconstruite.",
};

const RITUELS = [
  {
    num: "01",
    title: "Colorer",
    slug: "coloration-bio-vegan",
    duration: "Pose 35 min · en salon ou à domicile",
    desc: "La coloration crème vegan au complexe Hair Plex. Jojoba, thé vert, aloe vera et acide hyaluronique protègent la fibre pendant que la couleur se révèle. Sans ammoniaque.",
    steps: [
      "Mélanger avec la Crème Oxydante MANIKA.LAB, ratio 1:1,5",
      "Appliquer sur cheveux secs non lavés, racines puis longueurs",
      "Laisser poser 35 min, émulsionner puis rincer abondamment",
    ],
    bg: "bg-ivory-2",
    numColor: "text-taupe",
  },
  {
    num: "02",
    title: "Réparer",
    slug: "shampoing-keratine",
    duration: "1 à 2× par semaine",
    desc: "Le shampoing reconstructeur à la kératine et à l'acide hyaluronique comble les brèches de la fibre après la couleur. Sans SLES, sans colorants, sans allergènes.",
    steps: [
      "Émulsionner une noisette sur cheveux mouillés",
      "Masser le cuir chevelu, laisser agir une minute",
      "Rincer à l'eau tiède, renouveler si nécessaire",
    ],
    bg: "bg-ivory-3",
    numColor: "text-rose",
  },
  {
    num: "03",
    title: "Coiffer",
    slug: "texture-shine",
    duration: "Chaque jour · fixation légère",
    desc: "La pâte de coiffage brillance sépare, texturise et illumine la matière. Le fini glossy des coiffages de défilé, sans rigidité ni effet carton.",
    steps: [
      "Prélever une noisette, chauffer entre les paumes",
      "Travailler mèche par mèche sur cheveux secs ou humides",
      "Sculpter la coiffure du bout des doigts",
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
        <div className="pointer-events-none absolute -right-20 -top-28 w-[440px] opacity-[0.06]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-mark.png" alt="" />
        </div>
        <div className="container-luxe">
          <Reveal>
            <p className="kicker">Le protocole MANIKA.LAB</p>
            <h1 className="heading mt-4 max-w-2xl text-4xl leading-[1.1] md:text-6xl">
              Trois gestes,
              <br />
              une <em className="font-serif normal-case italic tracking-normal text-bronze">signature</em>
            </h1>
            <p className="mt-8 max-w-lg text-[15px] font-light leading-relaxed text-ink/80">
              La couleur, la réparation, la finition. Le protocole complet des salons partenaires
              MANIKA.LAB — des gestes précis, des formules professionnelles, un résultat qui dure.
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

      {/* Les trois gestes */}
      {RITUELS.map((r, idx) => {
        const product = bySlug(r.slug)!;
        const reversed = idx % 2 === 1;
        return (
          <section key={r.num} id={`rituel-${r.num}`} className={`${r.bg} py-20 md:py-28`}>
            <div className="container-luxe grid items-center gap-12 md:grid-cols-2 md:gap-16">
              <Reveal className={reversed ? "md:order-2" : ""}>
                <Link
                  href={`/produit/${r.slug}/`}
                  aria-label={product.name}
                  data-cursor
                  className="relative block aspect-[4/5] overflow-hidden rounded-[3px] bg-ivory"
                >
                  <ProductImage product={product} />
                  <span className="absolute bottom-4 left-1/2 w-max -translate-x-1/2 rounded-[2px] border border-taupe/60 bg-ivory/80 px-3 py-1.5 text-[9px] uppercase tracking-wide2 text-copper backdrop-blur-sm">
                    {r.duration}
                  </span>
                </Link>
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

      {/* La routine complète */}
      <section className="bg-copper py-20 text-ivory md:py-24">
        <div className="container-luxe grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <p className="text-[10px] uppercase tracking-wide3 text-ivory/75">L&apos;essentiel</p>
            <h2 className="heading mt-3 text-3xl !text-ivory md:text-4xl">La routine complète</h2>
            <p className="mt-5 max-w-md text-[14px] font-light leading-relaxed text-ivory/80">
              Les trois gestes réunis — coloration, shampoing kératine et texture. Et comme le
              coffret dépasse 60 €, la livraison est offerte.
            </p>
            <div className="mt-8">
              <RituelBundle />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="grid grid-cols-3 gap-4">
              {RITUELS.map((r) => {
                const p = bySlug(r.slug)!;
                return (
                  <Link
                    key={r.slug}
                    href={`/produit/${r.slug}/`}
                    aria-label={p.name}
                    data-cursor
                    className="aspect-[4/5] overflow-hidden rounded-[3px] transition-transform duration-500 hover:-translate-y-1.5"
                  >
                    <ProductImage product={p} />
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
