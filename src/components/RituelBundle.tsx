"use client";

import { useCart } from "@/components/cart-context";
import { bySlug, fmt } from "@/lib/products";
import Magnetic from "@/components/Magnetic";

const SLUGS = ["coloration-bio-vegan", "shampoing-keratine", "texture-shine"];

export default function RituelBundle() {
  const { add } = useCart();
  const items = SLUGS.map((s) => bySlug(s)!);
  const total = items.reduce((t, p) => t + p.price, 0);

  const addAll = () => {
    items.forEach((p) => {
      const size = p.sizes.find((s) => s.delta === 0) ?? p.sizes[0];
      add(p.slug, size.label, p.price + size.delta);
    });
  };

  return (
    <Magnetic>
      <button
        onClick={addAll}
        className="inline-flex items-center justify-center rounded-[2px] bg-ivory px-9 py-4 text-[11px] font-normal uppercase tracking-wide2 text-copper transition-colors duration-300 hover:bg-ivory-2"
        data-cursor
      >
        Ajouter le rituel complet — {fmt(total)}
      </button>
    </Magnetic>
  );
}
