import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ExternalLink,
  KeyRound,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import FormStatus from "../components/FormStatus.jsx";
import { siteConfig } from "../data/siteConfig.js";
import { callScript, isValidScriptUrl } from "../lib/registrations.js";
import { formatShortDate, isUpcomingDate, parseLocalDate } from "../lib/dates.js";
import { readAdminSession, writeAdminSession } from "../lib/adminSession.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { useNoIndex } from "../hooks/useNoIndex.js";
import { SECTIONS, slugify, validate } from "../editor/schema.js";
import { Fields } from "../editor/fields.jsx";
import { prepareUpload } from "../editor/upload.js";

/*
 * /loggin – the board's editing panel.
 * Login: the same password as /admin (ADMIN_PASSWORD in the Google Apps Script).
 * Files are read from and saved to GitHub by the Google Apps Script, which holds the
 * GitHub key. The website is rebuilt automatically after each save (1–2 minutes).
 */

const NEW = "__new__";

const errorTexts = {
  unauthorized: "Feil passord.",
  "too-many-attempts": "For mange feil forsøk. Vent 10 minutter og prøv igjen.",
  "no-password-configured": "Passordet er ikke satt i Google-skriptet ennå (ADMIN_PASSWORD).",
  "weak-password":
    "Passordet er for svakt til å kunne endre nettsiden. Bytt ADMIN_PASSWORD i Google-skriptet til et nytt passord på minst 12 tegn (Project Settings → Script Properties).",
  "no-github-token": "GitHub-nøkkelen mangler i Google-skriptet (GITHUB_TOKEN). Se README.md, «Redigering på /loggin».",
  "github-token-invalid": "GitHub-nøkkelen er ugyldig eller utløpt. Lag en ny og legg den inn som GITHUB_TOKEN (se README.md).",
  "github-no-access":
    "GitHub-nøkkelen har ikke lov til å endre nettsiden. Den må ha tilgang til The-Solution-Web med «Contents: Read and write».",
  conflict:
    "Noen har lagret en annen endring her i mellomtiden. Kopier gjerne teksten din, og trykk «Last inn på nytt».",
  "unknown-action": "Google-skriptet er ikke oppdatert. Lim inn den nye koden og lag en ny versjon (Deploy → Manage deployments).",
  "invalid-file-type": "Filtypen er ikke tillatt. Bruk JPG, PNG, WebP, GIF eller PDF.",
  "too-large": "Filen er for stor (maks 15 MB).",
  network: "Fikk ikke kontakt med Google. Sjekk internettforbindelsen.",
};
const errorText = (res) =>
  errorTexts[res?.error] || `Noe gikk galt. Prøv igjen.${res?.error ? ` (Feilkode: ${[res.error, res.detail].filter(Boolean).join(": ")})` : ""}`;

const eventPath = (slug) => `content/arrangementer/${slug}.json`;
const slugOf = (path) => path.split("/").pop().replace(/\.json$/, "");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function sortEvents(list) {
  return [...list].sort((a, b) => {
    const ua = isUpcomingDate(a.data.date);
    const ub = isUpcomingDate(b.data.date);
    if (ua !== ub) return ua ? -1 : 1;
    const da = parseLocalDate(a.data.date)?.getTime() || 0;
    const db = parseLocalDate(b.data.date)?.getTime() || 0;
    return ua ? da - db : db - da;
  });
}

export default function Editor() {
  usePageTitle("Rediger nettsiden");
  useNoIndex();
  if (!isValidScriptUrl(siteConfig.registrationScriptUrl)) {
    return (
      <section className="section admin">
        <div className="container">
          <h1 className="admin__title">Rediger nettsiden</h1>
          <FormStatus type="info" title="Google-skriptet er ikke satt opp">
            <p>Redigering krever Google Apps Script. Se README.md, «Redigering på /loggin».</p>
          </FormStatus>
        </div>
      </section>
    );
  }
  return <EditorApp />;
}

function EditorApp() {
  const params = useParams();
  const navigate = useNavigate();
  const scriptUrl = siteConfig.registrationScriptUrl;
  const [sectionKey = "arrangementer", itemSlug] = (params["*"] || "").split("/").filter(Boolean);
  const section = SECTIONS.find((s) => s.key === sectionKey) || SECTIONS[0];

  const [password, setPassword] = useState(readAdminSession);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState(null); // path → { sha, data }
  const [drafts, setDrafts] = useState({}); // path → data (unsaved)
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [message, setMessage] = useState(null); // { type, title, text }
  const [saving, setSaving] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [previews, setPreviews] = useState({});
  const messageRef = useRef(null);
  const keepMessage = useRef(false);

  const load = useCallback(
    async (pw) => {
      setLoading(true);
      setLoginError("");
      const res = await callScript(scriptUrl, { action: "content-load", password: pw });
      setLoading(false);
      if (res?.ok && Array.isArray(res.files)) {
        const next = {};
        res.files.forEach((f) => {
          try {
            next[f.path] = { sha: f.sha, data: JSON.parse(f.content) };
          } catch {
            /* skip broken file */
          }
        });
        setFiles(next);
        setPassword(pw);
        writeAdminSession(pw);
        return true;
      }
      if (res?.error === "unauthorized" || res?.error === "too-many-attempts") {
        writeAdminSession("");
        setPassword("");
        setFiles(null);
      }
      setLoginError(errorText(res));
      return false;
    },
    [scriptUrl]
  );

  useEffect(() => {
    if (password) load(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dirtyPaths = useMemo(() => Object.keys(drafts), [drafts]);
  useEffect(() => {
    if (!dirtyPaths.length) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirtyPaths.length]);

  useEffect(() => {
    if (message) messageRef.current?.focus();
  }, [message]);
  useEffect(() => {
    if (keepMessage.current) keepMessage.current = false;
    else setMessage(null);
  }, [sectionKey, itemSlug]);

  // ------- what is being edited right now -------
  const currentPath =
    section.kind === "single" ? section.path : itemSlug === "ny" ? NEW : itemSlug ? eventPath(itemSlug) : null;
  const saved = currentPath && currentPath !== NEW ? files?.[currentPath] : null;
  const data = currentPath ? drafts[currentPath] ?? saved?.data ?? (currentPath === NEW ? section.newItem() : null) : null;
  const dirty = currentPath ? currentPath in drafts : false;

  const change = (next) => {
    setDrafts((prev) => {
      const copy = { ...prev };
      if (currentPath !== NEW && saved && same(next, saved.data)) delete copy[currentPath];
      else copy[currentPath] = next;
      return copy;
    });
  };

  const discard = () => {
    if (!window.confirm("Forkaste endringene du ikke har lagret?")) return;
    setDrafts((prev) => {
      const copy = { ...prev };
      delete copy[currentPath];
      return copy;
    });
    if (currentPath === NEW) navigate("/loggin/arrangementer");
  };

  const handleScriptError = (res) => {
    if (res?.error === "unauthorized") {
      writeAdminSession("");
      setPassword("");
      setFiles(null);
      setLoginError("Passordet er endret. Logg inn på nytt.");
      return;
    }
    setMessage({ type: "error", title: "Ikke lagret", text: errorText(res) });
  };

  const upload = async (file, folder, isPdf) => {
    if (file.size > 15 * 1024 * 1024) return { ok: false, message: errorTexts["too-large"] };
    if (isPdf && !/\.pdf$/i.test(file.name)) return { ok: false, message: "Velg en PDF-fil." };
    let prepared;
    try {
      prepared = await prepareUpload(file);
    } catch {
      return { ok: false, message: "Kunne ikke lese filen." };
    }
    const res = await callScript(scriptUrl, { action: "upload", password, folder, name: prepared.name, data: prepared.dataUrl });
    if (!res?.ok) return { ok: false, message: errorText(res) };
    setPreviews((p) => ({ ...p, [res.url]: prepared.dataUrl }));
    return { ok: true, url: res.url };
  };

  const save = async () => {
    const problems = validate(section.fields, data);
    let path = currentPath;
    let slug = itemSlug;
    if (currentPath === NEW) {
      slug = slugify(newSlug || data.title);
      if (!slug) problems.push("Adresse");
      else if (files[eventPath(slug)]) {
        setMessage({
          type: "error",
          title: "Adressen er i bruk",
          text: `Det finnes allerede et arrangement med adressen /arrangementer/${slug}. Velg en annen adresse (f.eks. med årstall).`,
        });
        return;
      }
      path = eventPath(slug);
    }
    if (problems.length) {
      setMessage({ type: "error", title: "Fyll ut det som mangler", text: problems.join(", ") });
      return;
    }
    setSaving(true);
    const res = await callScript(scriptUrl, {
      action: "content-save",
      password,
      path,
      sha: saved?.sha || "",
      content: `${JSON.stringify(data, null, 2)}\n`,
    });
    setSaving(false);
    if (!res?.ok) return handleScriptError(res);
    setFiles((prev) => ({ ...prev, [path]: { sha: res.sha, data } }));
    setDrafts((prev) => {
      const copy = { ...prev };
      delete copy[currentPath];
      return copy;
    });
    setMessage({
      type: "success",
      title: "Lagret!",
      text: "Endringen vises på nettsiden om ca. 2 minutter. (Trykk Ctrl + Shift + R hvis du ikke ser den.)",
    });
    if (currentPath === NEW) {
      setNewSlug("");
      keepMessage.current = true;
      navigate(`/loggin/arrangementer/${slug}`, { replace: true });
    }
  };

  const remove = async () => {
    if (!saved) return;
    if (!window.confirm(`Slette «${data.title || itemSlug}» fra nettsiden?\n\nDette kan ikke angres her.`)) return;
    setSaving(true);
    const res = await callScript(scriptUrl, { action: "content-delete", password, path: currentPath, sha: saved.sha });
    setSaving(false);
    if (!res?.ok) return handleScriptError(res);
    setFiles((prev) => {
      const copy = { ...prev };
      delete copy[currentPath];
      return copy;
    });
    setDrafts((prev) => {
      const copy = { ...prev };
      delete copy[currentPath];
      return copy;
    });
    navigate("/loggin/arrangementer", { replace: true });
  };

  const reload = async () => {
    if (dirtyPaths.length && !window.confirm("Du har endringer som ikke er lagret. Last inn på nytt og forkaste dem?")) return;
    setDrafts({});
    setMessage(null);
    await load(password);
  };

  const logout = () => {
    if (dirtyPaths.length && !window.confirm("Du har endringer som ikke er lagret. Logge ut likevel?")) return;
    writeAdminSession("");
    setPassword("");
    setFiles(null);
    setDrafts({});
    setInput("");
  };

  // ------- login -------
  if (!files) {
    return (
      <section className="section admin">
        <div className="container">
          <div className="admin__top">
            <div>
              <p className="eyebrow">
                <span className="eyebrow__dot" aria-hidden="true" />
                Bare for styret
              </p>
              <h1 className="admin__title">Rediger nettsiden</h1>
            </div>
          </div>
          {password && loading ? (
            <p className="admin__updated">
              <Loader2 size={16} className="spin" aria-hidden="true" /> Henter innholdet …
            </p>
          ) : (
            <form
              className="admin-login form-card"
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) load(input.trim());
              }}
            >
              <span className="admin-login__icon" aria-hidden="true">
                <KeyRound size={26} />
              </span>
              <div className="field">
                <label htmlFor="editor-password" className="field__label">
                  Passord
                </label>
                <input
                  id="editor-password"
                  type="password"
                  autoComplete="current-password"
                  className="field__control"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-describedby={loginError ? "editor-error" : "editor-help"}
                />
                <p id="editor-help" className="field__hint">
                  Samme passord som på /admin.
                </p>
              </div>
              {loginError && (
                <p id="editor-error" className="field__error" role="alert">
                  {loginError}
                </p>
              )}
              <button type="submit" className="btn btn--primary btn--lg" disabled={loading || !input.trim()}>
                {loading ? <Loader2 size={18} className="spin" aria-hidden="true" /> : null}
                <span>{loading ? "Logger inn …" : "Logg inn"}</span>
              </button>
            </form>
          )}
        </div>
      </section>
    );
  }

  // ------- editor -------
  const events =
    section.kind === "folder"
      ? sortEvents(
          Object.entries(files)
            .filter(([p]) => p.startsWith(`${section.dir}/`))
            .map(([p, f]) => ({ path: p, slug: slugOf(p), data: drafts[p] ?? f.data }))
        )
      : [];
  const sectionDirty = (s) =>
    dirtyPaths.some((p) => (s.kind === "single" ? p === s.path : p === NEW || p.startsWith(`${s.dir}/`)));
  const ctx = { upload, previews };
  const viewUrl = section.viewUrl && (section.kind === "single" ? section.viewUrl() : saved ? section.viewUrl(itemSlug) : null);

  return (
    <section className="section admin editor">
      <div className="container">
        <div className="admin__top">
          <div>
            <p className="eyebrow">
              <span className="eyebrow__dot" aria-hidden="true" />
              Bare for styret
            </p>
            <h1 className="admin__title">Rediger nettsiden</h1>
          </div>
          <div className="admin__toolbar">
            <Link to="/admin" className="btn btn--ghost btn--sm">
              <span>Påmeldinger og besøk</span>
            </Link>
            <button type="button" className="btn btn--secondary btn--sm" onClick={reload} disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" aria-hidden="true" /> : <RefreshCw size={16} aria-hidden="true" />}
              <span>Last inn på nytt</span>
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
              <LogOut size={16} aria-hidden="true" /> <span>Logg ut</span>
            </button>
          </div>
        </div>

        <nav className="admin-tabs editor-tabs" aria-label="Hva vil du endre?">
          {SECTIONS.map((s) => (
            <Link
              key={s.key}
              to={`/loggin/${s.key}`}
              className={`admin-tabs__tab ${s.key === section.key ? "is-active" : ""}`}
              aria-current={s.key === section.key ? "page" : undefined}
            >
              {s.label}
              {sectionDirty(s) && <span className="editor-dot" title="Ikke lagret" aria-label="(ikke lagret)" />}
            </Link>
          ))}
        </nav>

        {section.kind === "folder" && !currentPath ? (
          <div className="editor-panel">
            <div className="editor-panel__head">
              <h2 className="admin-event__title">{section.label}</h2>
              <Link to="/loggin/arrangementer/ny" className="btn btn--primary btn--sm">
                <Plus size={16} aria-hidden="true" /> <span>Nytt arrangement</span>
              </Link>
            </div>
            {events.length ? (
              <ul className="editor-items">
                {events.map((e) => (
                  <li key={e.path}>
                    <Link to={`/loggin/arrangementer/${e.slug}`} className="editor-item">
                      <CalendarDays size={18} aria-hidden="true" />
                      <span className="editor-item__title">
                        {section.itemLabel(e.data)}
                        {e.path in drafts && <span className="editor-dot" title="Ikke lagret" aria-label="(ikke lagret)" />}
                      </span>
                      <span className="editor-item__meta">
                        {e.data.date ? formatShortDate(e.data.date) : "Ingen dato"}
                        {isUpcomingDate(e.data.date) ? " · kommende" : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-empty">Ingen arrangementer ennå.</p>
            )}
          </div>
        ) : !data ? (
          <FormStatus type="info" title="Fant ikke dette">
            <p>
              Det kan ha blitt slettet. <Link to={`/loggin/${section.key}`}>Tilbake</Link>
            </p>
          </FormStatus>
        ) : (
          <div className="editor-panel">
            <div className="editor-panel__head">
              <div>
                {section.kind === "folder" && (
                  <Link to="/loggin/arrangementer" className="text-link admin__back">
                    <ArrowLeft size={16} aria-hidden="true" /> Alle arrangementer
                  </Link>
                )}
                <h2 className="admin-event__title">
                  {section.kind === "folder" ? (currentPath === NEW ? "Nytt arrangement" : section.itemLabel(data)) : section.label}
                </h2>
              </div>
              {viewUrl && (
                <a href={viewUrl} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
                  <ExternalLink size={16} aria-hidden="true" /> <span>Se på nettsiden</span>
                </a>
              )}
            </div>

            {message && (
              <div ref={messageRef} tabIndex={-1} className="editor-message">
                <FormStatus type={message.type} title={message.title}>
                  <p>{message.text}</p>
                </FormStatus>
              </div>
            )}

            {currentPath === NEW && (
              <div className="field">
                <label htmlFor="editor-slug" className="field__label">
                  Adresse
                </label>
                <div className="editor-slug">
                  <span>/arrangementer/</span>
                  <input
                    id="editor-slug"
                    className="field__control"
                    value={newSlug || slugify(data.title)}
                    onChange={(e) => setNewSlug(e.target.value.toLowerCase())}
                    placeholder="f.eks. julebord-2026"
                    aria-describedby="editor-slug-hint"
                  />
                </div>
                <p id="editor-slug-hint" className="field__hint">
                  Lages fra tittelen. Kan ikke endres etter at arrangementet er lagret.
                </p>
              </div>
            )}

            <Fields fields={section.fields} data={data} onChange={change} ctx={ctx} />

            <div className="editor-savebar">
              <span className="editor-savebar__status" aria-live="polite">
                {saving ? (
                  "Lagrer …"
                ) : dirty || currentPath === NEW ? (
                  "Ikke lagret"
                ) : (
                  <>
                    <Check size={16} aria-hidden="true" /> Alt er lagret
                  </>
                )}
              </span>
              <div className="editor-savebar__actions">
                {section.kind === "folder" && saved && (
                  <button type="button" className="btn btn--ghost btn--sm admin-event__delete" onClick={remove} disabled={saving}>
                    <Trash2 size={16} aria-hidden="true" /> <span>Slett</span>
                  </button>
                )}
                {(dirty || currentPath === NEW) && (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={discard} disabled={saving}>
                    <RotateCcw size={16} aria-hidden="true" /> <span>Forkast</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={save}
                  disabled={saving || !(dirty || currentPath === NEW)}
                >
                  {saving ? <Loader2 size={18} className="spin" aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}
                  <span>Lagre</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
