import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuracion de Vite con el plugin de React y el puerto de desarrollo local.
// `strictPort` evita que Vite cambie silenciosamente de puerto si el 5173 esta
// ocupado: en ese caso muestra un error claro en lugar de usar otro puerto, lo
// que evita abrir http://localhost:5173 cuando el servidor quedo en otro puerto.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
  },
});
