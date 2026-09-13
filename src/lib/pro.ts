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
 *    cliente. Ne pas la réintroduire : l'offre d'essai passe désormais par le
 *    coffret découverte.
 *
 * ⚠️ 13/09/2026 — décisions d'Indy : franco de port à 250 € HT (seuil haut
 *    assumé, un salon réassortit par cartons), coffret découverte REMBOURSÉ
 *    sur la commande suivante, expédié en port offert, et limité à UN SEUL
 *    par salon (c'est une offre de découverte, pas un canal d'achat).
 *
 * ⚠️ Ces seuils ne sont QUE de l'affichage. Le port réel est calculé par le
 *    checkout Shopify : la règle « livraison offerte dès 250 € » doit être
 *    créée dans Shopify (Paramètres → Livraison), sinon le site promet ce que
 *    la caisse ne tient pas.
 */

/**
 * Conditionnements dégressifs — s'appliquent à TOUS les produits (décision
 * cliente du 11/08), pas seulement à la coloration.
 *
 * ⚠️ Ce sont des QUANTITÉS, pas des variantes Shopify. Les passer en variantes
 *    multiplierait le catalogue par 3 et ferait sauter la limite de 100
 *    variantes par produit dès qu'une gamme dépasse ~33 teintes.
 *    Le dégressif se joue sur le prix, à quantité atteinte.
 *
 * ⚠️ Les remises par palier ne sont PAS encore arrêtées (prix en cours de
 *    validation avec la cliente) → on affiche les paliers, jamais un tarif.
 */
export const PALIERS = [3, 12, 36] as const;

export const PRO = {
  /** Montant HT à partir duquel le port est offert. null → argument masqué. */
  francoDePortHT: 250 as number | null,

  /** Montant minimum de commande. null → on affiche « sans minimum de commande ». */
  minimumCommandeHT: null as number | null,

  /** Délai d'expédition, formulé tel quel (ex. « 48 h ouvrées »). null → masqué. */
  delaiExpedition: null as string | null,

  /** Les prix catalogue sont-ils saisis côté Shopify ? Tant que false, on n'annonce aucun tarif. */
  prixRenseignes: false,
} as const;

/**
 * Le COFFRET DÉCOUVERTE — remplace le kit « invendus repris ».
 * 6 échantillons au choix + 1 oxydant. Le salon l'achète, puis son montant lui
 * est remboursé sur la commande suivante : le test ne lui coûte rien.
 */
export const COFFRET = {
  nbEchantillons: 6,
  /** Volumes d'oxydant proposés avec le coffret. */
  volumesOxydant: ["10 Vol", "20 Vol", "30 Vol"],
  /** Prix du coffret. null → on annonce « à prix coûtant » sans montant. */
  prixTTC: null as number | null,
  /** Le montant du coffret est remboursé sur la commande suivante. */
  rembourseProchaineCommande: true,
  /** Le port est offert sur le coffret, sans condition de montant. */
  portOffert: true,
  /**
   * Nombre de coffrets qu'un salon peut commander — un seul, une fois.
   * ⚠️ Le site l'annonce, mais rien ne l'empêche techniquement : c'est Shopify
   *    qui doit appliquer la limite (une remise à usage unique par client, ou
   *    un contrôle à la validation de commande).
   */
  maxParSalon: 1,
} as const;

/** Formulation courte du coffret, réutilisée sur plusieurs pages. */
export const coffretResume = (): string =>
  `${COFFRET.nbEchantillons} échantillons au choix + 1 oxydant (${COFFRET.volumesOxydant.join(
    ", "
  )})`;

/**
 * Le bandeau haut de page. Dérivé des mêmes valeurs que le reste du site :
 * une condition commerciale qui change ici ne peut plus rester périmée là-bas.
 */
export function bandeauAnnonce(): string[] {
  const out = ["Tarifs professionnels HT"];
  if (COFFRET.rembourseProchaineCommande) out.push("Coffret découverte remboursé");
  if (PRO.francoDePortHT !== null) out.push(`Livraison offerte dès ${PRO.francoDePortHT} € HT`);
  else if (PRO.minimumCommandeHT === null) out.push("Sans minimum de commande");
  return out;
}

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
    label: "Coffret découverte remboursé",
    detail: `${coffretResume()}${
      COFFRET.rembourseProchaineCommande
        ? ". Son montant vous est remboursé sur votre commande suivante"
        : ""
    }${COFFRET.portOffert ? ", port offert" : ""}. ${
      COFFRET.maxParSalon === 1 ? "Un seul coffret par salon." : ""
    }`.trim(),
  });

  if (PRO.francoDePortHT !== null) {
    out.push({
      label: `Livraison offerte dès ${PRO.francoDePortHT} € HT`,
      detail: "Le réassort d'un salon atteint vite le seuil — le port ne vous coûte rien.",
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
