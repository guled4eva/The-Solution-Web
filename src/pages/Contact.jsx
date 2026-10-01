import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Handshake,
  Loader2,
  Mail,
  MessageCircle,
  Mic,
  Presentation,
  Send,
  Sparkles,
  Store,
  Coins,
} from "lucide-react";
import FormNotConfigured from "../components/FormNotConfigured.jsx";
import FormStatus from "../components/FormStatus.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SocialLinks, { getConfiguredSocials } from "../components/SocialLinks.jsx";
import { siteConfig } from "../data/siteConfig.js";
import { board } from "../data/board.js";
import { isDev, isFilled } from "../lib/config.js";
import { EMAIL_PATTERN } from "../lib/forms.js";
import { useFormSubmission } from "../hooks/useFormSubmission.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

const cooperation = [
  { label: "Bedriftspresentasjoner", Icon: Presentation },
  { label: "Bedriftsbesøk", Icon: Building2 },
  { label: "Seminarer", Icon: Mic },
  { label: "Stand på campus", Icon: Store },
  { label: "Sponsing", Icon: Coins },
  { label: "Andre relevante samarbeid", Icon: Sparkles },
];

const empty = { name: "", email: "", subject: "", message: "", _gotcha: "" };

function validate(v) {
  const errors = {};
  if (!v.name.trim()) errors.name = "Skriv inn navnet ditt.";
  if (!v.email.trim()) errors.email = "Skriv inn e-postadressen din, så vi kan svare deg.";
  else if (!EMAIL_PATTERN.test(v.email.trim())) errors.email = "Skriv inn en gyldig e-postadresse.";
  if (!v.subject.trim()) errors.subject = "Skriv inn et emne.";
  if (!v.message.trim()) errors.message = "Skriv inn en melding.";
  else if (v.message.trim().length < 10) errors.message = "Meldingen må være minst 10 tegn.";
  return errors;
}

/** Email for industry contact: industryEmail → board member "Industriansvarlig" → general email. */
function getIndustryEmail() {
  if (isFilled(siteConfig.industryEmail)) return siteConfig.industryEmail.trim();
  const officer = board.find((m) => m.role === "Industriansvarlig" && isFilled(m.email));
  if (officer) return officer.email.trim();
  if (isFilled(siteConfig.email)) return siteConfig.email.trim();
  return "";
}

function EmailDisplay({ email, placeholder, formAvailable }) {
  if (isFilled(email)) {
    return (
      <a href={`mailto:${email}`} className="contact-card__email">
        <Mail size={18} aria-hidden="true" />
        {email}
      </a>
    );
  }
  return isDev ? (
    <p className="contact-card__email contact-card__email--placeholder">{placeholder}</p>
  ) : (
    <p className="contact-card__email contact-card__email--missing">{formAvailable ? "E-postadresse kommer snart – bruk skjemaet under." : "E-postadresse kommer snart."}
    </p>
  );
}

export default function Contact() {
  usePageTitle("Kontakt oss");
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const { status, errorMessage, submit, reset, configured } = useFormSubmission(siteConfig.formspreeContactEndpoint);
  const statusRef = useRef(null);
  const refs = { name: useRef(null), email: useRef(null), subject: useRef(null), message: useRef(null) };
  const submitting = status === "submitting";
  const industryEmail = getIndustryEmail();
  const socials = getConfiguredSocials();

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
    const first = ["name", "email", "subject", "message"].find((k) => found[k]);
    if (first) {
      refs[first].current?.focus();
      return;
    }
    const ok = await submit({
      _subject: `Kontaktskjema: ${values.subject.trim()}`,
      navn: values.name.trim(),
      email: values.email.trim(),
      emne: values.subject.trim(),
      melding: values.message.trim(),
      _gotcha: values._gotcha,
    });
    if (ok) setValues(empty);
  };

  const field = (key, label, props = {}, Control = "input") => (
    <div className={`field ${errors[key] ? "field--error" : ""}`}>
      <label htmlFor={`kontakt-${key}`} className="field__label">
        {label} <span className="field__req" aria-hidden="true">*</span>
      </label>
      <Control
        id={`kontakt-${key}`}
        ref={refs[key]}
        value={values[key]}
        onChange={update(key)}
        required
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `kontakt-${key}-feil` : undefined}
        className="field__control"
        {...props}
      />
      {errors[key] && (
        <p id={`kontakt-${key}-feil`} className="field__error">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <>
      <PageHeader
        eyebrow="Kontakt oss"
        title="Kontakt oss"
        intro="Har du spørsmål, ønsker å samarbeide med oss eller bare lyst til å si hei?"
      />

      <section className="section" aria-label="Kontaktalternativer">
        <div className="container contact-grid">
          <div className="contact-card">
            <span className="contact-card__icon" aria-hidden="true">
              <MessageCircle size={26} strokeWidth={1.8} />
            </span>
            <h2 className="contact-card__title">Generelle henvendelser</h2>
            <p>Spørsmål om foreningen, arrangementer eller medlemskap? Send oss en e-post.</p>
            <EmailDisplay email={siteConfig.email} placeholder="[LEGG INN E-POST]" formAvailable={configured} />
            {socials.length > 0 && (
              <div className="contact-card__socials">
                <h3 className="contact-card__subtitle">Følg oss</h3>
                <SocialLinks showLabels />
              </div>
            )}
          </div>

          <div className="contact-card contact-card--industry">
            <span className="contact-card__icon" aria-hidden="true">
              <Handshake size={26} strokeWidth={1.8} />
            </span>
            <p className="contact-card__kicker">Samarbeid og bedrifter</p>
            <h2 className="contact-card__title">For bedrifter</h2>
            <p>
              Ønsker bedriften din å komme i kontakt med studenter innen bioteknologi og kjemi? The Solution ønsker
              samarbeid med bedrifter og organisasjoner som kan gi studentene våre innsikt i arbeidslivet.
            </p>
            <ul className="coop-list" aria-label="Mulige samarbeidsformer">
              {cooperation.map(({ label, Icon }) => (
                <li key={label}>
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
            {industryEmail ? (
              <a
                href={`mailto:${industryEmail}?subject=${encodeURIComponent("Samarbeid med The Solution")}`}
                className="btn btn--accent btn--lg contact-card__cta"
              >
                <Mail size={18} aria-hidden="true" />
                <span>Ta kontakt med Industriansvarlig</span>
              </a>
            ) : (
              <>
                <a href="#kontaktskjema" className="btn btn--accent btn--lg contact-card__cta" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("kontaktskjema")?.scrollIntoView({ behavior: "smooth" });
                  refs.name.current?.focus({ preventScroll: true });
                }}>
                  <Mail size={18} aria-hidden="true" />
                  <span>Ta kontakt med Industriansvarlig</span>
                </a>
                {isDev && <p className="dev-hint">[LEGG INN E-POST TIL INDUSTRIANSVARLIG i siteConfig.js]</p>}
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="kontaktskjema-tittel" id="kontaktskjema">
        <div className="container contact-form-wrap">
          <div className="contact-form-wrap__intro">
            <h2 id="kontaktskjema-tittel" className="section-heading__title">
              Send oss en melding
            </h2>
            <p className="section-heading__intro">
              Fyll ut skjemaet, så svarer vi så snart vi kan. Alle feltene må fylles ut.
            </p>
          </div>

          <div className="form-card">
            {status === "success" ? (
              <FormStatus type="success" title="Takk for meldingen!" focusRef={statusRef}>
                <p>Vi har mottatt meldingen din og svarer så snart vi kan.</p>
                <button type="button" className="btn btn--secondary btn--sm form-status__action" onClick={reset}>
                  Send en ny melding
                </button>
              </FormStatus>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="form">
                {!configured && status !== "not-configured" && (
                  <FormNotConfigured configKey="formspreeContactEndpoint" />
                )}
                <div className="field-row">
                  {field("name", "Navn", { type: "text", autoComplete: "name" })}
                  {field("email", "E-post", { type: "email", autoComplete: "email", inputMode: "email" })}
                </div>
                {field("subject", "Emne", { type: "text" })}
                {field("message", "Melding", { rows: 7, maxLength: 5000 }, "textarea")}

                <div className="honeypot" aria-hidden="true">
                  <label htmlFor="kontakt-gotcha">La dette feltet stå tomt</label>
                  <input
                    id="kontakt-gotcha"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={values._gotcha}
                    onChange={update("_gotcha")}
                  />
                </div>

                {status === "not-configured" && (
                  <FormNotConfigured configKey="formspreeContactEndpoint" focusRef={statusRef} />
                )}
                {status === "error" && (
                  <FormStatus type="error" title="Meldingen ble ikke sendt" focusRef={statusRef}>
                    <p>
                      {errorMessage === "network"
                        ? "Vi fikk ikke kontakt med serveren. Sjekk internettforbindelsen og prøv igjen."
                        : "Noe gikk galt under innsendingen. Prøv igjen om litt."}
                    </p>
                  </FormStatus>
                )}

                <button type="submit" className="btn btn--primary btn--lg form__submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="spin" aria-hidden="true" />
                      <span>Sender …</span>
                    </>
                  ) : (
                    <>
                      <span>Send melding</span>
                      <Send size={18} aria-hidden="true" />
                    </>
                  )}
                </button>
                <p className="visually-hidden" role="status" aria-live="polite">
                  {submitting ? "Sender meldingen …" : ""}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
