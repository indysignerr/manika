export type Product = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  price: number;
  sizes: { label: string; delta: number }[];
  desc: string;
  usage: string;
  inci: string;
  image: string;
  hair: string[];
  need: string[];
  badge?: string;
};

export const products: Product[] = [
  {
    slug: "shampoing-keratine",
    name: "Shampoing Kératine",
    tagline: "Ricostruzione",
    category: "Soin lavant",
    price: 24.9,
    sizes: [
      { label: "250 ml", delta: -6 },
      { label: "1 L", delta: 0 },
    ],
    desc: "Shampoing reconstructeur à la kératine et à l'acide hyaluronique. Répare la fibre en profondeur, redonne force et brillance aux cheveux abîmés ou colorés. Sans SLES, sans colorants, sans allergènes.",
    usage: "Émulsionner une noisette sur cheveux mouillés, masser le cuir chevelu, laisser agir une minute puis rincer. Renouveler si nécessaire.",
    inci: "Aqua, Coco-Glucoside, Hydrolyzed Keratin, Sodium Hyaluronate, Panthenol. SLES / colorants / allergènes free. Made in Italy.",
    image: "/images/products/shampoing-keratine.jpg",
    hair: ["Abîmés", "Secs", "Colorés"],
    need: ["Réparation"],
    badge: "Best-seller",
  },
  {
    slug: "coloration-bio-vegan",
    name: "Coloration Bio-Vegan",
    tagline: "Luxury Hair Plex",
    category: "Coloration",
    price: 12.9,
    sizes: [{ label: "100 ml", delta: 0 }],
    desc: "Coloration crème enrichie en actifs de soin — jojoba, thé vert, aloe vera et acide hyaluronique. Couverture parfaite des cheveux blancs, éclat durable, fibre préservée grâce au complexe Hair Plex. Sans ammoniaque.",
    usage: "Mélanger avec la Crème Oxydante MANIKA.LAB (1:1,5). Appliquer sur cheveux secs non lavés, laisser poser 35 min, émulsionner puis rincer.",
    inci: "Simmondsia Chinensis (jojoba), Camellia Sinensis (thé vert), Aloe Barbadensis, Sodium Hyaluronate. Vegan, sans ammoniaque.",
    image: "/images/products/coloration-bio-vegan.jpg",
    hair: ["Colorés", "Tous types"],
    need: ["Coloration"],
    badge: "Nouveauté",
  },
  {
    slug: "soin-monoi",
    name: "Soin Hydratant Monoï",
    tagline: "Corps & Cheveux",
    category: "Sans rinçage",
    price: 16.9,
    sizes: [{ label: "200 ml", delta: 0 }],
    desc: "Soin multi-usage corps & cheveux au monoï de Tahiti. Kératine et huile d'argan pour nourrir et discipliner, filtre UV pour protéger la couleur. Fini soyeux, sans rinçage.",
    usage: "Vaporiser ou appliquer sur cheveux et peau, des mi-longueurs aux pointes. Sans rinçage. Idéal en soin quotidien et après-soleil.",
    inci: "Cocos Nucifera Oil (Monoï), Argania Spinosa Kernel Oil, Hydrolyzed Keratin, Ethylhexyl Methoxycinnamate (UV).",
    image: "/images/products/soin-monoi.jpg",
    hair: ["Secs", "Tous types"],
    need: ["Hydratation", "Brillance"],
  },
  {
    slug: "texture-shine",
    name: "Texture Shine",
    tagline: "Fixation légère",
    category: "Coiffage",
    price: 16.9,
    sizes: [{ label: "100 ml", delta: 0 }],
    desc: "Pâte de coiffage brillance à fixation légère. Sépare, texturise et illumine la matière sans rigidité ni effet carton. Le fini glossy des coiffages de défilé.",
    usage: "Prélever une noisette, chauffer entre les paumes, travailler mèche par mèche sur cheveux secs ou humides.",
    inci: "Aqua, VP/VA Copolymer, Glycerin, Argania Spinosa Kernel Oil, Parfum.",
    image: "/images/products/texture-shine.jpg",
    hair: ["Tous types"],
    need: ["Coiffage", "Brillance"],
  },
  {
    slug: "cire-matifiante",
    name: "Cire Matifiante",
    tagline: "Effet naturel",
    category: "Coiffage",
    price: 16.9,
    sizes: [{ label: "100 ml", delta: 0 }],
    desc: "Cire de coiffage à finition mate. Texture, définition et tenue souple longue durée, sans effet gras. Pour un coiffé-décoiffé maîtrisé et un rendu 100 % naturel.",
    usage: "Chauffer une petite quantité entre les paumes, appliquer sur cheveux secs et sculpter la coiffure du bout des doigts.",
    inci: "Cera Alba, Kaolin, Ricinus Communis Seed Oil, Tocopherol.",
    image: "/images/products/cire-matifiante.jpg",
    hair: ["Tous types"],
    need: ["Coiffage"],
  },
  {
    slug: "creme-oxydante",
    name: "Crème Oxydante",
    tagline: "Révélateur",
    category: "Coloration",
    price: 14.9,
    sizes: [
      { label: "10 Vol · 3 %", delta: 0 },
      { label: "20 Vol · 6 %", delta: 0 },
      { label: "30 Vol · 9 %", delta: 0 },
      { label: "40 Vol · 12 %", delta: 0 },
    ],
    desc: "Crème oxydante professionnelle à la texture onctueuse et stable. Révèle la couleur de façon uniforme, sans coulure, et respecte la fibre pendant le temps de pose.",
    usage: "À mélanger avec la Coloration Bio-Vegan MANIKA.LAB. Choisir le volume selon le niveau d'éclaircissement souhaité. Usage professionnel.",
    inci: "Aqua, Hydrogen Peroxide, Cetearyl Alcohol, Glycerin. Flacon 1 L — usage professionnel.",
    image: "/images/products/creme-oxydante.jpg",
    hair: ["Colorés"],
    need: ["Coloration"],
  },
];

export const bySlug = (slug: string) => products.find((p) => p.slug === slug);

export const fmt = (n: number) => n.toFixed(2).replace(".", ",") + " €";

export const HAIR_TYPES = ["Tous types", "Colorés", "Abîmés", "Secs"];
export const NEEDS = ["Coloration", "Réparation", "Hydratation", "Coiffage", "Brillance"];

export const FREE_SHIPPING = 60;
