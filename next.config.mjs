/** @type {import('next').NextConfig} */
const nextConfig = {
  // `npm run build:check` écrit dans .next-build au lieu de .next, ce qui évite
  // d'invalider le cache du serveur de dev à chaque vérification.
  //
  // ⚠️ Cela ne rend PAS les deux processus concurrents : Next partage d'autres
  //    états, et un build lancé pendant que `npm run dev` tourne finit quand
  //    même par casser le dev (« Cannot find module ./vendor-chunks/… »).
  //    Règle : arrêter le serveur de dev avant de builder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
