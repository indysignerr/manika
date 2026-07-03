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
        taupe: "#C8BEB4",
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
