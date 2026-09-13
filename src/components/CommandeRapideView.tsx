"use client";

/**
 * COMMANDE RAPIDE — l'entrée réclamée par le document.
 *
 * « Le professionnel qui connaît déjà ses références n'a pas envie de naviguer
 *  dans tout le catalogue ; il veut retrouver Tassel 7.1, oxydant 20 vol,
 *  gants M, entrer ses quantités et commander. »
 *
 * Donc : un seul champ, des résultats immédiats, une quantité par variante, et
 * un ajout groupé. Aucune page produit à ouvrir, aucun aller-retour.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, X, Plus, Minus } from "lucide-react";
import { chercher, type IndexEntry } from "@/lib/search";
import { useCart } from "@/components/cart-context";
import { useDemandePrix, usePrixEtat } from "@/lib/prix";
import Prix from "@/components/Prix";
import { fmt } from "@/lib/products";

const EXEMPLES = ["7.34", "Oxydant 20 vol", "Gants", "Shampooing", "Aluminium"];

/** Clé d'une ligne de saisie : un produit + une variante. */
const cle = (slug: string, id: string) => `${slug}|${id}`;

export default function CommandeRapideView({ index }: { index: IndexEntry[] }) {
  const { addMany } = useCart();
  const [q, setQ] = useState("");
  const [qtes, setQtes] = useState<Record<string, number>>({});
  const [confirme, setConfirme] = useState(0);
  const champ = useRef<HTMLInputElement>(null);

  useEffect(() => {
    champ.current?.focus();
  }, []);

  const hits = useMemo(() => chercher(index, q, 12), [index, q]);

  // Les lignes déjà saisies restent visibles même quand la recherche change :
  // on compose une commande, on ne fait pas une recherche après l'autre.
  const retenus = useMemo(() => {
    const slugs = new Set(Object.keys(qtes).map((k) => k.split("|")[0]));
    return index.filter((e) => slugs.has(e.slug));
  }, [qtes, index]);

  const affiches = useMemo(() => {
    const vus = new Set(retenus.map((e) => e.slug));
    return [...retenus, ...hits.map((h) => h.entry).filter((e) => !vus.has(e.slug))];
  }, [retenus, hits]);

  useDemandePrix(useMemo(() => affiches.map((e) => e.slug), [affiches]));
  const { role, prix } = usePrixEtat();
  const peutCommander = role === "pro";

  const ajuster = (k: string, delta: number) =>
    setQtes((s) => {
      const n = (s[k] ?? 0) + delta;
      if (n <= 0) {
        const { [k]: _retire, ...reste } = s;
        return reste;
      }
      return { ...s, [k]: Math.min(999, n) };
    });

  const fixer = (k: string, v: string) =>
    setQtes((s) => {
      const n = Math.max(0, Math.min(999, parseInt(v, 10) || 0));
      if (n === 0) {
        const { [k]: _retire, ...reste } = s;
        return reste;
      }
      return { ...s, [k]: n };
    });

  const lignes = Object.entries(qtes);
  const totalArticles = lignes.reduce((s, [, n]) => s + n, 0);
  const totalPrix = lignes.reduce((s, [k, n]) => {
    const [slug, id] = k.split("|");
    const v = prix[slug]?.variantes.find((x) => x.id === id);
    return s + (v?.prix ?? 0) * n;
  }, 0);

  const toutAjouter = () => {
    const paniers = lignes
      .map(([k, n]) => {
        const [slug, id] = k.split("|");
        const e = index.find((x) => x.slug === slug);
        const v = e?.variantes.find((x) => x.id === id);
        if (!e || !v) return null;
        return {
          slug,
          size: v.label,
          qty: n,
          unit: prix[slug]?.variantes.find((x) => x.id === id)?.prix ?? 0,
          name: e.name,
          image: e.image,
          variantId: id,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    if (!paniers.length) return;
    addMany(paniers);
    setConfirme(totalArticles);
    setQtes({});
    setTimeout(() => setConfirme(0), 4000);
  };

  return (
    <div className="page-top">
      <div className="container-luxe pb-8">
        <nav className="text-[10px] uppercase tracking-wide2 text-taupe-deep" aria-label="Fil d'ariane">
          <Link href="/boutique/" className="hover:text-copper">Boutique</Link> /{" "}
          <span className="text-rose">Commande rapide</span>
        </nav>
        <h1 className="heading mt-4 text-4xl leading-[1.1] md:text-5xl">Commande rapide</h1>
        <p className="mt-4 max-w-xl text-[13px] font-light leading-relaxed text-ink/75">
          Vous connaissez vos références : tapez une teinte, un volume d&apos;oxydant ou un
          consommable, saisissez les quantités, et envoyez tout au panier en une fois.
        </p>

        <div className="relative mt-8 max-w-2xl">
          <SearchIcon
            size={18}
            strokeWidth={1.5}
            aria-hidden
            className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-bronze"
          />
          <label htmlFor="cr-q" className="sr-only">Référence, teinte ou volume</label>
          <input
            id="cr-q"
            ref={champ}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="7.34, oxydant 20 vol, gants…"
            className="w-full border-b border-taupe/60 bg-transparent py-4 pl-8 pr-9 text-[16px] font-light text-ink placeholder:text-taupe-deep focus:border-copper focus:outline-none"
          />
          {q && (
            <button
              onClick={() => { setQ(""); champ.current?.focus(); }}
              aria-label="Effacer la recherche"
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-taupe-deep transition-colors hover:text-copper"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {!q && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[9px] uppercase tracking-wide3 text-taupe-deep">Exemples</span>
            {EXEMPLES.map((e) => (
              <button
                key={e}
                onClick={() => setQ(e)}
                className="rounded-[2px] border border-taupe/60 px-3 py-2 text-[10px] uppercase tracking-wide2 text-copper transition-colors hover:border-copper"
              >
                {e}
              </button>
            ))}
          </div>
        )}

        {!peutCommander && (
          <p className="mt-8 max-w-xl rounded-[3px] border border-bronze/40 bg-ivory-2 p-5 text-[13px] font-light leading-relaxed text-ink/80">
            La commande rapide est réservée aux salons enregistrés.{" "}
            <Link href="/devenir-client-pro/" className="text-copper underline underline-offset-2">
              Ouvrir un compte professionnel
            </Link>{" "}
            — validation sous 24 h sur présentation du SIRET.
          </p>
        )}
      </div>

      <div className="border-t border-taupe/40">
        <div className="container-luxe py-10">
          {q && hits.length === 0 && (
            <p className="text-[14px] font-light text-ink/75">
              Aucune référence ne correspond à « {q} ». Essayez un code teinte (7.34), une
              famille (cendré) ou une catégorie (oxydant, gants).
            </p>
          )}

          {affiches.length > 0 && (
            <ul className="divide-y divide-taupe/30 border-t border-taupe/30">
              {affiches.map((e) => (
                <li key={e.slug} className="py-5">
                  <div className="flex items-start gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={e.image}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-[2px] bg-ivory-2 object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] uppercase tracking-wide3 text-taupe-deep">{e.category}</p>
                      <Link
                        href={`/produit/${e.slug}/`}
                        className="heading-produit mt-0.5 block text-[14px] leading-snug hover:underline underline-offset-2"
                      >
                        {e.name}
                      </Link>

                      <div className="mt-3 space-y-2">
                        {e.variantes.map((v) => {
                          if (!v.id) return null;
                          const k = cle(e.slug, v.id);
                          const n = qtes[k] ?? 0;
                          return (
                            <div key={v.id} className="flex flex-wrap items-center gap-3">
                              <span className="min-w-[150px] flex-1 text-[13px] font-light text-ink/80">
                                {v.label}
                                {!v.dispo && (
                                  <span className="ml-2 text-[10px] uppercase tracking-wide2 text-taupe-deep">
                                    Épuisé
                                  </span>
                                )}
                              </span>
                              <Prix
                                handle={e.slug}
                                variantId={v.id}
                                court
                                className="w-24 text-right text-[13px] text-copper"
                                classeMasque="w-24 text-right text-[11px] font-light text-taupe-deep"
                              />
                              <div className="flex items-center rounded-[2px] border border-taupe/60 text-copper">
                                <button
                                  onClick={() => ajuster(k, -1)}
                                  disabled={!peutCommander || !v.dispo}
                                  aria-label={`Retirer — ${e.name} ${v.label}`}
                                  className="px-3 py-2.5 disabled:opacity-30"
                                >
                                  <Minus size={12} strokeWidth={1.5} />
                                </button>
                                <input
                                  type="number"
                                  min={0}
                                  max={999}
                                  value={n || ""}
                                  placeholder="0"
                                  disabled={!peutCommander || !v.dispo}
                                  onChange={(ev) => fixer(k, ev.target.value)}
                                  aria-label={`Quantité — ${e.name} ${v.label}`}
                                  className="w-12 bg-transparent py-2.5 text-center text-[13px] tabular-nums text-copper placeholder:text-taupe-deep focus:outline-none disabled:opacity-30"
                                />
                                <button
                                  onClick={() => ajuster(k, 1)}
                                  disabled={!peutCommander || !v.dispo}
                                  aria-label={`Ajouter — ${e.name} ${v.label}`}
                                  className="px-3 py-2.5 disabled:opacity-30"
                                >
                                  <Plus size={12} strokeWidth={1.5} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Barre de commande — elle suit le coiffeur pendant sa saisie */}
      <div className="sticky bottom-0 z-20 border-t border-taupe/50 bg-ivory/95 py-4 backdrop-blur-md">
        <div className="container-luxe flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[13px] text-copper">
              <span className="font-medium">{totalArticles}</span> article
              {totalArticles > 1 ? "s" : ""}
              <span className="font-light text-taupe-deep">
                {" "}· {lignes.length} référence{lignes.length > 1 ? "s" : ""}
              </span>
              {peutCommander && totalPrix > 0 && (
                <span className="ml-2 font-medium">{fmt(totalPrix)}</span>
              )}
            </p>
            <p aria-live="polite" className="mt-1 text-[11px] font-light text-taupe-deep">
              {confirme > 0
                ? `${confirme} article${confirme > 1 ? "s" : ""} ajouté${confirme > 1 ? "s" : ""} au panier`
                : peutCommander
                  ? "Saisissez vos quantités, puis envoyez tout au panier"
                  : "Réservé aux salons enregistrés"}
            </p>
          </div>
          <button
            onClick={toutAjouter}
            disabled={!peutCommander || totalArticles === 0}
            className="btn-primary disabled:opacity-40"
            data-cursor
          >
            {peutCommander ? "Tout ajouter au panier" : "Réservé aux professionnels"}
          </button>
        </div>
      </div>
    </div>
  );
}
