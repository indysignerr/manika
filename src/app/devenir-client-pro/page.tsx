import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import LeadForm from "@/components/LeadForm";
import { PRO, proArguments } from "@/lib/pro";
import { BORONAT } from "@/lib/boronat";

export const metadata: Metadata = {
  title: "Devenir client pro — MANIKA.LAB",
  description:
    "Ouvrez votre compte professionnel MANIKA.LAB : tarifs HT réservés aux salons, kit de démarrage de 6 références, invendus repris à 90 jours. Sans minimum de commande.",
};

const ETAPES = [
  {
    num: "01",
    title: "Vous déposez votre SIRET",
    text: "Le formulaire ci-dessous suffit. Aucun engagement, aucune carte bancaire.",
  },
  {
    num: "02",
    title: "Nous validons sous 24 h",
    text: "Vérification du SIRET, puis activation de votre compte et des tarifs professionnels HT.",
  },
  {
    num: "03",
    title: "Vous recevez le kit de démarrage",
    text: `${PRO.kitReferences} références, un présentoir, des testeurs et l'argumentaire d'une page pour votre équipe.`,
  },
  {
    num: "04",
    title: "Vous ne gardez que ce qui tourne",
    text: `Les invendus sont repris à ${PRO.repriseInvendusJours} jours. Le risque de stock est pour nous, pas pour vous.`,
  },
];

export default function Page() {
  const args = proArguments();

  return (
    <div className="pt-32 md:pt-36">
      {/* Héro */}
      <section className="relative overflow-hidden pb-16">
        <div className="pointer-events-none absolute -right-20 -top-24 w-[440px] opacity-[0.06]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-mark.png" alt="" />
        </div>
        <div className="container-luxe">
          <Reveal>
            <p className="kicker">Compte professionnel</p>
            <h1 className="heading mt-4 max-w-3xl text-4xl leading-[1.1] md:text-6xl">
              Référencer la gamme
              <br />
              sans <em className="font-serif normal-case italic tracking-normal text-bronze">risque</em>
            </h1>
            <p className="mt-8 max-w-xl text-[15px] font-light leading-relaxed text-ink/80">
              Ajouter une marque sur votre étagère de revente ne demande aucun changement de
              pratique et rapporte immédiatement de la marge. Nous supprimons la seule vraie
              objection : l&apos;invendu.
            </p>
          </Reveal>
        </div>
      </section>

      {/* L'offre */}
      <section className="pb-20">
        <div className="container-luxe">
          <Reveal>
            <div className="rounded-[3px] border border-bronze/40 bg-ivory-2 p-8 md:p-12">
              <p className="kicker">L&apos;offre de lancement</p>
              <p className="mt-5 max-w-2xl font-serif text-2xl italic leading-relaxed text-copper md:text-[1.9rem]">
                « Kit de démarrage sans risque : {PRO.kitReferences} références, invendus repris à{" "}
                {PRO.repriseInvendusJours} jours. »
              </p>
              <p className="mt-7 max-w-xl text-[14px] font-light leading-relaxed text-ink/80">
                Un salon ne vend pas ce qu&apos;il ne sait pas expliquer. Le kit arrive donc avec un
                présentoir, des testeurs et un argumentaire d&apos;une page pour l&apos;équipe.
              </p>
              <a href="#formulaire" className="btn-primary mt-9" data-cursor>
                Ouvrir mon compte pro
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Conditions */}
      <section className="border-y border-taupe/40 bg-ivory-2 py-16">
        <div className="container-luxe">
          <Reveal>
            <p className="kicker text-center">Vos conditions</p>
          </Reveal>
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {args.map((a, i) => (
              <Reveal key={a.label} delay={i * 0.07}>
                <p className="text-[11px] uppercase tracking-wide2 text-copper">{a.label}</p>
                <p className="mt-2.5 text-[12px] font-light leading-relaxed text-taupe-deep">
                  {a.detail}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Étapes */}
      <section className="py-24">
        <div className="container-luxe">
          <Reveal className="text-center">
            <p className="kicker">Comment ça marche</p>
            <h2 className="heading mt-3 text-3xl md:text-4xl">Quatre étapes</h2>
          </Reveal>
          <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {ETAPES.map((e, i) => (
              <Reveal key={e.num} delay={i * 0.1}>
                <p className="font-display text-4xl font-extralight text-bronze/50">{e.num}</p>
                <h3 className="heading mt-4 text-base leading-snug">{e.title}</h3>
                <p className="mt-3 text-[13px] font-light leading-relaxed text-ink/75">{e.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Formulaire */}
      <section id="formulaire" className="scroll-mt-32 pb-28">
        <div className="container-luxe grid gap-14 md:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="kicker">Ouvrir un compte</p>
            <h2 className="heading mt-4 text-3xl leading-[1.15] md:text-[2.4rem]">
              Votre SIRET,
              <br />
              et c&apos;est <em className="font-serif normal-case italic tracking-normal text-bronze">parti</em>
            </h2>
            <p className="mt-7 max-w-sm text-[14px] font-light leading-relaxed text-ink/80">
              Réservé aux salons de coiffure, barbershops et écoles. Validation sous 24 h ouvrées.
            </p>
            <p className="mt-8 max-w-sm text-[13px] font-light leading-relaxed text-taupe-deep">
              Une question avant de vous lancer ? Assistez d&apos;abord à{" "}
              <Link href="/masterclass/" className="text-copper underline-offset-2 hover:underline">
                la masterclass de {BORONAT.name}
              </Link>{" "}
              — elle est gratuite et sans engagement.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="rounded-[3px] bg-ivory-2 p-8 md:p-10">
              <LeadForm
                variant="pro"
                cta="Ouvrir mon compte professionnel"
                messageLabel="Votre salon en deux mots"
                messagePlaceholder="Nombre de postes, gamme actuelle, ce que vous cherchez à changer…"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
