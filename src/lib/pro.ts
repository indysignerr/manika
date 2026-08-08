/**
 * Conditions commerciales B2B — SOURCE DE VÉRITÉ UNIQUE.
 *
 * ⚠️ RÈGLE : tout ce qui est affiché sur le site depuis ce fichier est un
 *    ENGAGEMENT COMMERCIAL opposable. On n'invente aucune valeur.
 *
 *    Une valeur à `null` = « pas encore arrêtée par la cliente » → l'argument
 *    correspondant n'est tout simplement PAS affiché sur le site. Dès que la
 *    valeur est connue, on la renseigne ici et l'argument apparaît partout
 *    (barre de réassurance, page Devenir client pro, CGV) — une seule ligne.
 */

export const PRO = {
  /** Montant HT à partir duquel le port est offert. null → argument masqué. */
  francoDePortHT: null as number | null,

  /** Montant minimum de commande. null → on affiche « sans minimum de commande ». */
  minimumCommandeHT: null as number | null,

  /** Délai d'expédition, formulé tel quel (ex. « 48 h ouvrées »). null → masqué. */
  delaiExpedition: null as string | null,

  /** Reprise des invendus du kit de démarrage, en jours. Validé dans le plan de lancement. */
  repriseInvendusJours: 90,

  /** Nombre de références du kit de démarrage. Validé dans le plan de lancement. */
  kitReferences: 6,

  /** Les prix catalogue sont-ils saisis côté Shopify ? Tant que false, on n'annonce aucun tarif. */
  prixRenseignes: false,
} as const;

export type ProArgument = { label: string; detail: string };

/**
 * Les arguments de switch affichés au salon.
 * On ne retourne QUE ceux dont la valeur est réellement arrêtée.
 */
export function proArguments(): ProArgument[] {
  const out: ProArgument[] = [];

  if (PRO.minimumCommandeHT === null) {
    out.push({
      label: "Sans minimum de commande",
      detail: "Testez la gamme sur une seule référence.",
    });
  } else {
    out.push({
      label: `Commande dès ${PRO.minimumCommandeHT} € HT`,
      detail: "Un seuil d'entrée volontairement bas.",
    });
  }

  out.push({
    label: `Invendus repris à ${PRO.repriseInvendusJours} jours`,
    detail: `Le kit de ${PRO.kitReferences} références ne vous fait courir aucun risque de stock.`,
  });

  if (PRO.francoDePortHT !== null) {
    out.push({
      label: `Franco de port dès ${PRO.francoDePortHT} € HT`,
      detail: "Livraison offerte sur vos réassorts.",
    });
  }

  if (PRO.delaiExpedition !== null) {
    out.push({
      label: `Expédition sous ${PRO.delaiExpedition}`,
      detail: "Vos commandes partent de notre stock.",
    });
  }

  out.push({
    label: "Compte professionnel",
    detail: "Tarifs HT réservés aux salons, sur validation du SIRET.",
  });

  return out;
}
