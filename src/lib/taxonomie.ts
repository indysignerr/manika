/**
 * L'ARBORESCENCE MULTIMARQUES — « Architecture MANIKA » (doc du 13/09/2026).
 *
 * Principe directeur du document : un produit accessible en 3 clics, jamais
 * plus de 4. On ne navigue donc PAS dans une cascade de sous-collections
 * (Marque → Univers → Type → Produit) ; on entre par une famille large et on
 * affine avec des FILTRES.
 *
 * ⚠️ Cette arborescence n'est pas écrite à la main : elle est DÉRIVÉE des
 *    métachamps Shopify `manika.*` portés par chaque produit. Ajouter une
 *    marque ou un type dans Shopify le fait apparaître dans le menu au build
 *    suivant, sans toucher au code — c'est l'exigence d'évolutivité du
 *    document. Les tableaux ci-dessous ne fixent que l'ORDRE d'affichage et
 *    les libellés de menu ; tout ce qu'ils ignorent est rangé à la suite.
 */
import type { Product } from "@/lib/products";

/** Accents et ponctuation en moins, tirets en plus — pour les URL. */
export function slugifier(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Les univers, dans l'ordre du menu voulu par le document.
 * `menu` est le libellé court de la barre de navigation — « SOINS » plutôt que
 * « Soins capillaires », comme demandé.
 *
 * ⚠️ « Coiffage » ne figure pas dans le document : il a été ajouté par
 *    décision d'Indy, sans quoi 26 produits n'auraient aucune page.
 */
export const UNIVERS_ORDRE = [
  { valeur: "Coloration & Technique", menu: "Coloration & Technique" },
  { valeur: "Soins capillaires", menu: "Soins" },
  { valeur: "Coiffage", menu: "Coiffage" },
  { valeur: "Accessoires coloration", menu: "Accessoires coloration" },
  { valeur: "Matériel & consommables", menu: "Matériel & consommables" },
] as const;

/**
 * L'ordre des rayons à l'intérieur d'un univers, tel que listé par le
 * document. Un type absent de cette liste n'est pas perdu : il est simplement
 * rangé après, par ordre de nombre de produits.
 */
const TYPES_ORDRE = [
  // Coloration & Technique
  "Coloration", "Oxydant", "Décoloration", "Nettoyant coloration",
  "Protecteur coloration", "Décapant couleur", "Retouche racines",
  // Soins capillaires
  "Shampooing", "Après-shampooing", "Masque", "Fibres capillaires",
  "Huiles & sérums",
  // Accessoires coloration
  "Bols", "Pinceaux", "Presse-tubes", "Palettes coloration", "Balances",
  "Minuteurs", "Papier aluminium",
  // Matériel & consommables
  "Gants", "Serviettes", "Capes", "Brosses", "Peignes",
];

export type Rayon = { valeur: string; slug: string; n: number };
export type UniversVue = { valeur: string; menu: string; slug: string; n: number; rayons: Rayon[] };
export type MarqueVue = { valeur: string; slug: string; n: number };

const premiereValeur = (p: Product, cle: string): string | null => p.facettes?.[cle]?.[0] ?? null;

/** Le rang d'un type dans l'ordre du document ; l'inconnu passe en dernier. */
const rangType = (t: string) => {
  const i = TYPES_ORDRE.indexOf(t);
  return i === -1 ? TYPES_ORDRE.length : i;
};

/** Les univers réellement peuplés, avec leurs rayons. */
export function universDuCatalogue(produits: Product[]): UniversVue[] {
  const parUnivers = new Map<string, Map<string, number>>();
  const totaux = new Map<string, number>();

  for (const p of produits) {
    const u = premiereValeur(p, "univers");
    if (!u) continue;
    totaux.set(u, (totaux.get(u) ?? 0) + 1);
    if (!parUnivers.has(u)) parUnivers.set(u, new Map());
    const t = premiereValeur(p, "type");
    if (t) {
      const m = parUnivers.get(u)!;
      m.set(t, (m.get(t) ?? 0) + 1);
    }
  }

  // L'ordre du document d'abord, puis tout univers inattendu, à la suite.
  const connus = UNIVERS_ORDRE.map((u) => u.valeur) as readonly string[];
  const ordre = [
    ...UNIVERS_ORDRE.filter((u) => totaux.has(u.valeur)).map((u) => ({ ...u })),
    ...[...totaux.keys()]
      .filter((v) => !connus.includes(v))
      .sort()
      .map((valeur) => ({ valeur, menu: valeur })),
  ];

  return ordre.map(({ valeur, menu }) => ({
    valeur,
    menu,
    slug: slugifier(valeur),
    n: totaux.get(valeur) ?? 0,
    rayons: [...(parUnivers.get(valeur) ?? new Map())]
      .map(([v, n]) => ({ valeur: v, slug: slugifier(v), n }))
      .sort((a, b) => rangType(a.valeur) - rangType(b.valeur) || b.n - a.n),
  }));
}

/** Toutes les marques du catalogue, la plus fournie en tête. */
export function marquesDuCatalogue(produits: Product[]): MarqueVue[] {
  const m = new Map<string, number>();
  for (const p of produits) {
    const v = premiereValeur(p, "marque");
    if (v) m.set(v, (m.get(v) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([valeur, n]) => ({ valeur, slug: slugifier(valeur), n }))
    .sort((a, b) => b.n - a.n || a.valeur.localeCompare(b.valeur, "fr"));
}

/** Tous les rayons du catalogue, tous univers confondus (pour les URL /rayon/…). */
export function rayonsDuCatalogue(produits: Product[]): Rayon[] {
  const m = new Map<string, number>();
  for (const p of produits) {
    const v = premiereValeur(p, "type");
    if (v) m.set(v, (m.get(v) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([valeur, n]) => ({ valeur, slug: slugifier(valeur), n }))
    .sort((a, b) => rangType(a.valeur) - rangType(b.valeur) || b.n - a.n);
}

/** Les produits d'une facette donnée (comparaison par slug, robuste aux accents). */
export const filtrerParFacette = (produits: Product[], cle: string, slug: string) =>
  produits.filter((p) => (p.facettes?.[cle] ?? []).some((v) => slugifier(v) === slug));
