/**
 * Jean-Yves Boronat — SOURCE DE VÉRITÉ UNIQUE de tout ce que le site affirme sur lui.
 *
 * ⚠️ CADRE JURIDIQUE — à lire avant toute modification :
 *
 * 1. PALMARÈS. Les titres doivent être exacts au mot près : ils sont vérifiables
 *    par n'importe quel professionnel du secteur. Un titre approximatif détruit
 *    la crédibilité et constitue une pratique commerciale trompeuse (art. L121-2
 *    du code de la consommation, contrôlé par la DGCCRF).
 *    → Chaque entrée porte sa `source`. Une entrée sans source ne se publie pas :
 *      `palmaresPublie()` filtre sur `verified === true`.
 *
 * 2. L'ORÉAL / HAUTE COIFFURE FRANÇAISE. Le parcours peut être mentionné
 *    FACTUELLEMENT et AU PASSÉ. Aucun logo. Rien qui laisse entendre un
 *    partenariat actuel.
 *
 * 3. MAISONS DE COUTURE. Ne jamais nommer une maison sans source publique.
 */

export type Titre = {
  /** Intitulé exact, tel que formulé par la source. */
  label: string;
  /** Année ou période, si la source la donne. */
  annee?: string;
  /** URL publique qui atteste le titre. Obligatoire pour publier. */
  source?: string;
  /** Passe à true UNIQUEMENT si une source publique atteste l'intitulé exact. */
  verified: boolean;
};

export const BORONAT = {
  name: "Jean-Yves Boronat",

  /** Accroche courte, non factuelle — sans risque. */
  role: "Directeur artistique MANIKA.LAB",

  /**
   * Palmarès. `verified: false` → l'entrée n'est PAS affichée sur le site.
   * Renseigner `source` puis basculer `verified` à true après vérification.
   */
  palmares: [] as Titre[],

  /** Éléments de parcours vérifiés, formulés au passé. */
  parcours: [] as Titre[],

  /** Photo de portrait dans public/images/. null → la page utilise un cadre neutre. */
  portrait: null as string | null,
} as const;

/** N'expose que ce qui est réellement sourcé — le garde-fou anti-affirmation. */
export const palmaresPublie = (): Titre[] => BORONAT.palmares.filter((t) => t.verified);
export const parcoursPublie = (): Titre[] => BORONAT.parcours.filter((t) => t.verified);

/** Le site a-t-il de quoi construire une page de caution crédible ? */
export const aUnPalmaresPubliable = (): boolean => palmaresPublie().length > 0;
