"use client";

/**
 * Affiche un tarif — ou ce qui le remplace.
 *
 * Quatre états, dans cet ordre de priorité :
 *   rôle inconnu   → un discret indicateur de chargement, jamais un montant
 *   visiteur       → « Tarif réservé aux professionnels »
 *   pro, prix à 0  → « Prix à venir » (la cliente ne l'a pas encore saisi)
 *   pro, prix connu→ le montant
 */
import Link from "next/link";
import { fmt } from "@/lib/products";
import { usePrixEtat, usePrix, usePrixVariante } from "@/lib/prix";

type Props = {
  handle: string;
  /** Variante précise ; à défaut, le tarif d'entrée de gamme. */
  variantId?: string;
  /** Multiplicateur (quantité). */
  quantite?: number;
  className?: string;
  /** Affiche un lien vers l'ouverture de compte quand le tarif est masqué. */
  avecLien?: boolean;
};

export default function Prix({ handle, variantId, quantite = 1, className = "", avecLien }: Props) {
  const { role } = usePrixEtat();
  const produit = usePrix(handle);
  const variante = usePrixVariante(handle, variantId);

  // Tant que le rôle n'est pas résolu, on affiche le message le plus restrictif.
  // C'est aussi ce que voient les moteurs de recherche et les navigateurs sans
  // JavaScript : jamais un montant, jamais un squelette perpétuel.
  if (role !== "pro") {
    const texte = (
      <span className={`text-[13px] font-light text-taupe-deep ${className}`}>
        Tarif réservé aux professionnels
      </span>
    );
    return avecLien ? (
      <Link href="/devenir-client-pro/" className="underline-offset-2 hover:underline">
        {texte}
      </Link>
    ) : texte;
  }

  const montant = variantId ? variante?.prix : produit?.min;
  if (montant === undefined || montant === null) {
    return <span className={className}>—</span>;
  }
  if (montant === 0) {
    return <span className={className}>Prix à venir</span>;
  }
  return <span className={className}>{fmt(montant * quantite)}</span>;
}
