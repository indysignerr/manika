import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { catalogTous } from "@/lib/catalog";
import { REFLETS, parseTeinte, swatch } from "@/lib/nuancier";
import { universDuCatalogue } from "@/lib/taxonomie";
import TeinteIntrouvable from "@/components/TeinteIntrouvable";

/**
 * 404 — « teinte introuvable ».
 *
 * Un salon qui arrive ici venait chercher un produit : la page ne s'arrête
 * pas sur l'erreur, elle rouvre les trois chemins les plus courts vers une
 * fiche — la recherche (nom ou nuance), les univers, la commande rapide.
 */
export default async function NotFound() {
  const univers = universDuCatalogue(await catalogTous());

  const teinte = parseTeinte("4.04");
  const nom = [
    teinte.hauteurLabel,
    [teinte.refletLabel, teinte.refletSecondaire ? REFLETS[teinte.refletSecondaire] : null]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="page-top relative overflow-hidden bg-ivory">
      {/* Halo cuivré, décoratif */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-rose/20 blur-3xl"
      />

      <div className="container-luxe relative grid items-center gap-14 py-16 md:grid-cols-[1fr_auto] md:gap-20 md:py-24">
        {/* Sur mobile, le texte et la recherche passent AVANT la carte : un salon
            arrivé ici cherche un produit, pas une illustration. */}
        <div>
          <p className="kicker">Erreur 404</p>
          <h1 className="heading mt-4 text-4xl leading-tight md:text-6xl">
            Teinte
            <br />
            introuvable
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink md:text-lg">
            Cette page n&apos;existe pas, ou plus. Le catalogue, lui, est complet&nbsp;:
            retrouvez votre produit par son nom ou sa nuance.
          </p>

          <form action="/recherche/" method="get" role="search" className="mt-8 max-w-md">
            <label htmlFor="recherche-404" className="sr-only">
              Rechercher un produit, une marque ou une nuance
            </label>
            <div className="flex items-stretch border border-copper bg-ivory focus-within:ring-2 focus-within:ring-copper/40">
              <input
                id="recherche-404"
                name="q"
                type="search"
                placeholder="Produit, marque ou nuance (ex. 6.64)"
                className="min-h-[48px] w-full bg-transparent px-4 text-sm text-ink placeholder:text-taupe-deep focus:outline-none"
              />
              <button
                type="submit"
                className="flex min-h-[48px] min-w-[48px] items-center justify-center bg-copper text-ivory transition-colors hover:bg-copper-deep"
                aria-label="Lancer la recherche"
              >
                <Search size={18} strokeWidth={1.5} aria-hidden />
              </button>
            </div>
          </form>

          {univers.length > 0 && (
            <nav aria-label="Univers" className="mt-10">
              <p className="kicker">Ou repartez d&apos;un univers</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {univers.map((u) => (
                  <li key={u.slug}>
                    <Link
                      href={`/univers/${u.slug}/`}
                      className="inline-flex min-h-[44px] items-center gap-2 border border-taupe px-4 text-[11px] uppercase tracking-wide2 text-ink transition-colors hover:border-copper hover:text-copper"
                    >
                      {u.menu}
                      <span className="text-taupe-deep">{u.n}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/commande-rapide/" className="btn-primary">
              Commande rapide
              <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
            </Link>
            <Link href="/" className="btn-ghost min-h-[44px]">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>

        <div>
          <TeinteIntrouvable code={teinte.code} nom={nom} couleur={swatch(teinte)} />
        </div>
      </div>
    </section>
  );
}
