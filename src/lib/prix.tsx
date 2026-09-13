"use client";

/**
 * Chargement des tarifs à l'exécution.
 *
 * Le build ne contient AUCUN prix : sur un site statique, un prix écrit dans
 * le HTML est lisible par tout le monde, y compris par Google. Les montants
 * sont donc demandés à /api/prix, qui ne répond qu'aux comptes professionnels
 * validés.
 *
 * Le fournisseur est monté une seule fois, à la racine. Chaque composant qui
 * affiche un tarif déclare les produits dont il a besoin avec useDemandePrix ;
 * les demandes sont regroupées (une grille de 24 cartes = une seule requête),
 * dédoublonnées et mises en cache pour toute la durée de la visite.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type PrixVariante = { id: string; titre: string; prix: number; dispo: boolean };
export type PrixProduit = { min: number; devise: string; variantes: PrixVariante[] };

/** null tant qu'on ne sait pas encore — évite d'afficher « réservé » puis un prix. */
export type Role = "visiteur" | "pro" | null;

type Etat = {
  role: Role;
  apercu: boolean;
  prix: Record<string, PrixProduit>;
  /** Une demande de tarifs est en vol : on affiche un repère, pas un tiret. */
  charge: boolean;
  demander: (handles: string[]) => void;
};

const VIDE: Etat = { role: null, apercu: false, prix: {}, charge: false, demander: () => {} };

const Ctx = createContext<Etat>(VIDE);

/** La passerelle refuse au-delà de 100 produits par appel. */
const LOT_MAX = 100;

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

/**
 * Déclare les produits dont le composant affiche le tarif.
 * Sans effet pour un visiteur : la passerelle ne répond qu'aux professionnels.
 */
export function useDemandePrix(handles: string[]) {
  const { demander } = useContext(Ctx);
  // Sérialisé pour ne relancer l'effet que si la liste change réellement.
  const cle = handles.filter(Boolean).join(",");
  useEffect(() => {
    if (cle) demander(cle.split(","));
  }, [cle, demander]);
}

export function PrixProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [apercu, setApercu] = useState(false);
  const [prix, setPrix] = useState<Record<string, PrixProduit>>({});
  const [enVol, setEnVol] = useState(0);

  /** Produits déjà demandés — en vol ou reçus. On ne redemande jamais. */
  const connus = useRef<Set<string>>(new Set());
  /** Demandes accumulées depuis le dernier envoi. */
  const file = useRef<string[]>([]);
  /** Le rôle est lu dans des fonctions non réactives : il lui faut une référence. */
  const roleRef = useRef<Role>(null);
  const groupage = useRef<ReturnType<typeof setTimeout> | null>(null);

  const envoyer = useCallback(async (lot: string[]) => {
    setEnVol((n) => n + 1);
    try {
      const r = await fetch("/api/prix", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handles: lot }),
      });
      // 403 : le compte n'est pas (ou plus) professionnel — rien à afficher.
      if (!r.ok) return;
      const d = await r.json();
      if (d?.prix) setPrix((p) => ({ ...p, ...d.prix }));
    } catch {
      // Réseau indisponible : on reste sans tarif, jamais sur un montant faux.
    } finally {
      setEnVol((n) => n - 1);
    }
  }, []);

  const vider = useCallback(() => {
    groupage.current = null;
    const lot = file.current;
    file.current = [];
    if (roleRef.current !== "pro" || lot.length === 0) return;
    for (let i = 0; i < lot.length; i += LOT_MAX) envoyer(lot.slice(i, i + LOT_MAX));
  }, [envoyer]);

  const demander = useCallback(
    (handles: string[]) => {
      let neuf = false;
      for (const h of handles) {
        if (!h || connus.current.has(h)) continue;
        connus.current.add(h);
        file.current.push(h);
        neuf = true;
      }
      // Tant que le rôle n'est pas connu, on accumule : l'envoi partira dès
      // que la réponse de /api/role arrive.
      if (neuf && roleRef.current !== null && groupage.current === null) {
        groupage.current = setTimeout(vider, 0);
      }
    },
    [vider]
  );

  useEffect(() => {
    let annule = false;

    (async () => {
      let r: Role = "visiteur";
      let a = false;
      try {
        const rep = await fetch("/api/role", { credentials: "same-origin" });
        const d = await rep.json();
        r = d?.role === "pro" ? "pro" : "visiteur";
        a = Boolean(d?.apercu);
      } catch {
        // Passerelle injoignable : on retombe sur le plus restrictif.
      }
      if (annule) return;

      roleRef.current = r;
      setRole(r);
      setApercu(a);

      if (r === "pro") {
        if (file.current.length && groupage.current === null) groupage.current = setTimeout(vider, 0);
      } else {
        file.current = [];
      }
    })();

    return () => {
      annule = true;
      if (groupage.current !== null) clearTimeout(groupage.current);
    };
  }, [vider]);

  const valeur = useMemo<Etat>(
    () => ({ role, apercu, prix, charge: enVol > 0, demander }),
    [role, apercu, prix, enVol, demander]
  );

  return <Ctx.Provider value={valeur}>{children}</Ctx.Provider>;
}
