/**
 * Mode aperçu — permet de voir le site tel que le verrait un visiteur non
 * connecté ou un salon validé, sans avoir à se connecter ni se déconnecter.
 *
 * Sécurité : le rôle simulé n'est honoré que si un jeton signé est présent.
 * Ce jeton s'obtient en visitant /apercu?cle=<APERCU_SECRET>, et il est signé
 * en HMAC-SHA256 avec un secret que seul le serveur connaît. Forger le cookie
 * de rôle sans lui ne donne donc rien : c'est ce qui empêche un visiteur de
 * s'attribuer les tarifs professionnels.
 */

const enc = new TextEncoder();

const b64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function signer(message, secret) {
  const cle = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  return b64url(await crypto.subtle.sign("HMAC", cle, enc.encode(message)));
}

/** Jeton « exp.signature », valable `heures`. */
export async function creerJeton(secret, heures = 8) {
  const exp = String(Date.now() + heures * 3600_000);
  return `${exp}.${await signer(exp, secret)}`;
}

/** Vérifie signature ET expiration. Comparaison en temps constant. */
export async function jetonValide(jeton, secret) {
  if (!jeton || !secret) return false;
  const [exp, sig] = jeton.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;

  const attendue = await signer(exp, secret);
  if (attendue.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ attendue.charCodeAt(i);
  return diff === 0;
}

/** Lit un cookie par son nom. */
export function cookie(request, nom) {
  const brut = request.headers.get("Cookie") || "";
  return brut.match(new RegExp(`(?:^|;\\s*)${nom}=([^;]*)`))?.[1] ?? null;
}
