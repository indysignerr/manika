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

### Étape 1 — Nom de domaine · ~10 €/an · **Indy + la cliente**

L'authentification e-mail s'attache au domaine : en changer ensuite oblige à
tout refaire. À choisir avant toute création de compte e-mailing.

Une fois acheté : Cloudflare → Add a domain (plan Free) → remplacer les
nameservers chez le registrar → SSL/TLS en **Full** + **Always Use HTTPS** →
Pages → Custom domain, **l'apex et le www** → Redirect Rule www → apex en 301.

### Étape 2 — SPF, DKIM, DMARC · gratuit · **Indy**

Sans eux, la prospection part en indésirables et le domaine se grille — un
domaine grillé ne se répare pas, il se remplace.

Resend affiche les enregistrements exacts à créer au moment où on ajoute le
domaine (étape 3) : **les copier depuis Resend**, ne pas les inventer. Seul le
DMARC est à composer, et il se pose en `_dmarc.<domaine>`, type TXT :

```
v=DMARC1; p=none; rua=mailto:dmarc@<domaine>; pct=100; adkim=s; aspf=s
```

On démarre en `p=none` (observation seule), puis on passe à `p=quarantine`
quand les rapports montrent que tous les envois légitimes passent. `npm run check:outils --
--domaine=<domaine>` relit les trois enregistrements et le
rappelle.

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

### Étape 5 — Vérification du fichier · ~40 € une fois · **Indy**

Les 27 751 contacts n'ont jamais été nettoyés. Une base non vérifiée grille un
domaine en quelques jours : les adresses mortes déclenchent les filtres avant
même que le contenu soit lu. À passer dans un vérificateur (NeverBounce, ZeroBounce)
**avant** le premier envoi, jamais après.

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

**Total outils : environ 150 €/mois, hors budget publicitaire.**

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
