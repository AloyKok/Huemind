import type { Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{js,jsx,ts,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 25px rgba(168, 85, 247, 0.25)",
        panel: "0px 18px 45px rgba(10, 12, 18, 0.55)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      gridTemplateColumns: {
        sidebar: "280px minmax(0, 1fr)",
      },
    },
  },
} satisfies Config;

export default config;
