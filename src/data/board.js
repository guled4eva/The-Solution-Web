/**
 * ============================================================
 *  STYRET
 * ============================================================
 *
 *  Etter et valg: bytt ut navn, bilde, e-post og LinkedIn under.
 *  Rekkefølgen her er rekkefølgen på nettsiden.
 *
 *  Felter:
 *   name             Navnet til styremedlemmet
 *   role             Vervet (f.eks. "Leder")
 *   image            Bilde i public/images/styret/, f.eks. "/images/styret/leder.jpg"
 *                    Tomt ("") = det vises et nøytralt plassholderbilde.
 *                    Tips: bruk kvadratiske bilder, ca. 600 × 600 piksler.
 *   description      Kort tekst om vervet eller personen
 *   responsibilities Liste med ansvarsområder (valgfritt – kan fjernes)
 *   email            E-postadresse (tom = ingen e-postknapp)
 *   linkedin         Full lenke til LinkedIn-profil (tom = ingen knapp)
 *   placeholder      Sett til false når ekte informasjon er lagt inn.
 *                    Så lenge den er true, vises et "Eksempel"-merke.
 *
 *  Vil dere legge til flere verv (f.eks. styremedlem eller vara),
 *  kopier en hel blokk { ... }, og husk kommaet mellom blokkene.
 * ============================================================
 */

export const board = [
  {
    name: "[Navn kommer]",
    role: "Leder",
    image: "",
    description:
      "Leder styret og er foreningens ansikt utad. Har hovedansvaret for at styret jobber i tråd med formålet til The Solution.",
    responsibilities: [
      "Kaller inn til og leder styremøter",
      "Foreningens talsperson",
      "Overordnet ansvar for styrets arbeid",
    ],
    email: "",
    linkedin: "",
    placeholder: true,
  },
  {
    name: "[Navn kommer]",
    role: "Nestleder",
    image: "",
    description:
      "Lederens høyre hånd, og trer inn som leder når lederen ikke er til stede.",
    responsibilities: [
      "Stedfortreder for leder",
      "Overtar lederens oppgaver ved fravær",
    ],
    email: "",
    linkedin: "",
    placeholder: true,
  },
  {
    name: "[Navn kommer]",
    role: "Økonomiansvarlig",
    image: "",
    description:
      "Holder styr på økonomien, slik at foreningen kan bruke pengene på det som betyr noe for studentene.",
    responsibilities: [
      "Oversikt over foreningens økonomi",
      "Søknader om økonomisk støtte",
      "Regnskap til generalforsamlingen",
    ],
    email: "",
    linkedin: "",
    placeholder: true,
  },
  {
    name: "[Navn kommer]",
    role: "Industriansvarlig",
    image: "",
    description:
      "Bindeleddet mellom foreningen og næringslivet – sørger for at studentene møter bedriftene de en dag kan jobbe for.",
    responsibilities: [
      "Bedriftspresentasjoner og bedriftsbesøk",
      "Stands og seminarer",
      "Sponsing, i samarbeid med økonomiansvarlig",
    ],
    email: "",
    linkedin: "",
    placeholder: true,
  },
  {
    name: "[Navn kommer]",
    role: "Omsorgsansvarlig",
    image: "",
    description:
      "Jobber for at alle skal trives – både faglig og sosialt – og sørger for at studentene får med seg det som skjer.",
    responsibilities: [
      "Faglige og sosiale arrangementer",
      "Foreningens kommunikasjonskanaler",
      "Samarbeid med fadderordningen for kjemistudentene",
    ],
    email: "",
    linkedin: "",
    placeholder: true,
  },
];
