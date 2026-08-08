import Reveal from "@/components/Reveal";
import { proArguments } from "@/lib/pro";

/**
 * Barre d'arguments de switch — répond à l'objection « pourquoi changerais-je
 * de fournisseur ? » avant même la fiche produit.
 * Ne rend que les conditions réellement arrêtées (cf. src/lib/pro.ts).
 */
export default function ProReassurance() {
  const args = proArguments();

  return (
    <section className="border-y border-taupe/40 bg-ivory-2" aria-label="Conditions professionnelles">
      <div className="container-luxe grid gap-x-8 gap-y-9 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {args.map((a, i) => (
          <Reveal key={a.label} delay={i * 0.07}>
            <div className="flex gap-3.5">
              <span
                aria-hidden
                className="mt-1 h-px w-6 shrink-0 bg-bronze"
              />
              <div>
                <p className="text-[11px] uppercase tracking-wide2 text-copper">{a.label}</p>
                <p className="mt-2 text-[12px] font-light leading-relaxed text-taupe-deep">
                  {a.detail}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
