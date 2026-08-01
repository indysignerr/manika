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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  const add = (item: AddInput) => {
    setItems((prev) => {
      const i = prev.findIndex((it) => it.slug === item.slug && it.size === item.size);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [...prev, { ...item, qty: 1 }];
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
    <Ctx.Provider value={{ items, open, setOpen, add, setQty, subtotal, count }}>
      {children}
    </Ctx.Provider>
  );
}
