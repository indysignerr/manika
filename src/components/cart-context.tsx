"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type CartItem = {
  slug: string;
  size: string;
  qty: number;
  unit: number;
  name: string;
  image: string;
  variantId?: string; // gid Shopify — pour le checkout
};

export type AddInput = Omit<CartItem, "qty">;

type CartCtx = {
  items: CartItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: AddInput) => void;
  /** Ajout groupé — grille de réassort : N teintes, N quantités, un seul rendu. */
  addMany: (entries: (AddInput & { qty: number })[]) => void;
  setQty: (index: number, qty: number) => void;
  subtotal: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
};

/**
 * Deux lignes fusionnent si elles désignent la même variante ET le même
 * conditionnement. Le variantId prime sur le slug (il est unique par teinte),
 * mais `size` reste discriminant : 2 packs de 3 et 1 pack de 12 portent la
 * même variante Shopify sans se facturer pareil — ils restent deux lignes.
 */
const memeLigne = (a: { slug: string; size: string; variantId?: string }, b: typeof a) =>
  (a.variantId && b.variantId ? a.variantId === b.variantId : a.slug === b.slug) &&
  a.size === b.size;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  const add = (item: AddInput) => {
    setItems((prev) => {
      const i = prev.findIndex((it) => memeLigne(it, item));
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setOpen(true);
  };

  /**
   * Ajoute plusieurs lignes d'un coup. Fusionne avec l'existant sur
   * (slug, size), et cumule aussi les doublons présents dans `entries`.
   */
  const addMany = (entries: (AddInput & { qty: number })[]) => {
    const utiles = entries.filter((e) => e.qty > 0);
    if (!utiles.length) return;

    setItems((prev) => {
      const next = [...prev];
      for (const e of utiles) {
        const i = next.findIndex((it) => memeLigne(it, e));
        if (i >= 0) next[i] = { ...next[i], qty: next[i].qty + e.qty };
        else next.push({ ...e });
      }
      return next;
    });
    setOpen(true);
  };

  const setQty = (index: number, qty: number) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((_, j) => j !== index) : prev.map((it, j) => (j === index ? { ...it, qty } : it))
    );
  };

  const subtotal = items.reduce((s, it) => s + it.unit * it.qty, 0);
  const count = items.reduce((s, it) => s + it.qty, 0);

  return (
    <Ctx.Provider value={{ items, open, setOpen, add, addMany, setQty, subtotal, count }}>
      {children}
    </Ctx.Provider>
  );
}
