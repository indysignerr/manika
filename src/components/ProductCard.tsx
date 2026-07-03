"use client";

import Link from "next/link";
import { Product, fmt } from "@/lib/products";
import { useCart } from "@/components/cart-context";
import BottleVisual from "@/components/BottleVisual";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const defaultSize = product.sizes.find((s) => s.delta === 0) ?? product.sizes[0];

  return (
    <div className="group" data-cursor>
      <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] bg-gradient-to-b from-ivory-2 to-ivory-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/motif.png"
          alt=""
          className="absolute left-1/2 top-1/2 w-2/3 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
        />
        <Link href={`/produit/${product.slug}/`} aria-label={product.name} className="absolute inset-0 z-[1]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <BottleVisual
            variant={product.variant}
            name={product.name}
            className="h-3/4 transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-1"
          />
        </div>
        <button
          onClick={() => add(product.slug, defaultSize.label, product.price + defaultSize.delta)}
          className="absolute inset-x-0 bottom-0 z-[2] translate-y-full bg-copper py-3 text-[10px] uppercase tracking-wide2 text-ivory transition-transform duration-400 hover:bg-copper-deep group-hover:translate-y-0 focus-visible:translate-y-0"
        >
          Ajout rapide — {fmt(product.price + defaultSize.delta)}
        </button>
        {product.stock && product.stock <= 10 && (
          <span className="absolute left-3 top-3 rounded-[2px] bg-bronze/90 px-2 py-1 text-[8px] uppercase tracking-wide2 text-ivory">
            Édition limitée
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-wide2 text-rose">{product.category}</p>
        <Link href={`/produit/${product.slug}/`} className="heading mt-1 block text-[13px] tracking-luxe">
          {product.name}
        </Link>
        <p className="mt-1.5 text-[13px] text-copper">{fmt(product.price)}</p>
      </div>
    </div>
  );
}
