import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import FormNotConfigured from "./FormNotConfigured.jsx";
import FormStatus from "./FormStatus.jsx";
import { siteConfig } from "../data/siteConfig.js";
import { isValidFormspreeEndpoint } from "../lib/config.js";
import { EMAIL_PATTERN, submitToFormspree } from "../lib/forms.js";
import { formatShortDate, parseLocalDate } from "../lib/dates.js";
import { DIET_OPTIONS, callScript, dietText, isValidScriptUrl } from "../lib/registrations.js";

const emptyDiet = { halal: false, vegan: false, nuts: false, other: false, otherText: "" };
const empty = { name: "", email: "", diet: emptyDiet, _gotcha: "" };

function validate(v, askDiet) {
  const errors = {};
  if (!v.name.trim()) errors.name = "Skriv inn navnet ditt.";
  if (!v.email.trim()) errors.email = "Skriv inn e-postadressen din.";
  else if (!EMAIL_PATTERN.test(v.email.trim())) errors.email = "Skriv inn en gyldig e-postadresse.";
  if (askDiet && v.diet.other && !v.diet.otherText.trim()) errors.otherText = "Skriv hva «Annet» gjelder.";
  return errors;
}

const errorTexts = {
  network: "Vi fikk ikke kontakt med serveren. Sjekk internettforbindelsen og prøv igjen.",
  "deadline-passed": "Påmeldingsfristen har gått ut.",
  "invalid-input": "Noe i skjemaet ser ikke riktig ut. Sjekk navn og e-post.",
};

/**
 * Sign-up form on an event page.
 * Primary: Google Apps Script (stored in the association's Google Sheet, shown on /admin).
 * Fallback: Formspree (one e-mail per sign-up) if no script address is set.
 */
export default function RegistrationForm({ event }) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error | not-configured
  const [errorText, setErrorText] = useState("");
  const inFlight = useRef(false);
  const statusRef = useRef(null);
  const refs = { name: useRef(null), email: useRef(null), otherText: useRef(null) };

  const scriptUrl = siteConfig.registrationScriptUrl;
  const useScript = isValidScriptUrl(scriptUrl);
  const configured = useScript || isValidFormspreeEndpoint(siteConfig.formspreeRegistrationEndpoint);
  const askDiet = event.registrationAskNotes === true;
  const submitting = status === "submitting";

  useEffect(() => {
    if (["success", "error", "not-configured"].includes(status)) statusRef.current?.focus();
  }, [status]);

  const clearError = (key) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const update = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    clearError(field);
    if (status === "error" || status === "not-configured") setStatus("idle");
  };

  const updateDiet = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setValues((prev) => {
      const diet = { ...prev.diet, [key]: value };
      if (key === "other" && !value) diet.otherText = "";
      return { ...prev, diet };
    });
    if (key === "otherText" || key === "other") clearError("otherText");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inFlight.current) return;
    const found = validate(values, askDiet);
    setErrors(found);
    const first = ["name", "email", "otherText"].find((k) => found[k]);
    if (first) {
      refs[first].current?.focus();
      return;
    }
    if (!configured) {
      setStatus("not-configured");
      return;
    }

    inFlight.current = true;
    setStatus("submitting");
    const diet = askDiet ? values.diet : emptyDiet;
    let result;
    if (useScript) {
      const res = await callScript(scriptUrl, {
        action: "register",
        eventSlug: event.slug,
        eventTitle: event.title,
        eventDate: formatShortDate(event.date),
        eventDateIso: parseLocalDate(event.date)?.toISOString() || "",
        deadline: event.registrationDeadline || "",
        name: values.name.trim(),
        email: values.email.trim(),
        diet: { ...diet, otherText: diet.otherText.trim() },
        _gotcha: values._gotcha,
      });
      result = res?.ok
        ? { ok: true }
        : { ok: false, error: res?.error || "server-error", detail: [res?.error, res?.detail].filter(Boolean).join(": ") };
    } else {
      const payload = {
        _subject: `Påmelding: ${event.title} (${formatShortDate(event.date)})`,
        arrangement: event.title,
        dato: formatShortDate(event.date),
        navn: values.name.trim(),
        email: values.email.trim(),
        _gotcha: values._gotcha,
      };
      if (askDiet) payload.mat_og_allergier = dietText(diet) || "Ingen";
      const res = await submitToFormspree(siteConfig.formspreeRegistrationEndpoint, payload);
      result = res.ok ? { ok: true } : { ok: false, error: res.reason };
    }
    inFlight.current = false;

    if (result.ok) {
      setValues(empty);
      setStatus("success");
    } else {
      setErrorText(
        errorTexts[result.error] ||
          `Noe gikk galt under påmeldingen. Prøv igjen om litt.${result.detail ? ` (Feilkode: ${result.detail})` : ""}`
      );
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <FormStatus type="success" title="Du er påmeldt!" focusRef={statusRef}>
        <p>
          Vi har registrert påmeldingen din til <strong>{event.title}</strong>. Vi gleder oss til å se deg!
        </p>
        <button type="button" className="btn btn--secondary btn--sm form-status__action" onClick={() => setStatus("idle")}>
          Meld på en til
        </button>
      </FormStatus>
    );
  }

  const field = (key, label, props = {}) => (
    <div className={`field ${errors[key] ? "field--error" : ""}`}>
      <label htmlFor={`pamelding-${key}`} className="field__label">
        {label}{" "}
        <span className="field__req" aria-hidden="true">
          *
        </span>
      </label>
      <input
        id={`pamelding-${key}`}
        ref={refs[key]}
        value={values[key]}
        onChange={update(key)}
        required
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `pamelding-${key}-feil` : undefined}
        className="field__control"
        {...props}
      />
      {errors[key] && (
        <p id={`pamelding-${key}-feil`} className="field__error">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="form">
      {!configured && status !== "not-configured" && <FormNotConfigured configKey="registrationScriptUrl" />}
      <div className="field-row">
        {field("name", "Navn", { type: "text", autoComplete: "name" })}
        {field("email", "E-post", { type: "email", autoComplete: "email", inputMode: "email" })}
      </div>

      {askDiet && (
        <fieldset className="fieldset diet">
          <legend className="fieldset__legend">
            Mat og allergier <span className="optional-tag">Valgfritt</span>
          </legend>
          <p className="field__hint diet__hint">Kryss av det som gjelder deg.</p>
          <div className="diet__options">
            {DIET_OPTIONS.map(({ key, label }) => (
              <label key={key} className={`diet__option ${values.diet[key] ? "is-checked" : ""}`}>
                <input type="checkbox" checked={values.diet[key]} onChange={updateDiet(key)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {values.diet.other && (
            <div className={`field ${errors.otherText ? "field--error" : ""}`}>
              <label htmlFor="pamelding-otherText" className="field__label">
                Hva gjelder «Annet»?{" "}
                <span className="field__req" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="pamelding-otherText"
                ref={refs.otherText}
                type="text"
                maxLength={300}
                placeholder="F.eks. laktoseintoleranse, glutenfri, vegetar"
                value={values.diet.otherText}
                onChange={updateDiet("otherText")}
                aria-invalid={Boolean(errors.otherText)}
                aria-describedby={errors.otherText ? "pamelding-otherText-feil" : undefined}
                className="field__control"
              />
              {errors.otherText && (
                <p id="pamelding-otherText-feil" className="field__error">
                  {errors.otherText}
                </p>
              )}
            </div>
          )}
          <p className="field__hint">
            Svarene brukes bare til å planlegge arrangementet, ses kun av styret og slettes etterpå.
          </p>
        </fieldset>
      )}

      <div className="honeypot" aria-hidden="true">
        <label htmlFor="pamelding-gotcha">La dette feltet stå tomt</label>
        <input
          id="pamelding-gotcha"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values._gotcha}
          onChange={update("_gotcha")}
        />
      </div>

      {status === "not-configured" && <FormNotConfigured configKey="registrationScriptUrl" focusRef={statusRef} />}
      {status === "error" && (
        <FormStatus type="error" title="Påmeldingen ble ikke sendt" focusRef={statusRef}>
          <p>{errorText}</p>
        </FormStatus>
      )}

      <button type="submit" className="btn btn--accent btn--lg form__submit" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 size={18} className="spin" aria-hidden="true" />
            <span>Sender …</span>
          </>
        ) : (
          <>
            <span>Meld meg på</span>
            <Send size={18} aria-hidden="true" />
          </>
        )}
      </button>
      <p className="visually-hidden" role="status" aria-live="polite">
        {submitting ? "Sender påmeldingen …" : ""}
      </p>
    </form>
  );
}
