/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Azul teal (verde azulado) institucional: color principal de AutoFacil.
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
        // Acento calido para detalles y llamados puntuales.
        acento: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        // Verde de estado positivo / disponible.
        exito: {
          50: "#ecfdf5",
          100: "#d1fae5",
          600: "#059669",
          700: "#047857",
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "Segoe UI", "system-ui", "sans-serif"],
        display: ['"Fraunces"', "Georgia", "serif"],
      },
      boxShadow: {
        suave: "0 1px 2px rgba(2, 42, 36, 0.06)",
        tarjeta: "0 1px 3px rgba(2, 42, 36, 0.08), 0 1px 2px rgba(2, 42, 36, 0.04)",
        realce: "0 12px 30px -12px rgba(0, 109, 91, 0.25)",
      },
    },
  },
  plugins: [],
};
