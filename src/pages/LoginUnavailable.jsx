import { Home, LockKeyhole } from "lucide-react";
import Button from "../components/Button.jsx";
import { usePageTitle } from "../hooks/usePageTitle.js";

/**
 * Shown at /loggin only when the editing panel (TinaCMS) has not been built yet,
 * i.e. before TINA_PUBLIC_CLIENT_ID and TINA_TOKEN are added in GitHub. See README.md.
 * Once it is set up, GitHub Pages serves the panel itself and this page is never shown.
 */
export default function LoginUnavailable() {
  usePageTitle("Logg inn");
  return (
    <section className="not-found">
      <div className="container not-found__inner">
        <span className="empty-state__icon" aria-hidden="true">
          <LockKeyhole size={32} strokeWidth={1.6} />
        </span>
        <div>
          <h1 className="not-found__title">Redigeringspanelet er ikke aktivert ennå</h1>
          <p className="not-found__text">
            Her skal styret logge inn for å endre tekster, bilder og arrangementer. Panelet blir tilgjengelig når
            oppsettet i README.md («Aktivere innlogging på /loggin») er fullført.
          </p>
          <div className="not-found__actions">
            <Button to="/" variant="primary" icon={Home} iconPosition="start">
              Til forsiden
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
