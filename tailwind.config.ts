import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: { DEFAULT: "#F5F3EF", "2": "#EFEBE4", "3": "#E8E2D8" },
        copper: { DEFAULT: "#82503C", deep: "#6B4230" },
        rose: { DEFAULT: "#B68D78", hover: "#C89678" },
        bronze: "#7A5424",
        // `deep` porte tout le petit texte du site. À #8A7E70 il ne donnait
        // que 3,58:1 sur ivoire, à #6D6458 tout juste 4,51:1 sur ivory-3.
        // Assombri à #5C5349 : 5,85:1 sur ivory-3, 6,8:1 sur l'ivoire clair.
        // `DEFAULT` reste très clair — réservé aux bordures, jamais au texte.
        taupe: { DEFAULT: "#C8BEB4", deep: "#5C5349" },
        // Texte courant assombri le 17/09/2026 à la demande d'Indy
        // (#4A3428 → #3A2A1F) : 12,4:1 sur ivoire au lieu de 10,5:1.
        ink: "#3A2A1F",
      },
      fontFamily: {
        display: ["var(--font-jost)", "sans-serif"],
        serif: ["var(--font-marcellus)", "serif"],
      },
      letterSpacing: {
        luxe: "0.15em",
        wide2: "0.22em",
        wide3: "0.32em",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
