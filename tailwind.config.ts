import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: { DEFAULT: "#F5F3EF", "2": "#EFEBE4", "3": "#E8E2D8" },
        copper: { DEFAULT: "#82503C", deep: "#6B4230" },
        rose: { DEFAULT: "#B68D78", hover: "#C89678" },
        bronze: "#8A5F2A",
        // `deep` porte tout le petit texte du site. À #8A7E70 il ne donnait
        // que 3,58:1 sur ivoire. Calé sur le fond le PLUS sombre de la palette
        // (ivory-3) : 4,51:1 dessus, 5,24:1 sur l'ivoire clair.
        // `DEFAULT` reste très clair — réservé aux bordures, jamais au texte.
        taupe: { DEFAULT: "#C8BEB4", deep: "#6D6458" },
        ink: "#4A3428",
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
