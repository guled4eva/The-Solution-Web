/* global __ADMIN_HASH__ */
import { useState } from "react";
import { CalendarDays, ExternalLink, KeyRound, LogOut, Mail } from "lucide-react";
import FormStatus from "../components/FormStatus.jsx";
import { siteConfig } from "../data/siteConfig.js";
import { allEvents } from "../lib/events.js";
import { formatDeadline, formatLongDate, formatShortDate, isPast, isUpcomingDate, parseLocalDate } from "../lib/dates.js";
import { isValidFormspreeEndpoint } from "../lib/config.js";

/**
 * Simple /admin used while no Google Apps Script is set up.
 * Login: e-mail + password from Tina (Innstillinger). Only a SHA-256 hash is in the code.
 * NB: a simple lock – the password is stored in plain text in the public GitHub repo.
 * Behind it: one card per event with on-site sign-up, linking to Gmail and Formspree.
 */
const SESSION_KEY = "ts-admin-ok";
const ADMIN_HASH = typeof __ADMIN_HASH__ === "string" ? __ADMIN_HASH__ : "";

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function isLoggedIn() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === ADMIN_HASH && Boolean(ADMIN_HASH);
  } catch {
    return false;
  }
}

/** Gmail search for the sign-up e-mails of one event (subject set by the sign-up form). */
function gmailSearchUrl(event) {
  const query = `subject:"Påmelding: ${event.title} (${formatShortDate(event.date)})"`;
  return `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(query)}`;
}

function formspreeUrl() {
  const endpoint = siteConfig.formspreeRegistrationEndpoint;
  if (!isValidFormspreeEndpoint(endpoint)) return "https://formspree.io/forms";
  const id = endpoint.trim().replace(/\/$/, "").split("/").pop();
  return `https://formspree.io/forms/${id}/submissions`;
}

export default function SimpleAdmin() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!ADMIN_HASH) {
      setError("Innlogging er ikke satt opp. Legg inn e-post og passord på /loggin under Innstillinger.");
      return;
    }
    setChecking(true);
    const hash = await sha256(`${email.trim().toLowerCase()}:${password}`);
    setChecking(false);
    if (hash === ADMIN_HASH) {
      try {
        sessionStorage.setItem(SESSION_KEY, ADMIN_HASH);
      } catch {
        /* private mode – login just isn't remembered */
      }
      setLoggedIn(true);
      setError("");
    } else {
      setError("Feil e-post eller passord.");
    }
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setLoggedIn(false);
    setPassword("");
  };

  const events = allEvents
    .filter((ev) => ev.registrationOnSite)
    .sort((a, b) => {
      const ua = isUpcomingDate(a.date);
      const ub = isUpcomingDate(b.date);
      if (ua !== ub) return ua ? -1 : 1;
      const da = parseLocalDate(a.date)?.getTime() ?? 0;
      const db = parseLocalDate(b.date)?.getTime() ?? 0;
      return ua ? da - db : db - da;
    });

  return (
    <section className="section admin">
      <div className="container">
        <div className="admin__top">
          <div>
            <p className="eyebrow">
              <span className="eyebrow__dot" aria-hidden="true" />
              Bare for styret
            </p>
            <h1 className="admin__title">Påmeldinger</h1>
          </div>
          {loggedIn && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
              <LogOut size={16} aria-hidden="true" /> <span>Logg ut</span>
            </button>
          )}
        </div>

        {!loggedIn ? (
          <form className="admin-login form-card" onSubmit={handleLogin}>
            <span className="admin-login__icon" aria-hidden="true">
              <KeyRound size={26} />
            </span>
            <div className="field">
              <label htmlFor="admin-email" className="field__label">
                E-post
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                className="field__control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="admin-password" className="field__label">
                Passord
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                className="field__control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby={error ? "admin-error" : undefined}
              />
            </div>
            {error && (
              <p id="admin-error" className="field__error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn--primary btn--lg" disabled={checking || !email || !password}>
              <span>Logg inn</span>
            </button>
          </form>
        ) : (
          <>
            <FormStatus type="info" title="Slik ser dere påmeldingene">
              <p>
                Påmeldingene kommer på e-post til {siteConfig.email || "foreningens e-post"} og ligger også hos Formspree.
                Trykk på knappene under for å se påmeldingene til hvert arrangement – antallet treff i Gmail er antall
                påmeldte.
              </p>
            </FormStatus>

            <div className="admin-simple-list">
              {events.length === 0 ? (
                <p className="admin-empty">
                  Ingen arrangementer har påmelding på nettsiden ennå. Slå på «Påmelding på nettsiden» for et arrangement
                  på /loggin.
                </p>
              ) : (
                events.map((ev) => {
                  const closed = ev.registrationDeadline ? isPast(ev.registrationDeadline) : !isUpcomingDate(ev.date);
                  return (
                    <article key={ev.slug} className="admin-event admin-event--simple">
                      <div>
                        <h2 className="admin-event__title">{ev.title}</h2>
                        <p className="admin-event__meta">
                          <CalendarDays size={14} aria-hidden="true" /> {formatLongDate(ev.date)}
                          {" · "}
                          <span className={`admin-pill ${closed ? "admin-pill--closed" : "admin-pill--open"}`}>
                            {closed
                              ? "Påmelding stengt"
                              : ev.registrationDeadline
                                ? `Åpen til ${formatDeadline(ev.registrationDeadline)}`
                                : "Åpen"}
                          </span>
                        </p>
                      </div>
                      <div className="admin-event__actions">
                        <a href={gmailSearchUrl(ev)} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--sm">
                          <Mail size={16} aria-hidden="true" /> <span>Se i Gmail</span>
                        </a>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            <p className="admin__note">
              <a href={formspreeUrl()} target="_blank" rel="noopener noreferrer" className="text-link">
                Alle påmeldinger hos Formspree <ExternalLink size={14} aria-hidden="true" />
              </a>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
