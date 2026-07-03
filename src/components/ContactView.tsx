"use client";

import { FormEvent, useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Reveal from "@/components/Reveal";

const INFOS = [
  { icon: Mail, label: "Email", value: "bonjour@manika.fr" },
  { icon: Phone, label: "Téléphone", value: "+33 4 00 00 00 00" },
  { icon: MapPin, label: "Atelier", value: "Chemin du Moulin, 84000 Provence" },
  { icon: Clock, label: "Réponse", value: "Sous 24 h ouvrées" },
];

const SUBJECTS = ["Conseil personnalisé", "Suivi de commande", "Presse & partenariats", "Visite de l'atelier", "Autre"];

const inputCls =
  "w-full border-b border-taupe/60 bg-transparent px-0 py-3 text-[14px] font-light text-ink placeholder:text-taupe focus:border-copper focus:outline-none transition-colors";

export default function ContactView() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="relative overflow-hidden pt-32 md:pt-36">
      <div className="pointer-events-none absolute -left-24 top-40 w-[420px] opacity-[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/motif.png" alt="" />
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
            Un doute sur le rituel adapté à vos cheveux ? Décrivez-les nous — nature, longueur,
            habitudes — et nous composons votre routine à la main.
          </p>

          <dl className="mt-10 space-y-6">
            {INFOS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory-2">
                  <Icon size={15} strokeWidth={1.4} className="text-bronze" aria-hidden />
                </span>
                <div>
                  <dt className="text-[9px] uppercase tracking-wide3 text-taupe">{label}</dt>
                  <dd className="mt-1 text-[13px] font-light text-copper">{value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex gap-4 text-[10px] uppercase tracking-wide2 text-copper">
            <a href="#" className="transition-opacity hover:opacity-60">Instagram</a>
            <span aria-hidden className="text-taupe">·</span>
            <a href="#" className="transition-opacity hover:opacity-60">Pinterest</a>
            <span aria-hidden className="text-taupe">·</span>
            <a href="#" className="transition-opacity hover:opacity-60">TikTok</a>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="rounded-[3px] bg-ivory-2 p-8 md:p-10">
            {sent ? (
              <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
                <p className="font-serif text-2xl italic text-copper">Message bien reçu.</p>
                <p className="mt-4 max-w-xs text-[13px] font-light text-ink/75">
                  Nous revenons vers vous sous 24 h ouvrées — le temps d&apos;une macération courte.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-7">
                <div className="grid gap-7 md:grid-cols-2">
                  <div>
                    <label htmlFor="ct-name" className="mb-1 block text-[9px] uppercase tracking-wide3 text-copper">
                      Nom *
                    </label>
                    <input id="ct-name" type="text" required placeholder="Votre nom" className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="ct-email" className="mb-1 block text-[9px] uppercase tracking-wide3 text-copper">
                      Email *
                    </label>
                    <input id="ct-email" type="email" required placeholder="votre@email.com" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label htmlFor="ct-subject" className="mb-1 block text-[9px] uppercase tracking-wide3 text-copper">
                    Sujet
                  </label>
                  <select id="ct-subject" className={`${inputCls} cursor-pointer`}>
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
                    placeholder="Décrivez vos cheveux, votre routine actuelle…"
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

                <button type="submit" className="btn-primary w-full" data-cursor>
                  Envoyer le message
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
