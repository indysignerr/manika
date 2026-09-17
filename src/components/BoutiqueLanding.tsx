import Link from "next/link";
import Reveal from "@/components/Reveal";
import type { MarqueVue, UniversVue } from "@/lib/taxonomie";

/**
 * La porte d'entrée du catalogue.
 *
 * Le document veut un produit en 3 clics : depuis cette page, un rayon est à
 * un clic et une fiche à deux. On propose donc les trois entrées possibles —
 * par univers (je cherche un type de produit), par marque (je sais ce que je
 * veux), ou par référence (commande rapide) — et rien d'autre.
 */
export default function BoutiqueLanding({
  univers,
  marques,
  total,
}: {
  univers: UniversVue[];
  marques: MarqueVue[];
  total: number;
}) {
  return (
    <div className="page-top">
      <div className="container-luxe pb-10">
        <Reveal>
          <p className="kicker">Le catalogue</p>
          <h1 className="heading mt-4 text-4xl leading-[1.1] md:text-5xl">La boutique</h1>
          <p className="mt-4 max-w-lg text-[13px] font-light leading-relaxed text-ink/75">
            {total} références, {marques.length} marques. Entrez par le rayon, par la marque, ou
            allez droit au but si vous connaissez déjà vos codes.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/commande-rapide/" className="btn-primary">
              Commande rapide
            </Link>
            <Link href="/marques/" className="btn-ghost">
              Nos marques
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Les univers et leurs rayons — à plat, pas de sous-menu à déplier */}
      <div className="border-t border-taupe/40">
        {univers.map((u, ui) => (
          <section
            key={u.slug}
            className={`border-b border-taupe/40 py-12 ${ui % 2 === 1 ? "bg-ivory-2" : ""}`}
            aria-labelledby={`univers-${u.slug}`}
          >
            <div className="container-luxe grid gap-6 md:grid-cols-[280px_1fr] md:gap-12">
              <Reveal>
                <h2 id={`univers-${u.slug}`} className="heading text-2xl md:text-[1.75rem]">
                  <Link href={`/univers/${u.slug}/`} className="hover:opacity-60">
                    {u.valeur}
                  </Link>
                </h2>
                <p className="mt-2 text-[11px] uppercase tracking-wide2 text-taupe-deep">
                  {u.n} référence{u.n > 1 ? "s" : ""}
                </p>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="flex flex-wrap gap-2">
                  {u.rayons.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/rayon/${r.slug}/`}
                      className="rounded-[2px] border border-taupe/60 px-5 py-3.5 text-[11px] tracking-wide text-copper transition-colors duration-300 hover:border-copper"
                    >
                      {r.valeur}
                      <span className="ml-2 text-[10px] text-taupe-deep">{r.n}</span>
                    </Link>
                  ))}
                  <Link
                    href={`/univers/${u.slug}/`}
                    className="rounded-[2px] border border-copper bg-copper px-5 py-3.5 text-[11px] tracking-wide text-ivory transition-colors duration-300 hover:bg-copper-deep"
                  >
                    Tout voir
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>
        ))}
      </div>

      {/* Les marques, en sortie de page */}
      <section className="py-14" aria-labelledby="marques-titre">
        <div className="container-luxe">
          <Reveal>
            <h2 id="marques-titre" className="heading text-2xl md:text-[1.75rem]">
              Nos marques
            </h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {marques.map((m) => (
                <Link
                  key={m.slug}
                  href={`/marques/${m.slug}/`}
                  className="rounded-[2px] border border-taupe/60 px-5 py-3.5 text-[11px] tracking-wide text-copper transition-colors duration-300 hover:border-copper"
                >
                  {m.valeur}
                  <span className="ml-2 text-[10px] text-taupe-deep">{m.n}</span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
