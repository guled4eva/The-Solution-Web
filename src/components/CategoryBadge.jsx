import { Briefcase, FlaskConical, Sparkles, Users, Vote } from "lucide-react";

export const categoryMeta = {
  Sosialt: { className: "cat--sosialt", Icon: Users },
  Faglig: { className: "cat--faglig", Icon: FlaskConical },
  Bedrift: { className: "cat--bedrift", Icon: Briefcase },
  Generalforsamling: { className: "cat--generalforsamling", Icon: Vote },
  Annet: { className: "cat--annet", Icon: Sparkles },
};

/** Category label: icon + text, so colour is never the only signal. */
export default function CategoryBadge({ category }) {
  const meta = categoryMeta[category] || categoryMeta.Annet;
  const { Icon } = meta;
  return (
    <span className={`badge ${meta.className}`}>
      <Icon size={14} aria-hidden="true" />
      {category}
    </span>
  );
}
