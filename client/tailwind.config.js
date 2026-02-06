/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      display: ['"Clash Display"', "Inter", "sans-serif"],
      body: ["Inter", "sans-serif"],
      mono: ['"Space Mono"', "monospace"],
      sans: ["Inter", "system-ui", "sans-serif"],
    },
    extend: {
      colors: {
        brand: {
          50: "#f4f7ff",
          100: "#e5edff",
          200: "#c5d6ff",
          300: "#9fb9ff",
          400: "#7b95ff",
          500: "#5a6dff",
          600: "#4d57f8",
          700: "#3f44d0",
          800: "#2e3196",
          900: "#1b1f5c",
          950: "#111337",
        },
      },
      boxShadow: {
        glow: "0 25px 55px rgba(15, 23, 42, 0.45)",
      },
      backgroundImage: {
        "grid-pattern":
          "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.15) 1px, transparent 0)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      screens: {
        "3xl": "1680px",
      },
    },
  },
  plugins: [],
}