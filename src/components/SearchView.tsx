"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, X } from "lucide-react";
import { chercher, type IndexEntry } from "@/lib/search";
import { fmtPrice } from "@/lib/products";

const SUGGESTIONS = ["Coloration", "Oxydant", "Blond cendré", "7.34", "Gants", "Nuancier"];

export default function SearchView({ index }: { index: IndexEntry[] }) {
  const [q, setQ] = useState("");
  const champ = useRef<HTMLInputElement>(null);

  // Permet d'arriver depuis un lien /recherche/?q=… et de garder l'URL
  // partageable, sans recharger la page (export statique : tout est côté client).
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q") ?? "";
    if (initial) setQ(initial);
    champ.current?.focus();
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }, [q]);

  const hits = useMemo(() => chercher(index, q), [index, q]);
  const aCherche = q.trim().length > 0;

  return (
    <div className="container-luxe max-w-4xl pb-28 pt-36">
      <p className="kicker">Recherche</p>
      <h1 className="heading mt-4 text-3xl md:text-4xl">Trouver un produit</h1>

      <div className="relative mt-9">
        <SearchIcon
          size={18}
          strokeWidth={1.5}
          aria-hidden
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-bronze"
        />
        <label htmlFor="q" className="sr-only">
          Rechercher un produit, une teinte, une référence
        </label>
        <input
          id="q"
          ref={champ}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Teinte, référence, catégorie…"
          className="w-full border-b border-taupe/60 bg-transparent py-4 pl-8 pr-9 text-[16px] font-light text-ink placeholder:text-taupe-deep focus:border-copper focus:outline-none"
        />
        {q && (
          <button
            onClick={() => {
              setQ("");
              champ.current?.focus();
            }}
            aria-label="Effacer la recherche"
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-taupe-deep transition-colors hover:text-copper"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {!aCherche && (
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[9px] uppercase tracking-wide3 text-taupe-deep">
            Suggestions
          </span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setQ(s)}
              className="rounded-[2px] border border-taupe/60 px-3 py-1.5 text-[10px] uppercase tracking-wide2 text-copper transition-colors hover:border-copper"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <p aria-live="polite" className="mt-8 text-[12px] font-light text-taupe-deep">
        {aCherche
          ? `${hits.length} résultat${hits.length > 1 ? "s" : ""} sur ${index.length} produits`
          : `${index.length} produits au catalogue`}
      </p>

      {aCherche && hits.length === 0 && (
        <p className="mt-8 text-[14px] font-light leading-relaxed text-ink/75">
          Aucun produit ne correspond à « {q} ». Essayez un code teinte (7.34), une famille
          (cendré, doré) ou une catégorie (coloration, consommables).
        </p>
      )}

      {hits.length > 0 && (
        <ul className="mt-6 divide-y divide-taupe/30 border-t border-taupe/30">
          {hits.map(({ entry, teintes }) => (
            <li key={entry.slug}>
              <Link
                href={`/produit/${entry.slug}/`}
                className="group flex items-center gap-5 py-4 transition-opacity hover:opacity-70"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={entry.image}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-[2px] bg-ivory-2 object-contain"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] uppercase tracking-wide3 text-taupe-deep">
                    {entry.category}
                  </p>
                  <p className="mt-1 text-[14px] font-light text-copper">{entry.name}</p>
                  {teintes.length > 0 && (
                    <p className="mt-1 truncate text-[11px] font-light text-bronze">
                      {teintes.join(" · ")}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[13px] font-light text-copper">{fmtPrice(entry.price)}</p>
                  {!entry.available && (
                    <p className="mt-1 text-[10px] uppercase tracking-wide2 text-taupe-deep">
                      Épuisé
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
