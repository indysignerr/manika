import Link from "next/link";
import { UNIVERS, collectionsByUnivers, productsInCollection } from "@/lib/collections";
import Reveal from "@/components/Reveal";

export default function BoutiqueLanding() {
  return (
    <div className="pt-32 md:pt-36">
      {/* En-tête */}
      <section className="relative overflow-hidden pb-8">
        <div className="pointer-events-none absolute -right-16 -top-24 w-[380px] opacity-[0.05]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-mark.png" alt="" />
        </div>
        <div className="container-luxe text-center">
          <Reveal>
            <p className="kicker">La boutique</p>
            <h1 className="heading mt-4 text-4xl leading-[1.1] md:text-5xl">
              Que cherchez-<em className="font-serif normal-case italic tracking-normal text-bronze">vous</em> ?
            </h1>
            <p className="mx-auto mt-5 max-w-md text-[13px] font-light leading-relaxed text-ink/75">
              Choisissez votre univers, puis la catégorie — coloration, soin, coiffage ou
              consommables. La qualité salon, rangée comme dans votre back-bar.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Univers */}
      <div className="container-luxe space-y-16 pb-24 pt-8">
        {UNIVERS.map((u, ui) => (
          <section key={u} aria-label={`Univers ${u}`}>
            <Reveal>
              <div className="mb-7 flex items-center gap-4">
                <h2 className="text-[13px] uppercase tracking-wide3 text-bronze">{u}</h2>
                <span className="h-px flex-1 bg-taupe/50" />
              </div>
            </Reveal>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {collectionsByUnivers(u).map((c, i) => {
                const count = productsInCollection(c.slug).length;
                const soon = count === 0;
                return (
                  <Reveal key={c.slug} delay={(i % 3) * 0.07}>
                    <Link
                      href={`/boutique/${c.slug}/`}
                      className="group flex h-full flex-col justify-between rounded-[3px] border border-taupe/50 bg-ivory-2 p-7 transition-colors duration-300 hover:border-copper"
                      data-cursor
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="heading text-lg tracking-luxe">{c.label}</h3>
                          {soon ? (
                            <span className="rounded-[2px] bg-taupe/30 px-2 py-1 text-[8px] uppercase tracking-wide2 text-copper">
                              Bientôt
                            </span>
                          ) : (
                            <span className="text-[10px] tracking-wide2 text-taupe-deep">
                              {count} produit{count > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-[12px] font-light leading-relaxed text-ink/70">
                          {c.tagline}
                        </p>
                      </div>
                      <span className="mt-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-wide2 text-rose transition-transform duration-300 group-hover:translate-x-1">
                        {soon ? "Découvrir" : "Voir la sélection"} <span aria-hidden>→</span>
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
            {ui === 0 && <div className="mt-16 border-b border-taupe/30" />}
          </section>
        ))}
      </div>
    </div>
  );
}
