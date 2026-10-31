import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { assetUrl } from "../lib/assets.js";

/**
 * Photos from past events that slowly roll sideways (pauses on hover/focus).
 * Clicking a photo opens it large, with previous/next.
 * With "reduce motion" turned on in the device settings, the row doesn't move but can be scrolled.
 */
export default function PhotoGallery({ images }) {
  const [open, setOpen] = useState(null); // index of the open photo
  const n = images.length;

  // Repeat the photos so the rolling row is always wider than the screen, then twice for a seamless loop.
  const repeat = Math.max(1, Math.ceil(8 / Math.max(n, 1)));
  const base = Array.from({ length: repeat }, () => images).flat();
  const track = [...base, ...base];
  const seconds = Math.max(30, base.length * 6);

  if (!n) return null;
  return (
    <>
      <div className="gallery" style={{ "--gallery-duration": `${seconds}s` }}>
        <ul className="gallery__track">
          {track.map((img, i) => {
            const index = i % n;
            const isCopy = i >= n; // only the first set is reachable by keyboard / screen readers
            return (
              <li key={i} className="gallery__item" aria-hidden={isCopy || undefined}>
                <button
                  type="button"
                  className="gallery__button"
                  onClick={() => setOpen(index)}
                  tabIndex={isCopy ? -1 : 0}
                  aria-label={`Vis bildet større${img.caption ? `: ${img.caption}` : ""}`}
                >
                  <img src={assetUrl(img.image)} alt={img.caption || ""} loading="lazy" decoding="async" draggable={false} />
                  {img.caption && <span className="gallery__caption">{img.caption}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {open !== null && <Lightbox images={images} index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}

function Lightbox({ images, index, onChange, onClose }) {
  const n = images.length;
  const dialog = useRef(null);
  const go = useCallback((dir) => onChange((index + dir + n) % n), [index, n, onChange]);
  const touch = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [go, onClose]);

  const img = images[index];
  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Bilde fra galleriet"
      tabIndex={-1}
      ref={dialog}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <button type="button" className="lightbox__close" onClick={onClose} aria-label="Lukk">
        <X size={26} aria-hidden="true" />
      </button>
      {n > 1 && (
        <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => go(-1)} aria-label="Forrige bilde">
          <ChevronLeft size={30} aria-hidden="true" />
        </button>
      )}
      <figure className="lightbox__figure">
        <img src={assetUrl(img.image)} alt={img.caption || ""} />
        <figcaption className="lightbox__caption">
          {img.caption && <span>{img.caption}</span>}
          {n > 1 && (
            <span className="lightbox__count">
              {index + 1} / {n}
            </span>
          )}
        </figcaption>
      </figure>
      {n > 1 && (
        <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => go(1)} aria-label="Neste bilde">
          <ChevronRight size={30} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
