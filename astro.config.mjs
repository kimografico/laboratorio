import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// En `astro dev` servimos en la raíz; en build/preview usamos la subruta
// de GitHub Pages (https://kimografico.github.io/laboratorio/).
const isDev = process.argv.includes("dev");

// https://astro.build/config
export default defineConfig({
  site: "https://kimografico.github.io",
  base: isDev ? "/" : "/laboratorio",
  // `dist/` lo usa la build de la librería (tsup); el sitio va a `dist-site/`.
  outDir: "./dist-site",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
