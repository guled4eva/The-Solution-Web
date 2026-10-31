import { useState } from "react";
import { assetUrl } from "../lib/assets.js";
import { isFilled } from "../lib/config.js";

/** Round photo with the same coloured ring as the board cards, or initials if there's no photo. */
export default function Portrait({ person, size = 120 }) {
  const [failed, setFailed] = useState(false);
  const initials = String(person.name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return (
    <span className="portrait" style={{ width: size, height: size }}>
      {isFilled(person.image) && !failed ? (
        <img src={assetUrl(person.image)} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span className="portrait__initials" aria-hidden="true">
          {initials}
        </span>
      )}
    </span>
  );
}
