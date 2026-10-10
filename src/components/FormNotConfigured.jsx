import FormStatus from "./FormStatus.jsx";
import { siteConfig } from "../data/siteConfig.js";
import { isDev, isFilled } from "../lib/config.js";

/**
 * Shown when a Formspree endpoint has not been added in the settings (content/innstillinger/nettside.json).
 * Developers get exact instructions; visitors get an honest message and an alternative.
 */
export default function FormNotConfigured({ configKey, focusRef }) {
  return (
    <FormStatus type="info" title="Skjemaet er ikke aktivert ennå" focusRef={focusRef}>
      {isDev ? (
        <p>
          <strong>For utviklere:</strong> Legg inn Formspree-adressen på <code>/loggin</code> under Innstillinger (eller i{" "}
          <code>content/innstillinger/nettside.json</code>, feltet{" "}
          <code>{configKey}</code>). Fremgangsmåten står i README.md. Ingenting blir sendt før dette er gjort.
        </p>
      ) : isFilled(siteConfig.email) ? (
        <p>
          Ingenting blir sendt herfra foreløpig. Send oss gjerne en e-post i mellomtiden:{" "}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        </p>
      ) : (
        <p>Ingenting blir sendt herfra foreløpig. Prøv igjen senere, eller ta kontakt med styret direkte.</p>
      )}
    </FormStatus>
  );
}
