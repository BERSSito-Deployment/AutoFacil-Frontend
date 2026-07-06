import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/AutoFacil-Frontend/" : "/",
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
  },
}));
