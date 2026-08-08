"use client";

import { FormEvent, useState } from "react";
import { formatSiret, validateLead } from "@/lib/lead";
import type { LeadErrors, LeadPayload, LeadVariant } from "@/lib/lead";

const base =
  "w-full border-b bg-transparent px-0 py-3 text-[14px] font-light text-ink placeholder:text-taupe-deep focus:outline-none transition-colors";
const ok = "border-taupe/60 focus:border-copper";
const bad = "border-[#B4442F] focus:border-[#B4442F]";
const labelCls = "mb-1 block text-[9px] uppercase tracking-wide3 text-copper";

const EMPTY: LeadPayload = {
  variant: "pro",
  salon: "",
  siret: "",
  contact: "",
  email: "",
  telephone: "",
  ville: "",
  message: "",
  website: "",
};

type Props = {
  variant: LeadVariant;
  /** Libellé du bouton d'envoi. */
  cta: string;
  /** Intitulé du champ libre. */
  messageLabel: string;
  messagePlaceholder: string;
};

export default function LeadForm({ variant, cta, messageLabel, messagePlaceholder }: Props) {
  const [data, setData] = useState<LeadPayload>({ ...EMPTY, variant });
  const [errors, setErrors] = useState<LeadErrors>({});
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverMsg, setServerMsg] = useState("");

  const set = (k: keyof LeadPayload) => (v: string) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validateLead(data);
    // `noValidate` désactive la vérification navigateur : le consentement doit
    // donc être contrôlé ici, sinon il ne l'est nulle part.
    setConsentError(!consent);
    if (Object.keys(errs).length || !consent) {
      setErrors(errs);
      const first = Object.keys(errs)[0];
      document.getElementById(first ? `lf-${first}` : "lf-consent")?.focus();
      return;
    }
    // Piège à robots : rempli = on simule un succès sans rien envoyer.
    if (data.website) {
      setState("done");
      return;
    }

    setState("sending");
    try {
      const res = await fetch("/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Envoi impossible pour le moment.");
      }
      setState("done");
    } catch (err) {
      setServerMsg(err instanceof Error ? err.message : "Envoi impossible pour le moment.");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div
        className="flex min-h-[420px] flex-col items-center justify-center text-center"
        role="status"
      >
        <p className="font-serif text-2xl italic text-copper">Demande enregistrée.</p>
        <p className="mt-4 max-w-xs text-[13px] font-light leading-relaxed text-ink/75">
          {variant === "masterclass"
            ? "Vous recevrez le lien de connexion et le rappel de session par email."
            : "Nous vérifions votre SIRET et activons votre compte professionnel sous 24 h ouvrées."}
        </p>
      </div>
    );
  }

  const field = (
    k: "salon" | "siret" | "contact" | "email" | "telephone" | "ville",
    label: string,
    type: string,
    placeholder: string,
    extra?: { inputMode?: "numeric" | "tel"; autoComplete?: string }
  ) => (
    <div>
      <label htmlFor={`lf-${k}`} className={labelCls}>
        {label} *
      </label>
      <input
        id={`lf-${k}`}
        type={type}
        value={data[k]}
        required
        placeholder={placeholder}
        inputMode={extra?.inputMode}
        autoComplete={extra?.autoComplete}
        aria-invalid={Boolean(errors[k])}
        aria-describedby={errors[k] ? `lf-${k}-err` : undefined}
        onChange={(e) => set(k)(k === "siret" ? formatSiret(e.target.value) : e.target.value)}
        className={`${base} ${errors[k] ? bad : ok}`}
      />
      {errors[k] && (
        <p id={`lf-${k}-err`} className="mt-1.5 text-[11px] text-[#B4442F]">
          {errors[k]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-7">
      <div className="grid gap-7 md:grid-cols-2">
        {field("salon", "Nom du salon", "text", "Votre enseigne", { autoComplete: "organization" })}
        {field("siret", "SIRET", "text", "123 456 789 00012", { inputMode: "numeric" })}
        {field("contact", "Votre nom", "text", "Prénom et nom", { autoComplete: "name" })}
        {field("ville", "Ville", "text", "Vence", { autoComplete: "address-level2" })}
        {field("email", "Email professionnel", "email", "contact@votresalon.fr", {
          autoComplete: "email",
        })}
        {field("telephone", "Téléphone", "tel", "06 12 34 56 78", { autoComplete: "tel" })}
      </div>

      <div>
        <label htmlFor="lf-message" className={labelCls}>
          {messageLabel}
        </label>
        <textarea
          id="lf-message"
          rows={4}
          value={data.message}
          placeholder={messagePlaceholder}
          onChange={(e) => set("message")(e.target.value)}
          className={`${base} ${ok} resize-none`}
        />
      </div>

      {/* Piège anti-robot — invisible et hors du parcours clavier. */}
      <div aria-hidden="true" className="absolute h-px w-px overflow-hidden opacity-0">
        <label htmlFor="lf-website">Ne pas remplir</label>
        <input
          id="lf-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={data.website}
          onChange={(e) => set("website")(e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-start gap-2.5">
          <input
            id="lf-consent"
            type="checkbox"
            checked={consent}
            aria-invalid={consentError}
            aria-describedby={consentError ? "lf-consent-err" : undefined}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (e.target.checked) setConsentError(false);
            }}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-copper"
          />
          <label htmlFor="lf-consent" className="text-[10px] leading-relaxed text-ink/60">
            J&apos;accepte que ces informations soient utilisées pour traiter ma demande
            professionnelle, conformément à la{" "}
            <a href="/politique-de-confidentialite/" className="underline hover:text-copper">
              politique de confidentialité
            </a>
            .
          </label>
        </div>
        {consentError && (
          <p id="lf-consent-err" className="mt-1.5 text-[11px] text-[#B4442F]">
            Votre accord est nécessaire pour que nous puissions traiter la demande.
          </p>
        )}
      </div>

      {state === "error" && (
        <p role="alert" className="text-[12px] leading-relaxed text-[#B4442F]">
          {serverMsg} Passez par{" "}
          <a href="/contact/" className="underline underline-offset-2">
            le formulaire de contact
          </a>{" "}
          — nous traiterons votre demande manuellement.
        </p>
      )}

      <button type="submit" disabled={state === "sending"} className="btn-primary w-full disabled:opacity-60" data-cursor>
        {state === "sending" ? "Envoi…" : cta}
      </button>
    </form>
  );
}
