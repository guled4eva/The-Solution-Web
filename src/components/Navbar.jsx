import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo.jsx";
import { navLinks } from "./navLinks.js";
import { siteConfig } from "../data/siteConfig.js";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const toggleRef = useRef(null);

  // Close the mobile menu when the page changes
  useEffect(() => setOpen(false), [pathname]);

  // Subtle shadow once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the menu; lock page scroll while it is open
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("menu-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("menu-open");
    };
  }, [open]);

  // Close the menu if the window grows to desktop size
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 960px)");
    const onChange = (e) => e.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""} ${open ? "navbar--open" : ""}`}>
      <div className="navbar__inner container">
        <Link to="/" className="navbar__brand" aria-label={`${siteConfig.associationName} – til forsiden`}>
          <Logo size={38} />
          <span className="navbar__name">{siteConfig.associationName}</span>
        </Link>

        <button
          ref={toggleRef}
          type="button"
          className="navbar__toggle"
          aria-expanded={open}
          aria-controls="hovedmeny"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden="true" size={24} /> : <Menu aria-hidden="true" size={24} />}
          <span className="visually-hidden">{open ? "Lukk meny" : "Åpne meny"}</span>
        </button>

        <nav id="hovedmeny" className="navbar__nav" aria-label="Hovedmeny">
          <ul className="navbar__list">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `navbar__link ${isActive ? "is-active" : ""}`}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="navbar__backdrop" aria-hidden="true" onClick={() => setOpen(false)} />
    </header>
  );
}
