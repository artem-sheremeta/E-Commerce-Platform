import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "./", // ДОДАНО: це важливо для nginx
  plugins: [react()],
});
