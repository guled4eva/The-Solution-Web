import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite-konfigurasjon.
 *
 * `base: "./"` betyr at alle filer lastes med relative stier.
 * Sammen med HashRouter (adresser som /#/styret) fungerer nettsiden da
 * uansett hvor den ligger:
 *   - https://brukernavn.github.io/the-solution/     (prosjektside)
 *   - https://brukernavn.github.io/                  (brukerside)
 *   - https://eget-domene.no/                        (eget domene)
 *
 * Du trenger altså IKKE endre noe her hvis repoet får et nytt navn.
 *
 * Hvis dere senere bytter til BrowserRouter (adresser uten #), må `base`
 * settes til repo-navnet, f.eks. base: "/the-solution/". Se README.md.
 */
export default defineConfig({
  base: "./",
  plugins: [react()],
});
