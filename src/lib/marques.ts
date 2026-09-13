/**
 * Les marques distribuées — texte de présentation.
 *
 * ⚠️ La LISTE des marques n'est pas ici : elle est dérivée du métachamp
 *    `manika.marque` porté par les produits (voir taxonomie.ts), pour que
 *    l'ajout d'une marque dans Shopify suffise. Ce fichier ne porte que ce
 *    qu'aucune donnée ne peut deviner : le texte de présentation.
 *
 * ⚠️ Rien n'est inventé ici. Tant qu'une marque n'a pas de texte fourni par
 *    la cliente, la page affiche un résumé factuel tiré du catalogue
 *    (nombre de références, univers couverts) plutôt qu'un discours creux.
 *
 * ⚠️ « Dousse » n'est PAS une marque : c'est une gamme de coloration Tassel.
 *    La collection Shopify `dousse` existe mais est vide (0 produit), et
 *    aucun produit ne porte `marque = Dousse`. À traiter en renseignant le
 *    métachamp `manika.gamme`, pas en créant une marque.
 */
export const PRESENTATIONS: Record<string, string> = {
  // "Tassel": "…texte fourni par la cliente…",
};

export const presentationDe = (marque: string): string | null =>
  PRESENTATIONS[marque] ?? null;
