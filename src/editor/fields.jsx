import { useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Crop, FileText, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import CircleCropper from "./CircleCropper.jsx";
import { parseLocalDate } from "../lib/dates.js";

const pad = (n) => String(n).padStart(2, "0");

function toDateInput(value) {
  const d = parseLocalDate(value);
  return d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : "";
}

function toDateTimeInput(value) {
  if (!value) return "";
  const text = String(value);
  const d = /^\d{4}-\d{2}-\d{2}$/.test(text) ? parseLocalDate(text) : new Date(text);
  if (!d || Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDateTimeInput(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function Hint({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="field__hint">
      {children}
    </p>
  );
}

function Label({ htmlFor, field }) {
  return (
    <label htmlFor={htmlFor} className="field__label">
      {field.label}
      {field.required && (
        <span className="field__req" aria-hidden="true">
          {" "}
          *
        </span>
      )}
    </label>
  );
}

function ImageField({ field, value, onChange, ctx }) {
  const id = useId();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isPdf = field.accept === "pdf";
  const src = ctx.previews[value] || value;

  const [dragging, setDragging] = useState(false);
  const [crop, setCrop] = useState(null); // { src, name, revoke }
  const isCircle = field.crop === "circle";

  const closeCrop = () => {
    if (crop?.revoke) URL.revokeObjectURL(crop.src);
    setCrop(null);
  };

  const send = async (file, cropped = false) => {
    if (!file || busy) return;
    if (!isPdf && !file.type.startsWith("image/")) {
      setError("Det du limte inn er ikke et bilde.");
      return;
    }
    // Pasted screenshots are called "image.png" – give them a useful name
    if (!isPdf && /^image\.(png|jpe?g|gif|webp)$/i.test(file.name)) {
      const ext = file.type.split("/")[1].replace("jpeg", "jpg");
      file = new File([file], `${field.folder || "bilde"}-limt-inn.${ext}`, { type: file.type });
    }
    // Round profile pictures: let the board choose the part that is shown first
    if (isCircle && !cropped && file.type !== "image/gif") {
      setError("");
      setCrop({ src: URL.createObjectURL(file), name: file.name, revoke: true });
      return;
    }
    setBusy(true);
    setError("");
    const res = await ctx.upload(file, field.folder, isPdf);
    setBusy(false);
    if (res.ok) onChange(res.url);
    else setError(res.message);
  };

  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    send(file);
  };

  const fileFrom = (list) => [...(list || [])].find((f) => (isPdf ? /pdf$/i.test(f.type || f.name) : f.type.startsWith("image/")));

  const onPaste = (e) => {
    const items = [...(e.clipboardData?.items || [])];
    const item = items.find((i) => i.kind === "file" && (isPdf ? i.type === "application/pdf" : i.type.startsWith("image/")));
    if (!item) return;
    e.preventDefault();
    send(item.getAsFile());
  };

  return (
    <div className="field">
      <span className="field__label" id={`${id}-label`}>
        {field.label}
      </span>
      <div className="ed-image">
        <div
          className={`ed-image__preview ed-image__drop ${dragging ? "is-dragging" : ""}`}
          tabIndex={0}
          role="button"
          aria-label={`${field.label}: trykk her og lim inn med Ctrl + V, eller dra en fil hit`}
          onPaste={onPaste}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            send(fileFrom(e.dataTransfer?.files));
          }}
        >
          {value ? (
            isPdf ? (
              <a href={src} target="_blank" rel="noreferrer" className="ed-image__file">
                <FileText size={28} aria-hidden="true" />
                <span>{value.split("/").pop()}</span>
              </a>
            ) : (
              <img src={src} alt="" className={isCircle ? "is-circle" : undefined} />
            )
          ) : (
            <span className="ed-image__empty">
              {isPdf ? "Dra en PDF hit" : "Trykk her og lim inn (Ctrl + V), eller dra et bilde hit"}
            </span>
          )}
        </div>
        <div className="ed-image__actions">
          <input
            ref={input}
            type="file"
            hidden
            accept={isPdf ? "application/pdf,.pdf" : "image/jpeg,image/png,image/webp,image/gif"}
            onChange={pick}
          />
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? <Loader2 size={16} className="spin" aria-hidden="true" /> : <ImagePlus size={16} aria-hidden="true" />}
            <span>{busy ? "Laster opp …" : value ? "Bytt" : "Last opp"}</span>
          </button>
          {value && !busy && isCircle && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setCrop({ src, name: value.split("/").pop(), revoke: false })}
            >
              <Crop size={16} aria-hidden="true" /> <span>Juster utsnitt</span>
            </button>
          )}
          {value && !busy && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange("")}>
              <X size={16} aria-hidden="true" /> <span>Fjern</span>
            </button>
          )}
        </div>
      </div>
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
      {crop && (
        <CircleCropper
          src={crop.src}
          fileName={crop.name.replace(/^\d{8}-\d{6}-/, "")}
          onCancel={closeCrop}
          onDone={(file) => {
            closeCrop();
            send(file, true);
          }}
        />
      )}
      <Hint>
        {isPdf ? "" : "Du kan også kopiere et bilde, trykke på feltet og lime inn med Ctrl + V (Cmd + V på Mac). "}
        {field.hint}
      </Hint>
    </div>
  );
}

function StringList({ field, value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const set = (i, v) => onChange(items.map((x, j) => (j === i ? v : x)));
  return (
    <fieldset className="field ed-strings">
      <legend className="field__label">{field.label}</legend>
      {items.map((item, i) => (
        <div key={i} className="ed-strings__row">
          <input
            className="field__control"
            value={item}
            onChange={(e) => set(i, e.target.value)}
            aria-label={`${field.label} ${i + 1}`}
          />
          <button
            type="button"
            className="ed-icon-btn"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label={`Fjern ${field.label.toLowerCase()} ${i + 1}`}
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn--ghost btn--sm ed-add" onClick={() => onChange([...items, ""])}>
        <Plus size={16} aria-hidden="true" /> <span>{field.addLabel || "Legg til"}</span>
      </button>
      <Hint>{field.hint}</Hint>
    </fieldset>
  );
}

function ObjectList({ field, value, onChange, ctx }) {
  const items = Array.isArray(value) ? value : [];
  const [open, setOpen] = useState(() => new Set());
  const toggle = (i) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen((prev) => {
      const s = new Set();
      prev.forEach((k) => s.add(k === i ? j : k === j ? i : k));
      return s;
    });
  };
  const remove = (i) => {
    if (!window.confirm(`Fjerne «${field.itemLabel(items[i])}»?`)) return;
    onChange(items.filter((_, j) => j !== i));
    setOpen(new Set());
  };
  const add = () => {
    onChange([...items, field.newItem()]);
    setOpen((prev) => new Set(prev).add(items.length));
  };

  return (
    <div className="field ed-list">
      <span className="field__label">{field.label}</span>
      <Hint>{field.hint}</Hint>
      <ol className="ed-list__items">
        {items.map((item, i) => {
          const isOpen = open.has(i);
          return (
            <li key={i} className={`ed-item ${isOpen ? "is-open" : ""}`}>
              <div className="ed-item__head">
                <button type="button" className="ed-item__toggle" onClick={() => toggle(i)} aria-expanded={isOpen}>
                  <ChevronDown size={18} aria-hidden="true" className="ed-item__chevron" />
                  <span>{field.itemLabel(item)}</span>
                </button>
                <div className="ed-item__tools">
                  <button type="button" className="ed-icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Flytt opp">
                    <ArrowUp size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="ed-icon-btn"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    aria-label="Flytt ned"
                  >
                    <ArrowDown size={16} aria-hidden="true" />
                  </button>
                  <button type="button" className="ed-icon-btn ed-icon-btn--danger" onClick={() => remove(i)} aria-label="Fjern">
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className="ed-item__body">
                  <Fields fields={field.fields} data={item} onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))} ctx={ctx} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <button type="button" className="btn btn--secondary btn--sm ed-add" onClick={add}>
        <Plus size={16} aria-hidden="true" /> <span>{field.addLabel || "Legg til"}</span>
      </button>
    </div>
  );
}

function Field({ field, data, onChange, ctx }) {
  const id = useId();
  const hintId = field.hint ? `${id}-hint` : undefined;
  const value = data?.[field.name];
  const set = (v) => onChange({ ...data, [field.name]: v });

  switch (field.type) {
    case "heading":
      return <h3 className="ed-heading">{field.label}</h3>;
    case "boolean":
      return (
        <div className="field">
          <label className="ed-switch">
            <input type="checkbox" checked={value === true} onChange={(e) => set(e.target.checked)} aria-describedby={hintId} />
            <span className="ed-switch__track" aria-hidden="true" />
            <span className="ed-switch__label">{field.label}</span>
          </label>
          <Hint id={hintId}>{field.hint}</Hint>
        </div>
      );
    case "image":
      return <ImageField field={field} value={value || ""} onChange={set} ctx={ctx} />;
    case "stringList":
      return <StringList field={field} value={value} onChange={set} />;
    case "list":
      return <ObjectList field={field} value={value} onChange={set} ctx={ctx} />;
    case "select":
      return (
        <div className="field">
          <Label htmlFor={id} field={field} />
          <select id={id} className="field__control" value={value || ""} onChange={(e) => set(e.target.value)} aria-describedby={hintId}>
            {!field.required && <option value="">–</option>}
            {field.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <Hint id={hintId}>{field.hint}</Hint>
        </div>
      );
    case "textarea":
      return (
        <div className="field">
          <Label htmlFor={id} field={field} />
          <textarea
            id={id}
            className="field__control"
            rows={field.rows || 4}
            value={value || ""}
            onChange={(e) => set(e.target.value)}
            aria-describedby={hintId}
          />
          <Hint id={hintId}>{field.hint}</Hint>
        </div>
      );
    case "date":
    case "datetime": {
      const isDate = field.type === "date";
      return (
        <div className="field">
          <Label htmlFor={id} field={field} />
          <div className="ed-date">
            <input
              id={id}
              type={isDate ? "date" : "datetime-local"}
              className="field__control"
              value={isDate ? toDateInput(value) : toDateTimeInput(value)}
              onChange={(e) => set(isDate ? e.target.value : fromDateTimeInput(e.target.value))}
              aria-describedby={hintId}
            />
            {value && !field.required && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => set("")}>
                <X size={16} aria-hidden="true" /> <span>Tøm</span>
              </button>
            )}
          </div>
          <Hint id={hintId}>{field.hint}</Hint>
        </div>
      );
    }
    default:
      return (
        <div className="field">
          <Label htmlFor={id} field={field} />
          <input
            id={id}
            type={field.inputType || "text"}
            className="field__control"
            value={value ?? ""}
            onChange={(e) => set(e.target.value)}
            aria-describedby={hintId}
          />
          <Hint id={hintId}>{field.hint}</Hint>
        </div>
      );
  }
}

/** Renders a set of fields for one object. */
export function Fields({ fields, data, onChange, ctx }) {
  return (
    <div className="ed-fields">
      {fields.map((f, i) =>
        f.showIf && !f.showIf(data) ? null : <Field key={f.name || `h${i}`} field={f} data={data} onChange={onChange} ctx={ctx} />
      )}
    </div>
  );
}
