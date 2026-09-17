# Les outils MANIKA.LAB — état, ordre de branchement, mode d'emploi

Document opérationnel. Il complète la synthèse de projet : celle-ci dit **quoi**
et **pourquoi**, celui-ci dit **comment** et **qui agit**.

Pour connaître l'état réel à l'instant T, sans lire ce fichier :

```bash
npm run check:outils
```

Le script interroge chaque service et dit lequel manque. Tout est en lecture
seule — le test du formulaire passe par le champ piège anti-robot, donc aucun
lead n'est créé et aucun e-mail n'est envoyé.

---

## 1. En place, rien à faire

| Outil | Rôle | Coût |
|---|---|---|
| Shopify | Catalogue, prix, stock, paiement, comptes clients | abonnement en cours |
| Cloudflare Pages | Hébergement + Function de réception des formulaires | gratuit |
| GitHub | Code, et déclencheur de déploiement automatique | gratuit |

Le site est **headless** : Shopify reste le back-office, le site n'en est que la
vitrine. Aucune donnée bancaire ne transite par le site, le paiement se fait sur
le checkout hébergé Shopify.

---

## 2. À activer côté Shopify

### 2.1 Créer les définitions de métafields (dix minutes, une seule fois)

Admin Shopify → Paramètres → Métachamps → Produits → « Ajouter une définition ».
Namespace **`manika`**, type **Texte sur une ligne** pour les onze :

| Clé | Contenu | Rempli par |
|---|---|---|
| `marque` | Tassel, Eurostil, Neuthrosun… | script |
| `univers` | l'un des 5 univers | script |
| `type` | Coloration, Oxydant, Pinceaux… | script |
| `format` | 250 ml, 1 L, 100 unités | script |
| `volume_oxydant` | 10 / 20 / 30 / 40 Vol | script |
| `ammoniaque` | Avec / Sans | script |
| `jetable` | Jetable / Réutilisable | script |
| `reflets` | Cendré, Cuivré, Doré… | script |
| `hauteurs_ton` | 1 à 12 | script |
| `besoin` | à définir avec les gérantes | **à la main** |
| `gamme` | à définir avec les gérantes | **à la main** |

⚠️ Cocher **« Accès Storefront »** sur chaque définition. Sans cette case, le
champ existe dans l'admin mais reste invisible au site, qui lit la boutique par
l'API Storefront — les filtres resteraient vides sans aucun message d'erreur.

C'est le prérequis de toute la nouvelle arborescence : menu, pages de marque,
pages d'univers et filtres se construisent sur ces onze champs.

### 2.2 Importer le CSV

```bash
npm run metafields      # régénère scripts/out/metafields-manika.csv
```

Puis Admin Shopify → Produits → Importer. Le fichier remplit 97 % des champs
structurants. Il ne demande **aucun jeton Admin** : le jeton en place est un
jeton Storefront, en lecture seule.

### 2.3 Ce qu'on n'achète pas

L'application **Search & Discovery** est inutile ici : le site étant headless,
les filtres sont construits directement à partir des métafields. Un abonnement
économisé. L'application **B2B** (~50 €/mois) ne se justifie que si la boutique
n'est pas en formule Plus — à vérifier avant de la souscrire.

### 2.4 Relancer les gérantes sur les données

```bash
npm run audit:shopify   # écrit scripts/out/audit-shopify.md, envoyable tel quel
```

Le rapport liste les produits sans prix, les indisponibles, ceux sans image, les
fautes de saisie et les doublons de collections. Il se régénère à la demande :
on relance sur une liste à jour, pas sur un souvenir.

> Au 13 septembre 2026 : 226 produits, dont **22 réellement vendables**
> (prix renseigné *et* disponible). C'est le vrai chiffre à suivre.

---

## 3. À brancher, dans cet ordre

L'ordre n'est pas négociable : chaque étape débloque la suivante.

### Étape 1 — Nom de domaine · ✅ acheté · **Indy**

Le domaine est **`manikalab.com`, sans tiret**. Il est enregistré chez **IONOS**,
qui en héberge aussi le DNS et les boîtes mail (`contact@manikalab.com`).
État relevé le 16 sept. 2026 :

| Enregistrement | Valeur actuelle |
|---|---|
| NS | `ns10xx.ui-dns.*` (IONOS) |
| MX | `mx00.ionos.fr`, `mx01.ionos.fr` |
| A | `217.160.0.207` — hébergement IONOS, **pas** le site |
| SPF | `v=spf1 include:_spf-eu.ionos.com ~all` |
| DMARC | CNAME `_dmarc` → `dmarc.ionos.fr` (`v=DMARC1; p=none;`) |
| Autodiscover | CNAME `autodiscover` → `adsredir.ionos.info` (configuration auto des boîtes) |
| www | **aucun enregistrement** |

> `manika-lab.com` (avec tiret) n'a jamais été enregistré. Le site l'a affiché
> jusqu'au 16 sept. : tout courrier écrit à cette adresse revenait en erreur.

Reste à faire pointer le domaine sur Cloudflare Pages. Deux voies :

- **Passer le DNS chez Cloudflare** (recommandé : redirection www → apex,
  SSL, tout au même endroit). ⚠️ **Avant** de changer les nameservers chez
  IONOS, vérifier que Cloudflare a bien importé les **MX, le SPF et le DMARC**
  ci-dessus, ainsi que l'autodiscover, tous en « DNS only » (nuage gris). Un seul oublié, et les boîtes `@manikalab.com` cessent de recevoir
  du courrier.
- **Garder le DNS chez IONOS** : possible pour `www` (CNAME vers
  `manika-bkh.pages.dev`), mais IONOS n'accepte pas de CNAME sur le domaine
  nu — l'apex resterait sur l'hébergement IONOS.

Puis : Pages → Custom domain, **l'apex et le www** → redirection www → apex en 301.

### Étape 2 — SPF, DKIM, DMARC · gratuit · **Indy**

Sans eux, la prospection part en indésirables et le domaine se grille — un
domaine grillé ne se répare pas, il se remplace.

SPF et DMARC existent déjà (posés par IONOS). **Il manque le DKIM** des outils
d'envoi, et Resend comme Klaviyo le fournissent au moment où on ajoute le
domaine : **copier leurs valeurs, ne pas les inventer**.

⚠️ **Un seul enregistrement SPF par nom.** Resend et Klaviyo envoient depuis un
sous-domaine qui porte son propre SPF : on ne touche pas à celui de l'apex. Si
un outil demandait un jour d'ajouter un `include:` à l'apex, il faut le fusionner
dans la ligne existante, jamais créer une seconde ligne `v=spf1` — deux lignes
invalident les deux.

Le DMARC est en `p=none` (observation seule) : le laisser ainsi pendant les
premiers envois, puis passer à `p=quarantine` quand les rapports montrent que
tous les envois légitimes passent. `npm run check:outils --
--domaine=manikalab.com` relit les trois enregistrements.

### Étape 3 — Resend · gratuit au volume qui nous concerne · **Indy**

Sans clé, `functions/lead.js` répond **503** et le formulaire de compte pro
affiche « service indisponible ». C'est volontaire : mieux vaut un formulaire
qui refuse qu'un formulaire qui dit « merci » en jetant le lead.

À poser dans Cloudflare Pages → Settings → Environment variables (Production
**et** Preview), puis **redéployer** — les Functions ne captent les secrets
qu'au déploiement suivant :

| Variable | Valeur |
|---|---|
| `RESEND_API_KEY` | clé Resend (chiffrée) |
| `LEAD_TO_EMAIL` | destinataires, séparés par des virgules |
| `LEAD_FROM_EMAIL` | `MANIKA.LAB <contact@…>` — domaine **vérifié** dans Resend |

### Étape 4 — Klaviyo · gratuit puis ~45 €/mois · **Indy**

Le flux de réassort à J+45 est ce qui transforme un acheteur en client
récurrent. Variables : `KLAVIYO_API_KEY` (clé **privée**) et `KLAVIYO_LIST_ID`.

Scopes à cocher à la création de la clé (vérifiés dans la doc API le
14/09/2026) : `profiles:read`, `profiles:write`, `lists:read`, `lists:write`,
`events:write`, `subscriptions:write`.

| Scope | À quoi il sert ici |
|---|---|
| `profiles:write` | créer / mettre à jour le profil d'un salon |
| `profiles:read` | retrouver un profil par email (script de synchronisation) |
| `events:write` | enregistrer les évènements — **ce qui déclenche les scénarios** |
| `subscriptions:write` + `lists:write` | abonner à la liste (les DEUX sont exigés par le job) |
| `lists:read` | lire les listes et leurs ID (diagnostic) |

Lien avec les scopes pré-cochés :
`https://www.klaviyo.com/create-private-api-key?scopes=profiles:read,profiles:write,lists:read,lists:write,events:write,subscriptions:write`

⚠️ **Prendre « Custom », pas « Full ».** La clé vit dans une variable
d'environnement Cloudflare utilisée par un point d'entrée public : avec un
accès complet, une fuite permettrait d'envoyer une campagne à toute la liste.

⚠️ Les scopes **ne sont pas modifiables après création** — une clé incomplète
se supprime et se recrée.

Trois points vérifiés le 12 septembre 2026 :

- **Aucune région de données européenne n'existe.** Hébergement aux États-Unis,
  conformité par le Data Privacy Framework et clauses contractuelles types →
  **signer le DPA**. (L'artefact budget d'août affirme le contraire : il a tort.)
- Révision d'API à jour : **`2026-07-15`** — valeur utilisée par
  `functions/lead.js`, et par `scripts/check-outils.mts` qui doit rester alignée.
- L'oubli d'un scope d'abonnement provoque un **403 silencieux** : le profil et
  l'évènement partent, seul l'abonnement échoue. D'où `scripts/test-klaviyo.mts`,
  qui teste chaque étape à part et nomme le scope fautif.

#### Ce que le site envoie à Klaviyo

Branché le 13 septembre 2026 (`functions/lead.js`). Trois écritures, dans cet
ordre :

1. **Le profil** (`POST /api/profiles/`, puis `PATCH` sur 409 en récupérant
   `duplicate_profile_id`). Propriétés retenues, toutes B2B :
   `origine`, `statut_compte`, `optin_marketing`, `siret`, `telephone`,
   `ville`. Le téléphone est normalisé en E.164 (`06 12 34 56 78` →
   `+33612345678`) : Klaviyo rejette tout le profil sinon.
2. **L'évènement** (`POST /api/events/`) — « Demande de compte pro »,
   « Message de contact » ou « Inscription newsletter ». **C'est lui qui arme
   les scénarios** : un profil seul ne déclenche rien.
3. **L'abonnement à la liste** — *uniquement* si la personne a coché l'opt-in
   marketing.

> ⚠️ **Deux consentements distincts.** La case obligatoire des formulaires
> autorise le *traitement de la demande*. L'abonnement à la liste de diffusion
> dépend d'une **seconde case, facultative et décochée par défaut**
> (`optinMarketing`). Un salon qui demande l'ouverture d'un compte n'a pas
> demandé à recevoir des offres — les confondre serait de la prospection non
> consentie. Ne pas « simplifier » en réunissant les deux cases.

#### Segmentation prévue

`statut_compte` vaut `prospect` (newsletter, contact), `demande` (compte pro
soumis) ou `valide`. Le passage à `valide` **ne peut pas venir du site** : la
validation est un geste manuel des gérantes dans Shopify (étiquette
`pro-valide`). C'est le rôle de :

```bash
source .env.local && npx tsx scripts/sync-klaviyo-pro.mts        # simulation
source .env.local && npx tsx scripts/sync-klaviyo-pro.mts --reel # applique
```

Il met `statut_compte` à jour et déclenche « Compte pro validé » — l'évènement
sur lequel brancher le scénario de bienvenue. À relancer après chaque vague de
validations (ou en tâche planifiée une fois le domaine en place).

#### Mise en service

```bash
source .env.local && npx tsx scripts/test-klaviyo.mts votre@email.com
```

Le script exerce chaque étape séparément et **nomme le scope manquant** en cas
de 403. Ajouter `--abonner` pour tester aussi l'inscription à la liste (avec
une adresse à soi). Tant qu'aucune clé n'est posée, les formulaires répondent
503 avec un message explicite — ils n'affichent jamais un faux « merci ».

### Étape 5 — Vérification du fichier · MillionVerifier, 89 $ une fois · **Indy**

Les 27 751 contacts n'ont jamais été nettoyés. Une base non vérifiée grille un
domaine en quelques jours : les adresses mortes déclenchent les filtres avant
même que le contenu soit lu. À passer dans un vérificateur **avant** le premier
envoi, jamais après.

Outil retenu le 16 sept. 2026 : **MillionVerifier** — société en Hongrie (UE),
crédits sans date d'expiration, adresses non vérifiables remboursées.
Pack **50 000 crédits à 89 $** : il couvre ce fichier et laisse ~22 000 crédits
pour les fichiers NAYUMA à venir. Pour mémoire, trois packs de 10 000 coûteraient
111 $.

Écartés : Captain Verify (124 $, France), EmailListVerify (98 $, localisation
non indiquée), Reoon (42 $, mais ni pays ni serveurs indiqués, aucune garantie
de transfert hors UE — injustifiable pour un fichier dont l'origine est déjà
en question), vérification intégrée à lemlist (~1 400 $).

Avant le premier téléversement : récupérer le **DPA** de MillionVerifier pour le
registre RGPD. Si NAYUMA est une société distincte, elle est responsable de ses
propres fichiers : son registre doit mentionner le même sous-traitant.

⚠️ Point juridique non tranché, signalé en août et toujours ouvert : d'où vient
ce fichier, est-il un actif de la société liquidée, quelle base légale RGPD pour
la prospection ? À faire valider par le conseil de la cliente avant tout envoi —
la vérification technique ne règle pas cette question.

### Étape 6 — lemlist · ~75 €/mois tout compris · **Indy**

Prospection sur le fichier nettoyé. N'a de sens qu'une fois les étapes 1 à 5
faites : envoyer depuis un domaine sans authentification, c'est brûler le
domaine et le fichier en même temps.

### Étape 7 — Meta Business Suite · gratuit (média à part) · **Indy**

Publications d'abord, puis Lead Ads et retargeting une fois le pixel posé —
donc après le bandeau de consentement, pas avant.

### Étape 8 — ManyChat · gratuit · **Indy**

Réponses automatiques en messages privés. À brancher seulement quand il y a du
volume : automatiser trois messages par semaine ne rapporte rien.

### Complément — Higgsfield Plus · 59 $/mois, puis 47 $ en annuel · **Indy**

Génération d'images et de vidéos pour **un post tous les 3 jours** (le même
contenu vertical 9:16 sur Instagram, Facebook et TikTok) **et les vidéos
publicitaires**. Compte existant (plan gratuit).

Dimensionnement (barèmes relevés le 16 sept. 2026) : ~20 clips utiles par mois
(10 posts + ~10 variantes pub), trois essais par clip en moyenne → ~60
générations.

| Modèle | Crédits par clip de 8 s | Besoin mensuel |
|---|---:|---:|
| Kling 3.0 | ~14 | ~880 |
| Veo 3.1 Fast (720p) | ~40 | ~2 440 |
| Posts Kling + pubs Veo 3.1 Fast | — | ~1 660 |
| Seedance 2.5 (720p) | ~52 | ~3 160 |
| Seedance 2.0 (1080p) | ~72 | ~4 360 |

Seedance au crédit coûte 4 à 5 fois Kling : hors de portée de Plus. Il existe
un module **« Seedance Unlimited »** (Seedance 2.0 Fast, 480/720p, 30 jours,
application web uniquement, une génération à la fois), vendu **en option
payante** — prix à lire dans l'application. Usage prévu : produire en lot
plusieurs mois de posts pendant la fenêtre illimitée. Les conditions le
réservent à un usage « personnel et humain » : vérifier l'usage commercial
avant de s'en servir pour des publicités.

**Plus (1 200 crédits)** couvre la production sur Kling 3.0, avec les
versions finales des pubs sur Veo. Starter (270 crédits) ne tient pas une
semaine ; Ultra (3 000 crédits, 99 à 129 $) absorberait toute la marge du
budget outils. Les crédits ne se reportent pas d'un mois sur l'autre, et les
recharges expirent au bout de 90 jours.

Règles d'usage pour tenir dans l'enveloppe :
- brouillons sur Kling, Veo réservé aux versions diffusées ;
- générer depuis l'**application web** : certains modèles y sont illimités sur
  Plus, alors que la ligne de commande consomme toujours des crédits ;
- un tuto filmé en vrai ne coûte aucun crédit : chacun remplace un clip généré ;
- premier mois en mensuel pour mesurer la consommation réelle, puis annuel.

⚠️ **Jamais pour montrer un résultat de coloration** : une teinte générée n'est
pas la vraie teinte du produit — c'est une publicité trompeuse, et les
coiffeurs le voient. Le cœur des publicités reste les tutos filmés en vrai,
mains uniquement. Les emballages générés se déforment aussi : les vérifier
avant diffusion. Tout visage ou corps réaliste généré doit être signalé comme
contenu synthétique (règlement européen sur l'IA, label « Info IA » de Meta).

---

## Budget outils : 250 €/mois

| Poste | Coût mensuel |
|---|---:|
| Domaine (IONOS) | ~1 € |
| Resend, Meta Business Suite, ManyChat | 0 € |
| Klaviyo | 0 € puis ~45 € |
| lemlist | ~75 € |
| Higgsfield Plus | ~50 € (≈ 40 € en annuel) |
| **Engagé** | **~170 €** |
| Marge | ~80 € |

Achat unique le premier mois : MillionVerifier, 89 $ (~80 €).

Sur les 1 300 € mensuels libérés par l'ancien local, cette enveloppe laisse
+250 € les mois 1 et 2, puis −50 € à partir du mois 3 (outils 250 € +
prestation 800 € + publicité 300 €). Décision du 16 sept. 2026 : l'écart est
couvert par les premières ventes, attendues d'ici là.

---

## 4. Ce que je ne peux pas faire à ta place

Ces actions engagent un compte, un paiement ou une identité : elles se font
depuis ton navigateur, pas depuis une session Claude Code.

- Acheter le domaine et payer les abonnements.
- Créer les comptes Resend, Klaviyo, lemlist, Meta, ManyChat.
- Saisir les enregistrements DNS chez le registrar / dans Cloudflare.
- Coller les secrets dans Cloudflare Pages.
- Créer les définitions de métafields dans l'admin Shopify.

Ce que le dépôt fait, lui : `npm run check:outils` dit à tout moment où en est
la chaîne, `npm run audit:shopify` produit la relance des gérantes, et
`npm run metafields` régénère le CSV d'import.
