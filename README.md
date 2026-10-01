# The Solution nettside

Nettsiden til **The Solution – linjeforeningen for Bioteknologi og kjemi ved OsloMet**.

Nettsiden er laget med React og Vite, og publiseres gratis med GitHub Pages.
**Du trenger ikke kunne React for å oppdatere innholdet.** Nesten alt du vil endre, ligger i noen få, kommenterte filer:

| Hva vil du endre?                         | Fil / mappe                                  |
| ----------------------------------------- | -------------------------------------------- |
| Arrangementer                             | `src/data/events.js`                         |
| Styret                                    | `src/data/board.js`                          |
| E-post, sosiale medier, skjemaer, logo    | `src/data/siteConfig.js`                     |
| Tidslinjen («Historien vår»)              | `src/data/history.js`                        |
| Bilder                                    | `public/images/`                             |
| Vedtektene (PDF)                          | `public/documents/vedtekter-the-solution.pdf`|
| Farger                                    | `src/styles/variables.css`                   |

---

## Kom i gang

Du trenger [Node.js](https://nodejs.org) (velg «LTS»-versjonen) installert på maskinen din.

1. Last ned prosjektet (eller `git clone` det).
2. Åpne en terminal i prosjektmappen.
3. Installer det prosjektet trenger (bare første gang):

   ```bash
   npm install
   ```

4. Start nettsiden på din egen maskin:

   ```bash
   npm run dev
   ```

5. Åpne adressen som vises i terminalen (vanligvis <http://localhost:5173>).

Når du lagrer en fil, oppdateres nettsiden i nettleseren automatisk. Stopp med `Ctrl + C` i terminalen.

> **Tips:** Mens du kjører `npm run dev`, vises gule plassholdere som `[LEGG INN E-POST]` der informasjon mangler.
> På den publiserte nettsiden skjules disse automatisk.

## Bygge nettsiden

```bash
npm run build
```

Dette lager en ferdig versjon av nettsiden i mappen `dist/`. Du trenger vanligvis ikke gjøre dette selv – GitHub gjør det automatisk ved publisering (se [Publisering](#publisering)). Det er likevel lurt å kjøre kommandoen før du laster opp, for å sjekke at det ikke er feil.

Vil du se den ferdige versjonen lokalt: `npm run preview`.

---

## Legge til et arrangement

Åpne `src/data/events.js`. Hvert arrangement er en blokk mellom `{` og `}`.
Kopier en hel blokk, lim den inn i listen og endre innholdet:

```js
  {
    id: 5,
    slug: "julebord-2026",
    title: "Julebord 2026",
    date: "2026-12-05",
    time: "19:00",
    location: "OsloMet, Pilestredet 46",
    category: "Sosialt",
    description: "Årets julebord for alle på Bioteknologi og kjemi!",
    fullDescription: "Velkommen til julebord!\n\nDet blir mat, quiz og god stemning.",
    image: "/images/arrangementer/julebord-2026.jpg",
    registrationLink: "https://eksempel.no/pamelding",
    registrationDeadline: "2026-11-28",
  },
```

Ting å huske på:

- **Komma** mellom blokkene. Hver blokk slutter med `},`.
- **Dato** skrives `ÅÅÅÅ-MM-DD`, f.eks. `"2026-12-05"`.
- **slug** blir adressen til arrangementssiden: `/#/arrangementer/julebord-2026`. Bruk små bokstaver, tall og bindestrek – ikke æ, ø, å eller mellomrom. Står den tom, lages den automatisk fra tittelen.
- **category** må være én av: `"Sosialt"`, `"Faglig"`, `"Bedrift"`, `"Generalforsamling"`, `"Annet"`.
- **Nytt avsnitt** i `fullDescription`: skriv `\n\n`.
- **Bilde** er valgfritt. Legg bildet i `public/images/arrangementer/`. Uten bilde vises en grafisk plassholder i kategorifargen. Bruk liggende bilder (ca. 1200 × 675 piksler) og hold dem under ca. 300 kB – komprimer gjerne på <https://squoosh.app>.
- **Påmelding:** står `registrationLink` tom, vises ingen påmeldingsknapp. Når `registrationDeadline` har passert, skjules knappen automatisk.

Du trenger **aldri** flytte arrangementer manuelt. Nettsiden sorterer selv:
arrangementer fra og med i dag havner under «Kommende arrangementer» (tidligste først), og eldre arrangementer under «Tidligere arrangementer» (nyeste først). Forsiden viser de tre neste.

> Arrangementene som ligger der nå, er **eksempler** (merket «Eksempel»). Slett dem når dere legger inn ekte arrangementer.

## Endre styret

Åpne `src/data/board.js`. Hvert styremedlem er en blokk:

```js
  {
    name: "Kari Nordmann",
    role: "Leder",
    image: "/images/styret/leder.jpg",
    description: "Kort tekst om vervet eller personen.",
    responsibilities: ["Leder styremøter", "Foreningens talsperson"],
    email: "leder@eksempel.no",
    linkedin: "https://www.linkedin.com/in/kari-nordmann",
    placeholder: false,
  },
```

- Legg bildet i `public/images/styret/` og skriv stien i `image`. Kvadratiske bilder fungerer best (ca. 600 × 600 piksler).
- Mangler bilde, e-post eller LinkedIn? La feltet stå tomt (`""`). Nettsiden viser da et nøytralt plassholderbilde og skjuler knappene som mangler.
- Sett `placeholder: false` når ekte informasjon er lagt inn – da forsvinner «Eksempel»-merket.
- Rekkefølgen i filen er rekkefølgen på nettsiden.

## Endre kontaktinformasjon

Åpne `src/data/siteConfig.js`:

```js
  email: "post@eksempel.no",          // generell e-post
  industryEmail: "bedrift@eksempel.no", // e-post til Industriansvarlig
```

- `email` vises på «Kontakt oss» og i bunnen av alle sider.
- `industryEmail` brukes på knappen «Ta kontakt med Industriansvarlig». Står den tom, brukes e-posten til Industriansvarlig fra `board.js`, og deretter den generelle e-posten.

## Endre sosiale medier

Også i `src/data/siteConfig.js`. Lim inn **hele** lenken:

```js
  instagram: "https://www.instagram.com/brukernavn",
  linkedin: "https://www.linkedin.com/company/foreningsnavn",
  discord: "https://discord.gg/invitasjonskode",
```

Plattformer som står tomme (`""`), vises ikke på nettsiden. Det blir aldri «døde» lenker.

## Statistikk på forsiden

I `siteConfig.js` kan du skru av tallseksjonen med `showStats: false`, eller endre tallene i `stats`. Skriv bare inn tall som faktisk stemmer.

## Oppdatere tidslinjen

Åpne `src/data/history.js` og kopier en blokk:

```js
  {
    date: "2027-03-12",
    title: "Ettårsjubileum",
    description: "The Solution fyller ett år.",
  },
```

Tidslinjen sorteres automatisk etter dato.

## Endre farger

Alle farger ligger i `src/styles/variables.css`, øverst i filen:

```css
  --color-primary: #0b4f5c;   /* Hovedfarge – knapper, lenker */
  --color-secondary: #1f8a70; /* Detaljer og ikoner */
  --color-accent: #ff8a4c;    /* Fremhevinger */
```

Endre fargekodene, lagre, og hele nettsiden får de nye fargene. Sjekk at tekst fortsatt er lett å lese (kontrast) – f.eks. på <https://webaim.org/resources/contrastchecker/>. Husk også `theme-color` i `index.html` hvis hovedfargen endres.

## Bytte logo

Logofilene ligger i `public/images/logo/`:

| Fil                  | Hva det er                                                              |
| -------------------- | ----------------------------------------------------------------------- |
| `logo.svg`           | Symbolet (kolbe + DNA) uten tekst. Brukes i menyen, på forsiden og nederst. |
| `logo-full.svg`      | Hele logoen med «THE SOLUTION». Fin til plakater og delingsbilder.      |
| `logo-original.jpg`  | Originalfilen logoen er tegnet opp fra.                                 |

SVG-filene er vektorer, så de blir skarpe i alle størrelser.

Slik bytter du logo:

1. Legg den nye logoen i `public/images/logo/`. SVG er best, ellers PNG med gjennomsiktig bakgrunn.
2. Enten: gi filen navnet `logo.svg` (erstatt den gamle), **eller** endre `logo` i `siteConfig.js`, f.eks. `logo: "/images/logo/ny-logo.png"`.
3. Bytt også `public/favicon.svg` og `public/apple-touch-icon.png` (ikonene i nettleserfanen og på mobilens hjemskjerm) og `public/og-image.png` (bildet som vises når lenken deles, 1200 × 630 piksler).

## Oppdatere vedtektene

1. Lagre de nye vedtektene som PDF.
2. Gi filen navnet **`vedtekter-the-solution.pdf`**.
3. Erstatt filen i `public/documents/`.
4. Oppdater datoen `bylawsLastRevised` i `siteConfig.js`.

Du trenger ikke endre noe annet. Knappen «Les vedtektene» åpner alltid denne filen.

> PDF-en som ligger der nå, er en **plassholder**. Bytt den ut med de ekte vedtektene.

---

## Aktivere Forslagsboksen

GitHub Pages kan bare vise nettsider – den kan ikke ta imot eller sende skjemaer. Derfor bruker vi den gratis tjenesten **Formspree**, som videresender innsendte forslag til e-posten deres.
Inntil dette er gjort, sier skjemaet tydelig fra om at det ikke er aktivert, og **ingenting blir sendt**.

1. Gå til <https://formspree.io> og lag en konto (bruk gjerne foreningens felles e-post, så kontoen kan overleveres til neste styre).
2. Trykk **New Form**, og kall skjemaet f.eks. «Forslagsboksen».
3. Kopier skjemaets adresse (endpoint). Den ser slik ut: `https://formspree.io/f/abcdwxyz`
4. Lim den inn i `src/data/siteConfig.js`:

   ```js
   formspreeSuggestionEndpoint: "https://formspree.io/f/abcdwxyz",
   ```

5. Publiser (se under). Send gjerne inn et testforslag for å sjekke at det kommer frem. Første gang må dere kanskje bekrefte e-postadressen i Formspree.

**Anonyme forslag:** Når «Jeg ønsker å sende inn forslaget anonymt» er huket av, sendes navn og e-post **ikke** med til Formspree.

Formspree-adressen er ikke hemmelig – den er laget for å ligge på nettsider. Legg likevel **aldri** passord, API-nøkler eller andre hemmeligheter i koden; alt i prosjektet blir synlig for alle.

## Aktivere kontaktskjemaet

Samme fremgangsmåte, men lag et **eget** skjema i Formspree (f.eks. «Kontaktskjema»), slik at forslag og henvendelser holdes adskilt:

```js
formspreeContactEndpoint: "https://formspree.io/f/efghwxyz",
```

Kontaktskjemaet sender navn, e-post, emne og melding. Når noen svarer på e-posten fra Formspree, går svaret direkte til avsenderen.

---

## Publisering

Nettsiden publiseres automatisk med **GitHub Actions** hver gang noen laster opp (pusher) endringer til grenen `main`. Oppskriften ligger i `.github/workflows/deploy.yml`.

### Engangsoppsett

1. Lag et repository på GitHub og last opp prosjektet (alt unntatt `node_modules` og `dist` – det sørger `.gitignore` for).
2. I repoet på GitHub: gå til **Settings → Pages**.
3. Under **Build and deployment → Source**, velg **GitHub Actions**.
4. Gå til fanen **Actions** og se at «Publiser til GitHub Pages» kjører. Når den er grønn (ca. 1–2 minutter), er nettsiden ute.
5. Adressen står under **Settings → Pages**, vanligvis `https://brukernavn.github.io/repo-navn/`.

### Etter det

Endre en fil → lagre → push til `main` (eller rediger filen direkte på github.com og trykk **Commit changes**). Nettsiden oppdateres av seg selv etter et par minutter.

Blir en publisering rød i Actions-fanen, er det som regel en skrivefeil i en av datafilene (f.eks. et manglende komma eller anførselstegn). Klikk på den røde kjøringen for å se feilmeldingen, eller kjør `npm run build` lokalt.

### Repo-navn og adresser

Nettsiden bruker adresser med `#`, f.eks. `/#/arrangementer`. Det gjør at direkte lenker og oppdatering av siden alltid fungerer på GitHub Pages.

I `vite.config.js` står `base: "./"`. Det betyr at nettsiden fungerer uansett hva repoet heter, og også med eget domene – **du trenger ikke endre noe hvis repoet får nytt navn.**

Bare hvis noen senere bytter til adresser uten `#` (BrowserRouter), må `base` settes til repo-navnet, f.eks. `base: "/the-solution/"`, og det må legges til en `404.html`-omdirigering. Det anbefales ikke.

**Eget domene** (f.eks. `thesolution.no`): legg det inn under **Settings → Pages → Custom domain** og følg GitHubs instruksjoner.

---

## Hvor ligger resten?

For den som vil endre utseende eller funksjoner:

```text
src/
├── components/   Gjenbrukbare deler (meny, bunntekst, kort, knapper, grafikk)
├── pages/        Én fil per side (Home, Board, Events, …)
├── hooks/        Små hjelpefunksjoner for React (sidetittel, skjemainnsending)
├── lib/          Logikk: datoer, sortering av arrangementer, Formspree
├── data/         ← Innholdet (dette er filene styret redigerer)
└── styles/       variables.css (farger) og global.css (all styling)
```

Ikoner kommer fra [Lucide](https://lucide.dev). Skrifttypene er Bricolage Grotesque og Instrument Sans fra Google Fonts (lastes i `index.html`).
