/**
 * Nuancier — lecture du code teinte, quelle que soit la convention de nommage.
 *
 * Deux conventions coexistent dans le catalogue, et il faut gérer les deux :
 *
 *  A. CODE CHIFFRÉ (International Colour Chart) — `hauteur.refletPrincipal…`
 *       7.34   → hauteur 7 (blond), reflet doré, secondaire cuivré
 *       N°6.64 → hauteur 6, reflet rouge, secondaire cuivré
 *
 *  B. LIBELLÉ FAMILLE : NOM — la convention de la boutique Shopify actuelle
 *       "Doré : Blond moyen doré cuivré"     → hauteur 7, reflet Doré
 *       "Base naturelle : Châtain foncé"     → hauteur 3, reflet Naturel
 *
 * Dans les deux cas on retombe sur les mêmes facettes — hauteur de ton et
 * reflet — qui sont le raisonnement réel du coloriste : il cherche « un 7
 * doré », pas « la troisième vignette de la deuxième rangée ».
 *
 * Conséquence : les filtres se génèrent SANS aucune saisie supplémentaire côté
 * Shopify. Le nom de la variante suffit.
 */

/**
 * Hauteurs de ton, notation universelle 1 → 12.
 * La hauteur 0 est réservée aux correcteurs / mixtons (ex. 0.66 rouge intense),
 * qui n'éclaircissent ni ne foncent : ils ne servent qu'à pousser un reflet.
 */
export const HAUTEURS: Record<number, string> = {
  0: "Correcteur",
  1: "Noir",
  2: "Brun",
  3: "Châtain foncé",
  4: "Châtain",
  5: "Châtain clair",
  6: "Blond foncé",
  7: "Blond",
  8: "Blond clair",
  9: "Blond très clair",
  10: "Blond ultra clair",
  11: "Superéclaircissant",
  12: "Superéclaircissant",
};

/** Reflets, notation universelle 0 → 9. */
export const REFLETS: Record<number, string> = {
  0: "Naturel",
  1: "Cendré",
  2: "Irisé",
  3: "Doré",
  4: "Cuivré",
  5: "Acajou",
  6: "Rouge",
  7: "Marron",
  8: "Mocca",
  9: "Perle",
};

/**
 * Mots de hauteur de ton → valeur ICC.
 * ⚠️ L'ORDRE COMPTE : on teste du plus spécifique au plus général, sinon
 *    « blond clair » capturerait « blond ultra clair ».
 */
const MOTS_HAUTEUR: [string, number][] = [
  ["super eclaircissant", 12],
  ["superclaircissant", 12],
  ["blond ultra clair", 10],
  ["blond tres tres clair", 10],
  ["blond tres clair", 9],
  ["blond clair", 8],
  ["blond moyen", 7],
  ["blond fonce", 6],
  ["chatain clair", 5],
  ["chatain moyen", 4],
  ["chatain fonce", 3],
  ["chatain", 4],
  ["brun", 2],
  ["noir", 1],
  ["blond", 7],
];

/**
 * Familles de reflet telles que nommées dans la boutique → valeur ICC.
 * « Beige » et « Super éclaircissant » ne correspondent à aucun chiffre unique
 * de la charte : ils restent des familles à part entière (valeur null), d'où
 * le fait que les facettes s'appuient sur le LIBELLÉ et non sur le chiffre.
 */
const FAMILLES: [string, { n: number | null; label: string }][] = [
  ["base naturelle", { n: 0, label: "Naturel" }],
  ["naturel", { n: 0, label: "Naturel" }],
  ["cendre", { n: 1, label: "Cendré" }],
  ["irise", { n: 2, label: "Irisé" }],
  ["dore", { n: 3, label: "Doré" }],
  ["cuivre", { n: 4, label: "Cuivré" }],
  ["acajou", { n: 5, label: "Acajou" }],
  ["rouge", { n: 6, label: "Rouge" }],
  ["marron", { n: 7, label: "Marron" }],
  ["chocolat", { n: 7, label: "Marron" }],
  ["mocca", { n: 8, label: "Mocca" }],
  ["perle", { n: 9, label: "Perle" }],
  ["beige", { n: null, label: "Beige" }],
  ["super eclaircissant", { n: null, label: "Super éclaircissant" }],
];

/** Minuscules sans accents — pour comparer des libellés saisis à la main. */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export type Teinte = {
  /** Code ICC normalisé ("7.34"). Vide si la teinte n'est nommée qu'en toutes lettres. */
  code: string;
  hauteur: number | null;
  hauteurLabel: string | null;
  /** Chiffre ICC du reflet, quand il est déterminable. Sert au tri. */
  refletPrincipal: number | null;
  /** Libellé du reflet — TOUJOURS renseigné. C'est la clé de facette. */
  refletLabel: string;
  refletSecondaire: number | null;
  /** Libellé lisible de la teinte, sans le préfixe famille ni le code. */
  nom: string;
  /** Titre d'origine de la variante Shopify, conservé tel quel. */
  titre: string;
};

const vide = (titre: string): Teinte => ({
  code: "",
  hauteur: null,
  hauteurLabel: null,
  refletPrincipal: null,
  refletLabel: "Autre",
  refletSecondaire: null,
  nom: titre,
  titre,
});

/** Cherche une hauteur de ton dans un libellé en toutes lettres. */
function hauteurDepuisTexte(texte: string): number | null {
  const n = norm(texte);
  for (const [mot, valeur] of MOTS_HAUTEUR) if (n.includes(mot)) return valeur;
  return null;
}

/** Cherche une famille de reflet dans un libellé. */
function refletDepuisTexte(texte: string): { n: number | null; label: string } | null {
  const n = norm(texte);
  for (const [mot, r] of FAMILLES) if (n.includes(mot)) return r;
  return null;
}

/**
 * Extrait la teinte d'un titre de variante, en essayant d'abord le code
 * chiffré puis le libellé « Famille : Nom ».
 */
export function parseTeinte(titre: string): Teinte {
  const t = titre.trim();
  if (!t) return vide(t);

  // ── A. Code chiffré, éventuellement précédé de « N° »
  const m = t.match(/^(?:n°\s*|no\s*|n\s*°\s*)?(\d{1,2})\s*(?:[.,/]\s*(\d{1,2}))?(?!\d)/i);
  if (m) {
    const hauteur = Number(m[1]);
    const refletsRaw = m[2] ?? "";
    const rp = refletsRaw.length > 0 ? Number(refletsRaw[0]) : null;
    const rs = refletsRaw.length > 1 ? Number(refletsRaw[1]) : null;
    const reste = t.slice(m[0].length).replace(/^\s*[-–—:]\s*/, "").trim();

    return {
      code: refletsRaw ? `${hauteur}.${refletsRaw}` : String(hauteur),
      hauteur,
      hauteurLabel: HAUTEURS[hauteur] ?? null,
      refletPrincipal: rp,
      refletLabel: rp !== null ? REFLETS[rp] ?? "Autre" : "Naturel",
      refletSecondaire: rs,
      nom: reste || HAUTEURS[hauteur] || t,
      titre: t,
    };
  }

  // ── B. « Famille : Nom »  (ou nom seul)
  const sep = t.indexOf(":");
  const famille = sep > 0 ? t.slice(0, sep).trim() : "";
  const nom = sep > 0 ? t.slice(sep + 1).trim() : t;

  // La hauteur se lit dans le nom ; à défaut dans la famille.
  const hauteur = hauteurDepuisTexte(nom) ?? hauteurDepuisTexte(famille);
  // Le reflet se lit dans la famille ; à défaut dans le nom.
  const reflet = (famille && refletDepuisTexte(famille)) || refletDepuisTexte(nom);

  if (hauteur === null && !reflet) return vide(t);

  return {
    code: "",
    hauteur,
    hauteurLabel: hauteur !== null ? HAUTEURS[hauteur] ?? null : null,
    refletPrincipal: reflet?.n ?? null,
    refletLabel: reflet?.label ?? "Naturel",
    refletSecondaire: null,
    nom: nom || t,
    titre: t,
  };
}

/* ────────────────────────────────────────────────────────────────────────
   PASTILLE DE COULEUR — repère visuel, PAS une référence colorimétrique
   ──────────────────────────────────────────────────────────────────────── */

/** Base de luminosité par hauteur de ton. */
const BASE: Record<number, [number, number, number]> = {
  1: [26, 21, 18],
  2: [43, 33, 27],
  3: [61, 43, 32],
  4: [79, 54, 38],
  5: [107, 74, 48],
  6: [135, 97, 60],
  7: [163, 124, 78],
  8: [189, 154, 104],
  9: [212, 183, 140],
  10: [230, 211, 176],
  11: [239, 225, 198],
  12: [245, 236, 216],
};

/** Teinte de chaque reflet, vers laquelle la base est mélangée. */
const TEINTE_REFLET: Record<number, [number, number, number]> = {
  0: [0, 0, 0], // naturel — aucun mélange
  1: [150, 155, 160], // cendré
  2: [140, 110, 165], // irisé
  3: [214, 170, 70], // doré
  4: [196, 110, 45], // cuivré
  5: [150, 55, 60], // acajou
  6: [175, 40, 40], // rouge
  7: [110, 85, 55], // marron
  8: [120, 95, 80], // mocca
  9: [190, 185, 180], // perle
};

/** Familles hors charte chiffrée. */
const TEINTE_FAMILLE: Record<string, [number, number, number]> = {
  Beige: [206, 184, 146],
  "Super éclaircissant": [240, 231, 210],
};

const mix = (a: number, b: number, r: number) => Math.round(a + (b - a) * r);
const hex = (c: number[]) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");

/**
 * Pastille indicative calculée depuis la teinte.
 *
 * ⚠️ APPROXIMATION. Un coloriste ne se fie JAMAIS à un écran pour choisir une
 *    teinte — le code et le nuancier physique font foi. Cette pastille ne sert
 *    qu'à donner du rythme visuel à la grille, et elle s'efface dès qu'une
 *    photo réelle de la variante existe (voir NuancierGrid).
 */
export function swatch(t: Teinte): string {
  // Correcteur (0.xx) : pas de hauteur à représenter, c'est le reflet pur.
  // Sans reflet (« 0 neutre »), TEINTE_REFLET vaut [0,0,0] qui donnerait un
  // noir trompeur — on rend un gris neutre à la place.
  if (t.hauteur === 0) {
    if (!t.refletPrincipal) return "#8f8b86";
    return hex(TEINTE_REFLET[t.refletPrincipal] ?? [143, 139, 134]);
  }

  const base = BASE[t.hauteur ?? 5] ?? BASE[5];
  let rgb: [number, number, number] = [...base];

  const familleHorsCharte = TEINTE_FAMILLE[t.refletLabel];
  if (t.refletPrincipal) {
    const cible = TEINTE_REFLET[t.refletPrincipal] ?? [0, 0, 0];
    rgb = [mix(rgb[0], cible[0], 0.42), mix(rgb[1], cible[1], 0.42), mix(rgb[2], cible[2], 0.42)];
  } else if (familleHorsCharte) {
    rgb = [
      mix(rgb[0], familleHorsCharte[0], 0.42),
      mix(rgb[1], familleHorsCharte[1], 0.42),
      mix(rgb[2], familleHorsCharte[2], 0.42),
    ];
  }

  if (t.refletSecondaire) {
    const cible = TEINTE_REFLET[t.refletSecondaire] ?? [0, 0, 0];
    rgb = [mix(rgb[0], cible[0], 0.18), mix(rgb[1], cible[1], 0.18), mix(rgb[2], cible[2], 0.18)];
  }
  return hex(rgb);
}

/* ────────────────────────────────────────────────────────────────────────
   FACETTES — dérivées des teintes réellement présentes, jamais codées en dur
   ──────────────────────────────────────────────────────────────────────── */

export type Facette = { cle: string; label: string; count: number; ordre: number };

export function facetteHauteurs(teintes: Teinte[]): Facette[] {
  const map = new Map<number, Facette>();
  for (const t of teintes) {
    if (t.hauteur === null) continue;
    const e = map.get(t.hauteur);
    if (e) e.count++;
    else
      map.set(t.hauteur, {
        cle: String(t.hauteur),
        label: t.hauteurLabel ?? String(t.hauteur),
        count: 1,
        ordre: t.hauteur,
      });
  }
  return [...map.values()].sort((a, b) => a.ordre - b.ordre);
}

export function facetteReflets(teintes: Teinte[]): Facette[] {
  const map = new Map<string, Facette>();
  for (const t of teintes) {
    if (t.hauteur === null && t.refletLabel === "Autre") continue;
    const e = map.get(t.refletLabel);
    if (e) e.count++;
    else
      map.set(t.refletLabel, {
        cle: t.refletLabel,
        label: t.refletLabel,
        count: 1,
        // Les familles hors charte passent après les reflets numérotés.
        ordre: t.refletPrincipal ?? 50,
      });
  }
  return [...map.values()].sort((a, b) => a.ordre - b.ordre || a.label.localeCompare(b.label));
}

/** Tri nuancier : du plus foncé au plus clair, puis par reflet. */
export const trierTeintes = <T extends { teinte: Teinte }>(items: T[]): T[] =>
  [...items].sort((a, b) => {
    const ha = a.teinte.hauteur ?? 99;
    const hb = b.teinte.hauteur ?? 99;
    if (ha !== hb) return ha - hb;
    const ra = a.teinte.refletPrincipal ?? 50;
    const rb = b.teinte.refletPrincipal ?? 50;
    if (ra !== rb) return ra - rb;
    return (a.teinte.refletSecondaire ?? -1) - (b.teinte.refletSecondaire ?? -1);
  });
