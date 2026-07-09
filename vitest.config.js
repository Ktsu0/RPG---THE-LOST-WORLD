import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@engine": fileURLToPath(new URL("./engine", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    include: ["engine/**/*.test.js", "WebRPG/src/**/*.test.js"],
  },
});
