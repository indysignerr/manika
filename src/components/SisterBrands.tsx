import Link from "next/link";
import Reveal from "@/components/Reveal";

export default function SisterBrands() {
  return (
    <section className="bg-ivory-2 py-24 md:py-32">
      <div className="container-luxe">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="kicker">Deux maisons, un même objectif</p>
          <h2 className="heading mt-5 text-3xl leading-[1.25] md:text-[2.5rem]">
            MANIKA.LAB prend soin de vos cheveux de l&apos;extérieur.{" "}
            <em className="font-serif normal-case italic tracking-normal text-bronze">NAYUMA</em>{" "}
            les nourrit de l&apos;intérieur.
          </h2>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2 md:gap-7">
          {/* MANIKA.LAB — l'extérieur */}
          <Reveal>
            <div className="flex h-full flex-col rounded-[3px] border border-taupe/50 bg-ivory p-8 md:p-10">
              <p className="font-display text-lg font-light tracking-[0.28em] text-copper">MANIKA.LAB</p>
              <p className="kicker mt-6">L&apos;extérieur</p>
              <p className="mt-4 text-[14px] font-light leading-relaxed text-ink/80">
                Une cosmétique capillaire de niveau professionnel — coloration vegan, soin et
                coiffage, pour prendre soin du cheveu de l&apos;extérieur.
              </p>
              <Link
                href="/boutique/"
                className="mt-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-wide2 text-copper transition-opacity hover:opacity-60"
                data-cursor
              >
                Explorer la boutique <span aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>

          {/* NAYUMA — l'intérieur */}
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col rounded-[3px] border border-taupe/50 bg-ivory p-8 md:p-10">
              <p className="font-serif text-xl italic text-bronze">
                NAYUMA{" "}
                <span className="text-[10px] not-italic uppercase tracking-wide2 text-taupe-deep">· Tea &amp; Mood</span>
              </p>
              <p className="kicker mt-6">L&apos;intérieur</p>
              <p className="mt-4 text-[14px] font-light leading-relaxed text-ink/80">
                Des infusions botaniques à boire chaque jour, pour nourrir le cheveu et accompagner
                le bien-être de l&apos;intérieur.
              </p>
              <a
                href="https://nayumatea.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-wide2 text-bronze transition-opacity hover:opacity-60"
                data-cursor
              >
                Découvrir NAYUMA <span aria-hidden>↗</span>
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal className="mx-auto mt-12 max-w-xl text-center">
          <p className="text-[12px] font-light leading-relaxed text-taupe-deep">
            NAYUMA et MANIKA.LAB appartiennent à la même maison — deux marques, un seul soin du cheveu.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
