"use client";

/**
 * Chargement des tarifs à l'exécution.
 *
 * Le build ne contient AUCUN prix : sur un site statique, un prix écrit dans
 * le HTML est lisible par tout le monde, y compris par Google. Les montants
 * sont donc demandés au chargement de la page à /api/prix, qui ne répond
 * qu'aux comptes professionnels validés.
 *
 * Chaque page déclare les produits qu'elle affiche ; une seule requête suffit.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type PrixVariante = { id: string; titre: string; prix: number; dispo: boolean };
export type PrixProduit = { min: number; devise: string; variantes: PrixVariante[] };

type Etat = {
  /** null tant qu'on ne sait pas encore — évite d'afficher « réservé » puis un prix. */
  role: "visiteur" | "pro" | null;
  apercu: boolean;
  prix: Record<string, PrixProduit>;
};

const Ctx = createContext<Etat>({ role: null, apercu: false, prix: {} });

export const usePrixEtat = () => useContext(Ctx);

/** Tarif d'un produit, ou null s'il n'est pas accessible. */
export function usePrix(handle: string): PrixProduit | null {
  return useContext(Ctx).prix[handle] ?? null;
}

/** Tarif d'une variante précise. */
export function usePrixVariante(handle: string, variantId?: string): PrixVariante | null {
  const p = usePrix(handle);
  if (!p) return null;
  if (!variantId) return p.variantes[0] ?? null;
  return p.variantes.find((v) => v.id === variantId) ?? null;
}

export function PrixProvider({ handles, children }: { handles: string[]; children: ReactNode }) {
  const [etat, setEtat] = useState<Etat>({ role: null, apercu: false, prix: {} });

  // Sérialisé pour ne relancer que si la liste change réellement.
  const cle = handles.join(",");

  useEffect(() => {
    let annule = false;

    (async () => {
      try {
        const r = await fetch("/api/role", { credentials: "same-origin" });
        const { role, apercu } = await r.json();
        if (annule) return;

        if (role !== "pro" || !cle) {
          setEtat({ role, apercu, prix: {} });
          return;
        }

        const p = await fetch("/api/prix", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handles: cle.split(",") }),
        });
        const d = await p.json();
        if (annule) return;
        setEtat({ role, apercu, prix: d.prix ?? {} });
      } catch {
        // Réseau indisponible : on reste sur « visiteur », jamais sur un prix erroné.
        if (!annule) setEtat({ role: "visiteur", apercu: false, prix: {} });
      }
    })();

    return () => { annule = true; };
  }, [cle]);

  return <Ctx.Provider value={etat}>{children}</Ctx.Provider>;
}
