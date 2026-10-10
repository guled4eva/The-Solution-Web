import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite-konfigurasjon.
 *
 * Nettsiden bruker vanlige adresser uten #, f.eks. /styret og /arrangementer.
 *
 * `base: "/"` betyr at nettsiden ligger i roten av domenet
 * (https://www.thesolutionoslomet.no/). Hvis nettsiden en gang skal ligge i
 * en undermappe, f.eks. https://brukernavn.github.io/repo-navn/, må base
 * endres til "/repo-navn/".
 */
const BASE = "/";

// Pages that get their own HTML copy, so direct links and refresh work on GitHub Pages.
const STATIC_ROUTES = ["styret", "arrangementer", "forslagsboksen", "om-oss", "kontakt", "admin"];

/** Same slug rules as src/lib/events.js. */
function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * GitHub Pages only serves files that exist. After the build, copy index.html to:
 *   - styret.html, kontakt.html, …        → /styret, /kontakt work directly
 *   - arrangementer/<slug>.html            → each event page works directly
 *                                            (one per file in content/arrangementer/)
 *   - 404.html                             → any other address still loads the app,
 *                                            which then shows the right page or "404"
 */
function githubPagesRoutes() {
  let outDir = "dist";
  return {
    name: "github-pages-routes",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const index = join(outDir, "index.html");
      const copyTo = (file) => {
        const target = join(outDir, file);
        mkdirSync(dirname(target), { recursive: true });
        copyFileSync(index, target);
      };
      copyTo("404.html");
      STATIC_ROUTES.forEach((route) => {
        copyTo(`${route}.html`);
        copyTo(`${route}/index.html`);
      });
      const eventsDir = "content/arrangementer";
      const eventFiles = existsSync(eventsDir) ? readdirSync(eventsDir) : [];
      eventFiles
        .filter((file) => file.endsWith(".json"))
        .forEach((file) => {
          const slug = slugify(file.replace(/\.json$/, ""));
          if (slug) copyTo(`arrangementer/${slug}.html`);
        });
    },
  };
}

export default defineConfig({
  base: BASE,
  plugins: [react(), githubPagesRoutes()],
});
