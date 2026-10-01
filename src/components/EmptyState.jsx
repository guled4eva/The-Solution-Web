import { FlaskConical } from "lucide-react";

/** Friendly message for sections with no content (e.g. no upcoming events). */
export default function EmptyState({ title, text, icon: Icon = FlaskConical, children, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        <Icon size={32} strokeWidth={1.6} />
      </div>
      <Heading className="empty-state__title">{title}</Heading>
      {text && <p className="empty-state__text">{text}</p>}
      {children}
    </div>
  );
}
