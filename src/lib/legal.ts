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
  /**
   * ⚠️ Le domaine est manikalab.com, SANS tiret (corrigé le 16/09/2026).
   *    manika-lab.com n'a jamais été enregistré : tout courrier envoyé à
   *    l'ancienne adresse revenait en erreur. Boîtes hébergées chez IONOS.
   */
  email: "contact@manikalab.com",
  /** Domaine public du site, sans protocole. Sert aux URL canoniques et au SEO. */
  domaine: "manikalab.com",

  /**
   * Réseaux sociaux. `null` = compte pas encore créé → le lien N'EST PAS
   * affiché, conformément à la règle du fichier. Un lien mort en pied de page
   * fait plus de mal que pas de lien du tout.
   *
   * ⚠️ Comptes en cours de création par Indy (semaine du 15/09/2026) : il
   *    suffira de coller les URL ici pour qu'ils apparaissent.
   */
  reseaux: {
    instagram: null as string | null,
    pinterest: null as string | null,
    tiktok: null as string | null,
  },

  /* ── Identité juridique — à renseigner par les gérants ────── */
  formeJuridique: null as string | null,
  capital: null as string | null,
  /**
   * Adresse relevée dans les paramètres Klaviyo le 14/09/2026.
   * ⚠️ À CONFIRMER comme siège social auprès des gérantes : c'est cette
   *    adresse qui figure au pied de tous les emails et dans les mentions
   *    légales, elle doit correspondre à l'immatriculation.
   */
  adresse: "2405 Route des Dolines, Sophia-Antipolis, 06560 Valbonne",
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

/** Les réseaux réellement ouverts, prêts à être affichés. */
export function reseauxActifs(): { nom: string; url: string }[] {
  const libelles: Record<string, string> = {
    instagram: "Instagram",
    pinterest: "Pinterest",
    tiktok: "TikTok",
  };
  return Object.entries(MAISON.reseaux)
    .filter(([, url]) => Boolean(url))
    .map(([cle, url]) => ({ nom: libelles[cle] ?? cle, url: url as string }));
}

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
