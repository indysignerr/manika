import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { bySlug } from "@/lib/products";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";

export const metadata: Metadata = {
  title: "Les ingrédients — MANIKA.LAB",
  description:
    "Le glossaire des actifs MANIKA.LAB : kératine, acide hyaluronique, argan, monoï. Et la liste de ce qui n'entrera jamais dans nos formules.",
};

const ACTIFS = [
  {
    name: "Kératine hydrolysée",
    latin: "Hydrolyzed Keratin",
    origin: "Actif reconstructeur",
    role: "Comble les brèches de la fibre et lui rend force et densité après la couleur.",
    products: ["shampoing-keratine", "soin-monoi"],
  },
  {
    name: "Acide hyaluronique",
    latin: "Sodium Hyaluronate",
    origin: "Agent d'hydratation",
    role: "Retient l'eau au cœur du cheveu, gonfle la fibre et lisse les écailles.",
    products: ["shampoing-keratine", "coloration-bio-vegan"],
  },
  {
    name: "Huile d'argan",
    latin: "Argania Spinosa",
    origin: "Pressée à froid, Maroc",
    role: "Nourrit la longueur, discipline et scelle la brillance sans alourdir.",
    products: ["soin-monoi", "texture-shine"],
  },
  {
    name: "Monoï de Tahiti",
    latin: "Cocos Nucifera",
    origin: "Appellation d'origine, Polynésie",
    role: "Adoucit corps et cheveux, protège du dessèchement après-soleil.",
    products: ["soin-monoi"],
  },
  {
    name: "Jojoba",
    latin: "Simmondsia Chinensis",
    origin: "Cire végétale",
    role: "Protège la fibre pendant la coloration et régule le sébum.",
    products: ["coloration-bio-vegan"],
  },
  {
    name: "Thé vert",
    latin: "Camellia Sinensis",
    origin: "Antioxydant végétal",
    role: "Antioxydant, apaise le cuir chevelu et préserve l'éclat de la couleur.",
    products: ["coloration-bio-vegan"],
  },
  {
    name: "Aloe vera",
    latin: "Aloe Barbadensis",
    origin: "Gel apaisant",
    role: "Hydrate et calme le cuir chevelu, même sensibilisé par la couleur.",
    products: ["coloration-bio-vegan"],
  },
  {
    name: "Argile kaolin",
    latin: "Kaolin",
    origin: "Argile blanche",
    role: "Matifie et texturise le coiffage sans effet gras ni résidu.",
    products: ["cire-matifiante"],
  },
];

const BANNIS = [
  { name: "Ammoniaque", why: "Agresse la fibre et le cuir chevelu pendant la couleur" },
  { name: "Sulfates SLES / SLS", why: "Décapent la fibre et ternissent la couleur" },
  { name: "Silicones", why: "Étouffent le cheveu sous un film occlusif" },
  { name: "Parabènes", why: "Conservateurs controversés — remplaçables" },
  { name: "Colorants de synthèse", why: "Aucun bénéfice pour la fibre" },
  { name: "Allergènes déclarables", why: "Premiers responsables des réactions" },
];

const Leaf = () => (
  <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none" stroke="#8A5F2A" strokeWidth="1.3" aria-hidden="true">
    <path d="M20 36 Q18 24 20 12 Q21 6 20 4" />
    <path d="M20 26 Q12 24 10 16 Q16 18 20 21" />
    <path d="M20 18 Q28 16 30 8 Q24 10 20 13" />
  </svg>
);

export default function Page() {
  return (
    <div className="pt-32 md:pt-36">
      {/* Héro */}
      <section className="relative overflow-hidden pb-16">
        <div className="pointer-events-none absolute -left-24 -top-20 w-[420px] opacity-[0.05]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-mark.png" alt="" />
        </div>
        <div className="container-luxe">
          <Reveal>
            <p className="kicker">La composition</p>
            <h1 className="heading mt-4 max-w-2xl text-4xl leading-[1.1] md:text-6xl">
              Des actifs,
              <br />
              sans <em className="font-serif normal-case italic tracking-normal text-bronze">compromis</em>
            </h1>
            <p className="mt-8 max-w-lg text-[15px] font-light leading-relaxed text-ink/80">
              Chaque formule MANIKA.LAB est construite autour d&apos;actifs choisis pour une raison
              précise et publiés ici. La qualité d&apos;un salon, la transparence en plus.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Glossaire des actifs */}
      <section className="border-t border-taupe/40 py-16 md:py-20">
        <div className="container-luxe">
          <Reveal>
            <p className="kicker">Le glossaire</p>
            <h2 className="heading mt-3 text-2xl md:text-3xl">Huit actifs, huit raisons d&apos;être</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-7">
            {ACTIFS.map((a, i) => (
              <Reveal key={a.name} delay={(i % 4) * 0.07}>
                <article className="flex h-full flex-col rounded-[3px] bg-ivory-2 p-7">
                  <Leaf />
                  <h3 className="heading mt-5 text-[15px] tracking-luxe">{a.name}</h3>
                  <p className="mt-1 font-serif text-[13px] italic text-bronze">{a.latin}</p>
                  <p className="mt-3 text-[12px] font-light leading-relaxed text-ink/80">{a.role}</p>
                  <p className="mt-3 text-[10px] uppercase tracking-wider text-taupe-deep">{a.origin}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                    {a.products.map((slug) => {
                      const p = bySlug(slug)!;
                      return (
                        <Link
                          key={slug}
                          href={`/produit/${slug}/`}
                          className="rounded-[2px] border border-taupe/60 px-2.5 py-1.5 text-[9px] uppercase tracking-wider text-copper transition-colors hover:border-copper hover:bg-copper hover:text-ivory"
                          data-cursor
                        >
                          {p.name}
                        </Link>
                      );
                    })}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Liste noire */}
      <section className="bg-copper py-20 text-ivory md:py-24">
        <div className="container-luxe">
          <Reveal className="text-center">
            <p className="text-[10px] uppercase tracking-wide3 text-ivory/75">La règle du labo</p>
            <h2 className="heading mt-3 text-3xl !text-ivory md:text-4xl">
              Jamais dans nos formules
            </h2>
          </Reveal>
          <div className="mx-auto mt-12 grid max-w-3xl gap-x-12 gap-y-6 sm:grid-cols-2">
            {BANNIS.map((b, i) => (
              <Reveal key={b.name} delay={(i % 2) * 0.08}>
                <div className="flex items-start gap-4 border-b border-ivory/15 pb-5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ivory/40">
                    <X size={13} strokeWidth={1.5} aria-hidden />
                  </span>
                  <div>
                    <p className="text-[13px] uppercase tracking-wide2">{b.name}</p>
                    <p className="mt-1 text-[12px] font-light text-ivory/70">{b.why}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center md:py-24">
        <div className="container-luxe">
          <Reveal>
            <h2 className="heading text-2xl md:text-3xl">La preuve par l&apos;étiquette</h2>
            <p className="mx-auto mt-4 max-w-sm text-[13px] font-light text-ink/75">
              Chaque INCI complet est publié sur la fiche produit, sans abréviation ni astérisque
              caché.
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
