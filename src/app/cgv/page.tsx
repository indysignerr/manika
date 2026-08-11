import type { Metadata } from "next";
import Link from "next/link";
import { MAISON, ligneEditeur } from "@/lib/legal";
import { ESSAI, PALIERS, PRO, essaiResume } from "@/lib/pro";

/**
 * Conditions Générales de Vente — ENTRE PROFESSIONNELS.
 *
 * ⚠️ Deux différences majeures avec des CGV grand public, à ne pas « corriger » :
 *    1. Pas de droit de rétractation de 14 jours (art. L221-3 c. conso : il ne
 *       vaut qu'entre professionnels remplissant des conditions strictes).
 *    2. Pas de garantie légale de conformité consommateur ; ce sont les
 *       garanties du code civil (vices cachés, art. 1641) qui s'appliquent.
 *
 * ⚠️ Les montants non arrêtés (franco de port, délais, pénalités) ne sont pas
 *    inventés : ils viennent de src/lib/pro.ts et ne s'affichent que s'ils sont
 *    renseignés. Ce document doit être relu par un juriste avant exploitation
 *    commerciale.
 */

export const metadata: Metadata = {
  title: "Conditions générales de vente — MANIKA.LAB",
  description:
    "Conditions générales de vente entre professionnels : commande, prix HT, conditionnements, paiement, livraison, réserve de propriété et garanties.",
};

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="heading mb-3 text-base">{children}</h2>
);

export default function Page() {
  return (
    <div className="container-luxe max-w-2xl pb-24 pt-36">
      <Link href="/" className="text-[10px] uppercase tracking-wide2 text-rose">
        ← Retour à l&apos;accueil
      </Link>
      <h1 className="heading mt-6 text-3xl">Conditions générales de vente</h1>
      <p className="mt-4 text-[12px] font-light text-taupe-deep">
        Ventes entre professionnels · Dernière mise à jour : août 2026
      </p>

      <div className="mt-10 space-y-8 text-[14px] font-light leading-relaxed text-ink/80">
        <section>
          <H>1. Objet et champ d&apos;application</H>
          <p>
            Les présentes conditions régissent les ventes conclues par {MAISON.nom} ({ligneEditeur()})
            auprès d&apos;acheteurs agissant à des fins professionnelles : salons de coiffure,
            barbershops, écoles de coiffure et professionnels de la beauté titulaires d&apos;un
            numéro SIRET.
          </p>
          <p className="mt-3">
            La vente est <strong className="font-medium">réservée aux professionnels</strong>.
            L&apos;ouverture d&apos;un compte suppose la communication d&apos;un SIRET valide, que
            nous vérifions avant activation. Toute commande vaut acceptation sans réserve des
            présentes conditions, qui prévalent sur les conditions d&apos;achat de l&apos;acheteur.
          </p>
        </section>

        <section>
          <H>2. Produits</H>
          <p>
            Les produits sont destinés à un <strong className="font-medium">usage professionnel</strong>{" "}
            et doivent être appliqués dans le respect des notices, des dosages et des temps de pose
            indiqués. Les colorations d&apos;oxydation nécessitent un test de sensibilité préalable
            sur la cliente, sous la responsabilité du salon.
          </p>
          <p className="mt-3">
            Les visuels et pastilles de teinte affichés sur le site sont indicatifs : le rendu
            dépend de la base naturelle, du fond d&apos;éclaircissement et de l&apos;oxydant utilisé.
            Seul le nuancier physique fait foi.
          </p>
        </section>

        <section>
          <H>3. Conditionnements</H>
          <p>
            Les produits se commandent par conditionnement de{" "}
            <strong className="font-medium">{PALIERS.join(", ")}</strong> unités. Plusieurs
            conditionnements d&apos;une même référence peuvent être commandés ; la vente à
            l&apos;unité n&apos;est pas proposée.
          </p>
        </section>

        <section>
          <H>4. Commandes</H>
          <p>
            Les commandes sont passées depuis le site, après connexion au compte professionnel.
            Elles ne deviennent définitives qu&apos;après confirmation par nos soins et encaissement
            du paiement. Nous nous réservons le droit de refuser toute commande émanant d&apos;un
            acheteur non professionnel, d&apos;un SIRET non vérifiable, ou en cas de litige de
            paiement antérieur.
          </p>
        </section>

        <section>
          <H>5. Prix</H>
          <p>
            Les prix sont indiqués en euros{" "}
            <strong className="font-medium">hors taxes (HT)</strong>, hors frais de port. La TVA au
            taux en vigueur s&apos;ajoute lors du règlement. Les prix applicables sont ceux affichés
            au moment de la validation de la commande. Nous pouvons les modifier à tout moment, sans
            effet sur les commandes déjà confirmées.
          </p>
          {PRO.francoDePortHT !== null && (
            <p className="mt-3">
              Le port est offert à partir de {PRO.francoDePortHT} € HT de commande.
            </p>
          )}
        </section>

        <section>
          <H>6. Offre d&apos;essai</H>
          <p>
            L&apos;offre d&apos;essai — {essaiResume()} — est facturée à prix coûtant.
            {ESSAI.deduitPremiereCommande && (
              <>
                {" "}
                Son montant est <strong className="font-medium">déduit de la première commande</strong>{" "}
                passée par le salon. Cette déduction s&apos;applique une seule fois par
                établissement, identifié par son SIRET.
              </>
            )}
          </p>
        </section>

        <section>
          <H>7. Paiement</H>
          <p>
            Le paiement s&apos;effectue en ligne, à la commande, via la solution de paiement
            sécurisée {MAISON.paiement} (conforme PCI-DSS). Aucune donnée bancaire ne transite ni
            n&apos;est conservée par {MAISON.nom}.
          </p>
          <p className="mt-3">
            Conformément à l&apos;article L441-10 du code de commerce, tout retard de paiement
            entraîne de plein droit des pénalités calculées au taux d&apos;intérêt de la Banque
            centrale européenne majoré de 10 points, ainsi qu&apos;une indemnité forfaitaire pour
            frais de recouvrement de 40 €.
          </p>
        </section>

        <section>
          <H>8. Livraison</H>
          <p>
            Les produits sont livrés à l&apos;adresse indiquée lors de la commande, en France
            métropolitaine.
            {PRO.delaiExpedition !== null
              ? ` Les commandes sont expédiées sous ${PRO.delaiExpedition}.`
              : " Le délai d'expédition est communiqué lors de la confirmation de commande."}{" "}
            Les délais annoncés sont indicatifs ; un retard ne peut donner lieu à annulation, refus
            de marchandise ni indemnité.
          </p>
          <p className="mt-3">
            Il appartient à l&apos;acheteur de vérifier les colis à la livraison et d&apos;émettre,
            le cas échéant, des réserves précises auprès du transporteur, confirmées par lettre
            recommandée dans les trois jours ouvrables (article L133-3 du code de commerce).
          </p>
        </section>

        <section>
          <H>9. Réserve de propriété</H>
          <p>
            Les marchandises demeurent la propriété de {MAISON.nom} jusqu&apos;au paiement intégral
            de leur prix. Les risques de perte et de détérioration sont en revanche transférés à
            l&apos;acheteur dès la remise au transporteur.
          </p>
        </section>

        <section>
          <H>10. Absence de droit de rétractation</H>
          <p>
            Les ventes étant conclues entre professionnels pour les besoins de leur activité, le
            droit de rétractation de quatorze jours prévu à l&apos;article L221-18 du code de la
            consommation <strong className="font-medium">ne s&apos;applique pas</strong>.
          </p>
        </section>

        <section>
          <H>11. Réclamations et garanties</H>
          <p>
            Toute réclamation portant sur un vice apparent ou une non-conformité doit nous être
            adressée par écrit dans les huit jours suivant la réception. Passé ce délai, les
            produits sont réputés conformes et acceptés.
          </p>
          <p className="mt-3">
            L&apos;acheteur bénéficie de la garantie légale des vices cachés (articles 1641 et
            suivants du code civil). Notre garantie se limite au remplacement ou au remboursement
            des produits reconnus défectueux, à l&apos;exclusion de toute autre indemnité. Sont
            exclus les dommages résultant d&apos;un usage non conforme aux notices, d&apos;un mauvais
            dosage, d&apos;un stockage inadapté ou de l&apos;absence de test de sensibilité préalable.
          </p>
        </section>

        <section>
          <H>12. Responsabilité</H>
          <p>
            Notre responsabilité ne saurait excéder le montant de la commande concernée. Nous ne
            répondons pas des dommages indirects, notamment perte d&apos;exploitation, perte de
            clientèle ou atteinte à l&apos;image.
          </p>
        </section>

        <section>
          <H>13. Données personnelles</H>
          <p>
            Les données collectées sont nécessaires au traitement des commandes et à la gestion de
            la relation commerciale. Leur traitement est détaillé dans notre{" "}
            <Link href="/politique-de-confidentialite/" className="underline hover:text-copper">
              politique de confidentialité
            </Link>
            .
          </p>
        </section>

        <section>
          <H>14. Droit applicable et litiges</H>
          <p>
            Les présentes conditions sont soumises au droit français. À défaut de résolution
            amiable, tout litige relève de la compétence exclusive du tribunal de commerce du
            ressort du siège de {MAISON.nom}, y compris en cas de pluralité de défendeurs ou
            d&apos;appel en garantie.
          </p>
        </section>

        <section>
          <H>15. Contact</H>
          <p>
            {MAISON.email} ·{" "}
            <a href={`tel:${MAISON.telephoneLien}`} className="hover:text-copper">
              {MAISON.telephone}
            </a>{" "}
            · réponse sous {MAISON.delaiReponse}.
          </p>
        </section>
      </div>
    </div>
  );
}
