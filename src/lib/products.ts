export type Variant = "serum" | "jar" | "tall" | "slim";

export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  sizes: { label: string; delta: number }[];
  desc: string;
  usage: string;
  inci: string;
  variant: Variant;
  hair: string[];
  need: string[];
  stock?: number;
};

export const products: Product[] = [
  {
    slug: "elixir-racines",
    name: "Élixir Racines",
    category: "Sérum",
    price: 42,
    sizes: [
      { label: "30 ml", delta: -12 },
      { label: "50 ml", delta: 0 },
      { label: "100 ml", delta: 24 },
    ],
    desc: "Concentré botanique pour racines fatiguées. Romarin de Provence, ortie sauvage et argan bio — densifie et fortifie la fibre en 8 semaines.",
    usage: "Le soir, sur cuir chevelu sec, appliquer 6 gouttes raie par raie. Masser 2 minutes du bout des doigts. Ne se rince pas.",
    inci: "Argania spinosa kernel oil*, Rosmarinus officinalis leaf extract*, Urtica dioica extract*, Tocopherol. *Issu de l'agriculture biologique — 98 % d'origine naturelle.",
    variant: "serum",
    hair: ["Fins", "Secs & abîmés"],
    need: ["Réparation", "Volume"],
    stock: 7,
  },
  {
    slug: "baume-ambre",
    name: "Baume Ambre",
    category: "Masque",
    price: 38,
    sizes: [{ label: "200 ml", delta: 0 }],
    desc: "Masque intensif à la kératine végétale. Répare la fibre altérée par la couleur et la chaleur, sans l'alourdir.",
    usage: "Une à deux fois par semaine, sur cheveux essorés. Poser 10 minutes des mi-longueurs aux pointes, puis rincer à l'eau tiède.",
    inci: "Butyrospermum parkii butter*, Hydrolyzed wheat protein, Ambre extract, Cetearyl alcohol. *Issu de l'agriculture biologique.",
    variant: "jar",
    hair: ["Secs & abîmés", "Colorés"],
    need: ["Réparation", "Hydratation"],
  },
  {
    slug: "rituel-doux",
    name: "Rituel Doux",
    category: "Shampoing",
    price: 28,
    sizes: [{ label: "250 ml", delta: 0 }],
    desc: "Base lavante douce sans sulfates. Nettoie sans décaper, respecte le microbiome du cuir chevelu.",
    usage: "Une noisette sur cheveux mouillés. Masser le cuir chevelu, laisser la mousse glisser sur les longueurs, rincer abondamment.",
    inci: "Aqua, Coco-glucoside, Aloe barbadensis leaf juice*, Chamomilla recutita extract*. *Issu de l'agriculture biologique.",
    variant: "tall",
    hair: ["Tous types"],
    need: ["Hydratation"],
  },
  {
    slug: "huile-precieuse",
    name: "Huile Précieuse",
    category: "Huile",
    price: 52,
    sizes: [{ label: "100 ml", delta: 0 }],
    desc: "Bain d'huiles avant-shampoing. Sept huiles vierges pressées à froid pour restaurer la fibre en profondeur.",
    usage: "Avant le shampoing, imprégner les longueurs et poser 30 minutes — ou toute une nuit pour un rituel profond.",
    inci: "Argania spinosa kernel oil*, Camellia oleifera seed oil*, Sesamum indicum seed oil*, Rosa canina fruit oil*. *Issu de l'agriculture biologique.",
    variant: "slim",
    hair: ["Secs & abîmés", "Bouclés"],
    need: ["Brillance", "Hydratation"],
  },
  {
    slug: "rituel-volume",
    name: "Rituel Volume",
    category: "Shampoing",
    price: 32,
    sizes: [{ label: "250 ml", delta: 0 }],
    desc: "Shampoing volumateur à la protéine de riz. Gaine la fibre fine et crée du corps dès la racine.",
    usage: "Sur cheveux mouillés, masser en mouvements circulaires. Rincer à l'eau fraîche pour resserrer les écailles.",
    inci: "Aqua, Coco-glucoside, Oryza sativa protein, Urtica dioica extract*. *Issu de l'agriculture biologique.",
    variant: "tall",
    hair: ["Fins"],
    need: ["Volume"],
  },
  {
    slug: "rituel-boucles",
    name: "Rituel Boucles",
    category: "Shampoing",
    price: 34,
    sizes: [{ label: "250 ml", delta: 0 }],
    desc: "Nettoyant hydratant pour boucles définies. Lin et guimauve pour un ressort naturel sans frisottis.",
    usage: "Répartir sur cuir chevelu mouillé, froisser les boucles en remontant. Rincer tête en bas.",
    inci: "Aqua, Coco-glucoside, Linum usitatissimum seed extract*, Althaea officinalis root extract*. *Issu de l'agriculture biologique.",
    variant: "tall",
    hair: ["Bouclés"],
    need: ["Hydratation"],
  },
  {
    slug: "brume-eclat",
    name: "Brume Éclat",
    category: "Finition",
    price: 36,
    sizes: [{ label: "100 ml", delta: 0 }],
    desc: "Voile de brillance à l'hydrolat de rose. Fixe la lumière sur la fibre sans effet gras.",
    usage: "En touche finale sur cheveux secs, vaporiser à 20 cm des longueurs. Ne pas rincer.",
    inci: "Rosa damascena flower water*, Glycerin, Camellia oleifera seed oil*. *Issu de l'agriculture biologique.",
    variant: "slim",
    hair: ["Tous types"],
    need: ["Brillance"],
  },
  {
    slug: "creme-de-nuit",
    name: "Crème de Nuit",
    category: "Soin sans rinçage",
    price: 44,
    sizes: [{ label: "150 ml", delta: 0 }],
    desc: "Soin de nuit régénérant. Céramides végétales et beurre de karité pour réparer pendant le sommeil.",
    usage: "Le soir, sur cheveux secs ou humides, appliquer des mi-longueurs aux pointes. Tresser souplement, rincer au matin si besoin.",
    inci: "Butyrospermum parkii butter*, Ceramide NP, Oryza sativa bran oil*, Tocopherol. *Issu de l'agriculture biologique.",
    variant: "jar",
    hair: ["Secs & abîmés", "Colorés"],
    need: ["Réparation"],
  },
];

export const bySlug = (slug: string) => products.find((p) => p.slug === slug);

export const fmt = (n: number) => n.toFixed(2).replace(".", ",") + " €";

export const HAIR_TYPES = ["Tous types", "Fins", "Secs & abîmés", "Bouclés", "Colorés"];
export const NEEDS = ["Hydratation", "Réparation", "Brillance", "Volume"];

export const FREE_SHIPPING = 60;
