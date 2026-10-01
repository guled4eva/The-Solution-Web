import {
  ArrowRight,
  BookOpen,
  Briefcase,
  FileText,
  FlaskConical,
  GraduationCap,
  Landmark,
  PartyPopper,
  Users,
  Vote,
} from "lucide-react";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { BondDivider } from "../components/ScienceArt.jsx";
import { siteConfig } from "../data/siteConfig.js";
import { history } from "../data/history.js";
import { assetUrl } from "../lib/assets.js";
import { formatShortDate, parseLocalDate, yearOf } from "../lib/dates.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

const purposes = [
  { title: "Sosialt miljø", text: "Et studiemiljø der det er lett å bli kjent og finne sin plass.", Icon: Users },
  { title: "Faglig miljø", text: "Faglig påfyll og læring sammen med medstudenter.", Icon: FlaskConical },
  { title: "Arrangementer", text: "Faglige og sosiale arrangementer gjennom hele studieåret.", Icon: PartyPopper },
  { title: "Studiets omdømme", text: "Gjøre Bioteknologi og kjemi kjent – og godt likt – på og utenfor campus.", Icon: GraduationCap },
  { title: "Næringslivet", text: "Kontakt mellom studentene og bedriftene de kan jobbe for etter studiene.", Icon: Briefcase },
];

export default function About() {
  usePageTitle("Om oss");
  const bylawsUrl = assetUrl(siteConfig.bylawsFile || "/documents/vedtekter-the-solution.pdf");
  const timeline = [...history]
    .filter((h) => h && h.title && parseLocalDate(h.date))
    .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));

  return (
    <>
      <PageHeader eyebrow="Om oss" title="Om The Solution" intro="Linjeforeningen for Bioteknologi og kjemi ved OsloMet." />

      {/* ---------- HVEM ER VI ---------- */}
      <section className="section" aria-labelledby="hvem">
        <div className="container about-intro">
          <SectionHeading id="hvem" eyebrow="Hvem er vi?" title="Studenter som vil gjøre studietiden bedre" />
          <div className="about-intro__text prose">
            <p className="lead">
              <strong>The Solution er linjeforeningen for Bioteknologi og kjemi ved OsloMet.</strong>
            </p>
            <p>
              Vi er en frivillig studentorganisasjon, stiftet 12. mars 2026. Foreningen drives av studenter, for
              studenter – og finnes for å gjøre det faglige og sosiale miljøet rundt studiet så godt som mulig.
            </p>
            <p>
              Enten du er helt ny på studiet eller snart ferdig, er The Solution et sted å bli kjent med andre, lære noe
              nytt og knytte kontakter for fremtiden.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- FORMÅL ---------- */}
      <section className="section section--alt" aria-labelledby="formal">
        <div className="container">
          <SectionHeading id="formal" eyebrow="Vårt formål" title="Dette jobber vi for" align="center" />
          <ul className="purpose-grid">
            {purposes.map(({ title, text, Icon }, i) => (
              <Reveal as="li" key={title} delay={i * 60} className="purpose">
                <span className="purpose__icon" aria-hidden="true">
                  <Icon size={24} strokeWidth={1.8} />
                </span>
                <h3 className="purpose__title">{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- HISTORIE ---------- */}
      <section className="section" aria-labelledby="historie">
        <div className="container history-wrap">
          <SectionHeading
            id="historie"
            eyebrow="Historien vår"
            title="En ung forening – med mye foran seg"
            intro="Historien vår har så vidt begynt. Her samler vi milepælene etter hvert."
          />
          <ol className="timeline">
            {timeline.map((item) => (
              <li key={`${item.date}-${item.title}`} className="timeline__item">
                <span className="timeline__year">{yearOf(item.date)}</span>
                <div className="timeline__card">
                  <time dateTime={item.date} className="timeline__date">
                    {formatShortDate(item.date)}
                  </time>
                  <h3 className="timeline__title">{item.title}</h3>
                  {item.description && <p>{item.description}</p>}
                </div>
              </li>
            ))}
            <li className="timeline__item timeline__item--future" aria-hidden="true">
              <span className="timeline__year">…</span>
            </li>
          </ol>
        </div>
      </section>

      {/* ---------- MEDLEMSKAP + GENERALFORSAMLING ---------- */}
      <section className="section section--alt" aria-label="Medlemskap og generalforsamling">
        <div className="container two-col">
          <Reveal className="info-panel">
            <span className="info-panel__icon" aria-hidden="true">
              <Users size={24} strokeWidth={1.8} />
            </span>
            <h2 className="info-panel__title">Medlemskap</h2>
            <p>
              The Solution er først og fremst for deg som studerer <strong>Bioteknologi og kjemi ved OsloMet</strong>.
              Alumni og andre som er interessert i foreningen kan også være med.
            </p>
            <p>Som medlem er du velkommen på arrangementene våre – og du kan være med å bestemme hvor foreningen skal.</p>
            <a href={bylawsUrl} target="_blank" rel="noopener noreferrer" className="text-link">
              Se de fullstendige reglene i vedtektene
              <ArrowRight size={16} aria-hidden="true" />
              <span className="visually-hidden"> (PDF, åpnes i ny fane)</span>
            </a>
          </Reveal>

          <Reveal className="info-panel" delay={80}>
            <span className="info-panel__icon" aria-hidden="true">
              <Vote size={24} strokeWidth={1.8} />
            </span>
            <h2 className="info-panel__title">Generalforsamling</h2>
            <p>
              <strong>Generalforsamlingen er The Solutions øverste organ.</strong> Den holdes minst én gang i året.
            </p>
            <p>
              Medlemmer har rett til å delta på foreningens arrangementer, stemme på generalforsamlingen og bli valgt til
              verv i foreningen, slik vedtektene beskriver.
            </p>
            <a href={bylawsUrl} target="_blank" rel="noopener noreferrer" className="text-link">
              Les mer i vedtektene
              <ArrowRight size={16} aria-hidden="true" />
              <span className="visually-hidden"> (PDF, åpnes i ny fane)</span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ---------- VEDTEKTER ---------- */}
      <section className="section" aria-labelledby="vedtekter">
        <div className="container">
          <div className="bylaws">
            <div className="bylaws__doc" aria-hidden="true">
              <FileText size={44} strokeWidth={1.4} />
              <span>PDF</span>
            </div>
            <div className="bylaws__text">
              <h2 id="vedtekter" className="bylaws__title">
                <Landmark size={22} aria-hidden="true" /> Vedtekter
              </h2>
              <p>
                Vedtektene er The Solutions øverste styringsdokument og beskriver blant annet foreningens formål,
                medlemskap, generalforsamling, valg, styrets ansvar og organisering.
              </p>
              <p className="bylaws__meta">
                <strong>Sist revidert:</strong> {siteConfig.bylawsLastRevised || "12.03.2026"}
              </p>
            </div>
            <Button href={bylawsUrl} newTab variant="primary" size="lg" icon={BookOpen} iconPosition="start">
              Les vedtektene
            </Button>
            <BondDivider className="bylaws__bond" />
          </div>
        </div>
      </section>
    </>
  );
}
