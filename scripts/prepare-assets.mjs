import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/images", { recursive: true });

// Détourage du fond blanc : min(R,G,B) >= 205 -> alpha 0, fade 175-205 pour l'anti-aliasing,
// puis trim des marges transparentes (sinon le logo garde tout le canvas d'origine)
async function transparent(src, out, width, crop) {
  let img = sharp(src).ensureAlpha();
  if (crop) {
    const meta = await sharp(src).metadata();
    img = img.extract({
      left: Math.round(meta.width * crop.left),
      top: Math.round(meta.height * crop.top),
      width: Math.round(meta.width * crop.width),
      height: Math.round(meta.height * crop.height),
    });
  }
  if (width) img = img.resize({ width });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    if (min >= 205) data[i + 3] = 0;
    else if (min >= 175) data[i + 3] = Math.round(255 * ((205 - min) / 30));
  }
  const buf = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
  await sharp(buf).trim().png().toFile(out);
  console.log("ok:", out);
}

await transparent("assets/favicon.jpg", "public/images/motif.png", 1000, {
  left: 0.34,
  top: 0.16,
  width: 0.33,
  height: 0.68,
});
await transparent("assets/wordmark.jpg", "public/images/wordmark.png", 1400);
await transparent("assets/logo-full.jpg", "public/images/logo-full.png", 1400);

await sharp("public/images/motif.png")
  .trim()
  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile("src/app/icon.png");
console.log("ok: src/app/icon.png");
