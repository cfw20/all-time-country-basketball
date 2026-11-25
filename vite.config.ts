import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const pagesBase = "/all-time-country-basketball/";

function spaFallback(): Plugin {
  let outDir = "dist";
  return {
    name: "github-pages-spa-fallback",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      copyFileSync(resolve(outDir, "index.html"), resolve(outDir, "404.html"));
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? pagesBase : "/",
  plugins: [react(), spaFallback()],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
}));
