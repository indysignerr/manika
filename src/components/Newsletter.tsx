"use client";

import { FormEvent, useState } from "react";
import Reveal from "@/components/Reveal";

/**
 * Inscription à la liste de diffusion.
 *
 * ⚠️ Ce formulaire N'ENVOYAIT RIEN : il affichait « Bienvenue dans le cercle »
 *    sans jamais appeler le serveur — toutes les inscriptions étaient perdues.
 *    Il poste désormais sur /lead, comme les autres formulaires, et ne
 *    remercie qu'en cas de succès réel.
 *
 * La case à cocher est un consentement MARKETING explicite : c'est elle qui
 * autorise l'abonnement Klaviyo (`optinMarketing`).
 */
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [etat, setEtat] = useState<"repos" | "envoi" | "fait" | "erreur">("repos");
  const [message, setMessage] = useState("");
  const [piege, setPiege] = useState("");

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
          variant: "newsletter",
          email: email.trim(),
          optinMarketing: consent,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Inscription impossible pour le moment.");
      }
      setEtat("fait");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Inscription impossible pour le moment.");
      setEtat("erreur");
    }
  };

  return (
    <section className="bg-copper py-24 text-ivory md:py-28">
      <div className="container-luxe max-w-2xl text-center">
        <Reveal>
          <p className="text-[10px] uppercase tracking-wide3 text-ivory/85">Cercle privé</p>
          <h2 className="heading mt-3 text-3xl !text-ivory md:text-4xl">Recevoir nos rituels</h2>
          <p className="mx-auto mt-5 max-w-md text-[13px] font-light leading-relaxed text-ivory/85">
            Conseils de coiffage, nouvelles teintes et offres réservées — une fois par mois, rien
            de plus.
          </p>

          {etat === "fait" ? (
            <p role="status" className="mt-9 font-serif text-lg italic text-ivory">
              Bienvenue dans le cercle. À très vite.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-9">
              <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row sm:gap-2">
                <label htmlFor="nl-email" className="sr-only">
                  Adresse email
                </label>
                <input
                  id="nl-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="flex-1 rounded-[2px] border border-ivory/40 bg-transparent px-5 py-3.5 text-sm font-light text-ivory placeholder:text-ivory/85 focus:border-ivory focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={etat === "envoi"}
                  className="btn-clair !px-7 disabled:opacity-60"
                  data-cursor
                >
                  {etat === "envoi" ? "Envoi…" : "S'inscrire"}
                </button>
              </div>

              {/* Piège à robots — invisible, jamais rempli par un humain */}
              <div aria-hidden className="absolute left-[-9999px]">
                <label htmlFor="nl-website">Ne pas remplir</label>
                <input
                  id="nl-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={piege}
                  onChange={(e) => setPiege(e.target.value)}
                />
              </div>

              <div className="mx-auto mt-5 flex max-w-md items-start justify-center gap-2.5 text-left">
                <input
                  id="nl-consent"
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-rose"
                />
                <label htmlFor="nl-consent" className="text-[10px] leading-relaxed text-ivory/85">
                  J&apos;accepte de recevoir les communications MANIKA.LAB et j&apos;ai lu la{" "}
                  <a href="/politique-de-confidentialite/" className="underline hover:text-ivory">
                    politique de confidentialité
                  </a>
                  . Désinscription en un clic, à tout moment.
                </label>
              </div>

              {etat === "erreur" && (
                <p role="alert" className="mx-auto mt-4 max-w-md text-[12px] text-ivory">
                  {message}
                </p>
              )}
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
