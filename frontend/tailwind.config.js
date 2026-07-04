/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050c1f",
          900: "#0a1630",
          800: "#101f42",
          700: "#182a56",
          600: "#22366b",
        },
        emerald: {
          DEFAULT: "#10b981",
          light: "#34d399",
          dark: "#059669",
        },
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px -6px rgba(10, 22, 48, 0.12)",
        soft: "0 2px 12px -2px rgba(10, 22, 48, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
