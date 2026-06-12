import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Central ocean palette used by the timeline, cards, and controls.
        ocean: {
          background: "#EAF8FF",
          timeline: "#7CCBFF",
          card: "#FFFFFF",
          text: "#345066",
          heart: "#FF5C8A",
          foam: "#F7FCFF",
          deep: "#1F6E91",
          seaGlass: "#A8E6E1",
          sand: "#FFE6B7",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        handwriting: [
          "Bradley Hand",
          "Segoe Print",
          "Comic Sans MS",
          "ui-rounded",
          "cursive",
        ],
        kaushan: ["Kaushan Script", "cursive"],
      },
      boxShadow: {
        // Soft shadows keep cards feeling like floating scrapbook paper.
        polaroid: "0 18px 38px rgba(31, 110, 145, 0.14)",
        memory: "0 20px 60px rgba(31, 110, 145, 0.16)",
        soft: "0 12px 32px rgba(52, 80, 102, 0.12)",
      },
      backgroundImage: {
        "rope-current":
          "linear-gradient(180deg, rgba(124,203,255,0.5), rgba(168,230,225,0.9), rgba(124,203,255,0.45))",
      },
    },
  },
  plugins: [],
};

export default config;
