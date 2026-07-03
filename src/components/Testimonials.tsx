import Reveal from "@/components/Reveal";

const QUOTES = [
  "« Une expérience sensorielle » — Journal Beauté",
  "« Le rituel qui change tout » — Presse Mode",
  "« L'apothicaire du cheveu » — Magazine Lifestyle",
  "« La Provence en flacon » — Revue Bien-être",
];

const REVIEWS = [
  {
    text: "Une texture divine, un parfum enivrant. Mes cheveux n'ont jamais été aussi doux.",
    author: "Élise M. · Paris",
  },
  {
    text: "Le sérum a transformé ma routine. Un vrai geste de soin, pas juste un produit.",
    author: "Camille R. · Lyon",
  },
  {
    text: "La composition est irréprochable, l'expérience est celle d'un spa à la maison.",
    author: "Sarah B. · Bordeaux",
  },
];

const Stars = () => (
  <p className="text-sm tracking-[0.35em] text-rose" aria-label="5 étoiles sur 5">
    ★★★★★
  </p>
);

export default function Testimonials() {
  return (
    <section className="py-24 md:py-32">
      <div className="overflow-hidden border-y border-taupe/50 py-5" aria-hidden="true">
        <div className="marquee flex w-max gap-16">
          {[...QUOTES, ...QUOTES].map((q, i) => (
            <span key={i} className="whitespace-nowrap font-serif text-base italic text-copper">
              <span className="mr-4 text-rose">★★★★★</span>
              {q}
            </span>
          ))}
        </div>
      </div>

      <div className="container-luxe mt-20">
        <Reveal className="text-center">
          <p className="kicker">Elles en parlent</p>
          <h2 className="heading mt-3 text-3xl md:text-4xl">Le rituel MANIKA</h2>
        </Reveal>

        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.author} delay={i * 0.12} className="text-center">
              <Stars />
              <blockquote className="mt-5 font-serif text-lg italic leading-relaxed text-copper">
                {r.text}
              </blockquote>
              <p className="mt-5 text-[10px] uppercase tracking-wide2 text-taupe-deep">{r.author}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
