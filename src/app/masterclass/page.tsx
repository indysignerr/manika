import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import LeadForm from "@/components/LeadForm";
import { BORONAT, palmaresPublie } from "@/lib/boronat";
import { PRO } from "@/lib/pro";

export const metadata: Metadata = {
  title: "Masterclass gratuite — MANIKA.LAB",
  description:
    "Masterclass technique gratuite réservée aux professionnels : coloration végétale, technique de blond, kératine. Inscription sur SIRET, en visio ou en présentiel.",
};

/**
 * Prochaines sessions.
 * ⚠️ Tableau vide tant qu'aucune date n'est arrêtée — on n'affiche JAMAIS une
 *    date inventée. Vide → la page invite à s'inscrire pour être prévenu.
 */
const SESSIONS: { date: string; theme: string; format: string; lieu: string }[] = [];

const THEMES = [
  {
    num: "01",
    title: "Coloration végétale",
    text: "Poser une coloration sans ammoniaque sans perdre en couvrance ni en tenue. Les erreurs classiques du passage au végétal.",
  },
  {
    num: "02",
    title: "Technique de blond",
    text: "Éclaircir en préservant la fibre. Gestion des fonds d'éclaircissement, neutralisation, tenue en cabine.",
  },
  {
    num: "03",
    title: "Kératine",
    text: "Reconstruction et lissage : quand la kératine tient ses promesses, et quand elle abîme plus qu'elle ne répare.",
  },
];

export default function Page() {
  const titres = palmaresPublie();

  return (
    <div className="pt-32 md:pt-36">
      {/* Héro */}
      <section className="relative overflow-hidden pb-16">
        <div className="pointer-events-none absolute -left-24 top-24 w-[420px] opacity-[0.06]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-mark.png" alt="" />
        </div>
        <div className="container-luxe">
          <Reveal>
            <p className="kicker">Formation professionnelle · Gratuite</p>
            <h1 className="heading mt-4 max-w-3xl text-4xl leading-[1.1] md:text-6xl">
              La masterclass
              <br />
              de{" "}
              <em className="font-serif normal-case italic tracking-normal text-bronze">
                {BORONAT.name}
              </em>
            </h1>
            {titres.length > 0 && (
              <p className="mt-6 flex flex-wrap gap-x-3 gap-y-2">
                {titres.map((t) => (
                  <span
                    key={t.label}
                    className="rounded-[2px] border border-bronze/40 px-3 py-1.5 text-[10px] uppercase tracking-wide2 text-bronze"
                  >
                    {t.label}
                    {t.annee ? ` · ${t.annee}` : ""}
                  </span>
                ))}
              </p>
            )}
            <p className="mt-8 max-w-xl text-[15px] font-light leading-relaxed text-ink/80">
              Une session technique, gratuite, réservée aux professionnels. Pas une démonstration
              produit : une vraie transmission de geste, avec le temps de poser vos questions.
            </p>
            <a href="#inscription" className="btn-primary mt-9" data-cursor>
              M&apos;inscrire à la prochaine session
            </a>
          </Reveal>
        </div>
      </section>

      {/* Thèmes */}
      <section className="border-y border-taupe/40 bg-ivory-2 py-24">
        <div className="container-luxe">
          <Reveal className="text-center">
            <p className="kicker">Au programme</p>
            <h2 className="heading mt-3 text-3xl md:text-4xl">Trois techniques</h2>
          </Reveal>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {THEMES.map((t, i) => (
              <Reveal key={t.num} delay={i * 0.12}>
                <p className="font-display text-4xl font-extralight text-bronze/50">{t.num}</p>
                <h3 className="heading mt-4 text-xl">{t.title}</h3>
                <p className="mt-4 text-[13px] font-light leading-relaxed text-ink/75">{t.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sessions */}
      <section className="py-24">
        <div className="container-luxe max-w-3xl">
          <Reveal className="text-center">
            <p className="kicker">Prochaines sessions</p>
          </Reveal>

          {SESSIONS.length > 0 ? (
            <ul className="mt-12 divide-y divide-taupe/40 border-y border-taupe/40">
              {SESSIONS.map((s) => (
                <li key={`${s.date}-${s.theme}`} className="grid gap-2 py-6 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8">
                  <p className="text-[11px] uppercase tracking-wide2 text-bronze">{s.date}</p>
                  <p className="text-[14px] font-light text-ink/85">{s.theme}</p>
                  <p className="text-[11px] uppercase tracking-wide2 text-taupe-deep">
                    {s.format} · {s.lieu}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <Reveal>
              <p className="mx-auto mt-10 max-w-md text-center text-[14px] font-light leading-relaxed text-ink/75">
                Le calendrier de la prochaine session est en cours de finalisation. Inscrivez-vous
                ci-dessous : vous serez prévenu en priorité, avant l&apos;ouverture publique des
                places.
              </p>
            </Reveal>
          )}

          <Reveal>
            <div className="mt-14 grid gap-8 border-t border-taupe/40 pt-12 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-wide2 text-copper">En visio</p>
                <p className="mt-2.5 text-[13px] font-light leading-relaxed text-taupe-deep">
                  Session enregistrée : si vous ne pouvez pas être là en direct, le replay vous est
                  envoyé.
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide2 text-copper">En présentiel</p>
                <p className="mt-2.5 text-[13px] font-light leading-relaxed text-taupe-deep">
                  Sessions en salon pour la région Alpes-Maritimes, en petit comité.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Inscription */}
      <section id="inscription" className="scroll-mt-32 bg-ivory-2 py-24">
        <div className="container-luxe grid gap-14 md:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="kicker">Inscription</p>
            <h2 className="heading mt-4 text-3xl leading-[1.15] md:text-[2.4rem]">
              Réservé aux
              <br />
              <em className="font-serif normal-case italic tracking-normal text-bronze">
                professionnels
              </em>
            </h2>
            <p className="mt-7 max-w-sm text-[14px] font-light leading-relaxed text-ink/80">
              Le SIRET est demandé parce que la session est technique et gratuite — elle est
              réservée aux salons, barbershops et écoles de coiffure.
            </p>
            <p className="mt-7 max-w-sm text-[13px] font-light leading-relaxed text-taupe-deep">
              Aucun achat n&apos;est nécessaire pour participer. Le kit de démarrage
              — {PRO.kitReferences} références, invendus repris à {PRO.repriseInvendusJours} jours —
              est présenté en fin de session, sans obligation.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="rounded-[3px] bg-ivory p-8 md:p-10">
              <LeadForm
                variant="masterclass"
                cta="Réserver ma place"
                messageLabel="Ce que vous aimeriez voir traité"
                messagePlaceholder="Une technique précise, une difficulté récurrente en cabine…"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
