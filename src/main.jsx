import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/variables.css";
import "./styles/global.css";

/*
 * BrowserRouter gives clean addresses like /arrangementer.
 * GitHub Pages has no server-side routing, so the build step in
 * vite.config.js writes an HTML copy for every page (and a 404.html
 * fallback). That makes direct links and page refreshes work.
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter
      basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </BrowserRouter>
  </StrictMode>
);
