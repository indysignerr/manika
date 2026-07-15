"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Lock } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { bySlug, fmt, FREE_SHIPPING } from "@/lib/products";
import ProductImage from "@/components/ProductImage";

export default function CartDrawer() {
  const { items, open, setOpen, setQty, subtotal } = useCart();
  const progress = Math.min(1, subtotal / FREE_SHIPPING);
  const remaining = FREE_SHIPPING - subtotal;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[95] bg-copper-deep/40 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 z-[96] flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl"
            role="dialog"
            aria-label="Panier"
          >
            <div className="flex items-center justify-between border-b border-taupe/50 px-6 py-5">
              <h2 className="heading text-sm tracking-wide2">
                Votre panier{items.length > 0 && ` · ${items.reduce((s, i) => s + i.qty, 0)}`}
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer le panier"
                className="p-2 text-copper transition-transform hover:rotate-90"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="border-b border-taupe/50 px-6 py-4">
              <p className="mb-2 text-[11px] tracking-wide text-copper">
                {remaining > 0 ? (
                  <>Plus que <strong className="font-medium">{fmt(remaining)}</strong> pour la livraison offerte</>
                ) : (
                  <>Livraison offerte ✦</>
                )}
              </p>
              <div className="h-[3px] rounded-full bg-ivory-3">
                <div
                  className="h-[3px] rounded-full bg-rose transition-all duration-700"
                  style={{ width: `${(progress * 100).toFixed(0)}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <p className="font-serif italic text-copper">Votre panier attend son rituel.</p>
                  <button onClick={() => setOpen(false)} className="btn-ghost">
                    Découvrir la boutique
                  </button>
                </div>
              ) : (
                items.map((it, i) => {
                  const p = bySlug(it.slug);
                  if (!p) return null;
                  return (
                    <div key={`${it.slug}-${it.size}`} className="flex gap-4 border-b border-taupe/40 py-5">
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-[3px] bg-ivory-2">
                        <ProductImage product={p} />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <p className="heading text-[12px] tracking-luxe">{p.name}</p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-wide2 text-taupe-deep">{it.size}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-[2px] border border-taupe/60 text-copper">
                            <button
                              onClick={() => setQty(i, it.qty - 1)}
                              aria-label="Réduire la quantité"
                              className="px-3.5 py-2.5"
                            >
                              <Minus size={12} strokeWidth={1.5} />
                            </button>
                            <span className="w-6 text-center text-xs">{it.qty}</span>
                            <button
                              onClick={() => setQty(i, it.qty + 1)}
                              aria-label="Augmenter la quantité"
                              className="px-3.5 py-2.5"
                            >
                              <Plus size={12} strokeWidth={1.5} />
                            </button>
                          </div>
                          <p className="text-sm text-copper">{fmt(it.unit * it.qty)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-taupe/50 px-6 py-5">
                <div className="mb-1 flex justify-between text-sm text-copper">
                  <span>Sous-total</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="mb-4 flex justify-between text-[11px] text-taupe-deep">
                  <span>Livraison</span>
                  <span>{subtotal >= FREE_SHIPPING ? "Offerte" : "Calculée à l'étape suivante"}</span>
                </div>
                <button className="btn-primary w-full" data-cursor>
                  <Lock size={13} strokeWidth={1.5} />
                  Passer commande
                </button>
                <p className="mt-3 text-center text-[10px] tracking-wide text-taupe-deep">
                  Paiement sécurisé · Retours offerts sous 30 jours
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
