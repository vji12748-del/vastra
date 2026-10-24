import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite builds the React client into client/dist — Express serves it on port 3000
export default defineConfig({
  root: "client",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
