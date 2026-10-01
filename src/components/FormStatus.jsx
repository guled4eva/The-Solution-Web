import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

const icons = { success: CheckCircle2, error: AlertTriangle, info: Info };

/**
 * Status message for forms. Uses role="status"/"alert" so screen readers
 * announce it, and an icon + title so colour is not the only signal.
 */
export default function FormStatus({ type = "info", title, children, focusRef }) {
  const Icon = icons[type] || Info;
  return (
    <div
      className={`form-status form-status--${type}`}
      role={type === "error" ? "alert" : "status"}
      tabIndex={-1}
      ref={focusRef}
    >
      <Icon size={22} aria-hidden="true" className="form-status__icon" />
      <div>
        {title && <p className="form-status__title">{title}</p>}
        <div className="form-status__text">{children}</div>
      </div>
    </div>
  );
}
