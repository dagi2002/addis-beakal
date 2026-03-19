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
        mist: "#f3f4f6",
        midnight: "#141b2d",
        slateblue: "#2f374f",
        cream: "#fcf7e8"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(23, 23, 23, 0.08)",
        glow: "0 10px 25px rgba(245, 158, 11, 0.28)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(216, 110, 57, 0.22), transparent 32%), radial-gradient(circle at bottom right, rgba(31, 109, 95, 0.18), transparent 28%)",
        "hero-photo":
          "linear-gradient(180deg, rgba(20, 27, 45, 0.58), rgba(20, 27, 45, 0.76)), url('https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=80')"
      }
    }
  },
  plugins: []
};

export default config;
