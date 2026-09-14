import sharp from "sharp";

/**
 * Détoure le fond uniforme d'un visuel produit.
 *
 * Remplissage depuis les BORDS, jamais par couleur globale : les emballages
 * portent des zones blanches (étiquettes, capuchons) qu'un simple filtrage
 * par couleur percerait. Seul ce qui touche le bord et reste dans la
 * tolérance est effacé.
 */
export async function detourer(buffer, { tolerance = 26, adoucissement = 1.6 } = {}) {
  const img = sharp(buffer).ensureAlpha();
  const { width: W, height: H } = await img.metadata();
  const data = await img.raw().toBuffer();
  const px = (x, y) => (y * W + x) * 4;

  // Couleur du fond : moyenne des quatre coins.
  let sr = 0, sg = 0, sb = 0, n = 0;
  for (const [x, y] of [[0,0],[W-1,0],[0,H-1],[W-1,H-1]]) {
    const i = px(x, y); sr += data[i]; sg += data[i+1]; sb += data[i+2]; n++;
  }
  const fond = [sr/n, sg/n, sb/n];

  const proche = (i) => {
    const d = Math.hypot(data[i]-fond[0], data[i+1]-fond[1], data[i+2]-fond[2]);
    return d <= tolerance;
  };

  // Parcours en largeur depuis tous les pixels de bord.
  const vu = new Uint8Array(W * H);
  const file = [];
  const pousser = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const k = y * W + x;
    if (vu[k]) return;
    vu[k] = 1;
    if (proche(px(x, y))) file.push(k);
  };
  for (let x = 0; x < W; x++) { pousser(x, 0); pousser(x, H-1); }
  for (let y = 0; y < H; y++) { pousser(0, y); pousser(W-1, y); }

  const masque = new Uint8Array(W * H); // 1 = fond
  while (file.length) {
    const k = file.pop();
    masque[k] = 1;
    const x = k % W, y = (k / W) | 0;
    pousser(x+1, y); pousser(x-1, y); pousser(x, y+1); pousser(x, y-1);
  }

  // Alpha : 0 sur le fond, 255 ailleurs — puis on adoucit le contour pour
  // éviter l'escalier, et on remet à 255 l'opacité globale des pixels gardés.
  const alpha = Buffer.alloc(W * H);
  for (let k = 0; k < W * H; k++) alpha[k] = masque[k] ? 0 : 255;

  // ⚠️ blur() promeut un buffer à 1 canal en 3 canaux : sans toColourspace,
  //    l'indexation lit un octet sur trois et l'image part en rayures.
  const alphaDoux = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } })
    .blur(adoucissement)
    .toColourspace("b-w")
    .raw()
    .toBuffer();

  const sortie = Buffer.alloc(W * H * 4);
  for (let k = 0; k < W * H; k++) {
    sortie[k*4] = data[k*4]; sortie[k*4+1] = data[k*4+1]; sortie[k*4+2] = data[k*4+2];
    sortie[k*4+3] = alphaDoux[k];
  }

  const efface = masque.reduce((a, b) => a + b, 0) / (W * H);
  return {
    png: await sharp(sortie, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer(),
    fond: fond.map(Math.round),
    partEffacee: efface,
    W, H,
  };
}
