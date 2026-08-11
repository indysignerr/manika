/**
 * Identité et coordonnées de la maison — SOURCE DE VÉRITÉ UNIQUE.
 *
 * Toutes les pages légales, la page contact et le pied de page lisent ici.
 * Objectif : ne plus jamais avoir de « [Adresse du siège] » en production,
 * et n'avoir qu'un seul endroit à corriger.
 *
 * ⚠️ RÈGLE : une valeur à `null` n'est PAS affichée. On ne publie jamais un
 *    espace réservé entre crochets ni une coordonnée inventée — un
 *    professionnel qui vérifie et tombe sur un faux numéro ne revient pas.
 *
 * ⚠️ À COMPLÉTER AVANT MISE EN LIGNE COMMERCIALE — l'article L123-1 du code
 *    de commerce et l'article 19 de la LCEN imposent d'indiquer la dénomination
 *    sociale, la forme juridique, le capital, l'adresse du siège, le RCS et le
 *    numéro de TVA intracommunautaire. Les champs `null` ci-dessous sont
 *    exactement ceux qui manquent.
 */

export const MAISON = {
  nom: "MANIKA.LAB",

  /* ── Coordonnées ─────────────────────────────────────────── */
  telephone: "06 20 14 90 60",
  /** Version compacte pour les liens tel: */
  telephoneLien: "+33620149060",
  email: "contact@manika-lab.fr",

  /* ── Identité juridique — à renseigner par les gérants ────── */
  formeJuridique: null as string | null,
  capital: null as string | null,
  adresse: null as string | null,
  rcs: null as string | null,
  tvaIntracom: null as string | null,
  directeurPublication: null as string | null,

  /* ── Exploitation ─────────────────────────────────────────── */
  hebergeur: {
    nom: "Cloudflare, Inc.",
    adresse: "101 Townsend St, San Francisco, CA 94107, États-Unis",
    site: "cloudflare.com",
  },
  /** Le paiement est délégué au checkout hébergé Shopify (PCI-DSS). */
  paiement: "Shopify Inc.",
  delaiReponse: "24 h ouvrées",
} as const;

/** L'identité légale est-elle complète ? Sert à alerter en développement. */
export const identiteComplete = (): boolean =>
  Boolean(MAISON.formeJuridique && MAISON.adresse && MAISON.rcs);

/**
 * Ligne d'identification de l'éditeur, construite avec les seuls champs connus.
 * Renvoie au minimum la dénomination et l'email.
 */
export function ligneEditeur(): string {
  return [
    MAISON.nom,
    MAISON.formeJuridique,
    MAISON.capital,
    MAISON.adresse,
    MAISON.rcs,
    MAISON.tvaIntracom ? `TVA ${MAISON.tvaIntracom}` : null,
    MAISON.email,
  ]
    .filter(Boolean)
    .join(" · ");
}
