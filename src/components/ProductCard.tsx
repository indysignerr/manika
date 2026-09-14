"use client";

import Link from "next/link";
import { Product, fmt } from "@/lib/products";
import { useCart } from "@/components/cart-context";
import ProductImage from "@/components/ProductImage";
import Prix from "@/components/Prix";
import { useDemandePrix, usePrixEtat, usePrixVariante } from "@/lib/prix";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const defaultSize = product.sizes.find((s) => s.delta === 0) ?? product.sizes[0];
  const multi = product.sizes.length > 1;

  // Le build ne contient aucun montant : la carte réclame le sien à la
  // passerelle. Dans une grille, toutes les cartes partent en une requête.
  useDemandePrix([product.slug]);
  const { role } = usePrixEtat();
  const tarif = usePrixVariante(product.slug, defaultSize?.variantId);
  const unit = tarif?.prix ?? 0;
  const peutAcheter = role === "pro";

  /** Bandeau de survol : ajout rapide, choix d'option, ou appel au compte pro. */
  const bandeau =
    "absolute inset-x-0 bottom-0 z-[2] translate-y-full bg-copper py-3 text-center text-[10px] uppercase tracking-wide2 text-ivory transition-transform duration-500 group-hover:translate-y-0 focus-visible:translate-y-0";

  return (
    <div className="group" data-cursor>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-ivory-2">
        <Link href={`/produit/${product.slug}/`} aria-label={product.name} className="absolute inset-0 z-[1]" />
        <ProductImage
          product={product}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {/* Hors compte pro, pas d'achat : on renvoie vers l'ouverture de compte */}
        {!peutAcheter ? (
          <Link href="/devenir-client-pro/" className={`${bandeau} hover:bg-copper-deep`}>
            Réservé aux professionnels
          </Link>
        ) : multi ? (
          /* Ajout rapide seulement si une seule variante ; sinon on renvoie au choix */
          <Link href={`/produit/${product.slug}/`} className={`${bandeau} hover:bg-copper-deep`}>
            Choisir une option
          </Link>
        ) : (
          <button
            onClick={() =>
              add({
                slug: product.slug,
                size: defaultSize.label,
                unit,
                name: product.name,
                image: product.image,
                variantId: defaultSize.variantId,
              })
            }
            className={`${bandeau} hover:bg-copper-deep`}
          >
            Ajout rapide{unit > 0 ? ` — ${fmt(unit)}` : ""}
          </button>
        )}
        {product.badge && (
          <span className="absolute left-3 top-3 z-[2] rounded-[2px] bg-copper/90 px-2.5 py-1 text-[8px] uppercase tracking-wide2 text-ivory">
            {product.badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-wide2 text-bronze">{product.category}</p>
        <Link href={`/produit/${product.slug}/`} className="heading-produit mt-1 block py-1 text-[14px] leading-snug">
          {product.name}
        </Link>
        <Prix
          handle={product.slug}
          court
          className="mt-1.5 block text-[13px] text-copper"
          classeMasque="mt-1.5 block text-[11px] font-light text-taupe-deep"
        />
      </div>
    </div>
  );
}
