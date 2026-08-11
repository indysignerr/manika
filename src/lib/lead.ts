/**
 * Validation des leads professionnels.
 *
 * L'inscription avec SIRET est le filtre qualifiant du dispositif : elle
 * distingue un salon d'un curieux. Autant la valider vraiment côté client —
 * un SIRET mal saisi qui part dans la base, c'est un lead perdu.
 */

export type LeadVariant = "pro" | "contact" | "newsletter";

/**
 * Un SIRET valide fait 14 chiffres et satisfait la clé de Luhn.
 * Exception connue : les établissements La Poste (préfixe SIREN 356000000)
 * ne respectent pas Luhn — on les accepte sur le seul critère de longueur.
 */
export function isValidSiret(raw: string): boolean {
  const s = raw.replace(/\s/g, "");
  if (!/^\d{14}$/.test(s)) return false;
  if (s.startsWith("356000000")) return true;

  let sum = 0;
  for (let i = 0; i < 14; i++) {
    // Les positions paires (en partant de la gauche, 0-indexé) sont doublées.
    let d = Number(s[i]) * (i % 2 === 0 ? 2 : 1);
    if (d > 9) d -= 9;
    sum += d;
  }
  return sum % 10 === 0;
}

/** Formatage lisible : 123 456 789 00012 */
export function formatSiret(raw: string): string {
  const s = raw.replace(/\D/g, "").slice(0, 14);
  const parts = [s.slice(0, 3), s.slice(3, 6), s.slice(6, 9), s.slice(9, 14)].filter(Boolean);
  return parts.join(" ");
}

export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

/** Numéro français, tolérant sur la mise en forme. */
export function isValidPhone(v: string): boolean {
  const s = v.replace(/[\s.\-()]/g, "");
  return /^(?:\+33|0)[1-9]\d{8}$/.test(s);
}

export type LeadPayload = {
  variant: LeadVariant;
  salon: string;
  siret: string;
  contact: string;
  email: string;
  telephone: string;
  ville: string;
  message?: string;
  /** Champ piège anti-robot : doit rester vide. */
  website?: string;
};

export type LeadErrors = Partial<Record<keyof LeadPayload, string>>;

export function validateLead(p: LeadPayload): LeadErrors {
  const e: LeadErrors = {};
  if (!p.salon.trim()) e.salon = "Indiquez le nom de votre salon.";
  if (!isValidSiret(p.siret)) e.siret = "SIRET invalide — 14 chiffres attendus.";
  if (!p.contact.trim()) e.contact = "Indiquez votre nom.";
  if (!isValidEmail(p.email)) e.email = "Adresse email invalide.";
  if (!isValidPhone(p.telephone)) e.telephone = "Numéro de téléphone invalide.";
  if (!p.ville.trim()) e.ville = "Indiquez votre ville.";
  return e;
}
