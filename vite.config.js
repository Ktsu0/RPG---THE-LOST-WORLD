import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  root: "WebRPG",
  // GitHub Pages serve em https://<user>.github.io/<repo>/ — o base precisa
  // bater com o nome do repo no deploy, e continuar "/" no dev local.
  base: process.env.VITE_BASE ?? "/",
  resolve: {
    alias: {
      "@engine": fileURLToPath(new URL("./engine", import.meta.url)),
      "@audio": fileURLToPath(new URL("./WebRPG/src/audio", import.meta.url)),
    },
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
