import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Inbox, Lightbulb, Loader2, Mail, MessageCircle, Trash2 } from "lucide-react";
import FormStatus from "../components/FormStatus.jsx";
import { callScript } from "../lib/registrations.js";

/*
 * /admin?vis=forslag – messages from Forslagsboksen and the contact form.
 * Stored in the "Forslag" tab of the Google Sheet by the Apps Script.
 */

const FILTERS = [
  { key: "alle", label: "Alle" },
  { key: "uleste", label: "Uleste" },
  { key: "forslag", label: "Forslag" },
  { key: "kontakt", label: "Kontaktskjema" },
];

function when(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("nb-NO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminMessages({ scriptUrl, password, errorTexts, reloadKey, onUnread }) {
  const [messages, setMessages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("alle");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await callScript(scriptUrl, { action: "messages-list", password });
    setLoading(false);
    if (res?.ok && Array.isArray(res.messages)) setMessages(res.messages);
    else if (res?.error === "unknown-action")
      setError("Google-skriptet er ikke oppdatert ennå. Lim inn den nye koden og lag en ny versjon (Deploy → Manage deployments).");
    else setError(errorTexts[res?.error] || "Kunne ikke hente meldingene.");
  }, [scriptUrl, password, errorTexts]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const unread = messages ? messages.filter((m) => !m.read).length : 0;
  useEffect(() => {
    if (messages) onUnread?.(unread);
  }, [messages, unread, onUnread]);

  const shown = useMemo(() => {
    if (!messages) return [];
    if (filter === "uleste") return messages.filter((m) => !m.read);
    if (filter === "forslag" || filter === "kontakt") return messages.filter((m) => m.kind === filter);
    return messages;
  }, [messages, filter]);

  const setRead = async (m, read) => {
    setBusy(m.id);
    const res = await callScript(scriptUrl, { action: "message-update", password, id: m.id, read });
    setBusy("");
    if (res?.ok) setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, read } : x)));
    else setError(errorTexts[res?.error] || "Kunne ikke oppdatere meldingen.");
  };

  const remove = async (m) => {
    if (!window.confirm("Slette meldingen? Dette kan ikke angres.")) return;
    setBusy(m.id);
    const res = await callScript(scriptUrl, { action: "message-delete", password, id: m.id });
    setBusy("");
    if (res?.ok) setMessages((list) => list.filter((x) => x.id !== m.id));
    else setError(errorTexts[res?.error] || "Kunne ikke slette meldingen.");
  };

  const count = (key) =>
    !messages
      ? 0
      : key === "alle"
        ? messages.length
        : key === "uleste"
          ? unread
          : messages.filter((m) => m.kind === key).length;

  return (
    <section className="admin-visits" aria-labelledby="messages-title">
      <div className="admin-visits__head">
        <h2 id="messages-title" className="admin-event__title">
          Forslag og meldinger
        </h2>
        <div className="segmented" role="group" aria-label="Vis">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`segmented__btn ${filter === f.key ? "is-active" : ""}`}
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label} ({count(f.key)})
            </button>
          ))}
        </div>
      </div>

      {error && (
        <FormStatus type="error" title="Noe gikk galt">
          <p>{error}</p>
        </FormStatus>
      )}

      {!messages && loading && (
        <p className="admin__updated">
          <Loader2 size={16} className="spin" aria-hidden="true" /> Henter meldinger …
        </p>
      )}

      {messages && shown.length === 0 && (
        <p className="admin-empty">
          <Inbox size={18} aria-hidden="true" /> {filter === "uleste" ? "Ingen uleste meldinger." : "Ingen meldinger her ennå."}
        </p>
      )}

      {shown.length > 0 && (
        <ul className="msg-list">
          {shown.map((m) => {
            const KindIcon = m.kind === "forslag" ? Lightbulb : MessageCircle;
            const from = m.anonymous ? "Anonym" : m.name || (m.email ? "" : "Ikke oppgitt navn");
            return (
              <li key={m.id} className={`msg ${m.read ? "is-read" : ""}`}>
                <div className="msg__head">
                  <span className={`msg__kind msg__kind--${m.kind}`}>
                    <KindIcon size={14} aria-hidden="true" /> {m.kind === "forslag" ? "Forslag" : "Kontaktskjema"}
                  </span>
                  {!m.read && <span className="msg__new">Ny</span>}
                  <span className="msg__date">{when(m.timestamp)}</span>
                </div>
                {m.subject && <h3 className="msg__subject">{m.subject}</h3>}
                <p className="msg__text">{m.message}</p>
                <div className="msg__foot">
                  <span className="msg__from">
                    {from}
                    {m.email && !m.anonymous && (
                      <>
                        {from ? " · " : ""}
                        <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Sv: ${m.subject || "Melding til The Solution"}`)}`}>
                          <Mail size={14} aria-hidden="true" /> {m.email}
                        </a>
                      </>
                    )}
                  </span>
                  <span className="msg__actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setRead(m, !m.read)} disabled={busy === m.id}>
                      {busy === m.id ? <Loader2 size={16} className="spin" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
                      <span>{m.read ? "Marker som ulest" : "Marker som lest"}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm admin-event__delete"
                      onClick={() => remove(m)}
                      disabled={busy === m.id}
                    >
                      <Trash2 size={16} aria-hidden="true" /> <span>Slett</span>
                    </button>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="admin__note">Meldingene lagres i fanen «Forslag» i regnearket. Anonyme forslag har verken navn eller e-post.</p>
    </section>
  );
}
