import { useEffect, useRef, useState } from "react";
import { Check, Minus, Plus, X } from "lucide-react";

const VIEW = 280; // size of the crop area on screen (px)
const OUT = 800; // size of the saved picture (px)

/**
 * Lets the board choose which part of a photo is shown in the round profile picture:
 * drag to move, slider (or +/-) to zoom. Returns a square JPEG file via onDone.
 */
export default function CircleCropper({ src, fileName = "profilbilde", onDone, onCancel }) {
  const [img, setImg] = useState(null);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef(null);
  const dialog = useRef(null);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      const s = VIEW / Math.min(image.naturalWidth, image.naturalHeight);
      setImg(image);
      setZoom(1);
      setPos({ x: (VIEW - image.naturalWidth * s) / 2, y: (VIEW - image.naturalHeight * s) / 2 });
    };
    image.onerror = () => setFailed(true);
    image.src = src;
  }, [src]);

  useEffect(() => {
    dialog.current?.focus();
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const base = img ? VIEW / Math.min(img.naturalWidth, img.naturalHeight) : 1;
  const scale = base * zoom;
  const w = img ? img.naturalWidth * scale : 0;
  const h = img ? img.naturalHeight * scale : 0;

  const clamp = (p, ww = w, hh = h) => ({
    x: Math.min(0, Math.max(VIEW - ww, p.x)),
    y: Math.min(0, Math.max(VIEW - hh, p.y)),
  });

  const setZoomKeepCenter = (z) => {
    if (!img) return;
    const nz = Math.min(4, Math.max(1, z));
    const ns = base * nz;
    // Keep the point in the middle of the circle in the middle
    const cx = (VIEW / 2 - pos.x) / scale;
    const cy = (VIEW / 2 - pos.y) / scale;
    const nw = img.naturalWidth * ns;
    const nh = img.naturalHeight * ns;
    setZoom(nz);
    setPos(clamp({ x: VIEW / 2 - cx * ns, y: VIEW / 2 - cy * ns }, nw, nh));
  };

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, start: pos };
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const { sx, sy, start } = drag.current;
    setPos(clamp({ x: start.x + e.clientX - sx, y: start.y + e.clientY - sy }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onKeyDown = (e) => {
    const step = 10;
    const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (moves[e.key]) {
      e.preventDefault();
      setPos((p) => clamp({ x: p.x + moves[e.key][0], y: p.y + moves[e.key][1] }));
    } else if (e.key === "+" || e.key === "=") setZoomKeepCenter(zoom + 0.1);
    else if (e.key === "-") setZoomKeepCenter(zoom - 0.1);
  };

  const apply = () => {
    const canvas = document.createElement("canvas");
    canvas.width = OUT;
    canvas.height = OUT;
    const g = canvas.getContext("2d");
    g.fillStyle = "#fff";
    g.fillRect(0, 0, OUT, OUT);
    const r = OUT / VIEW;
    g.drawImage(img, pos.x * r, pos.y * r, w * r, h * r);
    canvas.toBlob(
      (blob) => {
        if (blob) onDone(new File([blob], `${fileName.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="cropper-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="cropper" role="dialog" aria-modal="true" aria-labelledby="cropper-title" tabIndex={-1} ref={dialog}>
        <div className="cropper__head">
          <h2 id="cropper-title" className="cropper__title">
            Velg utsnitt
          </h2>
          <button type="button" className="ed-icon-btn" onClick={onCancel} aria-label="Lukk">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="field__hint">Dra bildet for å flytte det, og bruk glidebryteren for å zoome. Det som er inni sirkelen, vises på nettsiden.</p>

        {failed ? (
          <p className="field__error">Kunne ikke åpne bildet.</p>
        ) : (
          <div
            className="cropper__view"
            style={{ width: VIEW, height: VIEW }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={(e) => setZoomKeepCenter(zoom - e.deltaY * 0.002)}
            onKeyDown={onKeyDown}
            tabIndex={0}
            role="application"
            aria-label="Bildeutsnitt. Bruk piltastene for å flytte og + eller - for å zoome."
          >
            {img && (
              <img
                src={src}
                alt=""
                draggable={false}
                style={{ width: w, height: h, transform: `translate(${pos.x}px, ${pos.y}px)` }}
              />
            )}
            <span className="cropper__mask" aria-hidden="true" />
          </div>
        )}

        <div className="cropper__zoom">
          <button type="button" className="ed-icon-btn" onClick={() => setZoomKeepCenter(zoom - 0.2)} aria-label="Zoom ut">
            <Minus size={16} aria-hidden="true" />
          </button>
          <input
            type="range"
            min="1"
            max="4"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoomKeepCenter(Number(e.target.value))}
            aria-label="Zoom"
          />
          <button type="button" className="ed-icon-btn" onClick={() => setZoomKeepCenter(zoom + 0.2)} aria-label="Zoom inn">
            <Plus size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="cropper__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>
            Avbryt
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={apply} disabled={!img}>
            <Check size={16} aria-hidden="true" /> <span>Bruk utsnittet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
