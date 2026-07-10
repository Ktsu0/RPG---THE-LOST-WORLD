import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@engine": fileURLToPath(new URL("./engine", import.meta.url)),
      "@audio": fileURLToPath(new URL("./WebRPG/src/audio", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
    include: ["engine/**/*.test.js", "WebRPG/src/**/*.test.js"],
  },
});
