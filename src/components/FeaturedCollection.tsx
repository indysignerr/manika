import Link from "next/link";
import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

export default function FeaturedCollection() {
  const featured = products.slice(0, 4);

  return (
    <section id="collection" className="py-24 md:py-32">
      <div className="container-luxe">
        <Reveal className="text-center">
          <p className="kicker">L&apos;essentiel</p>
          <h2 className="heading mt-3 text-3xl md:text-4xl">Best-sellers</h2>
          <span className="mx-auto mt-6 block h-px w-10 bg-bronze" />
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-7">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 text-center">
          <Link href="/boutique/" className="btn-ghost" data-cursor>
            Toute la collection
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
