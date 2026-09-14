"use client";

/**
 * PROMOTIONS — entrée de menu réclamée par le document.
 *
 * ⚠️ Une promotion n'est pas calculable au build : les prix ne sont pas dans
 *    le build (catalogue fermé). La page demande donc les tarifs à la
 *    passerelle, puis ne garde que les produits dont Shopify déclare un prix
 *    barré (`compareAtPrice`). Rien n'est deviné.
 *
 * Conséquence assumée : un visiteur non professionnel ne voit aucune
 * promotion, puisqu'il ne voit aucun prix.
 */
import Link from "next/link";
import { useMemo } from "react";
import { type Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { useDemandePrix, usePrixEtat } from "@/lib/prix";

export default function PromotionsView({ produits }: { produits: Product[] }) {
  useDemandePrix(useMemo(() => produits.map((p) => p.slug), [produits]));
  const { role, prix, charge } = usePrixEtat();
  const pro = role === "pro";

  const enPromo = useMemo(
    () => produits.filter((p) => prix[p.slug]?.promo),
    [produits, prix]
  );

  return (
    <div className="page-top">
      <div className="container-luxe pb-8">
        <Reveal>
          <nav className="text-[10px] uppercase tracking-wide2 text-taupe-deep" aria-label="Fil d'ariane">
            <Link href="/boutique/" className="hover:text-copper">Boutique</Link> /{" "}
            <span className="text-bronze">Promotions</span>
          </nav>
          <h1 className="heading mt-4 text-4xl leading-[1.1] md:text-5xl">Promotions</h1>
          <p className="mt-4 max-w-lg text-[13px] font-light leading-relaxed text-ink/75">
            Les références dont le tarif professionnel est temporairement réduit.
          </p>
        </Reveal>
      </div>

      <div className="border-t border-taupe/40 py-12">
        <div className="container-luxe">
          {!pro ? (
            <div className="py-16 text-center">
              <p className="font-serif text-xl italic text-copper">
                Les promotions sont réservées aux salons enregistrés.
              </p>
              <p className="mx-auto mt-4 max-w-sm text-[13px] font-light text-ink/70">
                Les tarifs — et donc les remises — n&apos;apparaissent qu&apos;une fois votre
                compte professionnel validé.
              </p>
              <Link href="/devenir-client-pro/" className="btn-primary mt-8" data-cursor>
                Ouvrir mon compte pro
              </Link>
            </div>
          ) : charge && enPromo.length === 0 ? (
            <p className="py-16 text-center text-[13px] font-light text-taupe-deep" aria-busy>
              Chargement des tarifs…
            </p>
          ) : enPromo.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-serif text-xl italic text-copper">
                Aucune promotion en cours.
              </p>
              <p className="mx-auto mt-4 max-w-sm text-[13px] font-light text-ink/70">
                Les remises apparaissent ici dès qu&apos;un prix barré est en place sur une
                référence.
              </p>
              <Link href="/boutique/" className="btn-ghost mt-8">Voir le catalogue</Link>
            </div>
          ) : (
            <>
              <p className="mb-7 text-[11px] uppercase tracking-wide2 text-taupe-deep" aria-live="polite">
                {enPromo.length} produit{enPromo.length > 1 ? "s" : ""} en promotion
              </p>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-7">
                {enPromo.map((p, i) => (
                  <Reveal key={p.slug} delay={(i % 4) * 0.07}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
