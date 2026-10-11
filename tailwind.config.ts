import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: "rgb(var(--vault-rgb) / <alpha-value>)",
        "vault-2": "rgb(var(--vault-2-rgb) / <alpha-value>)",
        obsidian: "rgb(var(--obsidian-rgb) / <alpha-value>)",
        "obsidian-hi": "rgb(var(--obsidian-hi-rgb) / <alpha-value>)",
        steel: "rgb(var(--steel-rgb) / <alpha-value>)",
        "steel-dim": "rgb(var(--steel-dim-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        amber: "rgb(var(--amber-rgb) / <alpha-value>)",
        "amber-bright": "rgb(var(--amber-bright-rgb) / <alpha-value>)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        wash: "var(--wash)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};

export default config;
