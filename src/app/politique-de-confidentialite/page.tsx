import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Politique de confidentialité — MANIKA" };

export default function Page() {
  return (
    <div className="container-luxe max-w-2xl pb-24 pt-36">
      <Link href="/" className="text-[10px] uppercase tracking-wide2 text-rose">
        ← Retour à l&apos;accueil
      </Link>
      <h1 className="heading mt-6 text-3xl">Politique de confidentialité</h1>
      <div className="mt-10 space-y-8 text-[14px] font-light leading-relaxed text-ink/80">
        <section>
          <h2 className="heading mb-3 text-base">Données collectées</h2>
          <p>
            Nous collectons uniquement les données nécessaires au traitement de vos commandes et,
            avec votre consentement explicite, à l&apos;envoi de notre newsletter mensuelle.
          </p>
        </section>
        <section>
          <h2 className="heading mb-3 text-base">Vos droits (RGPD)</h2>
          <p>
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, de
            suppression et de portabilité de vos données. Écrivez-nous à privacy@manika.fr — réponse
            sous 30 jours. Vous pouvez également saisir la CNIL (cnil.fr).
          </p>
        </section>
        <section>
          <h2 className="heading mb-3 text-base">Cookies</h2>
          <p>
            Ce site n&apos;utilise aucun cookie publicitaire tiers. Seuls des cookies techniques
            strictement nécessaires au fonctionnement du panier sont déposés.
          </p>
        </section>
        <section>
          <h2 className="heading mb-3 text-base">Conservation</h2>
          <p>
            Les données de commande sont conservées 3 ans après le dernier achat ; les données
            newsletter jusqu&apos;à votre désinscription, effective en un clic.
          </p>
        </section>
      </div>
    </div>
  );
}
