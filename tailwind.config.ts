import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        sand: "#f7f1e8",
        clay: "#d86e39",
        moss: "#1f6d5f",
        gold: "#d4a947",
        mist: "#f3f4f6"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(23, 23, 23, 0.08)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(216, 110, 57, 0.22), transparent 32%), radial-gradient(circle at bottom right, rgba(31, 109, 95, 0.18), transparent 28%)"
      }
    }
  },
  plugins: []
};

export default config;
