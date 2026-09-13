/**
 * Référentiel des marques du catalogue — partagé par les scripts.
 *
 * Clé = orthographe telle qu'elle existe dans le champ « vendor » de Shopify,
 * valeur = marque canonique affichée sur le site.
 *
 * ⚠️ Les orthographes Shopify font foi sur celles du document d'arborescence
 *    (qui écrit Neutroson, Biopigma, Douce) — à confirmer auprès des
 *    fournisseurs avant tout référencement.
 */
export const MARQUES: Record<string, string> = {
  TASSEL: "Tassel",
  BIOPYGMA: "Biopygma",
  "MANIKA LAB": "Manika",
  DOUSSE: "Dousse",
  EUROSTIL: "Eurostil",
  NEUTHROSUN: "Neuthrosun",
  VASSO: "Vasso",
  RAGNAR: "Ragnar",
  "CAPTAIN COOK": "Captain Cook",
  // Suzishen est lié à la liquidation : il ne doit plus apparaître
  // publiquement. Ses produits sont réattribués à la marque maison.
  SUZISHEN: "Manika",
  "NUTRI HAIR": "Nutri Hair",
};
