/**
 * ============================================================
 *  INNSTILLINGER FOR NETTSIDEN
 * ============================================================
 *  Innholdet redigeres enklest på https://www.thesolutionoslomet.no/loggin
 *  (under «Innstillinger»), eller direkte i filen:
 *
 *      content/innstillinger/nettside.json
 *
 *  Denne filen leser bare inn innholdet og fyller inn standardverdier
 *  hvis noe mangler. Du trenger vanligvis ikke endre den.
 *
 *  ALDRI legg passord, API-nøkler eller andre hemmeligheter i nettsiden.
 *  Alt i nettsiden blir synlig for alle som besøker den.
 * ============================================================
 */
import data from "../../content/innstillinger/nettside.json";

const defaults = {
  associationName: "The Solution",
  tagline: "Fag. Fellesskap. Fremtid.",
  programme: "Bioteknologi og kjemi",
  university: "OsloMet",
  founded: "12.03.2026",
  email: "",
  industryEmail: "",
  instagram: "",
  linkedin: "",
  discord: "",
  logo: "/images/logo/logo.svg",
  bylawsFile: "/documents/vedtekter-the-solution.pdf",
  bylawsLastRevised: "12.03.2026",
  formspreeSuggestionEndpoint: "",
  formspreeContactEndpoint: "",
  showStats: true,
  stats: [],
};

// Empty values in the JSON fall back to the defaults above.
const cleaned = Object.fromEntries(
  Object.entries(data || {}).filter(([, v]) => v !== null && v !== undefined)
);

export const siteConfig = { ...defaults, ...cleaned };
