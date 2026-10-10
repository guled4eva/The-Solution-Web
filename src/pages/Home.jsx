import { ArrowRight, Briefcase, FlaskConical, Lightbulb, Users } from "lucide-react";
import Button from "../components/Button.jsx";
import EventCard from "../components/EventCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Logo from "../components/Logo.jsx";
import Paragraphs from "../components/Paragraphs.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { BondDivider, HexPattern, MoleculeHero } from "../components/ScienceArt.jsx";
import { siteConfig } from "../data/siteConfig.js";
import { texts } from "../data/texts.js";
import { getUpcomingEvents } from "../lib/events.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

const pillars = [
  {
    title: "Faglig",
    text: "Faglige arrangementer, seminarer og aktiviteter som gir deg mer enn det du får i forelesningssalen.",
    Icon: FlaskConical,
    tone: "faglig",
  },
  {
    title: "Sosialt",
    text: "Arrangementer og møteplasser som gjør det lettere å bli kjent med andre på studiet.",
    Icon: Users,
    tone: "sosialt",
  },
  {
    title: "Næringsliv",
    text: "Vi bygger broer mellom studentene og arbeidslivet gjennom bedriftspresentasjoner, stands, seminarer og bedriftsbesøk.",
    Icon: Briefcase,
    tone: "bedrift",
  },
];

export default function Home() {
  usePageTitle();
  const upcoming = getUpcomingEvents().slice(0, 3);
  const taglineWords = siteConfig.tagline.split(/\s+/).filter(Boolean);
  const stats = Array.isArray(siteConfig.stats) ? siteConfig.stats.filter((s) => s && s.value && s.label) : [];

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="hero" aria-labelledby="hero-title">
        <HexPattern className="hero__pattern" opacity={0.35} size={72} />
        <div className="hero__glow" aria-hidden="true" />
        <div className="container hero__inner">
          <div className="hero__text">
            <p className="hero__kicker">
              Linjeforeningen for {siteConfig.programme} ved {siteConfig.university}
            </p>
            <h1 id="hero-title" className="hero__title">
              The <span className="hero__title-break">Solution</span>
            </h1>
            <p className="hero__tagline" aria-label={siteConfig.tagline}>
              {taglineWords.map((word, i) => (
                <span key={i} className="hero__tagline-word" aria-hidden="true">
                  {word}
                </span>
              ))}
            </p>
            <p className="hero__lead">
              {texts.heroLead ||
                `The Solution skaper faglige og sosiale møteplasser for studenter ved ${siteConfig.programme} på ${siteConfig.university}.`}
            </p>
            <div className="hero__actions">
              <Button to="/arrangementer" variant="accent" size="lg" icon={ArrowRight}>
                Se arrangementer
              </Button>
              <Button to="/om-oss" variant="inverse" size="lg">
                Bli kjent med oss
              </Button>
            </div>
          </div>

          <div className="hero__art">
            <MoleculeHero>
              <Logo size={132} alt={`${siteConfig.associationName} logo`} className="hero__logo" />
            </MoleculeHero>
          </div>
        </div>
      </section>

      {/* ---------- INTRO / PILLARS ---------- */}
      <section className="section" aria-labelledby="intro-title">
        <div className="container">
          <div className="intro-split">
            <SectionHeading
              id="intro-title"
              eyebrow="Hva vi gjør"
              title="Mer enn bare forelesninger"
            />
            <div>
              <Paragraphs text={texts.introText} className="intro-split__text" />
            </div>
          </div>

          <ul className="pillar-grid">
            {pillars.map(({ title, text, Icon, tone }, i) => (
              <Reveal as="li" key={title} delay={i * 80} className={`pillar pillar--${tone}`}>
                <span className="pillar__icon" aria-hidden="true">
                  <Icon size={26} strokeWidth={1.8} />
                </span>
                <h3 className="pillar__title">{title}</h3>
                <p className="pillar__text">{text}</p>
                <span className="pillar__index" aria-hidden="true">
                  0{i + 1}
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- STATS (can be turned off under Innstillinger at /loggin) ---------- */}
      {siteConfig.showStats && stats.length > 0 && (
        <section className="stats" aria-label="The Solution i tall">
          <div className="container">
            <dl className="stats__list">
              {stats.map((s) => (
                <div key={s.label} className="stats__item">
                  <dt className="stats__label">{s.label}</dt>
                  <dd className={`stats__value ${s.value.length > 6 ? "stats__value--text" : ""}`}>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* ---------- UPCOMING EVENTS ---------- */}
      <section className="section section--alt" aria-labelledby="upcoming-title">
        <div className="container">
          <div className="section-row">
            <SectionHeading id="upcoming-title" eyebrow="Hva skjer?" title="Kommende arrangementer" />
            {upcoming.length > 0 && (
              <Button to="/arrangementer" variant="ghost" icon={ArrowRight} className="section-row__link">
                Se alle arrangementer
              </Button>
            )}
          </div>

          {upcoming.length > 0 ? (
            <ul className="event-grid">
              {upcoming.map((event, i) => (
                <Reveal as="li" key={event.slug} delay={i * 80}>
                  <EventCard event={event} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Ingen kommende arrangementer akkurat nå"
              text="Følg med – nye arrangementer kommer snart!"
            >
              <Button to="/arrangementer" variant="secondary" icon={ArrowRight}>
                Se tidligere arrangementer
              </Button>
            </EmptyState>
          )}
        </div>
      </section>

      {/* ---------- SUGGESTION CTA ---------- */}
      <section className="section" aria-labelledby="cta-title">
        <div className="container">
          <Reveal className="cta-band">
            <div className="cta-band__icon" aria-hidden="true">
              <Lightbulb size={30} strokeWidth={1.8} />
            </div>
            <div className="cta-band__text">
              <h2 id="cta-title" className="cta-band__title">
                Har du en idé? Vi vil høre den.
              </h2>
              <p>Forslag til arrangementer, ting styret bør jobbe med, eller noe som kan gjøre studiehverdagen bedre.</p>
            </div>
            <Button to="/forslagsboksen" variant="primary" icon={ArrowRight}>
              Til Forslagsboksen
            </Button>
            <BondDivider className="cta-band__bond" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
