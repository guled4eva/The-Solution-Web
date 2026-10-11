import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import FormStatus from "../components/FormStatus.jsx";
import { allEvents } from "../lib/events.js";
import { callScript } from "../lib/registrations.js";

/*
 * Visit statistics on /admin?vis=besok.
 * Data: the "Besøk" tab in the Google Sheet (one row per day + page + source).
 */

const PERIODS = [
  { days: 7, label: "7 dager" },
  { days: 30, label: "30 dager" },
  { days: 90, label: "90 dager" },
  { days: 365, label: "1 år" },
];

const CHANNEL_INFO = {
  Direkte: "Skrev inn adressen, bokmerke, QR-kode eller lenke fra en app som ikke sier hvor den kommer fra",
  Søk: "Google og andre søkemotorer",
  "Sosiale medier": "Instagram, Facebook, LinkedIn, TikTok …",
  Lenke: "Lenker fra andre nettsider",
  Kampanje: "Lenker med ?utm_source=… (f.eks. QR-kode på plakat)",
};

const PAGE_NAMES = {
  "/": "Forsiden",
  "/styret": "Styret",
  "/arrangementer": "Arrangementer",
  "/forslagsboksen": "Forslagsboksen",
  "/om-oss": "Om oss",
  "/kontakt": "Kontakt",
};

function pageName(path) {
  if (PAGE_NAMES[path]) return PAGE_NAMES[path];
  const m = path.match(/^\/arrangementer\/(.+)$/);
  if (m) {
    const ev = allEvents.find((e) => e.slug === m[1]);
    return ev ? `Arrangement: ${ev.title}` : path;
  }
  return path;
}

const nb = new Intl.NumberFormat("nb-NO");
const fmt = (n) => nb.format(n);

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dayLabel(key, opts = { day: "numeric", month: "short" }) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("nb-NO", opts);
}

/** Sums rows by a key and returns [{ key, visits, views }] sorted by visits. */
function sumBy(rows, keyFn) {
  const map = new Map();
  rows.forEach((r) => {
    const k = keyFn(r);
    const cur = map.get(k) || { key: k, visits: 0, views: 0 };
    cur.visits += r.visits;
    cur.views += r.views;
    map.set(k, cur);
  });
  return [...map.values()].sort((a, b) => b.visits - a.visits || b.views - a.views);
}

/** One bucket per day (or per week for long periods), including empty ones. */
function timeline(rows, days) {
  const byDay = new Map();
  rows.forEach((r) => {
    const cur = byDay.get(r.date) || { visits: 0, views: 0 };
    cur.visits += r.visits;
    cur.views += r.views;
    byDay.set(r.date, cur);
  });
  const step = days > 90 ? 7 : 1;
  const buckets = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  for (let i = days - 1; i >= 0; i -= step) {
    const keys = [];
    for (let j = 0; j < step && i - j >= 0; j++) {
      const d = new Date(today);
      d.setDate(d.getDate() - (i - j));
      keys.push(dayKey(d));
    }
    const sum = keys.reduce(
      (acc, k) => {
        const v = byDay.get(k);
        if (v) {
          acc.visits += v.visits;
          acc.views += v.views;
        }
        return acc;
      },
      { visits: 0, views: 0 }
    );
    const label =
      step === 1 ? dayLabel(keys[0], { weekday: "short", day: "numeric", month: "short" }) : `Uke fra ${dayLabel(keys[0])}`;
    buckets.push({ key: keys[0], label, ...sum });
  }
  return { buckets, step };
}

function BarList({ title, items, total, nameFn = (k) => k, infoFn }) {
  if (!items.length) return null;
  const max = Math.max(...items.map((i) => i.visits), 1);
  return (
    <div className="visit-list">
      <h3 className="admin-section-title">{title}</h3>
      <ul>
        {items.map((it) => {
          const pct = total ? Math.round((it.visits / total) * 100) : 0;
          return (
            <li key={it.key} className="visit-row" title={infoFn?.(it.key)}>
              <div className="visit-row__text">
                <span className="visit-row__name">{nameFn(it.key)}</span>
                <span className="visit-row__num">
                  {fmt(it.visits)} <span className="visit-row__pct">({pct} %)</span>
                </span>
              </div>
              <span className="visit-row__track" aria-hidden="true">
                <span className="visit-row__bar" style={{ width: `${(it.visits / max) * 100}%` }} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DailyChart({ buckets, step }) {
  const [active, setActive] = useState(null);
  const max = Math.max(...buckets.map((b) => b.visits), 1);
  const shown = active != null ? buckets[active] : null;
  return (
    <figure className="visit-chart">
      <figcaption className="visit-chart__head">
        <h3 className="admin-section-title">{step === 1 ? "Besøk per dag" : "Besøk per uke"}</h3>
        <p className="visit-chart__readout" aria-live="polite">
          {shown ? (
            <>
              <strong>{shown.label}:</strong> {fmt(shown.visits)} besøk · {fmt(shown.views)} sidevisninger
            </>
          ) : (
            <>Hold over eller trykk på en stolpe for tall · høyeste: {fmt(max)}</>
          )}
        </p>
      </figcaption>
      <div className="visit-chart__plot" onMouseLeave={() => setActive(null)}>
        <span className="visit-chart__max" aria-hidden="true">
          {fmt(max)}
        </span>
        <div className="visit-chart__bars">
          {buckets.map((b, i) => (
            <button
              type="button"
              key={b.key}
              className={`visit-chart__col ${active === i ? "is-active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-label={`${b.label}: ${b.visits} besøk, ${b.views} sidevisninger`}
            >
              <span className="visit-chart__bar" style={{ height: `${(b.visits / max) * 100}%` }} />
            </button>
          ))}
        </div>
      </div>
      <div className="visit-chart__axis" aria-hidden="true">
        <span>{buckets[0]?.label}</span>
        <span>{buckets[buckets.length - 1]?.label}</span>
      </div>
    </figure>
  );
}

export default function AdminVisits({ scriptUrl, password, errorTexts, reloadKey }) {
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await callScript(scriptUrl, { action: "stats", password, days });
    setLoading(false);
    if (res?.ok && Array.isArray(res.visits)) setRows(res.visits);
    else if (res?.error === "unknown-action")
      setError("Google-skriptet er ikke oppdatert ennå. Lim inn den nye koden og lag en ny versjon (se README).");
    else setError(errorTexts[res?.error] || "Kunne ikke hente besøkstall.");
  }, [scriptUrl, password, days, errorTexts]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const data = useMemo(() => {
    if (!rows) return null;
    const visits = rows.reduce((s, r) => s + r.visits, 0);
    const views = rows.reduce((s, r) => s + r.views, 0);
    return {
      visits,
      views,
      perDay: visits / days,
      channels: sumBy(rows, (r) => r.channel),
      sources: sumBy(rows, (r) => r.source).slice(0, 10),
      pages: sumBy(rows, (r) => r.path)
        .map((p) => ({ ...p, visits: p.views }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10),
      ...timeline(rows, days),
    };
  }, [rows, days]);

  return (
    <section className="admin-visits" aria-labelledby="visits-title">
      <div className="admin-visits__head">
        <h2 id="visits-title" className="admin-event__title">
          Besøk på nettsiden
        </h2>
        <div className="segmented" role="group" aria-label="Periode">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              className={`segmented__btn ${days === p.days ? "is-active" : ""}`}
              aria-pressed={days === p.days}
              onClick={() => setDays(p.days)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <FormStatus type="error" title="Noe gikk galt">
          <p>{error}</p>
        </FormStatus>
      )}

      {!data && loading && (
        <p className="admin__updated">
          <Loader2 size={16} className="spin" aria-hidden="true" /> Henter besøkstall …
        </p>
      )}

      {data && (
        <div className={loading ? "is-loading" : undefined}>
          <dl className="admin-stats">
            <div className="admin-stat admin-stat--total">
              <dt>Besøk</dt>
              <dd>{fmt(data.visits)}</dd>
            </div>
            <div className="admin-stat">
              <dt>Sidevisninger</dt>
              <dd>{fmt(data.views)}</dd>
            </div>
            <div className="admin-stat">
              <dt>Besøk per dag</dt>
              <dd>{data.perDay.toLocaleString("nb-NO", { maximumFractionDigits: 1 })}</dd>
            </div>
            <div className="admin-stat">
              <dt>Sider per besøk</dt>
              <dd>{data.visits ? (data.views / data.visits).toLocaleString("nb-NO", { maximumFractionDigits: 1 }) : "–"}</dd>
            </div>
          </dl>

          {data.views === 0 ? (
            <p className="admin-empty">Ingen besøk registrert i denne perioden ennå.</p>
          ) : (
            <>
              <DailyChart buckets={data.buckets} step={data.step} />
              <div className="visit-grid">
                <BarList
                  title="Hvor kommer de fra?"
                  items={data.channels}
                  total={data.visits}
                  infoFn={(k) => CHANNEL_INFO[k]}
                />
                <BarList title="Kilder" items={data.sources} total={data.visits} />
              </div>
              <BarList title="Mest besøkte sider (sidevisninger)" items={data.pages} total={data.views} nameFn={pageName} />
            </>
          )}
          <p className="admin__note">
            Besøk = én økt (en person som er innom, uansett hvor mange sider de ser). Tellingen er anonym – ingen
            informasjonskapsler eller IP-adresser lagres. Styrets egne besøk telles ikke mens dere er logget inn her.
            Lenker fra Instagram-appen og QR-koder vises ofte som «Direkte»; legg til <code>?utm_source=plakat</code> (eller
            et annet navn) bak adressen for å spore en bestemt plakat eller post.
          </p>
        </div>
      )}
    </section>
  );
}
