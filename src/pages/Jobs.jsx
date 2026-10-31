import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Briefcase, GraduationCap } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import JobCard from "../components/JobCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { FIELDS, getOpenJobs } from "../lib/industry.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

const SORTS = {
  frist: { label: "Snarest frist", fn: (a, b) => String(a.deadline || "9999").localeCompare(String(b.deadline || "9999")) },
  nyeste: { label: "Nyeste først", fn: (a, b) => String(b.published || "").localeCompare(String(a.published || "")) },
  bedrift: { label: "Bedrift A–Å", fn: (a, b) => String(a.company).localeCompare(String(b.company), "nb") },
};

/** /bedrift/jobber – open positions for bachelor graduates, filterable by field and type. */
export default function Jobs() {
  usePageTitle("Ledige stillinger");
  const jobs = getOpenJobs();
  const [params, setParams] = useSearchParams();
  const field = FIELDS.includes(params.get("fag")) ? params.get("fag") : "";
  const place = params.get("sted") || "";
  const [type, setType] = useState("");
  const [sort, setSort] = useState("frist");

  const inPlace = place ? jobs.filter((j) => j.county === place) : jobs;
  const inField = field ? inPlace.filter((j) => j.field === field) : inPlace;
  const counties = useMemo(() => {
    const counts = new Map();
    jobs.forEach((j) => j.county && counts.set(j.county, (counts.get(j.county) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "nb"));
  }, [jobs]);
  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const types = useMemo(() => [...new Set(inField.map((j) => j.type).filter(Boolean))], [inField]);
  const shown = (type ? inField.filter((j) => j.type === type) : inField).slice().sort(SORTS[sort].fn);

  const setField = (f) => {
    setType("");
    setParam("fag", f);
  };

  return (
    <>
      <PageHeader
        eyebrow="Bedrift"
        title="Ledige stillinger"
        intro="Stillinger innen bioteknologi, analytisk kjemi og prosessteknologi som passer for deg med en bachelorgrad – eller snart har en."
      >
        <Link to="/bedrift" className="page-header__back">
          <ArrowLeft size={16} aria-hidden="true" /> Til Bedrift
        </Link>
      </PageHeader>

      <section className="section" aria-label="Stillinger">
        <div className="container">
          <div className="job-fields" role="group" aria-label="Fagområde">
            <button type="button" className={`job-field ${!field ? "is-active" : ""}`} aria-pressed={!field} onClick={() => setField("")}>
              <span className="job-field__name">Alle fagområder</span>
              <span className="job-field__count">{inPlace.length}</span>
            </button>
            {FIELDS.map((f) => (
              <button
                key={f}
                type="button"
                className={`job-field job-field--${slug(f)} ${field === f ? "is-active" : ""}`}
                aria-pressed={field === f}
                onClick={() => setField(f)}
              >
                <span className="job-field__name">{f}</span>
                <span className="job-field__count">{inPlace.filter((j) => j.field === f).length}</span>
              </button>
            ))}
          </div>

          <div className="job-toolbar">
            {types.length > 1 ? (
              <div className="filter-chips" role="group" aria-label="Type stilling">
                <button type="button" className={`filter-chip ${type === "" ? "is-active" : ""}`} aria-pressed={type === ""} onClick={() => setType("")}>
                  Alle typer
                </button>
                {types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`filter-chip ${type === t ? "is-active" : ""}`}
                    aria-pressed={type === t}
                    onClick={() => setType(t)}
                  >
                    {t} ({inField.filter((j) => j.type === t).length})
                  </button>
                ))}
              </div>
            ) : (
              <span />
            )}
            <div className="job-selects">
            {counties.length > 1 && (
              <label className="job-sort">
                <span>Sted:</span>
                <select value={place} onChange={(e) => setParam("sted", e.target.value)} className="field__control">
                  <option value="">Hele landet</option>
                  {counties.map(([c, n]) => (
                    <option key={c} value={c}>
                      {c} ({n})
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="job-sort">
              <span>Sorter:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="field__control">
                {Object.entries(SORTS).map(([key, s]) => (
                  <option key={key} value={key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            </div>
          </div>

          <p className="job-note">
            <GraduationCap size={16} aria-hidden="true" /> Stillinger som passer for deg med bachelorgrad.
          </p>

          {shown.length > 0 ? (
            <ul className="job-list">
              {shown.map((job) => (
                <li key={job.slug}>
                  <JobCard job={job} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Briefcase}
              title={
                field || place
                  ? `Ingen ledige stillinger${field ? ` innen ${field.toLowerCase()}` : ""}${place ? ` i ${place}` : ""} akkurat nå`
                  : "Ingen ledige stillinger akkurat nå"
              }
              text="Listen oppdateres automatisk hver uke – følg også med på Instagram."
            >
              <Link to="/bedrift#samarbeid" className="text-link">
                Er du bedrift og vil annonsere en stilling? Ta kontakt.
              </Link>
            </EmptyState>
          )}
        </div>
      </section>
    </>
  );
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z]+/g, "-");
}
