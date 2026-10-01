import { useState } from "react";
import { siteConfig } from "../data/siteConfig.js";
import { assetUrl } from "../lib/assets.js";
import { isFilled } from "../lib/config.js";

/** Fallback mark used if the logo file is missing: a simple hexagon monogram. */
function FallbackMark({ size }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" className="logo__fallback">
      <path d="M24 3 42 13.5v21L24 45 6 34.5v-21Z" fill="currentColor" />
      <text x="24" y="29.5" textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--color-background)" fontFamily="var(--font-display)">
        TS
      </text>
    </svg>
  );
}

/** The association logo. Path comes from siteConfig.logo. Decorative by default (name is shown next to it). */
export default function Logo({ size = 40, alt = "", className = "" }) {
  const [failed, setFailed] = useState(false);
  if (!isFilled(siteConfig.logo) || failed) {
    return (
      <span className={`logo ${className}`} style={{ width: size, height: size }}>
        <FallbackMark size={size} />
      </span>
    );
  }
  return (
    <img
      src={assetUrl(siteConfig.logo)}
      alt={alt}
      width={size}
      height={size}
      className={`logo ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
