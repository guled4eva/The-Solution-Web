import { useState } from "react";
import { assetUrl } from "../lib/assets.js";
import { isFilled } from "../lib/config.js";
import { categoryMeta } from "./CategoryBadge.jsx";
import { HexPattern } from "./ScienceArt.jsx";

/**
 * Event image, or a tasteful category-coloured placeholder if no image is set
 * (or the file can't be found).
 */
export default function EventImage({ event, large = false }) {
  const [failed, setFailed] = useState(false);
  const meta = categoryMeta[event.category] || categoryMeta.Annet;
  const { Icon } = meta;

  if (isFilled(event.image) && !failed) {
    // The whole picture is always shown (nothing cut off). Empty space around
    // square or tall pictures is filled with a soft, blurred copy of the same picture.
    const src = assetUrl(event.image);
    return (
      <div className="event-image event-image--fit">
        <img className="event-image__backdrop" src={src} alt="" aria-hidden="true" loading={large ? "eager" : "lazy"} />
        <img
          className="event-image__main"
          src={src}
          alt=""
          loading={large ? "eager" : "lazy"}
          decoding="async"
          width={large ? 1200 : 600}
          height={large ? 675 : 338}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`event-image event-image--placeholder ${meta.className}`} aria-hidden="true">
      <HexPattern opacity={0.22} size={large ? 64 : 44} />
      <Icon size={large ? 72 : 44} strokeWidth={1.4} className="event-image__icon" />
    </div>
  );
}
