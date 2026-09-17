"use client";

import { FormEvent, useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Reveal from "@/components/Reveal";
import { MAISON, reseauxActifs } from "@/lib/legal";

/**
 * Coordonnées lues depuis src/lib/legal.ts.
 * L'adresse n'est affichée que si elle est renseignée : mieux vaut pas
 * d'adresse qu'une adresse inventée sur une cible professionnelle.
 */
const INFOS = [
  { icon: Mail, label: "Email", value: MAISON.email, href: `mailto:${MAISON.email}` },
  { icon: Phone, label: "Téléphone", value: MAISON.telephone, href: `tel:${MAISON.telephoneLien}` },
  ...(MAISON.adresse ? [{ icon: MapPin, label: "Adresse", value: MAISON.adresse, href: null }] : []),
  { icon: Clock, label: "Réponse", value: `Sous ${MAISON.delaiReponse}`, href: null },
];

const SUBJECTS = [
  "Question sur un produit",
  "Commande & livraison",
  "Compte professionnel",
  "Presse & partenariats",
  "Autre",
];

const inputCls =
  "w-full border-b border-taupe/60 bg-transparent px-0 py-3 text-[14px] font-light text-ink placeholder:text-taupe-deep focus:border-copper focus:outline-none transition-colors";

export default function ContactView() {
  const [etat, setEtat] = useState<"repos" | "envoi" | "fait" | "erreur">("repos");
  const [erreur, setErreur] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [sujet, setSujet] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [optin, setOptin] = useState(false);
  const [piege, setPiege] = useState("");

  /**
   * ⚠️ Jusqu'au 17/09/2026, ce formulaire affichait « Message bien reçu »
   *    SANS RIEN ENVOYER : tous les messages de la page Contact étaient
   *    perdus. Il poste désormais sur /lead, comme les autres formulaires —
   *    alerte Resend aux gérantes + évènement Klaviyo « Message de contact ».
   */
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (etat === "envoi") return;

    // Piège à robots : rempli = on simule un succès sans rien envoyer.
    if (piege) {
      setEtat("fait");
      return;
    }

    setEtat("envoi");
    try {
      const res = await fetch("/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant: "contact",
          contact: nom.trim(),
          email: email.trim(),
          sujet,
          message: message.trim(),
          optinMarketing: optin,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Envoi impossible pour le moment.");
      }
      setEtat("fait");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Envoi impossible pour le moment.");
      setEtat("erreur");
    }
  };

  return (
    <div className="relative overflow-hidden page-top">
      <div className="pointer-events-none absolute -left-24 top-40 w-[420px] opacity-[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-mark.png" alt="" />
      </div>

      <div className="container-luxe grid gap-16 pb-28 md:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="kicker">Contact</p>
          <h1 className="heading mt-4 text-4xl leading-[1.1] md:text-5xl">
            Écrivez-
            <br />
            <em className="font-serif normal-case italic tracking-normal text-bronze">nous</em>
          </h1>
          <p className="mt-7 max-w-sm text-[14px] font-light leading-relaxed text-ink/80">
            Une question sur un produit, une teinte, une commande ou l&apos;ouverture de votre
            compte professionnel ? Écrivez-nous, nous vous répondons personnellement.
          </p>

          <dl className="mt-10 space-y-6">
            {INFOS.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory-2">
                  <Icon size={15} strokeWidth={1.4} className="text-bronze" aria-hidden />
                </span>
                <div>
                  <dt className="text-[9px] uppercase tracking-wide3 text-taupe-deep">{label}</dt>
                  <dd className="mt-1 text-[13px] font-light text-copper">
                    {href ? (
                      <a href={href} className="transition-opacity hover:opacity-60">
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          {/* Un lien mort fait plus de mal que pas de lien : seuls les comptes
              réellement ouverts (src/lib/legal.ts) s'affichent. */}
          {reseauxActifs().length > 0 && (
            <div className="mt-10 flex gap-4 text-[10px] uppercase tracking-wide2 text-copper">
              {reseauxActifs().map((r) => (
                <a
                  key={r.nom}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center transition-opacity hover:opacity-60"
                >
                  {r.nom}
                </a>
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.15}>
          <div className="rounded-[3px] bg-ivory-2 p-8 md:p-10">
            {etat === "fait" ? (
              <div role="status" className="flex min-h-[380px] flex-col items-center justify-center text-center">
                <p className="font-serif text-2xl italic text-copper">Message bien reçu.</p>
                <p className="mt-4 max-w-xs text-[13px] font-light text-ink/75">
                  Nous revenons vers vous sous {MAISON.delaiReponse}.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-7">
                <div className="grid gap-7 md:grid-cols-2">
                  <div>
                    <label htmlFor="ct-name" className="mb-1 block text-[9px] uppercase tracking-wide3 text-copper">
                      Nom *
                    </label>
                    <input id="ct-name" type="text" required autoComplete="name" placeholder="Votre nom" value={nom} onChange={(e) => setNom(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="ct-email" className="mb-1 block text-[9px] uppercase tracking-wide3 text-copper">
                      Email *
                    </label>
                    <input id="ct-email" type="email" required autoComplete="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                  </div>
                </div>

                <div>
                  <label htmlFor="ct-subject" className="mb-1 block text-[9px] uppercase tracking-wide3 text-copper">
                    Sujet
                  </label>
                  <select id="ct-subject" value={sujet} onChange={(e) => setSujet(e.target.value)} className={`${inputCls} cursor-pointer`}>
                    {SUBJECTS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="ct-message" className="mb-1 block text-[9px] uppercase tracking-wide3 text-copper">
                    Message *
                  </label>
                  <textarea
                    id="ct-message"
                    required
                    rows={5}
                    placeholder="Votre question, le nom de votre salon, la référence concernée…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <div className="flex items-start gap-2.5">
                  <input id="ct-consent" type="checkbox" required className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-copper" />
                  <label htmlFor="ct-consent" className="text-[10px] leading-relaxed text-ink/60">
                    J&apos;accepte que mes données soient utilisées pour traiter ma demande,
                    conformément à la{" "}
                    <a href="/politique-de-confidentialite/" className="underline hover:text-copper">
                      politique de confidentialité
                    </a>
                    .
                  </label>
                </div>

                {/* Opt-in MARKETING — séparé, facultatif, décoché par défaut : la
                    case ci-dessus autorise le traitement du message, pas l'envoi
                    d'offres. */}
                <div className="-mt-3 flex items-start gap-2.5">
                  <input
                    id="ct-optin"
                    type="checkbox"
                    checked={optin}
                    onChange={(e) => setOptin(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-copper"
                  />
                  <label htmlFor="ct-optin" className="text-[10px] leading-relaxed text-ink/60">
                    Je souhaite recevoir les nouveautés, les teintes ajoutées au catalogue et les
                    offres réservées aux salons. Facultatif — désinscription en un clic.
                  </label>
                </div>

                {/* Piège à robots — invisible, jamais rempli par un humain */}
                <div aria-hidden className="absolute left-[-9999px]">
                  <label htmlFor="ct-website">Ne pas remplir</label>
                  <input
                    id="ct-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={piege}
                    onChange={(e) => setPiege(e.target.value)}
                  />
                </div>

                {etat === "erreur" && (
                  <p role="alert" className="text-[12px] leading-relaxed text-[#B4442F]">
                    {erreur} Écrivez-nous directement à{" "}
                    <a href={`mailto:${MAISON.email}`} className="underline underline-offset-2">
                      {MAISON.email}
                    </a>{" "}
                    ou appelez le{" "}
                    <a href={`tel:${MAISON.telephoneLien}`} className="underline underline-offset-2">
                      {MAISON.telephone}
                    </a>
                    .
                  </p>
                )}

                <button
                  type="submit"
                  disabled={etat === "envoi"}
                  className="btn-primary w-full disabled:opacity-60"
                  data-cursor
                >
                  {etat === "envoi" ? "Envoi…" : "Envoyer le message"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
