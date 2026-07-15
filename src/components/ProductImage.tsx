import { Product } from "@/lib/products";

/**
 * Photo produit MANIKA.LAB — remplit son conteneur (object-cover).
 * Le conteneur parent gère la forme (aspect, radius, overflow-hidden).
 */
export default function ProductImage({
  product,
  className = "",
  eager = false,
}: {
  product: Product;
  className?: string;
  eager?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.image}
      alt={product.name}
      loading={eager ? "eager" : "lazy"}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
