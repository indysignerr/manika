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
 *
 * ⚠️ 10/08/2026 — la REPRISE DES INVENDUS a été retirée à la demande de la
 *    cliente. Ne pas la réintroduire : l'offre d'essai passe désormais par les
 *    échantillons à prix coûtant, déduits de la première commande.
 */

export const PRO = {
  /** Montant HT à partir duquel le port est offert. null → argument masqué. */
  francoDePortHT: null as number | null,

  /** Montant minimum de commande. null → on affiche « sans minimum de commande ». */
  minimumCommandeHT: null as number | null,

  /** Délai d'expédition, formulé tel quel (ex. « 48 h ouvrées »). null → masqué. */
  delaiExpedition: null as string | null,

  /** Les prix catalogue sont-ils saisis côté Shopify ? Tant que false, on n'annonce aucun tarif. */
  prixRenseignes: false,
} as const;

/**
 * L'offre d'essai — remplace le kit « invendus repris ».
 * 6 échantillons au choix + 1 oxydant, vendus à prix coûtant et déduits de la
 * première commande.
 */
export const ESSAI = {
  nbEchantillons: 6,
  /** Volumes d'oxydant proposés avec le lot d'essai. */
  volumesOxydant: ["10 Vol", "20 Vol", "30 Vol"],
  /** Prix du lot d'essai. null → on annonce « à prix coûtant » sans montant. */
  prixTTC: null as number | null,
  /** Le montant est-il déduit de la première commande ? */
  deduitPremiereCommande: true,
} as const;

/** Formulation courte de l'offre d'essai, réutilisée sur plusieurs pages. */
export const essaiResume = (): string =>
  `${ESSAI.nbEchantillons} échantillons au choix + 1 oxydant (${ESSAI.volumesOxydant.join(
    ", "
  )})`;

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
    label: "Essayez à prix coûtant",
    detail: `${essaiResume()}${
      ESSAI.deduitPremiereCommande ? ", déduits de votre première commande." : "."
    }`,
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
