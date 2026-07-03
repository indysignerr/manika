"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type CartItem = { slug: string; size: string; qty: number; unit: number };

type CartCtx = {
  items: CartItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (slug: string, size: string, unit: number) => void;
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

  const add = (slug: string, size: string, unit: number) => {
    setItems((prev) => {
      const i = prev.findIndex((it) => it.slug === slug && it.size === size);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [...prev, { slug, size, qty: 1, unit }];
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
