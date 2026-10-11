/**
 * What can be edited on /loggin.
 * Each section is either one file ("single") or a folder with one file per item ("folder").
 *
 * Field types:
 *   text, textarea, select, boolean, date, datetime, image (or PDF), stringList, list (of objects)
 */

export const CATEGORIES = ["Sosialt", "Faglig", "Bedrift", "Generalforsamling", "Annet"];

/** Same slug rules as the website (æ→ae, ø→o, å→a). */
export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const SECTIONS = [
  {
    key: "arrangementer",
    label: "Arrangementer",
    kind: "folder",
    dir: "content/arrangementer",
    itemLabel: (d) => d.title || "Uten tittel",
    newItem: () => ({
      title: "",
      date: "",
      time: "",
      location: "",
      category: "Sosialt",
      description: "",
      fullDescription: "",
      image: "",
      registrationOnSite: false,
      registrationAskNotes: false,
      registrationLink: "",
      registrationDeadline: "",
      placeholder: false,
    }),
    viewUrl: (slug) => `/arrangementer/${slug}`,
    fields: [
      { name: "title", label: "Tittel", type: "text", required: true },
      { name: "date", label: "Dato", type: "date", required: true },
      { name: "time", label: "Klokkeslett", type: "text", hint: "F.eks. 18:00 eller 16:15–18:00" },
      { name: "location", label: "Sted", type: "text" },
      { name: "category", label: "Kategori", type: "select", options: CATEGORIES, required: true },
      { name: "description", label: "Kort beskrivelse", type: "textarea", rows: 3, hint: "1–2 setninger som vises på kortet." },
      {
        name: "fullDescription",
        label: "Full beskrivelse",
        type: "textarea",
        rows: 10,
        hint: "Vises på arrangementssiden. Lag nytt avsnitt med en tom linje.",
      },
      {
        name: "image",
        label: "Bilde",
        type: "image",
        folder: "arrangementer",
        hint: "Liggende bilde, helst ca. 1200 × 675 piksler. Tomt = grafisk plassholder.",
      },
      { type: "heading", label: "Påmelding" },
      {
        name: "registrationOnSite",
        label: "Påmelding på nettsiden",
        type: "boolean",
        hint: "Viser et skjema med navn og e-post. Påmeldingene ses på /admin.",
      },
      {
        name: "registrationAskNotes",
        label: "Spør om mat og allergier",
        type: "boolean",
        hint: "Halal, vegansk, nøtteallergi og annet. Fint når det blir mat.",
        showIf: (d) => d.registrationOnSite,
      },
      { name: "registrationDeadline", label: "Påmeldingsfrist", type: "datetime", hint: "Tomt = ingen frist." },
      {
        name: "registrationLink",
        label: "Ekstern påmeldingslenke",
        type: "text",
        inputType: "url",
        hint: "Bare hvis påmeldingen skjer et annet sted (f.eks. Google Skjema). Tomt = ingen lenke.",
      },
      { type: "heading", label: "Annet" },
      { name: "placeholder", label: "Eksempel", type: "boolean", hint: "Viser et «Eksempel»-merke. Slå av for ekte arrangementer." },
    ],
  },
  {
    key: "styret",
    label: "Styret",
    kind: "single",
    path: "content/styret/styret.json",
    viewUrl: () => "/styret",
    fields: [
      {
        name: "members",
        label: "Styremedlemmer",
        type: "list",
        hint: "Rekkefølgen her er rekkefølgen på nettsiden.",
        addLabel: "Legg til styremedlem",
        itemLabel: (m) => `${m.role || "Verv"} – ${m.name || "navn mangler"}`,
        newItem: () => ({ role: "", name: "", image: "", description: "", responsibilities: [], email: "", linkedin: "", placeholder: false }),
        fields: [
          { name: "role", label: "Verv", type: "text", required: true },
          { name: "name", label: "Navn", type: "text" },
          { name: "image", label: "Bilde", type: "image", folder: "styret", hint: "Kvadratisk bilde, ca. 600 × 600 piksler. Tomt = plassholder." },
          { name: "description", label: "Kort beskrivelse", type: "textarea", rows: 3 },
          { name: "responsibilities", label: "Ansvarsområder", type: "stringList", addLabel: "Legg til ansvarsområde" },
          { name: "email", label: "E-post", type: "text", inputType: "email" },
          { name: "linkedin", label: "LinkedIn-lenke", type: "text", inputType: "url" },
          { name: "placeholder", label: "Eksempel", type: "boolean", hint: "Viser et «Eksempel»-merke." },
        ],
      },
    ],
  },
  {
    key: "tekster",
    label: "Tekster",
    kind: "single",
    path: "content/tekster/tekster.json",
    viewUrl: () => "/",
    fields: [
      { name: "heroLead", label: "Forsiden – introtekst øverst", type: "textarea", rows: 3 },
      { name: "introText", label: "Forsiden – «Mer enn bare forelesninger»", type: "textarea", rows: 6, hint: "Lag nytt avsnitt med en tom linje." },
      { name: "boardIntro", label: "Styret – introtekst", type: "textarea", rows: 3 },
      { name: "aboutLead", label: "Om oss – uthevet første setning", type: "text" },
      { name: "aboutText", label: "Om oss – «Hvem er vi?»", type: "textarea", rows: 6, hint: "Lag nytt avsnitt med en tom linje." },
      { name: "industryText", label: "Kontakt oss – «For bedrifter»", type: "textarea", rows: 4 },
    ],
  },
  {
    key: "historie",
    label: "Historie",
    kind: "single",
    path: "content/historie/historie.json",
    viewUrl: () => "/om-oss",
    fields: [
      {
        name: "milestones",
        label: "Milepæler",
        type: "list",
        hint: "Sorteres automatisk etter dato på nettsiden. Legg bare inn ting som faktisk har skjedd.",
        addLabel: "Legg til milepæl",
        itemLabel: (m) => m.title || "Ny milepæl",
        newItem: () => ({ date: "", title: "", description: "" }),
        fields: [
          { name: "date", label: "Dato", type: "date", required: true },
          { name: "title", label: "Overskrift", type: "text", required: true },
          { name: "description", label: "Beskrivelse", type: "textarea", rows: 3 },
        ],
      },
    ],
  },
  {
    key: "innstillinger",
    label: "Innstillinger",
    kind: "single",
    path: "content/innstillinger/nettside.json",
    fields: [
      { type: "heading", label: "Kontakt og sosiale medier" },
      { name: "email", label: "E-post (generell)", type: "text", inputType: "email" },
      { name: "industryEmail", label: "E-post til Industriansvarlig", type: "text", inputType: "email", hint: "Tomt = bruker den generelle e-posten." },
      { name: "instagram", label: "Instagram-lenke", type: "text", inputType: "url", hint: "Tomt = skjules." },
      { name: "linkedin", label: "LinkedIn-lenke", type: "text", inputType: "url", hint: "Tomt = skjules." },
      { name: "discord", label: "Discord-lenke", type: "text", inputType: "url", hint: "Tomt = skjules." },
      { type: "heading", label: "Forsiden" },
      { name: "tagline", label: "Slagord", type: "text", hint: "F.eks. Fag. Fellesskap. Fremtid." },
      { name: "showStats", label: "Vis tall-seksjonen på forsiden", type: "boolean" },
      {
        name: "stats",
        label: "Tall på forsiden",
        type: "list",
        hint: "Skriv bare inn tall som faktisk stemmer.",
        addLabel: "Legg til tall",
        itemLabel: (s) => `${s.value || ""} ${s.label || ""}`.trim() || "Nytt tall",
        newItem: () => ({ value: "", label: "" }),
        fields: [
          { name: "value", label: "Tall/tekst", type: "text" },
          { name: "label", label: "Beskrivelse", type: "text" },
        ],
      },
      { type: "heading", label: "Vedtekter" },
      {
        name: "bylawsFile",
        label: "Vedtekter (PDF)",
        type: "image",
        accept: "pdf",
        folder: "dokumenter",
        hint: "Last opp nye vedtekter her. Husk å oppdatere «Sist revidert».",
      },
      { name: "bylawsLastRevised", label: "Vedtekter sist revidert", type: "text", hint: "F.eks. 12.03.2026" },
      { type: "heading", label: "Foreningen" },
      { name: "associationName", label: "Foreningens navn", type: "text" },
      { name: "programme", label: "Studieprogram", type: "text" },
      { name: "university", label: "Lærested", type: "text" },
      { name: "founded", label: "Stiftet", type: "text" },
      { name: "logo", label: "Logo", type: "image", folder: "logo" },
      { type: "heading", label: "Skjemaer og påmelding (teknisk)" },
      {
        name: "registrationScriptUrl",
        label: "Google Apps Script-adresse",
        type: "text",
        inputType: "url",
        hint: "Brukes til påmelding, /admin og denne siden. Ser ut som https://script.google.com/macros/s/…/exec. Endre bare hvis du vet hva du gjør.",
      },
      { name: "formspreeSuggestionEndpoint", label: "Formspree-adresse – Forslagsboksen", type: "text", inputType: "url" },
      { name: "formspreeContactEndpoint", label: "Formspree-adresse – kontaktskjema", type: "text", inputType: "url" },
      {
        name: "formspreeRegistrationEndpoint",
        label: "Formspree-adresse – påmelding (reserve)",
        type: "text",
        inputType: "url",
        hint: "Brukes bare hvis Google Apps Script-adressen står tom.",
      },
    ],
  },
];

/** Returns a list of problems (missing required fields), with readable labels. */
export function validate(fields, data, prefix = "") {
  const problems = [];
  fields.forEach((f) => {
    if (!f.name || (f.showIf && !f.showIf(data))) return;
    const value = data?.[f.name];
    if (f.type === "list") {
      (value || []).forEach((item, i) => {
        const label = `${prefix}${f.label} nr. ${i + 1} → `;
        problems.push(...validate(f.fields, item, label));
      });
    } else if (f.required && !String(value ?? "").trim()) {
      problems.push(`${prefix}${f.label}`);
    }
  });
  return problems;
}
