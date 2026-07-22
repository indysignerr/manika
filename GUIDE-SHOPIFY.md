# Brancher la boutique Shopify (headless)

Le site MANIKA.LAB affiche les produits de Shopify via l'**API Storefront**.
Shopify reste le **backend sécurisé** : produits, stock, paiement, commandes.
Le site n'est que la vitrine.

> 🔒 On n'utilise que le **jeton Storefront PUBLIC**. Jamais la clé Admin secrète,
> jamais un mot de passe. Aucune donnée bancaire ne transite par le site : le
> paiement se fait sur le checkout hébergé Shopify.

---

## 1. Récupérer le jeton Storefront (5 min)

Dans l'**admin Shopify de la boutique** :

1. **Paramètres** (roue crantée, en bas à gauche) → **Applications et canaux de vente**.
2. Cliquer **Développer des applications** (Develop apps). Activer le développement d'apps si demandé.
3. **Créer une application** → nommer-la par ex. `Site MANIKA`.
4. Onglet **Configuration de l'API Storefront** → **Configurer**.
5. Cocher au minimum ces autorisations (scopes) :
   - `unauthenticated_read_product_listings` (lire les produits)
   - `unauthenticated_read_product_inventory` (stock)
   - `unauthenticated_write_checkouts` + `unauthenticated_read_checkouts` (panier/checkout)
6. **Enregistrer** → onglet **Identifiants de l'API** (API credentials).
7. Copier le **Jeton d'accès de l'API Storefront** (Storefront API access token).
   👉 C'est LUI dont on a besoin. (Ne PAS toucher au « jeton Admin ».)

On récupère aussi le **domaine technique** : c'est `xxxxx.myshopify.com`
(visible dans Paramètres → Domaines, ou dans l'URL de l'admin).

---

## 2. Renseigner les deux valeurs

À la racine du projet, créer un fichier **`.env.local`** (copie de `.env.local.example`) :

```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=xxxxx.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=le_jeton_copié
```

Sur **Cloudflare Pages** : Settings → Environment variables → ajouter les deux
mêmes variables (Production + Preview), puis redéployer.

`.env.local` est ignoré par git (jamais commité) — le jeton étant public, ce
n'est pas un secret critique, mais on garde les valeurs hors du dépôt.

---

## 3. Ce qui se passe ensuite (côté code)

- `src/lib/shopify.ts` est le client Storefront. Tant que les variables sont
  vides, `isShopifyConfigured()` = false et le site utilise le **catalogue local**
  (`src/lib/products.ts`). Rien ne casse.
- Une fois les variables remplies, on bascule les pages (`/boutique/[collection]/`,
  `/produit/[slug]/`) pour lire **les produits Shopify** au build, et le panier
  crée un **checkout Shopify** (`redirectToShopifyCheckout`).

### À finaliser au branchement (côté Indysigner)
1. Étendre le type `Product` avec `variantId` par taille (pour les lignes de panier).
2. Renseigner les champs marketing via **metafields Shopify** (tagline, INCI,
   utilisation, type de cheveux, besoin) — ou via les tags.
3. Vérifier que le **handle** de chaque collection Shopify correspond bien aux
   slugs de `src/lib/collections.ts` :
   `barber-coiffage`, `barber-consommables`, `femme-coloration`,
   `femme-soin`, `femme-coiffage`, `femme-consommables`.

---

## 4. Mise à jour automatique (produits ajoutés par la cliente)

Pour que l'ajout d'un produit dans Shopify se reflète tout seul sur le site :

1. Cloudflare Pages → Settings → **Deploy hooks** → créer un hook (copier l'URL).
2. Admin Shopify → **Paramètres → Notifications → Webhooks** → créer un webhook
   `Product creation` **et** `Product update`, format JSON, URL = le deploy hook.

→ À chaque produit ajouté/modifié dans la bonne collection, le site se
reconstruit en ~1-2 min et le produit apparaît sur la page catégorie
correspondante. La cliente ne touche jamais au site.
