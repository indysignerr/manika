"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { products, HAIR_TYPES, NEEDS, Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

const MAX_PRICE = 60;
const CATEGORIES = ["Tous", ...Array.from(new Set(products.map((p) => p.category)))];

const SORTS = [
  { id: "reco", label: "Nos recommandations" },
  { id: "prix-asc", label: "Prix croissant" },
  { id: "prix-desc", label: "Prix décroissant" },
  { id: "az", label: "De A à Z" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

export default function BoutiqueView() {
  const [cat, setCat] = useState("Tous");
  const [hair, setHair] = useState<string[]>([]);
  const [needs, setNeeds] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sort, setSort] = useState<SortId>("reco");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const filtered = useMemo(() => {
    const list = products.filter(
      (p) =>
        (cat === "Tous" || p.category === cat) &&
        p.price <= maxPrice &&
        (hair.length === 0 || p.hair.some((h) => hair.includes(h))) &&
        (needs.length === 0 || p.need.some((n) => needs.includes(n)))
    );
    if (sort === "prix-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "prix-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "az") list.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    return list;
  }, [cat, hair, needs, maxPrice, sort]);

  const activeChips = [...hair, ...needs];
  const hasFilters = activeChips.length > 0 || maxPrice < MAX_PRICE || cat !== "Tous";

  const resetAll = () => {
    setCat("Tous");
    setHair([]);
    setNeeds([]);
    setMaxPrice(MAX_PRICE);
  };

  // Tuile éditoriale insérée dans la grille après le 4e produit
  const tiles: (Product | "edito")[] = [...filtered];
  if (filtered.length > 4) tiles.splice(4, 0, "edito");

  return (
    <div className="pt-32 md:pt-36">
      {/* En-tête éditorial */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-24 w-[380px] opacity-[0.07]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/motif.png" alt="" />
        </div>
        <div className="container-luxe pb-10">
          <Reveal>
            <p className="kicker">La collection · Automne 2026</p>
            <h1 className="heading mt-4 max-w-xl text-4xl leading-[1.1] md:text-5xl">
              Des soins qui
              <br />
              font <em className="font-serif normal-case italic tracking-normal text-bronze">rituel</em>
            </h1>
            <p className="mt-5 max-w-md text-[13px] font-light leading-relaxed text-ink/75">
              Formules douces à base d&apos;actifs végétaux — sulfates, silicones et compromis
              exclus. Chaque flacon est numéroté à l&apos;atelier.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-9 flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  aria-pressed={cat === c}
                  className={`rounded-[2px] border px-5 py-2.5 text-[10px] uppercase tracking-wide2 transition-colors duration-300 ${
                    cat === c
                      ? "border-copper bg-copper text-ivory"
                      : "border-taupe/60 text-copper hover:border-copper"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <div className="border-t border-taupe/40">
        <div className="container-luxe grid gap-8 py-12 md:gap-12 md:grid-cols-[240px_1fr]">
          {/* Bascule filtres — mobile uniquement */}
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

          {/* Filtres */}
          <aside
            aria-label="Filtres"
            className={`${filtersOpen ? "block" : "hidden"} md:block md:sticky md:top-40 md:self-start`}
          >
            <p className="border-b border-taupe/50 pb-3 text-[10px] uppercase tracking-wide3 text-copper">
              Affiner
            </p>

            <fieldset className="mt-7">
              <legend className="mb-4 text-[11px] uppercase tracking-wide2 text-copper">
                Type de cheveux
              </legend>
              <div className="space-y-2.5">
                {HAIR_TYPES.map((h) => (
                  <label
                    key={h}
                    className="flex cursor-pointer items-center gap-2.5 text-[13px] font-light text-ink/80 transition-colors hover:text-copper"
                  >
                    <input
                      type="checkbox"
                      checked={hair.includes(h)}
                      onChange={() => toggle(hair, setHair, h)}
                      className="h-3.5 w-3.5 accent-copper"
                    />
                    {h}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-8">
              <legend className="mb-4 text-[11px] uppercase tracking-wide2 text-copper">Besoin</legend>
              <div className="space-y-2.5">
                {NEEDS.map((n) => (
                  <label
                    key={n}
                    className="flex cursor-pointer items-center gap-2.5 text-[13px] font-light text-ink/80 transition-colors hover:text-copper"
                  >
                    <input
                      type="checkbox"
                      checked={needs.includes(n)}
                      onChange={() => toggle(needs, setNeeds, n)}
                      className="h-3.5 w-3.5 accent-copper"
                    />
                    {n}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-8">
              <legend className="mb-4 text-[11px] uppercase tracking-wide2 text-copper">
                Prix maximum
              </legend>
              <input
                type="range"
                min={20}
                max={MAX_PRICE}
                step={1}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-copper"
                aria-label="Prix maximum"
              />
              <div className="mt-2 flex justify-between text-[11px] text-copper">
                <span>20 €</span>
                <span>{maxPrice} €</span>
              </div>
            </fieldset>

            {hasFilters && (
              <button
                onClick={resetAll}
                className="mt-8 text-[10px] uppercase tracking-wide2 text-rose underline-offset-4 hover:underline"
              >
                Tout réinitialiser
              </button>
            )}
          </aside>

          {/* Grille */}
          <div>
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] uppercase tracking-wide2 text-taupe-deep" aria-live="polite">
                  {filtered.length} produit{filtered.length > 1 ? "s" : ""}
                </p>
                {activeChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() =>
                      hair.includes(chip) ? toggle(hair, setHair, chip) : toggle(needs, setNeeds, chip)
                    }
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
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortId)}
                  className="rounded-[2px] border border-taupe/60 bg-transparent px-3 py-2 text-[11px] tracking-wider text-copper focus:border-copper focus:outline-none"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {filtered.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-serif text-xl italic text-copper">
                  Aucun soin ne correspond à cette recherche.
                </p>
                <button onClick={resetAll} className="btn-ghost mt-7">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-7">
                {tiles.map((tile, i) =>
                  tile === "edito" ? (
                    <Reveal key="edito" delay={(i % 3) * 0.07}>
                      <div className="flex aspect-[3/4] flex-col justify-between rounded-[3px] bg-copper p-7 text-ivory">
                        <span className="font-serif text-4xl italic leading-none text-rose-hover" aria-hidden>
                          «
                        </span>
                        <p className="font-serif text-lg italic leading-relaxed md:text-xl">
                          Le soin commence par le geste, le geste devient rituel.
                        </p>
                        <Link
                          href="/rituels/"
                          className="text-[10px] uppercase tracking-wide2 text-ivory/85 transition-opacity hover:opacity-70"
                          data-cursor
                        >
                          Découvrir les trois gestes →
                        </Link>
                      </div>
                    </Reveal>
                  ) : (
                    <Reveal key={tile.slug} delay={(i % 3) * 0.07}>
                      <ProductCard product={tile} />
                    </Reveal>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
