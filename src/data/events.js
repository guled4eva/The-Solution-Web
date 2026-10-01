/**
 * ============================================================
 *  ARRANGEMENTER
 * ============================================================
 *
 *  Legg til et nytt arrangement ved å kopiere en hel blokk { ... }
 *  og endre innholdet. Husk kommaet mellom blokkene.
 *
 *  Nettsiden sorterer automatisk:
 *   - Arrangementer fra og med i dag  → "Kommende arrangementer"
 *   - Arrangementer før i dag         → "Tidligere arrangementer"
 *  Du trenger aldri flytte noe manuelt. Rekkefølgen i filen spiller ingen rolle.
 *
 *  Felter:
 *   slug                 Del av adressen, f.eks. "julebord-2026" →  /#/arrangementer/julebord-2026
 *                        Bruk små bokstaver, tall og bindestrek (ikke æ, ø, å eller mellomrom).
 *                        Må være unik. Står den tom, lages den automatisk fra tittelen.
 *   title                Navnet på arrangementet
 *   date                 Dato i formatet ÅÅÅÅ-MM-DD, f.eks. "2026-11-12"
 *   time                 Klokkeslett, f.eks. "17:00" eller "17:00–20:00" (kan stå tomt)
 *   location             Sted, f.eks. "OsloMet, Pilestredet 46, rom PI-A123"
 *   category             En av: "Sosialt", "Faglig", "Bedrift", "Generalforsamling", "Annet"
 *   description          Kort tekst (1–2 setninger) som vises på kortet
 *   fullDescription      Lengre tekst på arrangementssiden.
 *                        Lag nytt avsnitt med en tom linje (\n\n).
 *   image                Bilde i public/images/arrangementer/, f.eks. "/images/arrangementer/julebord.jpg"
 *                        Tomt ("") = det vises en grafisk plassholder i kategorifargen.
 *                        Tips: bruk liggende bilder, ca. 1200 × 675 piksler, under 300 kB.
 *   registrationLink     Lenke til påmelding (tom = ingen påmeldingsknapp)
 *   registrationDeadline Påmeldingsfrist, "ÅÅÅÅ-MM-DD" eller "ÅÅÅÅ-MM-DDTHH:MM" (kan stå tomt)
 *   placeholder          true = viser "Eksempel"-merke. Fjern eller sett til false for ekte arrangementer.
 *
 *  OBS: Arrangementene under er EKSEMPLER for å vise hvordan siden ser ut.
 *  Slett dem når dere legger inn ekte arrangementer.
 * ============================================================
 */

export const events = [
  {
    id: 1,
    slug: "eksempel-bli-kjent-kveld",
    title: "Eksempel: Bli kjent-kveld",
    date: "2026-10-22",
    time: "18:00",
    location: "[LEGG INN STED]",
    category: "Sosialt",
    description:
      "Eksempelarrangement. Slik ser et sosialt arrangement ut på nettsiden.",
    fullDescription:
      "Dette er et eksempelarrangement som viser hvordan en arrangementsside ser ut. Bytt ut teksten med en ekte beskrivelse.\n\nSkriv gjerne hva som skjer, hvem arrangementet passer for, og om det er noe deltakerne bør ta med seg.",
    image: "",
    registrationLink: "",
    registrationDeadline: "",
    placeholder: true,
  },
  {
    id: 2,
    slug: "eksempel-bedriftspresentasjon",
    title: "Eksempel: Bedriftspresentasjon",
    date: "2026-11-12",
    time: "16:15–18:00",
    location: "[LEGG INN STED]",
    category: "Bedrift",
    description:
      "Eksempelarrangement. En bedrift forteller om hva de jobber med og hvilke muligheter som finnes for studenter.",
    fullDescription:
      "Dette er et eksempel på en bedriftspresentasjon. Erstatt teksten med informasjon om bedriften, programmet for kvelden og eventuell servering.\n\nHar arrangementet påmelding, legger du inn lenken i feltet registrationLink, og fristen i registrationDeadline.",
    image: "",
    registrationLink: "",
    registrationDeadline: "2026-11-09",
    placeholder: true,
  },
  {
    id: 3,
    slug: "eksempel-faglig-seminar",
    title: "Eksempel: Faglig seminar",
    date: "2026-12-03",
    time: "14:00",
    location: "[LEGG INN STED]",
    category: "Faglig",
    description:
      "Eksempelarrangement. Et faglig arrangement som går litt utenfor pensum.",
    fullDescription:
      "Dette er et eksempel på et faglig arrangement. Beskriv temaet, hvem som holder innlegg og hva deltakerne får ut av det.",
    image: "",
    registrationLink: "",
    registrationDeadline: "",
    placeholder: true,
  },
  {
    id: 4,
    slug: "eksempel-generalforsamling",
    title: "Eksempel: Generalforsamling",
    date: "2026-09-10",
    time: "17:00",
    location: "[LEGG INN STED]",
    category: "Generalforsamling",
    description:
      "Eksempelarrangement i fortiden. Viser hvordan tidligere arrangementer vises.",
    fullDescription:
      "Dette er et eksempel på et tidligere arrangement. Når datoen har passert, flyttes arrangementet automatisk til «Tidligere arrangementer».",
    image: "",
    registrationLink: "",
    registrationDeadline: "",
    placeholder: true,
  },
];
