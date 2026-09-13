"use client";

/**
 * Affiche un tarif — ou ce qui le remplace.
 *
 * Cinq états, dans cet ordre de priorité :
 *   rôle inconnu    → le message le plus restrictif, jamais un montant
 *   visiteur        → « Tarif réservé aux professionnels »
 *   pro, en attente → un repère discret le temps de la requête
 *   pro, prix à 0   → « Prix à venir » (la cliente ne l'a pas encore saisi)
 *   pro, prix connu → le montant
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
  /** Formule courte, pour les grilles et les listes où la place manque. */
  court?: boolean;
  /** Habillage du texte de remplacement. `className` ne sert qu'au montant :
      un « tarif réservé » en 3 rem serait illisible. */
  classeMasque?: string;
};

export default function Prix({
  handle,
  variantId,
  quantite = 1,
  className = "",
  avecLien,
  court,
  classeMasque,
}: Props) {
  const { role, charge } = usePrixEtat();
  const produit = usePrix(handle);
  const variante = usePrixVariante(handle, variantId);

  // Tant que le rôle n'est pas résolu, on affiche le message le plus restrictif.
  // C'est aussi ce que voient les moteurs de recherche et les navigateurs sans
  // JavaScript : jamais un montant, jamais un squelette perpétuel.
  if (role !== "pro") {
    const texte = (
      <span
        className={
          classeMasque ?? `font-light text-taupe-deep ${court ? "text-[11px]" : "text-[13px]"}`
        }
      >
        {court ? "Tarif pro" : "Tarif réservé aux professionnels"}
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
    // Le tarif est en route : un tiret ferait croire à un produit sans prix.
    return (
      <span className={className} aria-busy={charge || undefined}>
        {charge ? "…" : "—"}
      </span>
    );
  }
  if (montant === 0) {
    return <span className={className}>Prix à venir</span>;
  }

  // Promotion : le prix barré vient de Shopify (compareAtPrice), jamais d'un calcul.
  const avant = variantId ? variante?.avant : undefined;
  if (avant && avant > montant) {
    return (
      <span className={className}>
        {fmt(montant * quantite)}
        <span className="ml-2 text-[0.8em] font-light text-taupe-deep line-through">
          {fmt(avant * quantite)}
        </span>
      </span>
    );
  }
  return <span className={className}>{fmt(montant * quantite)}</span>;
}
