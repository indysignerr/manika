"use client";

import { FormEvent, useState } from "react";
import Reveal from "@/components/Reveal";

export default function Newsletter() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="bg-copper py-24 text-ivory md:py-28">
      <div className="container-luxe max-w-2xl text-center">
        <Reveal>
          <p className="text-[10px] uppercase tracking-wide3 text-rose-hover">Cercle privé</p>
          <h2 className="heading mt-3 text-3xl !text-ivory md:text-4xl">Recevoir nos rituels</h2>
          <p className="mx-auto mt-5 max-w-md text-[13px] font-light leading-relaxed text-ivory/75">
            Inspirations botaniques, nouveautés confidentielles et rendez-vous saisonniers — une
            fois par mois, rien de plus.
          </p>

          {sent ? (
            <p className="mt-9 font-serif text-lg italic text-ivory">
              Bienvenue dans le cercle. À très vite.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-9">
              <div className="mx-auto flex max-w-md gap-2">
                <label htmlFor="nl-email" className="sr-only">
                  Adresse email
                </label>
                <input
                  id="nl-email"
                  type="email"
                  required
                  placeholder="votre@email.com"
                  className="flex-1 rounded-[2px] border border-ivory/40 bg-transparent px-5 py-3.5 text-sm font-light text-ivory placeholder:text-ivory/50 focus:border-ivory focus:outline-none"
                />
                <button type="submit" className="btn-primary !px-7" data-cursor>
                  S&apos;inscrire
                </button>
              </div>
              <div className="mx-auto mt-5 flex max-w-md items-start justify-center gap-2.5 text-left">
                <input
                  id="nl-consent"
                  type="checkbox"
                  required
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-rose"
                />
                <label htmlFor="nl-consent" className="text-[10px] leading-relaxed text-ivory/70">
                  J&apos;accepte de recevoir les communications MANIKA et j&apos;ai lu la{" "}
                  <a href="/politique-de-confidentialite/" className="underline hover:text-ivory">
                    politique de confidentialité
                  </a>
                  . Désinscription en un clic, à tout moment.
                </label>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
