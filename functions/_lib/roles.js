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
import { lireJetonSession, secretSession } from "./session.js";
import { salonValide } from "./clients.js";

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

  // 2. Session réelle du salon, ouverte par son lien d'accès personnel.
  //    Le jeton signé donne l'identifiant client ; l'étiquette `pro-valide`
  //    est REVÉRIFIÉE auprès de Shopify à chaque fois (avec un cache de 5 min),
  //    pour qu'un retrait d'étiquette coupe l'accès sans attendre l'expiration
  //    du cookie.
  const idClient = await lireJetonSession(
    cookie(request, "manika_session"),
    secretSession(env)
  );
  if (idClient && (await salonValide(env, idClient))) {
    return { role: PRO, apercu: false, client: idClient };
  }

  // 3.
  return { role: VISITEUR, apercu: false };
}
