# The Solution nettside

Nettsiden til **The Solution – linjeforeningen for Bioteknologi og kjemi ved OsloMet**.
Den ligger på **https://www.thesolutionoslomet.no**.

Nettsiden er laget med React og Vite, og publiseres gratis med GitHub Pages.
**Du trenger ikke kunne programmering for å oppdatere innholdet.**

## Den enkle måten: logg inn på /loggin

Gå til **https://www.thesolutionoslomet.no/loggin** og logg inn med foreningens konto (`thesolution.oslomet@gmail.com`).
Der kan du endre:

| Meny i panelet  | Hva du endrer                                                              |
| --------------- | -------------------------------------------------------------------------- |
| Arrangementer   | Legge til, endre og slette arrangementer, med bilde og påmelding          |
| Styret          | Navn, bilder, e-post og LinkedIn for styremedlemmene                       |
| Tekster         | Tekstene på forsiden, «Om oss», «Styret» og «For bedrifter»                |
| Historie        | Tidslinjen på «Om oss»                                                     |
| Innstillinger   | E-post, sosiale medier, vedtekter (PDF), tall på forsiden, Formspree       |

Trykk **Save** når du er ferdig. Endringen lagres i GitHub, og nettsiden oppdateres av seg selv etter 1–2 minutter.

> Innloggingen må settes opp én gang. Se [Aktivere innlogging på /loggin](#aktivere-innlogging-på-loggin).

## Hvor ligger innholdet?

Alt innholdet ligger i mappen `content/` som enkle tekstfiler (JSON). Panelet på `/loggin` redigerer disse filene for deg, men de kan også redigeres direkte på github.com.

| Hva                         | Fil / mappe                                  |
| --------------------------- | -------------------------------------------- |
| Arrangementer (én fil hver) | `content/arrangementer/`                     |
| Styret                      | `content/styret/styret.json`                 |
| Tekster                     | `content/tekster/tekster.json`               |
| Historie                    | `content/historie/historie.json`             |
| Innstillinger               | `content/innstillinger/nettside.json`        |
| Bilder                      | `public/images/`                             |
| Vedtektene (PDF)            | `public/documents/vedtekter-the-solution.pdf`|
| Farger                      | `src/styles/variables.css`                   |

Redigerer du en JSON-fil for hånd: hold på anførselstegnene `"…"` og kommaene mellom feltene. Mangler et komma, feiler publiseringen (rød ❌ under **Actions**), og den forrige versjonen av nettsiden blir liggende.

---

## Arrangementer

- Hvert arrangement er én fil i `content/arrangementer/`. **Filnavnet blir adressen**: `julebord-2026.json` → `/arrangementer/julebord-2026`. I panelet lages filnavnet automatisk fra tittelen.
- Nettsiden sorterer selv: arrangementer fra og med i dag står under «Kommende arrangementer» (tidligste først), eldre arrangementer under «Tidligere arrangementer» (nyeste først). Forsiden viser de tre neste.
- **Bilde** er valgfritt. Uten bilde vises en grafisk plassholder i kategorifargen. Bruk liggende bilder (ca. 1200 × 675 piksler) og hold dem under ca. 300 kB – komprimer gjerne på <https://squoosh.app>.
- **Påmelding på nettsiden:** slå på **Påmelding på nettsiden**, så får arrangementssiden et skjema med navn og e-post. Slå på **Spør om allergier/kommentarer** når det blir mat. Påmeldingene kommer på e-post via Formspree (se under), med arrangementets navn i emnet.
- **Ekstern påmelding:** skjer påmeldingen et annet sted (f.eks. Google Skjema), lim inn lenken i **Ekstern påmeldingslenke** i stedet.
- Når **påmeldingsfristen** har passert, stenges påmeldingen automatisk. Nettsiden kan ikke telle påmeldte eller stenge ved fullt – det ser dere i e-posten/Formspree.
- **Kategori** er én av: Sosialt, Faglig, Bedrift, Generalforsamling, Annet.
- Slå av **Eksempel** for ekte arrangementer. Eksempel-arrangementene som ligger der nå kan slettes.

Eksempel på en arrangementsfil (`content/arrangementer/julebord-2026.json`):

```json
{
  "title": "Julebord 2026",
  "date": "2026-12-05",
  "time": "19:00",
  "location": "OsloMet, Pilestredet 46",
  "category": "Sosialt",
  "description": "Årets julebord for alle på Bioteknologi og kjemi!",
  "fullDescription": "Velkommen til julebord!\n\nDet blir mat, quiz og god stemning.",
  "image": "/images/arrangementer/julebord-2026.jpg",
  "registrationLink": "https://eksempel.no/pamelding",
  "registrationDeadline": "2026-11-28",
  "placeholder": false
}
```

## Styret

- Rekkefølgen i lista er rekkefølgen på nettsiden.
- Mangler bilde, e-post eller LinkedIn? La feltet stå tomt. Nettsiden viser da et nøytralt plassholderbilde og skjuler knappene som mangler.
- Slå av **Eksempel** når ekte informasjon er lagt inn.
- Kvadratiske bilder fungerer best (ca. 600 × 600 piksler).

## Kontaktinformasjon og sosiale medier

Under **Innstillinger**:

- **E-post (generell)** vises på «Kontakt oss» og nederst på alle sider.
- **E-post til Industriansvarlig** brukes på «Ta kontakt med Industriansvarlig» og på samarbeidsboksene (Bedriftspresentasjoner, Bedriftsbesøk osv.). Står den tom, brukes den generelle e-posten.
- **Instagram, LinkedIn og Discord**: lim inn hele lenken. Tomme felt vises ikke på nettsiden – det blir aldri «døde» lenker.
- **Tall på forsiden** kan endres eller skrus av. Skriv bare inn tall som faktisk stemmer.

## Oppdatere vedtektene

**I panelet:** Innstillinger → **Vedtekter (PDF)** → last opp den nye PDF-en → oppdater **Vedtekter sist revidert** → Save.

**Eller på GitHub:** erstatt `public/documents/vedtekter-the-solution.pdf` med en ny fil med nøyaktig samme navn.

Knappen «Les vedtektene» åpner alltid gjeldende fil.

## Bytte logo

Logofilene ligger i `public/images/logo/`:

| Fil                  | Hva det er                                                                  |
| -------------------- | --------------------------------------------------------------------------- |
| `logo.svg`           | Symbolet (kolbe + DNA) uten tekst. Brukes i menyen, på forsiden og nederst. |
| `logo-full.svg`      | Hele logoen med «THE SOLUTION». Fin til plakater og delingsbilder.          |
| `logo-original.jpg`  | Originalfilen logoen er tegnet opp fra.                                     |

Ny logo kan lastes opp under **Innstillinger → Logo**. Bytt også `public/favicon.svg`, `public/apple-touch-icon.png` og `public/og-image.png` (bildet som vises når lenken deles, 1200 × 630 piksler).

## Endre farger

Alle farger ligger øverst i `src/styles/variables.css`:

```css
  --color-primary: #0b4f5c;   /* Hovedfarge – knapper, lenker */
  --color-secondary: #1f8a70; /* Detaljer og ikoner */
  --color-accent: #ff8a4c;    /* Fremhevinger */
```

Sjekk at tekst fortsatt er lett å lese (kontrast), f.eks. på <https://webaim.org/resources/contrastchecker/>.

---

## Aktivere Forslagsboksen og kontaktskjemaet

GitHub Pages kan bare vise nettsider – den kan ikke ta imot skjemaer. Derfor bruker vi den gratis tjenesten **Formspree**, som videresender innsendte forslag og meldinger til e-posten deres.
Inntil dette er gjort, sier skjemaene tydelig fra om at de ikke er aktivert, og **ingenting blir sendt**.

1. Gå til <https://formspree.io> og lag en konto med `thesolution.oslomet@gmail.com`.
2. Lag tre skjemaer: «Forslagsboksen», «Kontaktskjema» og «Påmelding».
3. Kopier adressen til hvert skjema. Den ser slik ut: `https://formspree.io/f/abcdwxyz`
4. Lim dem inn under **Innstillinger** i panelet (eller i `content/innstillinger/nettside.json`):
   - **Formspree-adresse – Forslagsboksen**
   - **Formspree-adresse – kontaktskjema**
   - **Formspree-adresse – påmelding til arrangementer** (ett skjema for alle arrangementer)
5. Send gjerne inn en test for å sjekke at det kommer frem. Første gang må dere kanskje bekrefte e-postadressen i Formspree.

**Anonyme forslag:** Når «Jeg ønsker å sende inn forslaget anonymt» er huket av, sendes navn og e-post **ikke** med.

Formspree-adressene er ikke hemmelige – de er laget for å ligge på nettsider.

## Aktivere innlogging på /loggin

Panelet på `/loggin` er **TinaCMS**. Innloggingen håndteres av TinaCloud (gratisversjonen har plass til 2 brukere – nok for foreningens felles konto). Oppsettet gjøres én gang, av den som eier GitHub-repoet:

1. Gå til <https://app.tina.io> og lag en konto med `thesolution.oslomet@gmail.com`.
2. Velg **Create Project** → **Import your site**. Gi TinaCloud tilgang til GitHub-repoet med nettsiden når den spør (logg inn med GitHub-kontoen som eier repoet).
3. Under **Site URLs**, legg inn `https://www.thesolutionoslomet.no`.
4. Kopier **Client ID** fra prosjektet. Gå til **Tokens** og lag et **Read Only**-token, og kopier det.
5. I GitHub-repoet: **Settings → Secrets and variables → Actions → New repository secret**. Lag to:
   - Navn `TINA_PUBLIC_CLIENT_ID`, verdi: Client ID-en
   - Navn `TINA_TOKEN`, verdi: tokenet
6. Gå til **Actions** → «Deploy The Solution to GitHub Pages» → **Run workflow**.
7. Når kjøringen er grønn, gå til <https://www.thesolutionoslomet.no/loggin> og logg inn.

Nøklene ligger trygt som «secrets» i GitHub og havner aldri i koden. Før oppsettet er gjort viser `/loggin` bare en melding om at panelet ikke er aktivert – resten av nettsiden fungerer som vanlig.

**Sikkerhet:** Alle som kan logge inn på `thesolution.oslomet@gmail.com`, kan endre nettsiden. Bruk et sterkt passord og slå på totrinnsbekreftelse på Gmail-kontoen, og bytt passord når styret byttes.

Endrer noen feltene i redigeringspanelet (`tina/config.js`), må `tina/tina-lock.json` oppdateres: kjør `npm run dev:cms` lokalt én gang og last opp den nye `tina-lock.json`.

---

## Publisering

Nettsiden publiseres automatisk med **GitHub Actions** hver gang noe endres i grenen `main` – også når noen lagrer i panelet. Oppskriften ligger i `.github/workflows/deploy.yml`.

Blir en publisering rød i **Actions**-fanen, er det som regel en skrivefeil i en av innholdsfilene. Klikk på den røde kjøringen for å se feilmeldingen.

### Engangsoppsett (allerede gjort)

1. **Settings → Pages → Source: GitHub Actions**.
2. **Settings → Pages → Custom domain:** `www.thesolutionoslomet.no`, med **Enforce HTTPS** på.
3. Domenet er registrert hos Domeneshop. DNS-oppsettet der peker til GitHub Pages (fire A-poster, fire AAAA-poster og en CNAME for `www`).

### Adresser

Nettsiden bruker vanlige adresser, f.eks. `/styret` og `/arrangementer/julebord-2026`.
GitHub Pages kan bare vise filer som finnes, så byggesteget (i `vite.config.js`) lager automatisk en kopi av siden for hver adresse – også for hvert arrangement – pluss en `404.html` som fanger opp alt annet.

I `vite.config.js` står `base: "/"`, fordi nettsiden ligger i roten av domenet. Bytter dere domene, oppdater også `og:url` og `og:image` i `index.html`.

---

## For den som vil jobbe med koden

Du trenger [Node.js](https://nodejs.org) (LTS).

```bash
npm install        # første gang
npm run dev        # nettsiden på http://localhost:5173
npm run dev:cms    # nettsiden + redigeringspanelet lokalt (lagrer til filene på maskinen)
npm run build      # bygg nettsiden til mappen dist/
```

Mens du kjører `npm run dev`, vises gule plassholdere som `[LEGG INN E-POST]` der informasjon mangler. På den publiserte nettsiden skjules disse.

```text
content/          ← Innholdet (redigeres på /loggin)
tina/config.js    Hvilke felter redigeringspanelet viser
src/
├── components/   Gjenbrukbare deler (meny, bunntekst, kort, knapper, grafikk)
├── pages/        Én fil per side (Home, Board, Events, …)
├── data/         Leser innholdet fra content/
├── hooks/        Sidetittel og skjemainnsending
├── lib/          Datoer, sortering av arrangementer, Formspree
└── styles/       variables.css (farger) og global.css (all styling)
```

Ikoner kommer fra [Lucide](https://lucide.dev). Skrifttypene er Bricolage Grotesque og Instrument Sans fra Google Fonts.
