import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { bySlug } from "@/lib/products";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";

export const metadata: Metadata = {
  title: "Les ingrédients — MANIKA Hair Cosmetics",
  description:
    "Le glossaire complet des actifs MANIKA : origine, rôle et produits. Et la liste de ce qui n'entrera jamais dans nos formules.",
};

const ACTIFS = [
  {
    name: "Romarin de Provence",
    latin: "Rosmarinus officinalis",
    origin: "Récolté à moins de 40 km de l'atelier",
    role: "Stimule la microcirculation du cuir chevelu et fortifie la racine.",
    products: ["elixir-racines", "rituel-volume"],
  },
  {
    name: "Ortie sauvage",
    latin: "Urtica dioica",
    origin: "Cueillette sauvage certifiée, Provence",
    role: "Purifie et régule le sébum sans agresser le microbiome.",
    products: ["elixir-racines", "rituel-volume"],
  },
  {
    name: "Argan bio",
    latin: "Argania spinosa",
    origin: "Coopérative féminine partenaire, Maroc",
    role: "Nourrit la longueur et scelle la brillance, première pression à froid.",
    products: ["elixir-racines", "huile-precieuse"],
  },
  {
    name: "Camomille",
    latin: "Chamomilla recutita",
    origin: "Culture biologique, Drôme provençale",
    role: "Apaise les cuirs chevelus sensibles et ravive les reflets.",
    products: ["rituel-doux"],
  },
  {
    name: "Lin",
    latin: "Linum usitatissimum",
    origin: "Filière française tracée",
    role: "Gaine la boucle et lui rend son ressort naturel, sans effet carton.",
    products: ["rituel-boucles"],
  },
  {
    name: "Guimauve",
    latin: "Althaea officinalis",
    origin: "Racines séchées à basse température",
    role: "Démêle et adoucit — le meilleur après-shampoing que la nature ait écrit.",
    products: ["rituel-boucles"],
  },
  {
    name: "Rose de Damas",
    latin: "Rosa damascena",
    origin: "Distillation artisanale, vallée de Grasse",
    role: "Fixe la lumière sur la fibre et parfume sans alcool ni synthèse.",
    products: ["brume-eclat"],
  },
  {
    name: "Karité brut",
    latin: "Butyrospermum parkii",
    origin: "Commerce équitable, Burkina Faso",
    role: "Répare la fibre altérée par la couleur et la chaleur, en profondeur.",
    products: ["baume-ambre", "creme-de-nuit"],
  },
];

const BANNIS = [
  { name: "Sulfates SLS / SLES", why: "Décapent la fibre et le cuir chevelu" },
  { name: "Silicones", why: "Étouffent le cheveu sous un film occlusif" },
  { name: "Parabènes", why: "Conservateurs controversés — remplaçables" },
  { name: "PEG", why: "Dérivés pétrochimiques, procédé polluant" },
  { name: "Colorants synthétiques", why: "Aucun bénéfice pour la fibre" },
  { name: "Parfums de synthèse", why: "Premiers allergènes de la cosmétique" },
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
        <div className="pointer-events-none absolute -left-24 -top-20 w-[420px] opacity-[0.06]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/motif.png" alt="" />
        </div>
        <div className="container-luxe">
          <Reveal>
            <p className="kicker">La composition</p>
            <h1 className="heading mt-4 max-w-2xl text-4xl leading-[1.1] md:text-6xl">
              Le végétal,
              <br />
              sans <em className="font-serif normal-case italic tracking-normal text-bronze">compromis</em>
            </h1>
            <p className="mt-8 max-w-lg text-[15px] font-light leading-relaxed text-ink/80">
              Chaque actif est choisi pour une raison précise, tracé jusqu&apos;à sa parcelle, et
              publié ici. Si un ingrédient n&apos;a pas de rôle démontré, il n&apos;entre pas dans
              la formule — c&apos;est la règle de l&apos;atelier.
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
            <p className="text-[10px] uppercase tracking-wide3 text-ivory/75">La règle de l&apos;atelier</p>
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
            <h2 className="heading text-2xl md:text-3xl">La preuve par le flacon</h2>
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
