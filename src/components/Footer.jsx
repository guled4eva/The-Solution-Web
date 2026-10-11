import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import Logo from "./Logo.jsx";
import SocialLinks from "./SocialLinks.jsx";
import { navLinks } from "./navLinks.js";
import { siteConfig } from "../data/siteConfig.js";
import { isDev, isFilled } from "../lib/config.js";

export default function Footer() {
  const year = new Date().getFullYear();
  const hasEmail = isFilled(siteConfig.email);

  return (
    <footer className="footer">
      <div className="footer__bond" aria-hidden="true" />
      <div className="container footer__grid">
        <div className="footer__brand">
          <Link to="/" className="footer__logo-link" aria-label="Til forsiden">
            <Logo size={48} />
            <span className="footer__name">{siteConfig.associationName}</span>
          </Link>
          <p className="footer__tagline">
            Linjeforeningen for {siteConfig.programme} ved {siteConfig.university}
          </p>
          <SocialLinks variant="dark" />
        </div>

        <nav className="footer__nav" aria-label="Bunnmeny">
          <h2 className="footer__heading">Sider</h2>
          <ul>
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__contact">
          <h2 className="footer__heading">Kontakt</h2>
          {hasEmail ? (
            <a href={`mailto:${siteConfig.email}`} className="footer__email">
              <Mail size={18} aria-hidden="true" />
              {siteConfig.email}
            </a>
          ) : isDev ? (
            <p className="footer__email footer__email--placeholder">[LEGG INN E-POST]</p>
          ) : null}
          <p>
            <Link to="/forslagsboksen">Har du en idé? Send den til styret →</Link>
          </p>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>© {year} {siteConfig.associationName}</p>
        <p className="footer__motto">Av studenter – for studenter.</p>
        {/* Plain link (not router Link) so the browser loads the separate editing panel */}
        <p className="footer__login">
          For styret:{" "}
          <a href="/loggin/">Rediger nettsiden</a>
          <span aria-hidden="true"> · </span>
          <Link to="/admin">Påmeldinger og besøk</Link>
        </p>
      </div>
    </footer>
  );
}
