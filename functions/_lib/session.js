/**
 * Session « salon validé ».
 *
 * Le problème à résoudre : les gérantes valident un salon À LA MAIN dans
 * Shopify (étiquette `pro-valide`). Le site, lui, est statique et n'a aucune
 * session. Sans passerelle, un salon validé restait un visiteur — donc aucun
 * prix, aucune commande. Toute la plomberie du catalogue fermé existait sans
 * porte d'entrée.
 *
 * La porte : un LIEN D'ACCÈS PERSONNEL, signé, envoyé au salon dans l'email
 * « Compte pro validé ». Il pose un cookie de session de 90 jours.
 *
 * Ce qui rend la chose sûre :
 *   · le jeton est signé en HMAC-SHA256 — il ne se forge pas ;
 *   · il porte l'identifiant du client, pas un simple « je suis pro » ;
 *   · à CHAQUE résolution de rôle, l'étiquette `pro-valide` est revérifiée
 *     auprès de Shopify. Retirer l'étiquette coupe l'accès en quelques
 *     minutes, même si le salon a encore son cookie.
 */

const enc = new TextEncoder();

const b64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** Secret dédié ; repli sur celui de l'aperçu pour ne pas bloquer la mise en service. */
export const secretSession = (env) => env.SESSION_SECRET || env.APERCU_SECRET;

async function signer(message, secret) {
  const cle = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  return b64url(await crypto.subtle.sign("HMAC", cle, enc.encode(message)));
}

/** Jeton « idClient.expiration.signature ». */
export async function creerJetonSession(idClient, secret, jours = 90) {
  const charge = `${idClient}.${Date.now() + jours * 86400_000}`;
  return `${charge}.${await signer(charge, secret)}`;
}

/** Renvoie l'identifiant client si le jeton est valide, sinon null. */
export async function lireJetonSession(jeton, secret) {
  if (!jeton || !secret) return null;
  const parts = jeton.split(".");
  if (parts.length !== 3) return null;
  const [idClient, exp, sig] = parts;
  if (!idClient || !exp || !sig) return null;
  if (Number(exp) < Date.now()) return null;

  const attendue = await signer(`${idClient}.${exp}`, secret);
  if (attendue.length !== sig.length) return null;
  // Comparaison en temps constant : une comparaison naïve laisse fuiter la
  // signature attendue, caractère par caractère, par le temps de réponse.
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ attendue.charCodeAt(i);
  return diff === 0 ? idClient : null;
}
