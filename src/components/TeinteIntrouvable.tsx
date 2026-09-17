"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Géométrie de la mèche, calculée une fois. Des cheveux se lisent comme tels
 * quand les brins suivent TOUS la même ondulation : une seule courbe douce,
 * parallèle d'un brin à l'autre, et des pointes à peine décalées.
 */
const BRINS = Array.from({ length: 60 }, (_, i) => {
  const t = i / 59;
  const depart = 40 + t * 40; // serrés sous la pince
  const arrivee = 50 + t * 26; // la pointe se resserre légèrement
  const fin = 190 + ((i * 29) % 22); // pointes irrégulières
  const d =
    `M${depart.toFixed(1)} 18 ` +
    `C${(depart + 14).toFixed(1)} 78 ${(arrivee - 16).toFixed(1)} 140 ${arrivee.toFixed(1)} ${fin}`;
  return {
    d,
    largeur: 1.1 + ((i * 7) % 4) * 0.2,
    opacite: 0.6 + ((i * 11) % 5) * 0.08,
    clair: i % 7 === 3, // quelques reflets
  };
});

/**
 * La 404 présentée comme une fiche de nuancier : la « teinte 4.04 » existe
 * dans la notation des coloristes, mais pas dans le catalogue.
 *
 * La couleur de la mèche est calculée côté serveur par `swatch()`, avec la
 * même règle que le vrai nuancier — la blague ne tient que si la teinte est
 * crédible pour un coiffeur.
 */
export default function TeinteIntrouvable({
  code,
  nom,
  couleur,
}: {
  code: string;
  nom: string;
  couleur: string;
}) {
  const reduit = useReducedMotion();

  return (
    <motion.figure
      initial={reduit ? false : { opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[230px] rounded-[2px] border border-taupe bg-ivory px-7 pb-7 pt-9 md:max-w-[280px] md:px-8 md:pb-8 md:pt-10 shadow-[0_30px_60px_-30px_rgba(74,52,40,0.35)]"
    >
      {/* Trou de l'anneau, comme sur un nuancier de salon */}
      <span
        aria-hidden
        className="absolute left-1/2 top-3 h-3 w-3 -translate-x-1/2 rounded-full border border-taupe bg-ivory-3"
      />

      <motion.svg
        aria-hidden
        viewBox="0 0 120 220"
        className="mx-auto h-40 w-auto origin-top md:h-56"
        animate={reduit ? undefined : { rotate: [-2.5, 2.5, -2.5] }}
        transition={reduit ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Pince */}
        <rect x="34" y="4" width="52" height="14" rx="2" fill="#6B4230" />
        <rect x="34" y="15" width="52" height="3" fill="#4A3428" opacity="0.5" />

        {/* Brins : dessinés un par un, longueurs et nuances variées, pour
            qu'on lise des cheveux et non une forme pleine. */}
        {BRINS.map((b, i) => (
          <path
            key={i}
            d={b.d}
            stroke={b.clair ? "#F5F3EF" : couleur}
            strokeOpacity={b.clair ? 0.3 : b.opacite}
            strokeWidth={b.largeur}
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </motion.svg>

      <figcaption className="mt-6 border-t border-taupe pt-5 text-left">
        <p className="kicker">Nuance</p>
        <p className="mt-1 font-display text-4xl font-extralight leading-none text-ink">
          N°&nbsp;{code}
        </p>
        <p className="mt-2 font-serif text-base italic text-taupe-deep">{nom}</p>
        <p className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-wide2 text-copper">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-copper" />
          Introuvable
        </p>
      </figcaption>
    </motion.figure>
  );
}
