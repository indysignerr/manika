"use client";

import Link from "next/link";
import { Product, fmtPrice } from "@/lib/products";
import { useCart } from "@/components/cart-context";
import ProductImage from "@/components/ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const defaultSize = product.sizes.find((s) => s.delta === 0) ?? product.sizes[0];
  const unit = product.price + (defaultSize?.delta ?? 0);
  const multi = product.sizes.length > 1;

  return (
    <div className="group" data-cursor>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-ivory-2">
        <Link href={`/produit/${product.slug}/`} aria-label={product.name} className="absolute inset-0 z-[1]" />
        <ProductImage
          product={product}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {/* Ajout rapide seulement si une seule variante ; sinon on renvoie au choix */}
        {multi ? (
          <Link
            href={`/produit/${product.slug}/`}
            className="absolute inset-x-0 bottom-0 z-[2] translate-y-full bg-copper py-3 text-center text-[10px] uppercase tracking-wide2 text-ivory transition-transform duration-500 hover:bg-copper-deep group-hover:translate-y-0 focus-visible:translate-y-0"
          >
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
            className="absolute inset-x-0 bottom-0 z-[2] translate-y-full bg-copper py-3 text-[10px] uppercase tracking-wide2 text-ivory transition-transform duration-500 hover:bg-copper-deep group-hover:translate-y-0 focus-visible:translate-y-0"
          >
            Ajout rapide{unit > 0 ? ` — ${fmtPrice(unit)}` : ""}
          </button>
        )}
        {product.badge && (
          <span className="absolute left-3 top-3 z-[2] rounded-[2px] bg-copper/90 px-2.5 py-1 text-[8px] uppercase tracking-wide2 text-ivory">
            {product.badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-wide2 text-rose">{product.category}</p>
        <Link href={`/produit/${product.slug}/`} className="heading mt-1 block text-[13px] tracking-luxe">
          {product.name}
        </Link>
        <p className="mt-1.5 text-[13px] text-copper">{fmtPrice(product.price)}</p>
      </div>
    </div>
  );
}
