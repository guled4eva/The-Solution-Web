import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ArrowDown, ArrowLeft, CalendarDays, Clock, ExternalLink, MapPin, Timer } from "lucide-react";
import Button from "../components/Button.jsx";
import CategoryBadge from "../components/CategoryBadge.jsx";
import EventImage from "../components/EventImage.jsx";
import RegistrationForm from "../components/RegistrationForm.jsx";
import NotFound from "./NotFound.jsx";
import { getEventBySlug, getRegistration } from "../lib/events.js";
import { formatDeadline, formatLongDate } from "../lib/dates.js";
import { isFilled } from "../lib/config.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

export default function EventDetails() {
  const { slug } = useParams();
  const event = getEventBySlug(slug);
  const { hash } = useLocation();
  usePageTitle(event ? event.title : "Fant ikke arrangementet");

  // Coming from a "Meld deg på" button on an event card: jump to the form.
  useEffect(() => {
    if (hash !== "#pamelding") return undefined;
    const timer = setTimeout(() => document.getElementById("pamelding")?.scrollIntoView({ block: "start" }), 50);
    return () => clearTimeout(timer);
  }, [hash, slug]);

  if (!event) return <NotFound />;

  const registration = getRegistration(event);
  const { upcoming, hasDeadline, deadlinePassed } = registration;
  const scrollToForm = (e) => {
    e.preventDefault();
    const form = document.getElementById("pamelding");
    form?.scrollIntoView({ behavior: "smooth", block: "start" });
    form?.querySelector("input")?.focus({ preventScroll: true });
  };
  const paragraphs = String(event.fullDescription || event.description || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="event-detail">
      <div className="event-detail__top">
        <div className="container">
          <Button to="/arrangementer" variant="ghost" icon={ArrowLeft} iconPosition="start" className="event-detail__back">
            Tilbake til arrangementer
          </Button>
        </div>
      </div>

      <div className="container event-detail__layout">
        <div className="event-detail__main">
          <div className="event-detail__tags">
            <CategoryBadge category={event.category} />
            {!upcoming && <span className="badge badge--muted">Tidligere arrangement</span>}
            {event.placeholder && <span className="badge badge--example">Eksempel</span>}
          </div>
          <h1 className="event-detail__title">{event.title}</h1>

          <div className="event-detail__image">
            <EventImage event={event} large />
          </div>

          <div className="prose prose--lines">
            {paragraphs.length > 0 ? paragraphs.map((p, i) => <p key={i}>{p}</p>) : <p>Mer informasjon kommer.</p>}
          </div>

          {registration.mode === "onsite" && registration.open && (
            <section id="pamelding" className="registration" aria-labelledby="pamelding-tittel">
              <h2 id="pamelding-tittel" className="registration__title">
                Meld deg på
              </h2>
              {hasDeadline && (
                <p className="registration__deadline">
                  Påmeldingsfrist: {formatDeadline(event.registrationDeadline)}
                </p>
              )}
              <RegistrationForm event={event} />
            </section>
          )}
        </div>

        <aside className="event-detail__aside" aria-label="Praktisk informasjon">
          <div className="info-card">
            <h2 className="info-card__title">Praktisk info</h2>
            <dl className="info-list">
              <div>
                <dt>
                  <CalendarDays size={18} aria-hidden="true" /> Dato
                </dt>
                <dd>
                  <time dateTime={event.date}>{formatLongDate(event.date)}</time>
                </dd>
              </div>
              {isFilled(event.time) && (
                <div>
                  <dt>
                    <Clock size={18} aria-hidden="true" /> Tid
                  </dt>
                  <dd>{event.time}</dd>
                </div>
              )}
              {isFilled(event.location) && (
                <div>
                  <dt>
                    <MapPin size={18} aria-hidden="true" /> Sted
                  </dt>
                  <dd>{event.location}</dd>
                </div>
              )}
              {hasDeadline && (
                <div>
                  <dt>
                    <Timer size={18} aria-hidden="true" /> Påmeldingsfrist
                  </dt>
                  <dd>
                    {formatDeadline(event.registrationDeadline)}
                    {deadlinePassed && upcoming && <span className="info-list__note"> – fristen har gått ut</span>}
                  </dd>
                </div>
              )}
            </dl>

            {registration.open && registration.mode === "link" && (
              <Button href={event.registrationLink} newTab variant="accent" icon={ExternalLink} className="info-card__cta">
                Meld deg på
              </Button>
            )}
            {registration.open && registration.mode === "onsite" && (
              <a href="#pamelding" onClick={scrollToForm} className="btn btn--accent btn--md info-card__cta">
                <span>Meld deg på</span>
                <ArrowDown size={18} aria-hidden="true" className="btn__icon" />
              </a>
            )}
            {upcoming && !registration.mode && (
              <p className="info-card__hint">Ingen påmelding er nødvendig for dette arrangementet.</p>
            )}
            {upcoming && registration.mode && deadlinePassed && <p className="info-card__hint">Påmeldingen er stengt.</p>}
            {!upcoming && <p className="info-card__hint">Dette arrangementet har allerede funnet sted.</p>}
          </div>
        </aside>
      </div>
    </article>
  );
}
