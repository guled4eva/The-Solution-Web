import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import FormNotConfigured from "./FormNotConfigured.jsx";
import FormStatus from "./FormStatus.jsx";
import { siteConfig } from "../data/siteConfig.js";
import { EMAIL_PATTERN } from "../lib/forms.js";
import { formatShortDate } from "../lib/dates.js";
import { useFormSubmission } from "../hooks/useFormSubmission.js";

const empty = { name: "", email: "", notes: "", _gotcha: "" };

function validate(v) {
  const errors = {};
  if (!v.name.trim()) errors.name = "Skriv inn navnet ditt.";
  if (!v.email.trim()) errors.email = "Skriv inn e-postadressen din.";
  else if (!EMAIL_PATTERN.test(v.email.trim())) errors.email = "Skriv inn en gyldig e-postadresse.";
  return errors;
}

/**
 * Sign-up form on an event page. Sends name, email and optional notes to
 * Formspree (the "Påmelding" address in the settings), with the event in the subject.
 */
export default function RegistrationForm({ event }) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const { status, errorMessage, submit, reset, configured } = useFormSubmission(
    siteConfig.formspreeRegistrationEndpoint
  );
  const statusRef = useRef(null);
  const refs = { name: useRef(null), email: useRef(null) };
  const submitting = status === "submitting";
  const showNotes = event.registrationAskNotes === true;

  useEffect(() => {
    if (["success", "error", "not-configured"].includes(status)) statusRef.current?.focus();
  }, [status]);

  const update = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
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
    const first = ["name", "email"].find((k) => found[k]);
    if (first) {
      refs[first].current?.focus();
      return;
    }
    const payload = {
      _subject: `Påmelding: ${event.title} (${formatShortDate(event.date)})`,
      arrangement: event.title,
      dato: formatShortDate(event.date),
      navn: values.name.trim(),
      email: values.email.trim(),
      _gotcha: values._gotcha,
    };
    if (showNotes && values.notes.trim()) payload.allergier_og_kommentarer = values.notes.trim();
    const ok = await submit(payload);
    if (ok) setValues(empty);
  };

  if (status === "success") {
    return (
      <FormStatus type="success" title="Du er påmeldt!" focusRef={statusRef}>
        <p>
          Vi har registrert påmeldingen din til <strong>{event.title}</strong>. Vi gleder oss til å se deg!
        </p>
        <button type="button" className="btn btn--secondary btn--sm form-status__action" onClick={reset}>
          Meld på en til
        </button>
      </FormStatus>
    );
  }

  const field = (key, label, props = {}, required = true) => (
    <div className={`field ${errors[key] ? "field--error" : ""}`}>
      <label htmlFor={`pamelding-${key}`} className="field__label">
        {label}{" "}
        {required ? (
          <span className="field__req" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="field__optional">(valgfritt)</span>
        )}
      </label>
      <input
        id={`pamelding-${key}`}
        ref={refs[key]}
        value={values[key]}
        onChange={update(key)}
        required={required}
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
      {!configured && status !== "not-configured" && <FormNotConfigured configKey="formspreeRegistrationEndpoint" />}
      <div className="field-row">
        {field("name", "Navn", { type: "text", autoComplete: "name" })}
        {field("email", "E-post", { type: "email", autoComplete: "email", inputMode: "email" })}
      </div>
      {showNotes && (
        <div className="field">
          <label htmlFor="pamelding-notes" className="field__label">
            Allergier eller annet vi bør vite <span className="field__optional">(valgfritt)</span>
          </label>
          <textarea
            id="pamelding-notes"
            rows={3}
            maxLength={1000}
            value={values.notes}
            onChange={update("notes")}
            className="field__control field__control--short"
          />
        </div>
      )}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="pamelding-gotcha">La dette feltet stå tomt</label>
        <input id="pamelding-gotcha" type="text" tabIndex={-1} autoComplete="off" value={values._gotcha} onChange={update("_gotcha")} />
      </div>

      {status === "not-configured" && (
        <FormNotConfigured configKey="formspreeRegistrationEndpoint" focusRef={statusRef} />
      )}
      {status === "error" && (
        <FormStatus type="error" title="Påmeldingen ble ikke sendt" focusRef={statusRef}>
          <p>
            {errorMessage === "network"
              ? "Vi fikk ikke kontakt med serveren. Sjekk internettforbindelsen og prøv igjen."
              : "Noe gikk galt under påmeldingen. Prøv igjen om litt."}
          </p>
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
