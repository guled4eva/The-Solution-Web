import { Mail } from "lucide-react";
import BoardMemberCard from "../components/BoardMemberCard.jsx";
import Button from "../components/Button.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Reveal from "../components/Reveal.jsx";
import { board } from "../data/board.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

export default function Board() {
  usePageTitle("Styret");
  const members = Array.isArray(board) ? board.filter((m) => m && m.role) : [];

  return (
    <>
      <PageHeader
        eyebrow="Styret"
        title="Møt styret"
        intro="Styret i The Solution jobber for å skape et godt faglig og sosialt miljø for studentene ved Bioteknologi og kjemi."
      />

      <section className="section" aria-label="Styremedlemmer">
        <div className="container">
          {members.length > 0 ? (
            <ul className="board-grid">
              {members.map((member, i) => (
                <Reveal as="li" key={`${member.role}-${i}`} delay={(i % 3) * 80}>
                  <BoardMemberCard member={member} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <EmptyState title="Styret presenteres snart" text="Informasjon om styret kommer her etter neste valg." />
          )}

          <div className="board-note">
            <p>
              Lurer du på noe, eller har du lyst til å engasjere deg? Styret velges på generalforsamlingen – og alle
              medlemmer kan stille til valg.
            </p>
            <Button to="/kontakt" variant="secondary" icon={Mail} iconPosition="start">
              Kontakt styret
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
