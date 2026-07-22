"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { HAIR_TYPES, NEEDS } from "@/lib/products";
import { Collection, collectionsByUnivers, productsInCollection } from "@/lib/collections";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

const MAX_PRICE = 60;

const SORTS = [
  { id: "reco", label: "Nos recommandations" },
  { id: "prix-asc", label: "Prix croissant" },
  { id: "prix-desc", label: "Prix décroissant" },
  { id: "az", label: "De A à Z" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

export default function CollectionView({ collection }: { collection: Collection }) {
  const base = useMemo(() => productsInCollection(collection.slug), [collection.slug]);
  const siblings = collectionsByUnivers(collection.univers);

  const [hair, setHair] = useState<string[]>([]);
  const [needs, setNeeds] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sort, setSort] = useState<SortId>("reco");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const filtered = useMemo(() => {
    const list = base.filter(
      (p) =>
        p.price <= maxPrice &&
        (hair.length === 0 || p.hair.some((h) => hair.includes(h))) &&
        (needs.length === 0 || p.need.some((n) => needs.includes(n)))
    );
    if (sort === "prix-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "prix-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "az") list.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    return list;
  }, [base, hair, needs, maxPrice, sort]);

  const activeChips = [...hair, ...needs];
  const hasFilters = activeChips.length > 0 || maxPrice < MAX_PRICE;
  const resetAll = () => {
    setHair([]);
    setNeeds([]);
    setMaxPrice(MAX_PRICE);
  };

  return (
    <div className="pt-32 md:pt-36">
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
              <span className="text-rose">{collection.label}</span>
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
                  className={`rounded-[2px] border px-5 py-2.5 text-[10px] uppercase tracking-wide2 transition-colors duration-300 ${
                    c.slug === collection.slug
                      ? "border-copper bg-copper text-ivory"
                      : "border-taupe/60 text-copper hover:border-copper"
                  }`}
                  data-cursor
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
          {base.length > 0 && (
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
              className="flex items-center justify-between rounded-[2px] border border-taupe/60 px-5 py-3.5 text-[10px] uppercase tracking-wide2 text-copper md:hidden"
            >
              <span className="flex items-center gap-2.5">
                <SlidersHorizontal size={14} strokeWidth={1.5} aria-hidden />
                Filtres{activeChips.length > 0 && ` (${activeChips.length})`}
              </span>
              <span aria-hidden>{filtersOpen ? "−" : "+"}</span>
            </button>
          )}

          {/* Filtres */}
          {base.length > 0 && (
            <aside
              aria-label="Filtres"
              className={`${filtersOpen ? "block" : "hidden"} md:sticky md:top-40 md:block md:self-start`}
            >
              <p className="border-b border-taupe/50 pb-3 text-[10px] uppercase tracking-wide3 text-copper">Affiner</p>

              <fieldset className="mt-7">
                <legend className="mb-4 text-[11px] uppercase tracking-wide2 text-copper">Type de cheveux</legend>
                <div className="space-y-2.5">
                  {HAIR_TYPES.map((h) => (
                    <label key={h} className="flex cursor-pointer items-center gap-2.5 text-[13px] font-light text-ink/80 transition-colors hover:text-copper">
                      <input type="checkbox" checked={hair.includes(h)} onChange={() => toggle(hair, setHair, h)} className="h-3.5 w-3.5 accent-copper" />
                      {h}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-8">
                <legend className="mb-4 text-[11px] uppercase tracking-wide2 text-copper">Besoin</legend>
                <div className="space-y-2.5">
                  {NEEDS.map((n) => (
                    <label key={n} className="flex cursor-pointer items-center gap-2.5 text-[13px] font-light text-ink/80 transition-colors hover:text-copper">
                      <input type="checkbox" checked={needs.includes(n)} onChange={() => toggle(needs, setNeeds, n)} className="h-3.5 w-3.5 accent-copper" />
                      {n}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-8">
                <legend className="mb-4 text-[11px] uppercase tracking-wide2 text-copper">Prix maximum</legend>
                <input type="range" min={10} max={MAX_PRICE} step={1} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-copper" aria-label="Prix maximum" />
                <div className="mt-2 flex justify-between text-[11px] text-copper">
                  <span>10 €</span>
                  <span>{maxPrice} €</span>
                </div>
              </fieldset>

              {hasFilters && (
                <button onClick={resetAll} className="mt-8 text-[10px] uppercase tracking-wide2 text-rose underline-offset-4 hover:underline">
                  Tout réinitialiser
                </button>
              )}
            </aside>
          )}

          {/* Grille / états */}
          <div className={base.length > 0 ? "" : "md:col-span-2"}>
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
                    {activeChips.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => (hair.includes(chip) ? toggle(hair, setHair, chip) : toggle(needs, setNeeds, chip))}
                        className="flex items-center gap-1.5 rounded-[2px] bg-ivory-2 px-3 py-1.5 text-[10px] uppercase tracking-wider text-copper transition-colors hover:bg-ivory-3"
                        aria-label={`Retirer le filtre ${chip}`}
                      >
                        {chip}
                        <X size={10} strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-3 text-[10px] uppercase tracking-wide2 text-copper">
                    Trier
                    <select value={sort} onChange={(e) => setSort(e.target.value as SortId)} className="rounded-[2px] border border-taupe/60 bg-transparent px-3 py-2 text-[11px] tracking-wider text-copper focus:border-copper focus:outline-none">
                      {SORTS.map((s) => (
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
