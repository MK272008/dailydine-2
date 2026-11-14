import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f7f1e8",
        "paper-deep": "#eee2d1",
        ink: "#2b211e",
        muted: "#766b64",
        surface: "#fffaf2",
        wine: "#5e1b2b",
        "wine-deep": "#43111e",
        terracotta: "#d57045",
        saffron: "#e7a14b",
        sage: "#6d8066",
        line: "#dfd2c2",
        soft: "#f5e5d8",
      },
      fontFamily: {
        sans: ['"Avenir Next"', "Avenir", '"Segoe UI"', "sans-serif"],
        serif: ["Georgia", '"Times New Roman"', "serif"],
      },
      boxShadow: {
        daily: "0 1.25rem 3rem rgb(74 42 27 / 10%)",
        "daily-soft": "0 0.6rem 1.4rem rgb(74 42 27 / 8%)",
      },
    },
  },
  plugins: [],
};

export default config;
