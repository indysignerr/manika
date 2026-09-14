import type { Metadata } from "next";
import Link from "next/link";
import { catalogTous } from "@/lib/catalog";
import { marquesDuCatalogue, universDuCatalogue } from "@/lib/taxonomie";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Nos marques — MANIKA.LAB",
  description:
    "Les marques distribuées par MANIKA.LAB aux salons de coiffure : coloration, soins, coiffage, matériel et consommables. Tarifs professionnels HT.",
};

export default async function Page() {
  const produits = await catalogTous();
  const marques = marquesDuCatalogue(produits);
  const universParMarque = new Map<string, string[]>();
  for (const m of marques) {
    const u = [
      ...new Set(
        produits
          .filter((p) => (p.facettes?.marque ?? []).includes(m.valeur))
          .flatMap((p) => p.facettes?.univers ?? [])
      ),
    ];
    universParMarque.set(m.valeur, u);
  }
  const univers = universDuCatalogue(produits);

  return (
    <div className="page-top">
      <div className="container-luxe pb-10">
        <Reveal>
          <nav className="text-[10px] uppercase tracking-wide2 text-taupe-deep" aria-label="Fil d'ariane">
            <Link href="/boutique/" className="hover:text-copper">Boutique</Link> /{" "}
            <span className="text-bronze">Nos marques</span>
          </nav>
          <h1 className="heading mt-4 text-4xl leading-[1.1] md:text-5xl">Nos marques</h1>
          <p className="mt-4 max-w-lg text-[13px] font-light leading-relaxed text-ink/75">
            {marques.length} marques distribuées, {produits.length} références. Entrez par la
            marque que vous connaissez déjà — ou par l&apos;univers si vous cherchez un produit.
          </p>
        </Reveal>
      </div>

      <div className="border-t border-taupe/40 py-12">
        <div className="container-luxe grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {marques.map((m, i) => (
            <Reveal key={m.slug} delay={(i % 3) * 0.07}>
              <Link
                href={`/marques/${m.slug}/`}
                className="group flex h-full flex-col justify-between rounded-[3px] border border-taupe/50 bg-ivory-2 p-7 transition-colors duration-300 hover:border-copper"
                data-cursor
              >
                <div>
                  <p className="heading text-xl tracking-luxe">{m.valeur}</p>
                  <p className="mt-3 text-[12px] font-light leading-relaxed text-taupe-deep">
                    {(universParMarque.get(m.valeur) ?? []).join(" · ") || "Catalogue en cours"}
                  </p>
                </div>
                <p className="mt-7 text-[10px] uppercase tracking-wide2 text-bronze">
                  {m.n} référence{m.n > 1 ? "s" : ""} →
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Sortie de secours : on ne connaît pas toujours la marque qu'on cherche */}
      <div className="border-t border-taupe/40 bg-ivory-2 py-14">
        <div className="container-luxe">
          <Reveal>
            <p className="kicker">Vous cherchez un produit, pas une marque ?</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {univers.map((u) => (
                <Link
                  key={u.slug}
                  href={`/univers/${u.slug}/`}
                  className="rounded-[2px] border border-taupe/60 px-5 py-2.5 text-[10px] uppercase tracking-wide2 text-copper transition-colors hover:border-copper"
                  data-cursor
                >
                  {u.valeur}
                  <span className="ml-2 text-taupe-deep">{u.n}</span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
