import { Building2, Coins, Mic, Presentation, Sparkles, Store } from "lucide-react";
import { siteConfig } from "../data/siteConfig.js";
import { board } from "../data/board.js";
import { isFilled } from "./config.js";

/** Ways companies can work with The Solution (used on «Kontakt oss» and «Bedrift»). */
export const cooperation = [
  { label: "Bedriftspresentasjoner", Icon: Presentation },
  { label: "Bedriftsbesøk", Icon: Building2 },
  { label: "Seminarer", Icon: Mic },
  { label: "Stand på campus", Icon: Store },
  { label: "Sponsing", Icon: Coins },
  { label: "Andre relevante samarbeid", Icon: Sparkles },
];

/** Email for industry contact: industryEmail → board member "Industriansvarlig" → general email. */
export function getIndustryEmail() {
  if (isFilled(siteConfig.industryEmail)) return siteConfig.industryEmail.trim();
  const officer = board.find((m) => m.role === "Industriansvarlig" && isFilled(m.email));
  if (officer) return officer.email.trim();
  if (isFilled(siteConfig.email)) return siteConfig.email.trim();
  return "";
}
