/**
 * Détermine ce que le visiteur a le droit de voir.
 *
 *   « visiteur » — catalogue restreint, aucun prix, aucune commande
 *   « pro »      — catalogue complet, tarifs HT, commande possible
 *
 * Ordre de résolution :
 *   1. mode aperçu — uniquement si le jeton signé est valide
 *   2. session client réelle + étiquette « pro-valide » côté Shopify
 *   3. à défaut, visiteur
 */
import { cookie, jetonValide } from "./apercu.js";

export const VISITEUR = "visiteur";
export const PRO = "pro";

export async function resoudreRole(request, env) {
  // 1. Aperçu
  const jeton = cookie(request, "manika_apercu");
  if (await jetonValide(jeton, env.APERCU_SECRET)) {
    const simule = cookie(request, "manika_role");
    return {
      role: simule === PRO ? PRO : VISITEUR,
      apercu: true,
    };
  }

  // 2. Session client réelle — branchée à l'étape « Customer Account API ».
  //    Tant qu'elle n'existe pas, on retombe volontairement sur visiteur :
  //    mieux vaut trop peu montrer que trop.
  // TODO(session) : vérifier le jeton client puis lire l'étiquette pro-valide.

  // 3.
  return { role: VISITEUR, apercu: false };
}
