import { useEffect, useRef, useState } from "react";
import { EyeOff, Lightbulb, Loader2, Send } from "lucide-react";
import FormNotConfigured from "../components/FormNotConfigured.jsx";
import FormStatus from "../components/FormStatus.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { siteConfig } from "../data/siteConfig.js";
import { EMAIL_PATTERN } from "../lib/forms.js";
import { useFormSubmission } from "../hooks/useFormSubmission.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

const CATEGORIES = [
  "Sosialt arrangement",
  "Faglig arrangement",
  "Bedrift/næringsliv",
  "Studentmiljø",
  "Nettsiden",
  "Annet",
];

const MIN_LENGTH = 10;
const MAX_LENGTH = 5000;
const empty = { category: "", suggestion: "", name: "", email: "", anonymous: false, _gotcha: "" };

function validate(values) {
  const errors = {};
  if (!values.category) errors.category = "Velg hva forslaget gjelder.";
  const text = values.suggestion.trim();
  if (!text) errors.suggestion = "Skriv inn forslaget ditt.";
  else if (text.length < MIN_LENGTH) errors.suggestion = `Forslaget må være minst ${MIN_LENGTH} tegn.`;
  else if (text.length > MAX_LENGTH) errors.suggestion = `Forslaget kan være maks ${MAX_LENGTH} tegn.`;
  if (!values.anonymous && values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Skriv inn en gyldig e-postadresse, eller la feltet stå tomt.";
  }
  return errors;
}

/**
 * Builds exactly what is sent to Formspree.
 * When "anonymous" is checked, name and email are NEVER included.
 */
function buildSuggestionPayload(values) {
  const payload = {
    _subject: `Nytt forslag: ${values.category}`,
    kategori: values.category,
    forslag: values.suggestion.trim(),
    anonymt: values.anonymous ? "Ja" : "Nei",
    _gotcha: values._gotcha,
  };
  if (!values.anonymous) {
    if (values.name.trim()) payload.navn = values.name.trim();
    if (values.email.trim()) payload.email = values.email.trim();
  }
  return payload;
}

export default function Suggestions() {
  usePageTitle("Forslagsboksen");
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const { status, errorMessage, submit, reset, configured } = useFormSubmission(
    siteConfig.formspreeSuggestionEndpoint
  );
  const statusRef = useRef(null);
  const fieldRefs = { category: useRef(null), suggestion: useRef(null), email: useRef(null) };
  const submitting = status === "submitting";

  useEffect(() => {
    if (["success", "error", "not-configured"].includes(status)) statusRef.current?.focus();
  }, [status]);

  const update = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      // Anonymous: clear identifying fields so nothing is kept around
      if (field === "anonymous" && value) {
        next.name = "";
        next.email = "";
      }
      return next;
    });
    if (errors[field] || (field === "anonymous" && errors.email)) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        if (field === "anonymous") delete next.email;
        return next;
      });
    }
    if (status === "error" || status === "not-configured") reset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const found = validate(values);
    setErrors(found);
    const firstInvalid = ["category", "suggestion", "email"].find((k) => found[k]);
    if (firstInvalid) {
      setShowSummary(true);
      fieldRefs[firstInvalid].current?.focus();
      return;
    }
    setShowSummary(false);
    const ok = await submit(buildSuggestionPayload(values));
    if (ok) setValues(empty);
  };

  const remaining = MAX_LENGTH - values.suggestion.length;

  return (
    <>
      <PageHeader eyebrow="Forslagsboksen" title="Forslagsboksen" intro="Har du en idé? Vi vil høre den." />

      <section className="section" aria-label="Send inn forslag">
        <div className="container suggestion-layout">
          <aside className="suggestion-aside">
            <div className="suggestion-aside__icon" aria-hidden="true">
              <Lightbulb size={30} strokeWidth={1.7} />
            </div>
            <p className="suggestion-aside__lead">
              Har du forslag til et arrangement, noe du ønsker at styret skal jobbe med, eller en idé som kan gjøre
              studentmiljøet bedre? Send det inn her.
            </p>
            <ul className="suggestion-aside__points">
              <li>Alle forslag leses av styret.</li>
              <li>Navn og e-post er helt valgfritt.</li>
              <li>Vil du ha svar? Legg igjen e-posten din.</li>
            </ul>
          </aside>

          <div className="form-card">
            {status === "success" ? (
              <FormStatus type="success" title="Takk for forslaget!" focusRef={statusRef}>
                <p>Forslaget ditt er sendt til styret i The Solution.</p>
                <button type="button" className="btn btn--secondary btn--sm form-status__action" onClick={reset}>
                  Send et nytt forslag
                </button>
              </FormStatus>
            ) : (
              <form onSubmit={handleSubmit} noValidate aria-describedby="forslag-info" className="form">
                <p id="forslag-info" className="form__required-note">
                  Felt merket med <span aria-hidden="true">*</span>
                  <span className="visually-hidden">stjerne</span> må fylles ut.
                </p>

                {!configured && status !== "not-configured" && (
                  <FormNotConfigured configKey="formspreeSuggestionEndpoint" />
                )}

                {showSummary && Object.keys(errors).length > 0 && (
                  <FormStatus type="error" title="Noe mangler i skjemaet">
                    <ul>
                      {Object.values(errors).map((msg) => (
                        <li key={msg}>{msg}</li>
                      ))}
                    </ul>
                  </FormStatus>
                )}

                <div className={`field ${errors.category ? "field--error" : ""}`}>
                  <label htmlFor="forslag-kategori" className="field__label">
                    Hva gjelder forslaget? <span className="field__req" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="forslag-kategori"
                    ref={fieldRefs.category}
                    value={values.category}
                    onChange={update("category")}
                    required
                    aria-invalid={Boolean(errors.category)}
                    aria-describedby={errors.category ? "forslag-kategori-feil" : undefined}
                    className="field__control"
                  >
                    <option value="">Velg kategori</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p id="forslag-kategori-feil" className="field__error">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div className={`field ${errors.suggestion ? "field--error" : ""}`}>
                  <label htmlFor="forslag-tekst" className="field__label">
                    Forslag <span className="field__req" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="forslag-tekst"
                    ref={fieldRefs.suggestion}
                    rows={8}
                    value={values.suggestion}
                    onChange={update("suggestion")}
                    required
                    maxLength={MAX_LENGTH}
                    placeholder="Beskriv ideen din. Jo mer konkret, jo lettere er det for styret å følge den opp."
                    aria-invalid={Boolean(errors.suggestion)}
                    aria-describedby={`forslag-tekst-hjelp${errors.suggestion ? " forslag-tekst-feil" : ""}`}
                    className="field__control"
                  />
                  <p id="forslag-tekst-hjelp" className="field__hint">
                    Minst {MIN_LENGTH} tegn. {remaining < 500 && `${remaining} tegn igjen.`}
                  </p>
                  {errors.suggestion && (
                    <p id="forslag-tekst-feil" className="field__error">
                      {errors.suggestion}
                    </p>
                  )}
                </div>

                <div className="checkbox">
                  <input
                    id="forslag-anonym"
                    type="checkbox"
                    checked={values.anonymous}
                    onChange={update("anonymous")}
                  />
                  <label htmlFor="forslag-anonym">
                    <EyeOff size={18} aria-hidden="true" />
                    Jeg ønsker å sende inn forslaget anonymt
                  </label>
                </div>

                {values.anonymous ? (
                  <p className="anon-note" role="status">
                    Navn og e-post sendes ikke med. Styret kan derfor ikke svare deg direkte.
                  </p>
                ) : (
                  <fieldset className="fieldset">
                    <legend className="fieldset__legend">
                      Om deg <span className="optional-tag">Valgfritt</span>
                    </legend>
                    <div className="field-row">
                      <div className="field">
                        <label htmlFor="forslag-navn" className="field__label">
                          Navn <span className="field__optional">(valgfritt)</span>
                        </label>
                        <input
                          id="forslag-navn"
                          type="text"
                          autoComplete="name"
                          value={values.name}
                          onChange={update("name")}
                          className="field__control"
                        />
                      </div>
                      <div className={`field ${errors.email ? "field--error" : ""}`}>
                        <label htmlFor="forslag-epost" className="field__label">
                          E-post <span className="field__optional">(valgfritt)</span>
                        </label>
                        <input
                          id="forslag-epost"
                          ref={fieldRefs.email}
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          value={values.email}
                          onChange={update("email")}
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={errors.email ? "forslag-epost-feil" : undefined}
                          className="field__control"
                        />
                        {errors.email && (
                          <p id="forslag-epost-feil" className="field__error">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </fieldset>
                )}

                {/* Honeypot against spam bots – hidden from people */}
                <div className="honeypot" aria-hidden="true">
                  <label htmlFor="forslag-gotcha">La dette feltet stå tomt</label>
                  <input
                    id="forslag-gotcha"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={values._gotcha}
                    onChange={update("_gotcha")}
                  />
                </div>

                {status === "not-configured" && (
                  <FormNotConfigured configKey="formspreeSuggestionEndpoint" focusRef={statusRef} />
                )}
                {status === "error" && (
                  <FormStatus type="error" title="Forslaget ble ikke sendt" focusRef={statusRef}>
                    <p>
                      {errorMessage === "network"
                        ? "Vi fikk ikke kontakt med serveren. Sjekk internettforbindelsen og prøv igjen."
                        : "Noe gikk galt under innsendingen. Prøv igjen om litt."}
                    </p>
                  </FormStatus>
                )}

                <button type="submit" className="btn btn--primary btn--lg form__submit" disabled={submitting} aria-disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="spin" aria-hidden="true" />
                      <span>Sender …</span>
                    </>
                  ) : (
                    <>
                      <span>Send forslag</span>
                      <Send size={18} aria-hidden="true" />
                    </>
                  )}
                </button>
                <p className="visually-hidden" role="status" aria-live="polite">
                  {submitting ? "Sender forslaget …" : ""}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
