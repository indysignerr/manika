import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/images", { recursive: true });
mkdirSync("public/images/products", { recursive: true });

// ── LOGO MANIKA.LAB ──────────────────────────────────────────────
// Source : fond blanc. On rend le blanc transparent (seuil haut pour
// préserver le noir + le tan), puis on découpe monogramme et wordmark.
const LOGO = "assets/logo-manikalab.png";

async function whiteToAlpha(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    if (min >= 246) data[i + 3] = 0;
    else if (min >= 228) data[i + 3] = Math.round(255 * ((246 - min) / 18));
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

const logoBuf = await whiteToAlpha(LOGO);
const lm = await sharp(logoBuf).metadata();
const W = lm.width, H = lm.height;
const crop = (l, t, w, h) => ({
  left: Math.round(l * W),
  top: Math.round(t * H),
  width: Math.round(w * W),
  height: Math.round(h * H),
});

// Lockup complet (trim OK car le contenu touche les bords)
await sharp(logoBuf).trim().png().toFile("public/images/logo-lockup.png");
console.log("ok: logo-lockup.png");

// Wordmark « MANIKA.LAB » — bande horizontale, SANS trim (évite le crash
// sur une bande vide), padding transparent centré = OK dans le header
await sharp(logoBuf)
  .extract(crop(0.05, 0.595, 0.9, 0.135))
  .png()
  .toFile("public/images/wordmark.png");
console.log("ok: wordmark.png");

// Monogramme M·L (haut), sans trim
await sharp(logoBuf)
  .extract(crop(0.265, 0.17, 0.485, 0.42))
  .png()
  .toFile("public/images/logo-mark.png");
console.log("ok: logo-mark.png");

// Favicon depuis le monogramme
await sharp("public/images/logo-mark.png")
  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile("src/app/icon.png");
console.log("ok: src/app/icon.png");

// ── PHOTOS PRODUITS ──────────────────────────────────────────────
// Fond crème homogène : on échantillonne le coin de chaque image et on
// recadre en 4:5 (contain + padding de la couleur de fond) pour une
// grille de cartes parfaitement uniforme et sans letterbox visible.
const PRODUCTS = [
  ["coloration.jpg", "coloration-bio-vegan"],
  ["oxydante.jpg", "creme-oxydante"],
  ["shampoo.jpg", "shampoing-keratine"],
  ["soin-monoi.jpg", "soin-monoi"],
  ["cire-matifiante.jpg", "cire-matifiante"],
  ["texture-shine.jpg", "texture-shine"],
];

async function sampleBg(src) {
  const { data } = await sharp(src).extract({ left: 3, top: 3, width: 2, height: 2 }).raw().toBuffer({ resolveWithObject: true });
  return { r: data[0], g: data[1], b: data[2] };
}

for (const [file, slug] of PRODUCTS) {
  const src = `assets/products/${file}`;
  const bg = await sampleBg(src);
  await sharp(src)
    .resize(1000, 1250, { fit: "contain", background: bg })
    .flatten({ background: bg })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(`public/images/products/${slug}.jpg`);
  console.log(`ok: products/${slug}.jpg  bg=rgb(${bg.r},${bg.g},${bg.b})`);
}
