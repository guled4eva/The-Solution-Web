/**
 * ============================================================
 *  INNSTILLINGER FOR NETTSIDEN
 * ============================================================
 *
 *  Her ligger informasjon som styret typisk endrer: e-post,
 *  sosiale medier, logo og skjema-adresser (Formspree).
 *
 *  Slik redigerer du:
 *   - Skriv teksten mellom anførselstegnene "slik".
 *   - La feltet stå tomt ("") hvis dere ikke har informasjonen ennå.
 *     Nettsiden skjuler da feltet automatisk (eller viser en
 *     tydelig plassholder mens dere utvikler lokalt).
 *   - Ikke fjern kommaene på slutten av linjene.
 *
 *  ALDRI legg passord, API-nøkler eller andre hemmeligheter her.
 *  Alt i denne filen blir synlig for alle som besøker nettsiden.
 * ============================================================
 */

export const siteConfig = {
  // ---- Grunnleggende informasjon ----
  associationName: "The Solution",
  tagline: "Fag. Fellesskap. Fremtid.",
  programme: "Bioteknologi og kjemi",
  university: "OsloMet",
  founded: "12.03.2026",

  // ---- E-post ----
  // Generell e-postadresse for foreningen, f.eks. "post@thesolution.no"
  email: "",
  // E-post til Industriansvarlig (vises under "For bedrifter").
  // Står denne tom, brukes den generelle e-posten over.
  industryEmail: "",

  // ---- Sosiale medier ----
  // Lim inn hele lenken, f.eks. "https://www.instagram.com/brukernavn"
  // Tomme felt vises ikke på nettsiden.
  instagram: "",
  linkedin: "",
  discord: "",

  // ---- Logo ----
  // Legg logofilen i mappen public/images/logo/ og skriv filnavnet her.
  // logo.svg er symbolet (kolbe + DNA) uten tekst, som brukes i menyen, på
  // forsiden og i bunnteksten. logo-full.svg er hele logoen med "THE SOLUTION".
  logo: "/images/logo/logo.svg",

  // ---- Vedtekter ----
  // Bytt ut PDF-en i public/documents/ med samme filnavn, så trenger
  // du ikke endre noe her. Oppdater datoen når vedtektene revideres.
  bylawsFile: "/documents/vedtekter-the-solution.pdf",
  bylawsLastRevised: "12.03.2026",

  // ---- Skjemaer (Formspree) ----
  // Lag et skjema på https://formspree.io og lim inn adressen her.
  // Den ser slik ut: "https://formspree.io/f/abcdwxyz"
  // Se README.md, avsnittet "Aktivere Forslagsboksen".
  formspreeSuggestionEndpoint: "",
  formspreeContactEndpoint: "",

  // ---- Statistikk på forsiden ----
  // Sett showStats til false for å skjule seksjonen.
  // Skriv bare inn tall som faktisk stemmer.
  showStats: true,
  stats: [
    { value: "2026", label: "Stiftet" },
    { value: "5", label: "Styreverv" },
    { value: "Bioteknologi + kjemi", label: "Ett studentmiljø" },
  ],
};
