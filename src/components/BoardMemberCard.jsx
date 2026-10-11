import { useState } from "react";
import { Mail } from "lucide-react";
import { LinkedinIcon } from "./SocialIcons.jsx";
import { assetUrl } from "../lib/assets.js";
import { isFilled } from "../lib/config.js";
import { HexPattern } from "./ScienceArt.jsx";

function initialsOf(member) {
  const source = isFilled(member.name) ? member.name : member.role;
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/** Profile card for a board member. Missing photo/email/LinkedIn are handled gracefully. */
export default function BoardMemberCard({ member }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = isFilled(member.image) && !imageFailed;
  const hasName = isFilled(member.name);

  return (
    <article className="member-card">
      <div className="member-card__photo">
        <HexPattern opacity={0.16} size={46} />
        {hasImage ? (
          <img
            src={assetUrl(member.image)}
            alt={hasName ? `Portrett av ${member.name}` : `Portrett av ${member.role}`}
            loading="lazy"
            decoding="async"
            width="480"
            height="480"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="member-card__avatar" aria-hidden="true">
            <svg viewBox="0 0 100 100" className="member-card__hex">
              <path d="M50 4 90 27v46L50 96 10 73V27Z" />
            </svg>
            <span>{initialsOf(member)}</span>
          </div>
        )}
        {member.placeholder && <span className="badge badge--example member-card__example">Eksempel</span>}
      </div>

      <div className="member-card__body">
        <p className="member-card__role">{member.role}</p>
        <h3 className={`member-card__name ${hasName ? "" : "is-placeholder"}`}>
          {hasName ? member.name : "Navn kommer"}
        </h3>
        {member.description && <p className="member-card__desc">{member.description}</p>}

        {Array.isArray(member.responsibilities) && member.responsibilities.length > 0 && (
          <ul className="member-card__list" aria-label={`Ansvarsområder for ${member.role}`}>
            {member.responsibilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}

        {(isFilled(member.email) || isFilled(member.linkedin)) && (
          <div className="member-card__links">
            {isFilled(member.email) && (
              <a href={`mailto:${member.email}`} className="icon-link">
                <Mail size={18} aria-hidden="true" />
                <span>{member.email}</span>
              </a>
            )}
            {isFilled(member.linkedin) && (
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="icon-link">
                <LinkedinIcon width={18} height={18} />
                <span>LinkedIn</span>
                <span className="visually-hidden">
                  {" "}
                  – {hasName ? member.name : member.role} (åpnes i ny fane)
                </span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
