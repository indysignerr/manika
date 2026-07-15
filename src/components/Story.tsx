import Magnetic from "@/components/Magnetic";
import Reveal from "@/components/Reveal";

export default function Story() {
  return (
    <section id="histoire" className="relative overflow-hidden py-24 md:py-32">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-6 select-none font-serif text-[26rem] leading-none text-bronze/[0.06]"
      >
        M
      </span>

      <div className="container-luxe grid items-center gap-14 md:grid-cols-2">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-gradient-to-br from-ivory-2 via-ivory-3 to-[#EFE3D6]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-mark.png"
              alt="MANIKA.LAB"
              className="absolute left-1/2 top-1/2 w-3/5 -translate-x-1/2 -translate-y-1/2 opacity-90"
            />
            <div className="absolute inset-x-0 bottom-0 bg-copper-deep/80 px-6 py-4 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wide3 text-ivory/80">
                Formulé en Italie — laboratoire partenaire
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="kicker">Notre histoire</p>
          <h2 className="heading mt-4 text-3xl leading-[1.15] md:text-[2.6rem]">
            La science
            <br />
            au service du <em className="font-serif normal-case italic tracking-normal text-bronze">cheveu</em>
          </h2>
          <p className="mt-7 max-w-md text-[14px] font-light leading-relaxed text-ink/80">
            MANIKA.LAB conçoit des formules de niveau salon — coloration vegan, kératine
            reconstructrice, coiffage de précision — fabriquées en Italie. Des actifs qui ont une
            raison d&apos;être, une transparence totale, rien de superflu.
          </p>
          <div className="mt-9">
            <Magnetic>
              <a href="/a-propos/" className="btn-ghost" data-cursor>
                Notre manifeste
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
