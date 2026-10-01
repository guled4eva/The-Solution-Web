import { ArrowRight, Home } from "lucide-react";
import Button from "../components/Button.jsx";
import { EmptyFlask, HexPattern } from "../components/ScienceArt.jsx";
import { usePageTitle } from "../hooks/usePageTitle.js";

export default function NotFound() {
  usePageTitle("Fant ikke siden");
  return (
    <section className="not-found">
      <HexPattern className="not-found__pattern" opacity={0.6} size={60} />
      <div className="container not-found__inner">
        <EmptyFlask />
        <div>
          <h1 className="not-found__title">
            <span className="not-found__code">404</span><span className="visually-hidden"> – </span> Denne løsningen fant vi ikke.
          </h1>
          <p className="not-found__text">The Solution fant dessverre ikke siden du leter etter.</p>
          <div className="not-found__actions">
            <Button to="/" variant="primary" icon={Home} iconPosition="start">
              Til forsiden
            </Button>
            <Button to="/arrangementer" variant="secondary" icon={ArrowRight}>
              Se arrangementer
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
