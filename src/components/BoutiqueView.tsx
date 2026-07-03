"use client";

import { useMemo, useState } from "react";
import { products, HAIR_TYPES, NEEDS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

const MAX_PRICE = 60;

export default function BoutiqueView() {
  const [hair, setHair] = useState<string[]>([]);
  const [needs, setNeeds] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.price <= maxPrice &&
          (hair.length === 0 || p.hair.some((h) => hair.includes(h))) &&
          (needs.length === 0 || p.need.some((n) => needs.includes(n)))
      ),
    [hair, needs, maxPrice]
  );

  return (
    <div className="pt-32 md:pt-36">
      <div className="border-b border-taupe/40 pb-12 text-center">
        <p className="kicker">Accueil / Boutique</p>
        <h1 className="heading mt-3 text-3xl md:text-4xl">Toute la collection</h1>
        <p className="mx-auto mt-4 max-w-md text-[13px] font-light text-ink/75">
          Formules douces à base d&apos;actifs végétaux — sulfates, silicones et compromis exclus.
        </p>
      </div>

      <div className="container-luxe grid gap-12 py-14 md:grid-cols-[230px_1fr]">
        {/* Filtres */}
        <aside aria-label="Filtres">
          <p className="border-b border-taupe/50 pb-3 text-[10px] uppercase tracking-wide3 text-copper">
            Filtrer
          </p>

          <fieldset className="mt-7">
            <legend className="mb-4 text-[11px] uppercase tracking-wide2 text-copper">
              Type de cheveux
            </legend>
            <div className="space-y-2.5">
              {HAIR_TYPES.map((h) => (
                <label key={h} className="flex cursor-pointer items-center gap-2.5 text-[13px] font-light text-ink/80">
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
                <label key={n} className="flex cursor-pointer items-center gap-2.5 text-[13px] font-light text-ink/80">
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

          {(hair.length > 0 || needs.length > 0 || maxPrice < MAX_PRICE) && (
            <button
              onClick={() => {
                setHair([]);
                setNeeds([]);
                setMaxPrice(MAX_PRICE);
              }}
              className="mt-8 text-[10px] uppercase tracking-wide2 text-rose underline-offset-4 hover:underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </aside>

        {/* Grille */}
        <div>
          <p className="mb-7 text-[11px] uppercase tracking-wide2 text-taupe" aria-live="polite">
            {filtered.length} produit{filtered.length > 1 ? "s" : ""}
          </p>
          {filtered.length === 0 ? (
            <p className="py-20 text-center font-serif italic text-copper">
              Aucun produit ne correspond — élargissez vos filtres.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-7">
              {filtered.map((p, i) => (
                <Reveal key={p.slug} delay={(i % 3) * 0.07}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
