import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import LeadForm from "@/components/LeadForm";
import { ESSAI, essaiResume, proArguments } from "@/lib/pro";

export const metadata: Metadata = {
  title: "Devenir client pro — MANIKA.LAB",
  description:
    "Ouvrez votre compte professionnel MANIKA.LAB : tarifs HT réservés aux salons, sans minimum de commande. Testez la coloration avec un lot d'échantillons à prix coûtant, déduit de votre première commande.",
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
    title: "Vous testez à prix coûtant",
    text: `${essaiResume()} — vous ne payez que ce que le lot nous coûte.`,
  },
  {
    num: "04",
    title: "Le lot vous est remboursé",
    text: "Le montant de l'essai est déduit de votre première commande. Tester ne vous coûte rien.",
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
              Changer de coloration, c&apos;est prendre un risque sur vos clientes. Alors testez
              d&apos;abord : le lot d&apos;essai est vendu à prix coûtant, et son montant est déduit
              de votre première commande.
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
                « {ESSAI.nbEchantillons} échantillons au choix, un oxydant, à prix coûtant — déduits
                de votre première commande. »
              </p>
              <p className="mt-7 max-w-xl text-[14px] font-light leading-relaxed text-ink/80">
                Vous choisissez les {ESSAI.nbEchantillons} teintes que vous voulez essayer et le
                volume d&apos;oxydant qui va avec ({ESSAI.volumesOxydant.join(", ")}). Posez-les sur
                vos vraies clientes avant de décider quoi que ce soit.
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
              Une question avant de vous lancer ?{" "}
              <Link href="/contact/" className="text-copper underline-offset-2 hover:underline">
                Écrivez-nous
              </Link>{" "}
              — on répond en technicien, pas en commercial.
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
