import Link from "next/link";

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Boutique",
    links: [
      { label: "Toute la boutique", href: "/boutique/" },
      { label: "Femme · Coloration", href: "/boutique/femme-coloration/" },
      { label: "Femme · Soin", href: "/boutique/femme-soin/" },
      { label: "Femme · Coiffage", href: "/boutique/femme-coiffage/" },
      { label: "Barber · Coiffage", href: "/boutique/barber-coiffage/" },
    ],
  },
  {
    title: "Maison",
    links: [
      { label: "À propos", href: "/a-propos/" },
      { label: "Ingrédients", href: "/ingredients/" },
      { label: "Le protocole", href: "/rituels/" },
      { label: "Nos engagements", href: "/a-propos/" },
      { label: "Contact", href: "/contact/" },
    ],
  },
  {
    title: "Aide",
    links: [
      { label: "Livraison", href: "/contact/" },
      { label: "Retours", href: "/contact/" },
      { label: "Suivi de commande", href: "/contact/" },
      { label: "FAQ", href: "/contact/" },
      { label: "Espace client", href: "/contact/" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-copper-deep text-ivory">
      <div className="container-luxe grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-lg font-light tracking-[0.3em] text-ivory">MANIKA.LAB</p>
          <p className="mt-1 text-[9px] uppercase tracking-wide3 text-rose">Professional Hair Care</p>
          <p className="mt-5 max-w-xs text-[12px] font-light leading-relaxed text-ivory/70">
            Cosmétique capillaire professionnelle : coloration vegan, soins reconstructeurs et
            coiffage de précision. Formulé en Italie, pensé pour les exigeantes.
          </p>
          <div className="mt-6 flex gap-4 text-[10px] uppercase tracking-wide2 text-ivory/70">
            <a href="#" className="transition-colors hover:text-ivory">Instagram</a>
            <a href="#" className="transition-colors hover:text-ivory">Pinterest</a>
            <a href="#" className="transition-colors hover:text-ivory">TikTok</a>
          </div>
        </div>

        {COLS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="mb-5 text-[10px] uppercase tracking-wide3 text-rose">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[12px] font-light text-ivory/80 transition-colors hover:text-ivory"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-ivory/15">
        <div className="container-luxe flex flex-col items-center justify-between gap-4 py-6 text-[10px] tracking-wider text-ivory/60 md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>© 2026 MANIKA.LAB</span>
            <span aria-hidden>·</span>
            <a href="#" className="hover:text-ivory">CGV</a>
            <span aria-hidden>·</span>
            <Link href="/mentions-legales/" className="hover:text-ivory">Mentions légales</Link>
            <span aria-hidden>·</span>
            <Link href="/politique-de-confidentialite/" className="hover:text-ivory">Confidentialité</Link>
          </div>
          <div className="flex items-center gap-2" aria-label="Moyens de paiement acceptés">
            {["VISA", "MC", "AMEX", "PayPal", "Klarna"].map((p) => (
              <span key={p} className="rounded-[2px] bg-ivory px-2 py-0.5 text-[9px] font-medium text-copper">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
