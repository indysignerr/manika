"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { type Product } from "@/lib/products";
import { FACETTES } from "@/lib/shopify";
import { Collection, collectionsByUnivers } from "@/lib/collections";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { useDemandePrix, usePrixEtat } from "@/lib/prix";

const MAX_PRICE = 60;

const SORTS = [
  { id: "reco", label: "Nos recommandations" },
  { id: "prix-asc", label: "Prix croissant" },
  { id: "prix-desc", label: "Prix décroissant" },
  { id: "az", label: "De A à Z" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

/** Une facette affichable : ses valeurs présentes dans le rayon, et leur compte. */
type FacetteVue = { cle: string; label: string; valeurs: { valeur: string; n: number }[] };

export default function CollectionView({
  collection,
  products,
}: {
  collection: Collection;
  products: Product[];
}) {
  const base = products;
  const siblings = collectionsByUnivers(collection.univers);

  // Aucun montant n'est dans le build : on demande ceux de la collection en
  // une fois, et on ne propose filtre et tri par prix qu'à qui peut les voir.
  const slugs = useMemo(() => base.map((p) => p.slug), [base]);
  useDemandePrix(slugs);
  const { role, prix } = usePrixEtat();
  const tarifsVisibles = role === "pro";
  const sorts = useMemo(
    () => (tarifsVisibles ? SORTS : SORTS.filter((s) => !s.id.startsWith("prix"))),
    [tarifsVisibles]
  );

  /**
   * Les filtres sont CONSTRUITS À PARTIR DU RAYON, pas d'une liste écrite à la
   * main : on n'affiche que des cases qui ramènent au moins un produit. Une
   * facette dont tout le rayon partage la même valeur est masquée — proposer
   * « Marque : Tassel » sur un rayon 100 % Tassel ne filtre rien.
   */
  const facettes = useMemo<FacetteVue[]>(() => {
    const comptes = new Map<string, Map<string, number>>();
    for (const p of base) {
      for (const [cle, valeurs] of Object.entries(p.facettes ?? {})) {
        if (!comptes.has(cle)) comptes.set(cle, new Map());
        const m = comptes.get(cle)!;
        for (const v of valeurs) m.set(v, (m.get(v) ?? 0) + 1);
      }
    }
    return FACETTES.flatMap(({ cle, label }) => {
      const m = comptes.get(cle);
      if (!m || m.size < 2) return [];
      const valeurs = [...m.entries()]
        .map(([valeur, n]) => ({ valeur, n }))
        .sort((a, b) => b.n - a.n || a.valeur.localeCompare(b.valeur, "fr"));
      return [{ cle, label, valeurs }];
    });
  }, [base]);

  const [actifs, setActifs] = useState<Record<string, string[]>>({});
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sort, setSort] = useState<SortId>("reco");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const basculer = (cle: string, valeur: string) =>
    setActifs((a) => {
      const cur = a[cle] ?? [];
      const suite = cur.includes(valeur) ? cur.filter((v) => v !== valeur) : [...cur, valeur];
      if (suite.length === 0) {
        const { [cle]: _retire, ...reste } = a;
        return reste;
      }
      return { ...a, [cle]: suite };
    });

  /**
   * Tarif d'entrée de gamme, ou undefined tant qu'il n'est pas arrivé —
   * auquel cas le produit reste visible : mieux vaut un produit de trop
   * qu'une grille qui se vide le temps d'une requête.
   */
  const tarifDe = (slug: string) => prix[slug]?.min;

  const filtered = useMemo(() => {
    // Curseur au maximum = pas de plafond. Sans ça, un produit à 80 € HT
    // disparaîtrait de la grille sans que personne n'ait rien filtré.
    const plafond = maxPrice < MAX_PRICE ? maxPrice : Infinity;
    const list = base.filter((p) => {
      const min = tarifDe(p.slug);
      // Le prix 0 signifie « pas encore saisi » : il ne doit pas passer pour gratuit.
      if (tarifsVisibles && min !== undefined && min > 0 && min > plafond) return false;
      // ET entre facettes, OU à l'intérieur d'une facette.
      for (const [cle, choisies] of Object.entries(actifs)) {
        const portees = p.facettes?.[cle] ?? [];
        if (!choisies.some((v) => portees.includes(v))) return false;
      }
      return true;
    });
    if (tarifsVisibles && (sort === "prix-asc" || sort === "prix-desc")) {
      // Les produits sans tarif connu ferment la marche dans les deux sens.
      const cle = (s: string) => tarifDe(s) || Number.POSITIVE_INFINITY;
      list.sort((a, b) =>
        sort === "prix-asc" ? cle(a.slug) - cle(b.slug) : cle(b.slug) - cle(a.slug)
      );
    }
    if (sort === "az") list.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, actifs, maxPrice, sort, prix, tarifsVisibles]);

  const chips = Object.entries(actifs).flatMap(([cle, vs]) => vs.map((valeur) => ({ cle, valeur })));
  const hasFilters = chips.length > 0 || (tarifsVisibles && maxPrice < MAX_PRICE);
  const resetAll = () => {
    setActifs({});
    setMaxPrice(MAX_PRICE);
  };

  return (
    <div className="page-top">
      {/* En-tête */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-24 w-[380px] opacity-[0.05]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-mark.png" alt="" />
        </div>
        <div className="container-luxe pb-8">
          <Reveal>
            <nav className="text-[10px] uppercase tracking-wide2 text-taupe-deep" aria-label="Fil d'ariane">
              <Link href="/boutique/" className="hover:text-copper">Boutique</Link> / {collection.univers} /{" "}
              <span className="text-bronze">{collection.label}</span>
            </nav>
            <h1 className="heading mt-4 text-4xl leading-[1.1] md:text-5xl">{collection.label}</h1>
            <p className="mt-4 max-w-md text-[13px] font-light leading-relaxed text-ink/75">
              {collection.tagline} · Univers {collection.univers}.
            </p>
          </Reveal>

          {/* Catégories sœurs */}
          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-wrap gap-2" aria-label={`Autres catégories ${collection.univers}`}>
              {siblings.map((c) => (
                <Link
                  key={c.slug}
                  href={`/boutique/${c.slug}/`}
                  aria-current={c.slug === collection.slug ? "page" : undefined}
                  className={`rounded-[2px] border px-5 py-3.5 text-[10px] uppercase tracking-wide2 transition-colors duration-300 ${
                    c.slug === collection.slug
                      ? "border-copper bg-copper text-ivory"
                      : "border-taupe/60 text-copper hover:border-copper"
                  }`}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <div className="border-t border-taupe/40">
        <div className="container-luxe grid gap-8 py-12 md:grid-cols-[240px_1fr] md:gap-12">
          {/* Bascule filtres mobile */}
          {facettes.length > 0 && (
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
              className="flex items-center justify-between rounded-[2px] border border-taupe/60 px-5 py-3.5 text-[10px] uppercase tracking-wide2 text-copper md:hidden"
            >
              <span className="flex items-center gap-2.5">
                <SlidersHorizontal size={14} strokeWidth={1.5} aria-hidden />
                Filtres{chips.length > 0 && ` (${chips.length})`}
              </span>
              <span aria-hidden>{filtersOpen ? "−" : "+"}</span>
            </button>
          )}

          {/* Filtres */}
          {facettes.length > 0 && (
            <aside
              aria-label="Filtres"
              className={`${filtersOpen ? "block" : "hidden"} md:sticky md:top-40 md:block md:self-start`}
            >
              <p className="border-b border-taupe/50 pb-3 text-[10px] uppercase tracking-wide3 text-copper">Affiner</p>

              {facettes.map((f) => (
                <fieldset key={f.cle} className="mt-7">
                  <legend className="mb-4 text-[11px] uppercase tracking-wide2 text-copper">{f.label}</legend>
                  <div className="space-y-2.5">
                    {f.valeurs.map(({ valeur, n }) => (
                      <label
                        key={valeur}
                        className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[13px] font-light text-ink/80 transition-colors hover:text-copper"
                      >
                        <input
                          type="checkbox"
                          checked={(actifs[f.cle] ?? []).includes(valeur)}
                          onChange={() => basculer(f.cle, valeur)}
                          className="h-4 w-4 shrink-0 accent-copper"
                        />
                        <span className="flex-1">{valeur}</span>
                        <span className="text-[11px] text-taupe-deep">{n}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}

              {/* Filtre prix : sans objet pour qui ne voit pas les tarifs */}
              {tarifsVisibles && (
                <fieldset className="mt-8">
                  <legend className="mb-4 text-[11px] uppercase tracking-wide2 text-copper">Prix maximum</legend>
                  <input type="range" min={10} max={MAX_PRICE} step={1} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-copper" aria-label="Prix maximum" />
                  <div className="mt-2 flex justify-between text-[11px] text-copper">
                    <span>10 €</span>
                    <span>{maxPrice < MAX_PRICE ? `${maxPrice} €` : "Sans limite"}</span>
                  </div>
                </fieldset>
              )}

              {hasFilters && (
                <button onClick={resetAll} className="mt-8 text-[10px] uppercase tracking-wide2 text-bronze underline-offset-4 hover:underline">
                  Tout réinitialiser
                </button>
              )}
            </aside>
          )}

          {/* Grille / états */}
          <div className={facettes.length > 0 ? "" : "md:col-span-2"}>
            {base.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-serif text-xl italic text-copper">Cette catégorie arrive bientôt.</p>
                <p className="mx-auto mt-4 max-w-sm text-[13px] font-light text-ink/70">
                  Les produits « {collection.label} » de l&apos;univers {collection.univers} sont en cours
                  d&apos;ajout. Reviens très vite.
                </p>
                <Link href="/boutique/" className="btn-ghost mt-8">Retour à la boutique</Link>
              </div>
            ) : (
              <>
                <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[11px] uppercase tracking-wide2 text-taupe-deep" aria-live="polite">
                      {filtered.length} produit{filtered.length > 1 ? "s" : ""}
                    </p>
                    {chips.map(({ cle, valeur }) => (
                      <button
                        key={cle + valeur}
                        onClick={() => basculer(cle, valeur)}
                        className="flex items-center gap-1.5 rounded-[2px] bg-ivory-2 px-3 py-1.5 text-[10px] uppercase tracking-wider text-copper transition-colors hover:bg-ivory-3"
                        aria-label={`Retirer le filtre ${valeur}`}
                      >
                        {valeur}
                        <X size={10} strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-3 text-[10px] uppercase tracking-wide2 text-copper">
                    Trier
                    <select value={sort} onChange={(e) => setSort(e.target.value as SortId)} className="min-h-11 rounded-[2px] border border-taupe/60 bg-transparent px-3 py-2 text-[11px] tracking-wider text-copper focus:border-copper focus:outline-none">
                      {sorts.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {filtered.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="font-serif text-xl italic text-copper">Aucun produit ne correspond à ces filtres.</p>
                    <button onClick={resetAll} className="btn-ghost mt-7">Réinitialiser les filtres</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-7">
                    {filtered.map((p, i) => (
                      <Reveal key={p.slug} delay={(i % 3) * 0.07}>
                        <ProductCard product={p} />
                      </Reveal>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
