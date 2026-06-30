/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Color principal.
        marca: {
          50: "#ecf7f4",
          100: "#cfeae3",
          200: "#a0d6c9",
          300: "#67bdab",
          400: "#34a08c",
          500: "#128574",
          600: "#057262",
          700: "#006d5b",
          800: "#0a564a",
          900: "#0c463d",
          950: "#042a24",
        },
        // Acento.
        acento: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        // Estado positivo.
        exito: {
          50: "#ecfdf5",
          100: "#d1fae5",
          600: "#059669",
          700: "#047857",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Segoe UI"',
          "system-ui",
          "sans-serif",
        ],
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"Segoe UI"',
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
