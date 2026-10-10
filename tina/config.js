/**
 * TinaCMS – redigeringspanelet på https://www.thesolutionoslomet.no/loggin
 *
 * Denne filen bestemmer hvilke skjemaer som vises i panelet.
 * Innholdet ligger i mappen content/ og lagres i GitHub når noen trykker «Save».
 *
 * Nøklene TINA_PUBLIC_CLIENT_ID og TINA_TOKEN ligger som «secrets» i GitHub
 * (Settings → Secrets and variables → Actions), ALDRI i koden. Se README.md.
 */
import { defineConfig } from "tinacms";

const CATEGORIES = ["Sosialt", "Faglig", "Bedrift", "Generalforsamling", "Annet"];

/** Same slug rules as the website (æ→ae, ø→o, å→a). */
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

const textarea = { component: "textarea" };
const singleton = { allowedActions: { create: false, delete: false } };

export default defineConfig({
  branch: process.env.GITHUB_BRANCH || process.env.GITHUB_REF_NAME || "main",
  clientId: process.env.TINA_PUBLIC_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  build: {
    outputFolder: "loggin",
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "images",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
      // ---------------- ARRANGEMENTER ----------------
      {
        name: "arrangement",
        label: "Arrangementer",
        path: "content/arrangementer",
        format: "json",
        ui: {
          filename: {
            readonly: false,
            slugify: (values) => slugify(values?.title),
            description: "Blir adressen til arrangementet, f.eks. julebord-2026",
          },
        },
        fields: [
          { type: "string", name: "title", label: "Tittel", isTitle: true, required: true },
          {
            type: "datetime",
            name: "date",
            label: "Dato",
            required: true,
            ui: { dateFormat: "DD.MM.YYYY", timeFormat: false },
          },
          { type: "string", name: "time", label: "Klokkeslett", description: "F.eks. 18:00 eller 16:15–18:00" },
          { type: "string", name: "location", label: "Sted" },
          { type: "string", name: "category", label: "Kategori", options: CATEGORIES, required: true },
          {
            type: "string",
            name: "description",
            label: "Kort beskrivelse",
            description: "1–2 setninger som vises på kortet",
            ui: textarea,
          },
          {
            type: "string",
            name: "fullDescription",
            label: "Full beskrivelse",
            description: "Vises på arrangementssiden. Lag nytt avsnitt med en tom linje.",
            ui: textarea,
          },
          {
            type: "image",
            name: "image",
            label: "Bilde",
            description: "Liggende bilde, helst ca. 1200 × 675 piksler. Tomt = grafisk plassholder.",
            uploadDir: () => "arrangementer",
          },
          {
            type: "boolean",
            name: "registrationOnSite",
            label: "Påmelding på nettsiden",
            description: "Viser et påmeldingsskjema (navn og e-post) på arrangementssiden. Påmeldingene kommer på e-post.",
          },
          {
            type: "boolean",
            name: "registrationAskNotes",
            label: "Spør om mat og allergier",
            description: "Halal, vegansk, nøtteallergi og annet. Fint når det blir mat. Gjelder bare påmelding på nettsiden.",
          },
          {
            type: "string",
            name: "registrationLink",
            label: "Ekstern påmeldingslenke",
            description: "Bare hvis påmeldingen skjer et annet sted (f.eks. Google Skjema). Tomt = ingen lenke.",
          },
          {
            type: "datetime",
            name: "registrationDeadline",
            label: "Påmeldingsfrist",
            ui: { dateFormat: "DD.MM.YYYY", timeFormat: "HH:mm" },
          },
          {
            type: "boolean",
            name: "placeholder",
            label: "Eksempel",
            description: "Viser et «Eksempel»-merke. Slå av for ekte arrangementer.",
          },
        ],
      },

      // ---------------- STYRET ----------------
      {
        name: "styret",
        label: "Styret",
        path: "content/styret",
        format: "json",
        match: { include: "styret" },
        ui: singleton,
        fields: [
          {
            type: "object",
            list: true,
            name: "members",
            label: "Styremedlemmer",
            description: "Rekkefølgen her er rekkefølgen på nettsiden.",
            ui: {
              itemProps: (item) => ({ label: `${item?.role || "Verv"} – ${item?.name || "navn mangler"}` }),
            },
            fields: [
              { type: "string", name: "role", label: "Verv", required: true },
              { type: "string", name: "name", label: "Navn" },
              {
                type: "image",
                name: "image",
                label: "Bilde",
                description: "Kvadratisk bilde, ca. 600 × 600 piksler. Tomt = nøytral plassholder.",
                uploadDir: () => "styret",
              },
              { type: "string", name: "description", label: "Kort beskrivelse", ui: textarea },
              { type: "string", name: "responsibilities", label: "Ansvarsområder", list: true },
              { type: "string", name: "email", label: "E-post" },
              { type: "string", name: "linkedin", label: "LinkedIn-lenke" },
              {
                type: "boolean",
                name: "placeholder",
                label: "Eksempel",
                description: "Viser et «Eksempel»-merke. Slå av når ekte informasjon er lagt inn.",
              },
            ],
          },
        ],
      },

      // ---------------- TEKSTER ----------------
      {
        name: "tekster",
        label: "Tekster",
        path: "content/tekster",
        format: "json",
        match: { include: "tekster" },
        ui: singleton,
        fields: [
          { type: "string", name: "heroLead", label: "Forsiden – introtekst øverst", ui: textarea },
          {
            type: "string",
            name: "introText",
            label: "Forsiden – «Mer enn bare forelesninger»",
            description: "Lag nytt avsnitt med en tom linje.",
            ui: textarea,
          },
          { type: "string", name: "boardIntro", label: "Styret – introtekst", ui: textarea },
          { type: "string", name: "aboutLead", label: "Om oss – uthevet første setning" },
          {
            type: "string",
            name: "aboutText",
            label: "Om oss – «Hvem er vi?»",
            description: "Lag nytt avsnitt med en tom linje.",
            ui: textarea,
          },
          { type: "string", name: "industryText", label: "Kontakt oss – «For bedrifter»", ui: textarea },
        ],
      },

      // ---------------- HISTORIE ----------------
      {
        name: "historie",
        label: "Historie",
        path: "content/historie",
        format: "json",
        match: { include: "historie" },
        ui: singleton,
        fields: [
          {
            type: "object",
            list: true,
            name: "milestones",
            label: "Milepæler",
            description: "Sorteres automatisk etter dato. Legg bare inn ting som faktisk har skjedd.",
            ui: { itemProps: (item) => ({ label: item?.title || "Ny milepæl" }) },
            fields: [
              { type: "datetime", name: "date", label: "Dato", required: true, ui: { dateFormat: "DD.MM.YYYY", timeFormat: false } },
              { type: "string", name: "title", label: "Overskrift", required: true },
              { type: "string", name: "description", label: "Beskrivelse", ui: textarea },
            ],
          },
        ],
      },

      // ---------------- INNSTILLINGER ----------------
      {
        name: "innstillinger",
        label: "Innstillinger",
        path: "content/innstillinger",
        format: "json",
        match: { include: "nettside" },
        ui: singleton,
        fields: [
          { type: "string", name: "email", label: "E-post (generell)" },
          {
            type: "string",
            name: "industryEmail",
            label: "E-post til Industriansvarlig",
            description: "Tomt = bruker den generelle e-posten",
          },
          { type: "string", name: "instagram", label: "Instagram-lenke", description: "Tomt = skjules" },
          { type: "string", name: "linkedin", label: "LinkedIn-lenke", description: "Tomt = skjules" },
          { type: "string", name: "discord", label: "Discord-lenke", description: "Tomt = skjules" },
          {
            type: "image",
            name: "bylawsFile",
            label: "Vedtekter (PDF)",
            description: "Last opp nye vedtekter her. Husk å oppdatere «Sist revidert».",
            accept: "pdf",
            uploadDir: () => "dokumenter",
          },
          { type: "string", name: "bylawsLastRevised", label: "Vedtekter sist revidert", description: "F.eks. 12.03.2026" },
          { type: "string", name: "tagline", label: "Slagord", description: "F.eks. Fag. Fellesskap. Fremtid." },
          {
            type: "string",
            name: "formspreeSuggestionEndpoint",
            label: "Formspree-adresse – Forslagsboksen",
            description: "F.eks. https://formspree.io/f/abcdwxyz",
          },
          {
            type: "string",
            name: "formspreeContactEndpoint",
            label: "Formspree-adresse – kontaktskjema",
          },
          {
            type: "string",
            name: "registrationScriptUrl",
            label: "Påmelding – Google Apps Script-adresse",
            description:
              "Lagrer påmeldinger i foreningens Google-regneark og gjør /admin mulig. Ser ut som https://script.google.com/macros/s/…/exec. Se README.",
          },
          {
            type: "string",
            name: "formspreeRegistrationEndpoint",
            label: "Formspree-adresse – påmelding (reserve)",
            description: "Brukes bare hvis Google Apps Script-adressen over står tom. Gir e-post per påmelding, men ingen /admin-oversikt.",
          },
          { type: "boolean", name: "showStats", label: "Vis tall-seksjonen på forsiden" },
          {
            type: "object",
            list: true,
            name: "stats",
            label: "Tall på forsiden",
            description: "Skriv bare inn tall som faktisk stemmer.",
            ui: { itemProps: (item) => ({ label: `${item?.value || ""} ${item?.label || ""}`.trim() || "Nytt tall" }) },
            fields: [
              { type: "string", name: "value", label: "Tall/tekst" },
              { type: "string", name: "label", label: "Beskrivelse" },
            ],
          },
          { type: "string", name: "associationName", label: "Foreningens navn" },
          { type: "string", name: "programme", label: "Studieprogram" },
          { type: "string", name: "university", label: "Lærested" },
          { type: "string", name: "founded", label: "Stiftet" },
          { type: "image", name: "logo", label: "Logo" },
        ],
      },
    ],
  },
});
