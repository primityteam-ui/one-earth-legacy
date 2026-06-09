/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        royalBlack: "#0A0A0A",
        royalPanel: "#111111",
        royalCard: "#1A1A1A",
        gold: "#D4AF37",
        goldLight: "#F5D76E",
        crimson: "#8B0000",
        crimsonLight: "#C0392B",
        textPrimary: "#F5F5F0",
        textSecondary: "#A0A0A0",
        borderRoyal: "#2A2A2A"
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        subheading: ["Cormorant Garamond", "serif"],
        body: ["Inter", "sans-serif"],
        numbers: ["Space Grotesk", "sans-serif"]
      },
      boxShadow: {
        gold: "0 0 35px rgba(212, 175, 55, 0.22)"
      }
    }
  },
  plugins: []
};