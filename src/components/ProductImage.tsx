import { Product } from "@/lib/products";

/**
 * Photo produit.
 *
 * ⚠️ Deux règles, tirées de l'audit du 13/09 :
 *
 * 1. CADRAGE CONTENU, jamais `object-cover`. Les visuels viennent des
 *    fournisseurs, chacun avec son cadrage : en remplissant le cadre, les
 *    sprays étaient tranchés en plein milieu de leur étiquette et le produit
 *    devenait méconnaissable. On préfère de l'ivoire autour qu'un produit coupé.
 *
 * 2. JAMAIS D'AGRANDISSEMENT. Certains visuels ne font que 190 px de large
 *    pour une vignette de 269 : étirés, ils sont flous. On plafonne à leur
 *    taille native, quitte à ce qu'ils occupent moins que le cadre.
 */
export default function ProductImage({
  product,
  className = "",
  eager = false,
  /** Marge intérieure — le produit ne doit pas toucher les bords du cadre. */
  marge = "p-5 md:p-7",
}: {
  product: Product;
  className?: string;
  eager?: boolean;
  marge?: string;
}) {
  const { imageLargeur: l, imageHauteur: h } = product;

  return (
    <span className={`absolute inset-0 flex items-center justify-center ${marge}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.image}
        alt={product.name}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        {...(l && h ? { width: l, height: h } : {})}
        style={l && h ? { maxWidth: `${l}px`, maxHeight: `${h}px` } : undefined}
        className={`h-full w-full object-contain ${className}`}
      />
    </span>
  );
}
