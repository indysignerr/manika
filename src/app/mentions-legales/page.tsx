import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Mentions légales — MANIKA" };

export default function Page() {
  return (
    <div className="container-luxe max-w-2xl pb-24 pt-36">
      <Link href="/" className="text-[10px] uppercase tracking-wide2 text-rose">
        ← Retour à l&apos;accueil
      </Link>
      <h1 className="heading mt-6 text-3xl">Mentions légales</h1>
      <div className="mt-10 space-y-8 text-[14px] font-light leading-relaxed text-ink/80">
        <section>
          <h2 className="heading mb-3 text-base">Éditeur du site</h2>
          <p>
            MANIKA — Hair Cosmetics · [Forme juridique, capital] · [Adresse du siège] ·
            RCS [Ville n°] · contact@manika.fr
          </p>
        </section>
        <section>
          <h2 className="heading mb-3 text-base">Hébergement</h2>
          <p>
            Cloudflare, Inc. — 101 Townsend St, San Francisco, CA 94107, États-Unis —
            cloudflare.com
          </p>
        </section>
        <section>
          <h2 className="heading mb-3 text-base">Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus (textes, visuels, logo, motifs) est la propriété exclusive
            de MANIKA. Toute reproduction sans autorisation écrite est interdite.
          </p>
        </section>
        <section>
          <h2 className="heading mb-3 text-base">Droit applicable</h2>
          <p>Le présent site est soumis au droit français. Tout litige relève des tribunaux compétents.</p>
        </section>
      </div>
    </div>
  );
}
