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
  /**
   * Une teinte se commande en packs : on choisit UNE taille de pack (3, 12 ou 36)
   * et un nombre de packs. On peut donc prendre 2 packs de 3 (= 6 tubes), mais
   * jamais une unité isolée, ni mélanger deux tailles sur la même teinte.
   */
  const [sel, setSel] = useState<Record<string, { pack: number; packs: number }>>({});
  const unites = (id: string) => {
    const s = sel[id];
    return s ? s.pack * s.packs : 0;
  };

  const visibles = lignes.filter(({ teinte }) => {
    if (fHauteur !== null && String(teinte.hauteur) !== fHauteur) return false;
    if (fReflet !== null && teinte.refletLabel !== fReflet) return false;
    return true;
  });

  const totalUnites = Object.keys(sel).reduce((s, id) => s + unites(id), 0);
  const totalPacks = Object.values(sel).reduce((s, x) => s + x.packs, 0);
  const totalPrix = lignes.reduce((s, l) => s + unites(l.v.variantId) * l.v.prix, 0);
  const nbTeintes = Object.keys(sel).length;

  /** Sélectionne une taille de pack, ou la désélectionne si déjà active. */
  const choisirPack = (id: string, pack: number) =>
    setSel((s) => {
      if (s[id]?.pack === pack) {
        const { [id]: _retire, ...reste } = s;
        return reste;
      }
      return { ...s, [id]: { pack, packs: 1 } };
    });

  /** Ajuste le nombre de packs ; retomber sous 1 retire la teinte. */
  const ajusterPacks = (id: string, delta: number) =>
    setSel((s) => {
      const cur = s[id];
      if (!cur) return s;
      const packs = cur.packs + delta;
      if (packs < 1) {
        const { [id]: _retire, ...reste } = s;
        return reste;
      }
      return { ...s, [id]: { ...cur, packs: Math.min(99, packs) } };
    });

  const ajouter = () => {
    addMany(
      lignes
        .filter((l) => sel[l.v.variantId])
        .map((l) => {
          const s = sel[l.v.variantId];
          return {
            slug,
            // Le conditionnement fait partie de l'identité de la ligne :
            // 2 packs de 3 et 1 pack de 12 ne se facturent pas pareil.
            size: `${l.teinte.code || l.teinte.nom} · ${s.packs} × ${s.pack}`,
            qty: s.pack * s.packs,
            unit: l.v.prix,
            name: `${nomGamme} · ${l.teinte.code || l.teinte.nom}`,
            image: l.v.image || "/images/logo-mark.png",
            variantId: l.v.variantId,
          };
        })
    );
    setSel({});
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
        {lignes.length} teintes. Choisissez un pack de {paliers.join(", ")} par teinte — et
        autant de packs que nécessaire — puis ajoutez tout au panier en une fois.
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
            const s = sel[v.variantId];
            const n = unites(v.variantId);
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

                {/* Taille de pack (3, 12 ou 36) puis nombre de packs.
                    Pas de champ libre : l'unité isolée ne se vend pas. */}
                <div
                  role="group"
                  aria-label={`Conditionnement pour la teinte ${teinte.code || teinte.nom}`}
                  className="flex shrink-0 items-center gap-1"
                >
                  {paliers.map((p) => (
                    <button
                      key={p}
                      onClick={() => choisirPack(v.variantId, p)}
                      disabled={!v.disponible}
                      aria-pressed={s?.pack === p}
                      aria-label={`Pack de ${p} — ${teinte.code || teinte.nom}`}
                      className={`h-8 w-9 rounded-[2px] border text-[12px] transition-colors disabled:opacity-30 ${
                        s?.pack === p
                          ? "border-copper bg-copper text-ivory"
                          : "border-taupe/60 text-copper hover:border-copper"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  {s ? (
                    <span className="ml-1.5 flex items-center gap-1">
                      <button
                        onClick={() => ajusterPacks(v.variantId, -1)}
                        aria-label={`Retirer un pack de ${s.pack}`}
                        className="h-8 w-7 rounded-[2px] border border-taupe/60 text-copper transition-colors hover:border-copper"
                      >
                        −
                      </button>
                      <span
                        aria-live="polite"
                        className="w-14 text-center text-[12px] tabular-nums text-copper"
                      >
                        ×{s.packs} = {n}
                      </span>
                      <button
                        onClick={() => ajusterPacks(v.variantId, 1)}
                        aria-label={`Ajouter un pack de ${s.pack}`}
                        className="h-8 w-7 rounded-[2px] border border-taupe/60 text-copper transition-colors hover:border-copper"
                      >
                        +
                      </button>
                    </span>
                  ) : (
                    /* Réserve la place pour éviter que la ligne ne saute. */
                    <span aria-hidden className="ml-1.5 w-[118px]" />
                  )}
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
                ? `Vente par packs de ${paliers.join(", ")} — pas d'unité isolée`
                : `${totalPacks} pack${totalPacks > 1 ? "s" : ""}`}
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
