import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, CalendarDays, Handshake, Mail, MessageSquareQuote } from "lucide-react";
import Button from "../components/Button.jsx";
import EmptyState from "../components/EmptyState.jsx";
import EventCard from "../components/EventCard.jsx";
import JobCard from "../components/JobCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Paragraphs from "../components/Paragraphs.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { HexPattern } from "../components/ScienceArt.jsx";
import { industry } from "../data/industry.js";
import { assetUrl } from "../lib/assets.js";
import { isFilled } from "../lib/config.js";
import { cooperation, getIndustryEmail } from "../lib/contact.js";
import { getUpcomingEvents } from "../lib/events.js";
import { getInterviews, getOpenJobs } from "../lib/industry.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

/** /bedrift – the association's contact with industry: jobs, company events, interviews, cooperation. */
export default function Industry() {
  usePageTitle("Bedrift");
  const jobs = getOpenJobs();
  const interviews = getInterviews();
  const companyEvents = getUpcomingEvents().filter((e) => e.category === "Bedrift");
  const email = getIndustryEmail();

  const cards = [
    {
      to: "/bedrift/jobber",
      Icon: Briefcase,
      title: "Ledige stillinger",
      text: "Stillinger innen bioteknologi, analytisk kjemi og prosessteknologi for deg med bachelor.",
      count: jobs.length,
      unit: jobs.length === 1 ? "ledig stilling" : "ledige stillinger",
    },
    {
      to: "#bedriftsarrangementer",
      Icon: CalendarDays,
      title: "Bedriftsarrangementer",
      text: "Bedriftspresentasjoner, bedriftsbesøk og seminarer.",
      count: companyEvents.length,
      unit: "kommende",
    },
    {
      to: "/bedrift/intervjuer",
      Icon: MessageSquareQuote,
      title: "Intervjuer",
      text: "Møt tidligere studenter og hør hvor utdanningen tok dem.",
      count: interviews.length,
      unit: interviews.length === 1 ? "intervju" : "intervjuer",
    },
    {
      to: "#samarbeid",
      Icon: Handshake,
      title: "For bedrifter",
      text: "Vil dere møte studentene våre? Slik kan vi samarbeide.",
    },
  ];

  const scrollTo = (e, hash) => {
    e.preventDefault();
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <PageHeader eyebrow="Bedrift" title={industry.title || "The Solution og næringslivet"} intro={industry.lead} />

      {/* ---------- Overview cards ---------- */}
      <section className="section" aria-label="Snarveier">
        <div className="container">
          <ul className="industry-cards">
            {cards.map(({ to, Icon, title, text, count, unit }, i) => {
              const inner = (
                <>
                  <span className="industry-card__icon" aria-hidden="true">
                    <Icon size={24} strokeWidth={1.8} />
                  </span>
                  <h2 className="industry-card__title">{title}</h2>
                  <p className="industry-card__text">{text}</p>
                  <span className="industry-card__foot">
                    {count !== undefined && (
                      <span className="industry-card__count">
                        <strong>{count}</strong> {unit}
                      </span>
                    )}
                    <ArrowRight size={18} aria-hidden="true" className="industry-card__arrow" />
                  </span>
                </>
              );
              return (
                <Reveal as="li" key={title} delay={i * 70}>
                  {to.startsWith("#") ? (
                    <a href={to} className="industry-card" onClick={(e) => scrollTo(e, to)}>
                      {inner}
                    </a>
                  ) : (
                    <Link to={to} className="industry-card">
                      {inner}
                    </Link>
                  )}
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------- About ---------- */}
      <section className="section section--alt" aria-labelledby="industri-om">
        <div className="container industry-about">
          <div>
            <SectionHeading id="industri-om" eyebrow="Industrikontakt" title={industry.aboutTitle || "Studentene og arbeidslivet"} />
            <div className="prose">
              <Paragraphs text={industry.aboutText} />
            </div>
          </div>
          <div className="industry-about__media">
            {isFilled(industry.image) ? (
              <img src={assetUrl(industry.image)} alt="" loading="lazy" />
            ) : (
              <div className="industry-about__art" aria-hidden="true">
                <HexPattern opacity={0.3} size={52} />
                <Briefcase size={64} strokeWidth={1.3} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Newest jobs ---------- */}
      {jobs.length > 0 && (
        <section className="section" aria-labelledby="industri-jobber">
          <div className="container">
            <div className="section-row">
              <SectionHeading id="industri-jobber" eyebrow="Jobb" title="Ledige stillinger" />
              <Button to="/bedrift/jobber" variant="ghost" icon={ArrowRight} className="section-row__link">
                Se alle stillinger
              </Button>
            </div>
            <ul className="job-list">
              {jobs.slice(0, 3).map((job) => (
                <li key={job.slug}>
                  <JobCard job={job} compact />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------- Company events ---------- */}
      <section className={`section ${jobs.length > 0 ? "section--alt" : ""}`} aria-labelledby="bedriftsarrangementer-tittel" id="bedriftsarrangementer">
        <div className="container">
          <div className="section-row">
            <SectionHeading id="bedriftsarrangementer-tittel" eyebrow="Arrangementer" title="Kommende bedriftsarrangementer" />
            <Button to="/arrangementer" variant="ghost" icon={ArrowRight} className="section-row__link">
              Alle arrangementer
            </Button>
          </div>
          {companyEvents.length > 0 ? (
            <ul className="event-grid">
              {companyEvents.map((event, i) => (
                <Reveal as="li" key={event.slug} delay={(i % 3) * 80}>
                  <EventCard event={event} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Ingen bedriftsarrangementer akkurat nå"
              text="Nye bedriftspresentasjoner og bedriftsbesøk legges ut her og under Arrangementer."
            />
          )}
        </div>
      </section>

      {/* ---------- Cooperation ---------- */}
      <section className="section" aria-labelledby="samarbeid-tittel" id="samarbeid">
        <div className="container">
          <div className="contact-card contact-card--industry industry-contact">
            <span className="contact-card__icon" aria-hidden="true">
              <Handshake size={26} strokeWidth={1.8} />
            </span>
            <p className="contact-card__kicker">For bedrifter</p>
            <h2 className="contact-card__title" id="samarbeid-tittel">
              Vil dere samarbeide med oss?
            </h2>
            <p>{industry.contactText}</p>
            <ul className="coop-list coop-list--wide" aria-label="Mulige samarbeidsformer">
              {cooperation.map(({ label, Icon }) => (
                <li key={label}>
                  {email ? (
                    <a href={`mailto:${email}?subject=${encodeURIComponent(`Samarbeid: ${label}`)}`} className="coop-list__item">
                      <Icon size={18} aria-hidden="true" />
                      <span>{label}</span>
                      <span className="visually-hidden"> – send e-post til Industriansvarlig</span>
                      <Mail size={16} aria-hidden="true" className="coop-list__mail" />
                    </a>
                  ) : (
                    <span className="coop-list__item">
                      <Icon size={18} aria-hidden="true" />
                      <span>{label}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {email && <p className="coop-list__hint">Trykk på det dere er interessert i, så åpnes en e-post med riktig emne.</p>}
            <div className="industry-contact__actions">
              {email && (
                <a href={`mailto:${email}?subject=${encodeURIComponent("Samarbeid med The Solution")}`} className="btn btn--accent btn--lg">
                  <Mail size={18} aria-hidden="true" />
                  <span>Ta kontakt med Industriansvarlig</span>
                </a>
              )}
              <Button to="/kontakt" variant="inverse" size="lg">
                Til kontaktsiden
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
