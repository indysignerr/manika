"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-context";
import { fmtPrice } from "@/lib/products";
import { PALIERS } from "@/lib/pro";
import {
  facetteHauteurs,
  facetteReflets,
  parseTeinte,
  swatch,
  trierTeintes,
  type Teinte,
} from "@/lib/nuancier";

/** Une teinte commandable = une variante Shopify. */
export type TeinteVariante = {
  variantId: string;
  titre: string;
  prix: number;
  disponible: boolean;
  /** Photo réelle de la variante. Prime toujours sur la pastille calculée. */
  image?: string | null;
};

type Props = {
  /** Slug du produit-gamme (une fiche = une gamme de coloration). */
  slug: string;
  nomGamme: string;
  variantes: TeinteVariante[];
  /** Paliers de conditionnement. Par défaut ceux de la maison (3 / 12 / 36). */
  paliers?: readonly number[];
};

type Ligne = { v: TeinteVariante; teinte: Teinte };

export default function NuancierGrid({ slug, nomGamme, variantes, paliers = PALIERS }: Props) {
  const { addMany } = useCart();

  const lignes = useMemo<Ligne[]>(
    () => trierTeintes(variantes.map((v) => ({ v, teinte: parseTeinte(v.titre) }))),
    [variantes]
  );

  const teintes = useMemo(() => lignes.map((l) => l.teinte), [lignes]);

  /**
   * Une image de variante ne fait une bonne pastille que si elle est PROPRE à
   * cette teinte. Dans la boutique, la plupart des variantes partagent la même
   * photo de tube : l'afficher donnerait 31 ronds identiques, illisibles.
   * On ne retient donc une image que si elle n'apparaît qu'une seule fois —
   * sinon on retombe sur la pastille calculée, qui elle distingue les teintes.
   */
  const imagesUniques = useMemo(() => {
    const compte = new Map<string, number>();
    for (const { v } of lignes) if (v.image) compte.set(v.image, (compte.get(v.image) ?? 0) + 1);
    return new Set([...compte.entries()].filter(([, n]) => n === 1).map(([url]) => url));
  }, [lignes]);
  const hauteurs = useMemo(() => facetteHauteurs(teintes), [teintes]);
  const reflets = useMemo(() => facetteReflets(teintes), [teintes]);

  // Les facettes sont clés par chaîne : la hauteur par son chiffre, le reflet
  // par son libellé — indispensable pour les familles hors charte (Beige…).
  const [fHauteur, setFHauteur] = useState<string | null>(null);
  const [fReflet, setFReflet] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});

  const visibles = lignes.filter(({ teinte }) => {
    if (fHauteur !== null && String(teinte.hauteur) !== fHauteur) return false;
    if (fReflet !== null && teinte.refletLabel !== fReflet) return false;
    return true;
  });

  const totalUnites = Object.values(qty).reduce((s, n) => s + n, 0);
  const totalPrix = lignes.reduce((s, l) => s + (qty[l.v.variantId] ?? 0) * l.v.prix, 0);
  const nbTeintes = Object.values(qty).filter((n) => n > 0).length;

  const set = (id: string, n: number) => setQty((q) => ({ ...q, [id]: n }));

  const ajouter = () => {
    addMany(
      lignes
        .filter((l) => (qty[l.v.variantId] ?? 0) > 0)
        .map((l) => ({
          slug,
          // Libellé court : le titre brut répéterait la famille déjà lisible
          // dans le nom de ligne (« Doré : Blond moyen doré »).
          size: l.teinte.code || l.teinte.nom,
          qty: qty[l.v.variantId],
          unit: l.v.prix,
          name: `${nomGamme} · ${l.teinte.code || l.teinte.nom}`,
          image: l.v.image || "/images/logo-mark.png",
          variantId: l.v.variantId,
        }))
    );
    setQty({});
  };

  const chip = (actif: boolean) =>
    `rounded-[2px] border px-3 py-1.5 text-[10px] uppercase tracking-wide2 transition-colors ${
      actif
        ? "border-copper bg-copper text-ivory"
        : "border-taupe/60 text-copper hover:border-copper"
    }`;

  return (
    <section aria-labelledby="nuancier-titre">
      <h2 id="nuancier-titre" className="heading text-2xl md:text-3xl">
        Le nuancier
      </h2>
      <p className="mt-3 text-[13px] font-light text-taupe-deep">
        {lignes.length} teintes, à commander par {paliers.join(", ")}. Choisissez vos
        conditionnements, puis ajoutez tout au panier en une fois.
      </p>

      {/* Filtres */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 w-28 shrink-0 text-[9px] uppercase tracking-wide3 text-taupe-deep">
            Hauteur de ton
          </span>
          <button onClick={() => setFHauteur(null)} className={chip(fHauteur === null)}>
            Toutes
          </button>
          {hauteurs.map((h) => (
            <button
              key={h.cle}
              onClick={() => setFHauteur(fHauteur === h.cle ? null : h.cle)}
              className={chip(fHauteur === h.cle)}
              aria-pressed={fHauteur === h.cle}
            >
              {h.cle} · {h.label} ({h.count})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 w-28 shrink-0 text-[9px] uppercase tracking-wide3 text-taupe-deep">
            Reflet
          </span>
          <button onClick={() => setFReflet(null)} className={chip(fReflet === null)}>
            Tous
          </button>
          {reflets.map((r) => (
            <button
              key={r.cle}
              onClick={() => setFReflet(fReflet === r.cle ? null : r.cle)}
              className={chip(fReflet === r.cle)}
              aria-pressed={fReflet === r.cle}
            >
              {r.label} ({r.count})
            </button>
          ))}
        </div>
      </div>

      {/* Grille */}
      {visibles.length === 0 ? (
        <p className="mt-10 text-[14px] font-light text-ink/70">
          Aucune teinte ne correspond à ce filtre.
        </p>
      ) : (
        <ul className="mt-8 grid gap-x-6 gap-y-1 sm:grid-cols-2 xl:grid-cols-3">
          {visibles.map(({ v, teinte }) => {
            const n = qty[v.variantId] ?? 0;
            return (
              <li
                key={v.variantId}
                className={`flex items-center gap-3.5 border-b border-taupe/30 py-3 ${
                  v.disponible ? "" : "opacity-45"
                }`}
              >
                {v.image && imagesUniques.has(v.image) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={v.image}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="h-9 w-9 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
                    style={{ background: swatch(teinte) }}
                  />
                )}

                <div className="min-w-0 flex-1">
                  {/* Le préfixe famille (« Doré : ») est déjà porté par le filtre
                      reflet — on ne le répète pas sur chaque ligne. */}
                  <p className="truncate text-[13px] text-copper">
                    <span className="font-medium">{teinte.code || teinte.nom}</span>
                    {teinte.code && teinte.nom && (
                      <span className="ml-2 font-light text-ink/70">{teinte.nom}</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] font-light text-taupe-deep">
                    {v.disponible ? fmtPrice(v.prix) : "Épuisée"}
                  </p>
                </div>

                {/* La coloration ne se vend que par conditionnement : 3, 12 ou 36.
                    Pas de champ libre — les quantités intermédiaires n'existent pas. */}
                <div
                  role="group"
                  aria-label={`Conditionnement pour la teinte ${teinte.code || teinte.nom}`}
                  className="flex shrink-0 items-center gap-1"
                >
                  {paliers.map((p) => (
                    <button
                      key={p}
                      onClick={() => set(v.variantId, n === p ? 0 : p)}
                      disabled={!v.disponible}
                      aria-pressed={n === p}
                      className={`h-8 w-9 rounded-[2px] border text-[12px] transition-colors disabled:opacity-30 ${
                        n === p
                          ? "border-copper bg-copper text-ivory"
                          : "border-taupe/60 text-copper hover:border-copper"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Barre de commande — sticky, elle suit le coiffeur pendant sa saisie */}
      <div className="sticky bottom-0 z-20 mt-8 border-t border-taupe/50 bg-ivory/95 py-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[13px] text-copper">
              <span className="font-medium">{totalUnites}</span> tube
              {totalUnites > 1 ? "s" : ""}
              {nbTeintes > 0 && (
                <span className="font-light text-taupe-deep">
                  {" "}
                  · {nbTeintes} teinte{nbTeintes > 1 ? "s" : ""}
                </span>
              )}
              {totalPrix > 0 && <span className="ml-2 font-medium">{fmtPrice(totalPrix)}</span>}
            </p>
            <p aria-live="polite" className="mt-1 text-[11px] font-light text-taupe-deep">
              {totalUnites === 0
                ? `Chaque teinte se commande par ${paliers.join(", ")} tubes`
                : `Conditionnement par ${paliers.join(" / ")}`}
            </p>
          </div>

          <button
            onClick={ajouter}
            disabled={totalUnites === 0}
            className="btn-primary disabled:opacity-40"
            data-cursor
          >
            Ajouter au panier
          </button>
        </div>
      </div>
    </section>
  );
}
