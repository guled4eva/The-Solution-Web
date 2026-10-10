import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Download, KeyRound, Loader2, LogOut, RefreshCw, Trash2, Users } from "lucide-react";
import FormStatus from "../components/FormStatus.jsx";
import { siteConfig } from "../data/siteConfig.js";
import { allEvents } from "../lib/events.js";
import { formatDeadline, formatLongDate, isPast, parseLocalDate } from "../lib/dates.js";
import { isFilled } from "../lib/config.js";
import { DIET_OPTIONS, callScript, dietText, isValidScriptUrl } from "../lib/registrations.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import SimpleAdmin from "./SimpleAdmin.jsx";

const SESSION_KEY = "ts-admin-password";

const errorTexts = {
  unauthorized: "Feil passord.",
  "too-many-attempts": "For mange feil forsøk. Vent 10 minutter og prøv igjen.",
  "no-password-configured": "Passordet er ikke satt i Google Apps Script ennå (ADMIN_PASSWORD). Se README.",
  network: "Fikk ikke kontakt med Google. Sjekk internettforbindelsen.",
};

function readSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) || "";
  } catch {
    return "";
  }
}
function writeSession(value) {
  try {
    if (value) sessionStorage.setItem(SESSION_KEY, value);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* private mode – password just isn't remembered */
  }
}

/** Keeps search engines away from the admin page. */
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}

function toCsv(rows) {
  const header = ["Navn", "E-post", "Halal", "Vegansk", "Nøtteallergi", "Annet", "Annet (tekst)", "Påmeldt"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [r.name, r.email, r.halal ? "Ja" : "", r.vegan ? "Ja" : "", r.nuts ? "Ja" : "", r.other ? "Ja" : "", r.otherText, formatTimestamp(r.timestamp)]
      .map(esc)
      .join(";")
  );
  return "﻿" + [header.map(esc).join(";"), ...lines].join("\r\n");
}

function formatTimestamp(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("nb-NO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/** Groups registrations by event and adds events with on-site sign-up but no registrations yet. */
function groupByEvent(registrations) {
  const groups = new Map();
  allEvents
    .filter((e) => e.registrationOnSite)
    .forEach((e) => groups.set(e.slug, { slug: e.slug, event: e, title: e.title, rows: [] }));
  registrations.forEach((r) => {
    if (!groups.has(r.eventSlug)) {
      const event = allEvents.find((e) => e.slug === r.eventSlug);
      groups.set(r.eventSlug, { slug: r.eventSlug, event, title: event?.title || r.eventTitle, rows: [] });
    }
    groups.get(r.eventSlug).rows.push(r);
  });
  const dateOf = (g) => parseLocalDate(g.event?.date)?.getTime() ?? 0;
  const now = Date.now();
  // Upcoming first (soonest first), then past (newest first)
  return [...groups.values()].sort((a, b) => {
    const da = dateOf(a);
    const db = dateOf(b);
    const pa = da < now;
    const pb = db < now;
    if (pa !== pb) return pa ? 1 : -1;
    return pa ? db - da : da - db;
  });
}

function EventGroup({ group, onDelete, deleting }) {
  const { rows, event } = group;
  const counts = Object.fromEntries(DIET_OPTIONS.map((o) => [o.key, rows.filter((r) => r[o.key]).length]));
  const others = rows.filter((r) => r.other && r.otherText);
  const deadline = event?.registrationDeadline;
  const closed = deadline ? isPast(deadline) : false;
  const [copied, setCopied] = useState(false);

  const download = () => {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pamelding-${group.slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyEmails = async () => {
    try {
      await navigator.clipboard.writeText(rows.map((r) => r.email).join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <section className="admin-event" aria-labelledby={`admin-${group.slug}`}>
      <header className="admin-event__head">
        <div>
          <h2 id={`admin-${group.slug}`} className="admin-event__title">
            {group.title}
          </h2>
          <p className="admin-event__meta">
            {event?.date ? formatLongDate(event.date) : "Arrangementet finnes ikke lenger på nettsiden"}
            {deadline && (
              <>
                {" · "}
                <span className={`admin-pill ${closed ? "admin-pill--closed" : "admin-pill--open"}`}>
                  {closed ? "Påmelding stengt" : `Åpen til ${formatDeadline(deadline)}`}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="admin-event__actions">
          <button type="button" className="btn btn--secondary btn--sm" onClick={download} disabled={!rows.length}>
            <Download size={16} aria-hidden="true" /> <span>CSV</span>
          </button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={copyEmails} disabled={!rows.length}>
            <Copy size={16} aria-hidden="true" /> <span>{copied ? "Kopiert!" : "Kopier e-poster"}</span>
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm admin-event__delete"
            onClick={() => onDelete(group)}
            disabled={!rows.length || deleting}
          >
            <Trash2 size={16} aria-hidden="true" /> <span>Slett påmeldinger</span>
          </button>
        </div>
      </header>

      <dl className="admin-stats">
        <div className="admin-stat admin-stat--total">
          <dt>Påmeldte</dt>
          <dd>{rows.length}</dd>
        </div>
        {DIET_OPTIONS.map((o) => (
          <div key={o.key} className="admin-stat">
            <dt>{o.label}</dt>
            <dd>{counts[o.key]}</dd>
          </div>
        ))}
      </dl>

      {others.length > 0 && (
        <div className="admin-others">
          <h3>«Annet»</h3>
          <ul>
            {others.map((r) => (
              <li key={r.id || r.timestamp}>
                <strong>{r.name}:</strong> {r.otherText}
              </li>
            ))}
          </ul>
        </div>
      )}

      {rows.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Navn</th>
                <th scope="col">E-post</th>
                <th scope="col">Mat og allergier</th>
                <th scope="col">Påmeldt</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id || `${r.timestamp}-${i}`}>
                  <td>{i + 1}</td>
                  <td>{r.name}</td>
                  <td>
                    <a href={`mailto:${r.email}`}>{r.email}</a>
                  </td>
                  <td>{dietText(r) || "–"}</td>
                  <td>{formatTimestamp(r.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="admin-empty">Ingen påmeldinger ennå.</p>
      )}
    </section>
  );
}

/** /admin: full overview with Google Apps Script, otherwise the simple e-mail/password version. */
export default function Admin() {
  usePageTitle("Admin – påmeldinger");
  useNoIndex();
  return isValidScriptUrl(siteConfig.registrationScriptUrl) ? <ScriptAdmin /> : <SimpleAdmin />;
}

function ScriptAdmin() {
  const scriptUrl = siteConfig.registrationScriptUrl;
  const configured = isValidScriptUrl(scriptUrl);

  const [password, setPassword] = useState(readSession);
  const [input, setInput] = useState("");
  const [registrations, setRegistrations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(
    async (pw) => {
      if (!configured || !pw) return;
      setLoading(true);
      setError("");
      const res = await callScript(scriptUrl, { action: "list", password: pw });
      setLoading(false);
      if (res?.ok) {
        setRegistrations(Array.isArray(res.registrations) ? res.registrations : []);
        setPassword(pw);
        writeSession(pw);
        setUpdatedAt(new Date());
      } else {
        const code = res?.error || "server-error";
        setError(errorTexts[code] || "Noe gikk galt. Prøv igjen.");
        if (code === "unauthorized" || code === "too-many-attempts") {
          setPassword("");
          writeSession("");
          setRegistrations(null);
        }
      }
    },
    [configured, scriptUrl]
  );

  useEffect(() => {
    if (password) load(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = useMemo(() => (registrations ? groupByEvent(registrations) : []), [registrations]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (input.trim()) load(input.trim());
  };

  const logout = () => {
    writeSession("");
    setPassword("");
    setRegistrations(null);
    setInput("");
  };

  const handleDelete = async (group) => {
    const ok = window.confirm(
      `Slette alle ${group.rows.length} påmeldinger til «${group.title}»?\n\nDette kan ikke angres. Last gjerne ned CSV først.`
    );
    if (!ok) return;
    setDeleting(true);
    const res = await callScript(scriptUrl, { action: "delete-event", password, eventSlug: group.slug });
    setDeleting(false);
    if (res?.ok) load(password);
    else setError(errorTexts[res?.error] || "Kunne ikke slette. Prøv igjen.");
  };

  const loggedIn = registrations !== null;

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
            <div className="admin__toolbar">
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => load(password)} disabled={loading}>
                {loading ? <Loader2 size={16} className="spin" aria-hidden="true" /> : <RefreshCw size={16} aria-hidden="true" />}
                <span>Oppdater</span>
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
                <LogOut size={16} aria-hidden="true" /> <span>Logg ut</span>
              </button>
            </div>
          )}
        </div>

        {!configured ? (
          <FormStatus type="info" title="Påmeldingsoversikten er ikke satt opp ennå">
            <p>
              Legg inn adressen til Google Apps Script på <code>/loggin</code> under Innstillinger → «Påmelding – Google
              Apps Script-adresse». Fremgangsmåten står i README.md, under «Påmelding og /admin».
            </p>
          </FormStatus>
        ) : !loggedIn ? (
          <form className="admin-login form-card" onSubmit={handleLogin}>
            <span className="admin-login__icon" aria-hidden="true">
              <KeyRound size={26} />
            </span>
            <div className="field">
              <label htmlFor="admin-password" className="field__label">
                Passord
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                className="field__control"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-describedby={error ? "admin-error" : undefined}
              />
            </div>
            {error && (
              <p id="admin-error" className="field__error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn--primary btn--lg" disabled={loading || !input.trim()}>
              {loading ? <Loader2 size={18} className="spin" aria-hidden="true" /> : null}
              <span>{loading ? "Logger inn …" : "Logg inn"}</span>
            </button>
          </form>
        ) : (
          <>
            {error && (
              <FormStatus type="error" title="Noe gikk galt">
                <p>{error}</p>
              </FormStatus>
            )}
            <p className="admin__updated">
              <Users size={16} aria-hidden="true" /> {registrations.length} påmeldinger totalt
              {updatedAt && ` · oppdatert ${updatedAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`}
            </p>
            {groups.length === 0 ? (
              <p className="admin-empty">
                Ingen arrangementer med påmelding på nettsiden ennå. Slå på «Påmelding på nettsiden» for et arrangement
                på /loggin.
              </p>
            ) : (
              groups.map((g) => <EventGroup key={g.slug} group={g} onDelete={handleDelete} deleting={deleting} />)
            )}
            {isFilled(siteConfig.email) && (
              <p className="admin__note">
                Når påmeldingsfristen har gått ut, sendes en oppsummering automatisk på e-post.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
