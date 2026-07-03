# MANIKA — Hair Cosmetics

Site e-commerce premium pour MANIKA, marque de cosmétiques capillaires naturels.
Next.js 14 (App Router, static export) · Tailwind CSS · GSAP ScrollTrigger · Lenis · Framer Motion.

## Démarrer

```bash
npm install
npm run prepare-assets   # détoure les logos (assets/ -> public/images/)
npm run dev              # http://localhost:1104
```

## Structure

- `src/app/` — pages (accueil, boutique, produit/[slug], pages légales)
- `src/components/` — sections et briques UI (héro, rituels, panier, curseur…)
- `src/lib/products.ts` — catalogue produits (source de vérité)
- `assets/` — fichiers de marque source (JPG)
- `scripts/prepare-assets.mjs` — détourage fond blanc + favicon via sharp

## Expériences signature

- Préloader compteur + révélation du wordmark
- Héro : parallaxe souris multi-couches, particules d'or, curseur custom, split-text
- Section ingrédients épinglée (pin + scrub)
- Rituels en scroll horizontal
- Page produit : flacon 360° piloté au scroll, bouton magnétique, barre d'achat sticky
- Panier tiroir avec jauge livraison offerte

`prefers-reduced-motion` est respecté sur toutes les animations.

## Déploiement

Static export (`output: "export"`) → Cloudflare Pages.
Build command : `npm run build` · Output : `out` · `NODE_VERSION=20`.
