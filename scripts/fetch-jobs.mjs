/**
 * Henter ledige stillinger innen kjemi, biokjemi, bioteknologi og prosess fra
 * NAV sin åpne stillingsfeed (arbeidsplassen.nav.no) og lagrer dem som
 * content/stillinger/nav-*.json. Kjøres automatisk hver mandag av
 * .github/workflows/stillinger.yml. Stillinger lagt inn for hånd på /loggin
 * (filer som ikke starter med «nav-») blir aldri endret.
 *
 * Feed: https://navikt.github.io/pam-stilling-feed/ – vilkår: arbeidsplassen.nav.no/vilkar-api
 * Token: secret NAV_FEED_TOKEN hvis den finnes, ellers den offentlige test-tokenen.
 */
import { readdirSync, readFileSync, unlinkSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://pam-stilling-feed.nav.no";
const DIR = "content/stillinger";
const DAYS_BACK = 45; // se på annonser endret de siste 45 dagene
const MAX_PAGES = 600;
const MAX_JOBS = 40;

// Ord i stillingstittelen som gjør stillingen relevant. \b = ordgrense, så «qa» ikke treffer «uniqa».
const INCLUDE = [
  /kjemi/, /kjemiker/, /biokjem/, /bioteknolog/, /molekylærbiolog/, /mikrobiolog/,
  /\blaborant/, /laboratorie(ingeniør|assistent|tekniker|leder|analytiker)?\b/, /\blab[- ]?(ingeniør|tekniker|assistent)/,
  /analyseingeniør/, /(kjemisk|laboratorie)analytiker/,
  /prosess(ingeniør|operatør|tekniker|teknolog|ansvarlig|teknikk|kjemi)/, /kvalitetskontroll/, /\bqc\b/, /\bqa\b/, /\bgmp\b/,
  /fermentering/, /formulering/, /legemiddelproduksjon/,
  /\bchemist/, /\bchemical/, /chemistry/, /biochem/, /biotech/, /bioprocess/, /process (engineer|technician|chemist)/,
  /\blaboratory\b/, /\blab (technician|engineer)/, /analytical/, /quality control/,
];
// Ord som utelukker stillingen
const EXCLUDE = [
  /lærer/, /lektor/, /renhold/, /kokk/, /barnehage/, /sykepleier/, /\blege\b/, /tannlege/, /kjemisk rens/,
  /bioingeniør/, /overlege/, /legespesialist/, /cyber/, /sikkerhet/, /selger/, /\bikt\b/, /\bit[- ]/, /programvare/, /software/, /test(er|analytiker)/, /kundeservice/,
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getToken() {
  if (process.env.NAV_FEED_TOKEN) return process.env.NAV_FEED_TOKEN.trim();
  const text = await (await fetch(`${BASE}/api/publicToken`)).text();
  const m = text.match(/eyJ[\w-]+\.[\w-]+\.[\w-]+/);
  if (!m) throw new Error(`Fant ingen token i svaret fra publicToken: ${text.slice(0, 200)}`);
  return m[0];
}

async function getJson(path, token, headers = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json", ...headers },
    });
    if (res.ok) return res.json();
    if (res.status >= 500 || res.status === 429) {
      await sleep(3000 * (attempt + 1));
      continue;
    }
    throw new Error(`${res.status} ${res.statusText} for ${path}: ${(await res.text()).slice(0, 200)}`);
  }
  throw new Error(`Ga opp etter flere forsøk: ${path}`);
}

const lower = (s) => ` ${String(s || "").toLowerCase()} `;
const relevant = (title) => {
  const t = lower(title);
  return INCLUDE.some((re) => re.test(t)) && !EXCLUDE.some((re) => re.test(t));
};

function stripHtml(html) {
  return String(html || "")
    .replace(/<\/(p|li|h\d|br)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shorten(text, max = 320) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:–-]$/, "")} …`;
}

function isoDate(value) {
  if (!value) return "";
  const s = String(value).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const n = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/); // 31.12.2026
  if (n) return `${n[3]}-${n[2].padStart(2, "0")}-${n[1].padStart(2, "0")}`;
  return ""; // f.eks. «Snarest» eller «Løpende»
}

function jobType(title, ad) {
  const t = lower(title);
  const engagement = lower(ad.engagementtype);
  if (t.includes("sommer") || engagement.includes("sommer")) return "Sommerjobb";
  if (t.includes("trainee") || t.includes("graduate")) return "Trainee / graduate";
  if (t.includes("intern") || t.includes("praksis")) return "Internship";
  if (t.includes("master")) return "Masteroppgave";
  if (/ph\.?d|stipendiat|postdo|research fellow/.test(t)) return "Stipendiat / PhD";
  if (t.includes("vikar")) return "Vikariat";
  if (lower(ad.extent).includes("deltid")) return "Deltid";
  if (engagement.includes("fast")) return "Fast stilling";
  return "Annet";
}

async function main() {
  const token = await getToken();
  const since = new Date(Date.now() - DAYS_BACK * 86400000).toUTCString();

  // 1) Gå gjennom feeden og husk siste status for hver annonse
  const latest = new Map();
  let page = await getJson("/api/v1/feed", token, { "If-Modified-Since": since });
  let pages = 0;
  while (page && pages < MAX_PAGES) {
    pages++;
    for (const item of page.items || []) {
      const entry = item._feed_entry || {};
      const uuid = entry.uuid || item.id;
      if (uuid) latest.set(uuid, { item, entry });
    }
    if (!page.next_id || !page.next_url || page.next_url === page.feed_url) break;
    page = await getJson(page.next_url, token);
  }
  console.log(`Leste ${pages} sider, ${latest.size} annonser.`);

  // 2) Plukk ut aktive, relevante annonser
  const candidates = [...latest.values()].filter(
    ({ item, entry }) => entry.status === "ACTIVE" && relevant(entry.title || item.title)
  );
  console.log(`${candidates.length} aktive og relevante.`);

  // 3) Hent hele annonsen for frist, sted og lenke
  const today = new Date().toISOString().slice(0, 10);
  const jobs = [];
  for (const { item, entry } of candidates) {
    try {
      const full = await getJson(item.url, token);
      const ad = full.ad_content || full.json || full;
      if (ad.status && ad.status !== "ACTIVE") continue;
      const deadline = isoDate(ad.applicationDue);
      if (deadline && deadline < today) continue;
      const uuid = ad.uuid || entry.uuid;
      const city = (ad.workLocations || []).map((w) => w.city || w.municipal).filter(Boolean);
      const title = (ad.title || entry.title || "").trim();
      jobs.push({
        file: `nav-${String(uuid).slice(0, 13).toLowerCase().replace(/[^a-z0-9-]/g, "")}.json`,
        modified: entry.sistEndret || item.date_modified || "",
        data: {
          title,
          company: (ad.employer?.name || ad.businessName || entry.businessName || "").trim(),
          logo: "",
          type: jobType(title, ad),
          location: [...new Set(city.map((c) => c.charAt(0) + c.slice(1).toLowerCase()))].join(", ") || entry.municipal || "",
          deadline,
          link: `https://arbeidsplassen.nav.no/stillinger/stilling/${uuid}`,
          description: shorten(stripHtml(ad.description)),
          source: "nav",
        },
      });
    } catch (err) {
      console.warn(`Hoppet over ${entry.uuid}: ${err.message}`);
    }
    await sleep(150);
  }

  // Nyeste først, maks MAX_JOBS
  jobs.sort((a, b) => String(b.modified).localeCompare(String(a.modified)));
  const keep = jobs.filter((j) => j.data.title && j.data.company).slice(0, MAX_JOBS);

  // 4) Skriv filene, og fjern gamle NAV-stillinger som ikke lenger er aktive
  mkdirSync(DIR, { recursive: true });
  const wanted = new Set(keep.map((j) => j.file));
  for (const f of readdirSync(DIR)) {
    if (f.startsWith("nav-") && f.endsWith(".json") && !wanted.has(f)) unlinkSync(join(DIR, f));
  }
  for (const j of keep) {
    const path = join(DIR, j.file);
    const text = `${JSON.stringify(j.data, null, 2)}\n`;
    let old = "";
    try {
      old = readFileSync(path, "utf8");
    } catch {
      /* ny fil */
    }
    if (old !== text) writeFileSync(path, text);
  }
  console.log(`Lagret ${keep.length} stillinger:`);
  keep.forEach((j) => console.log(` - ${j.data.title} (${j.data.company}, ${j.data.location}, frist ${j.data.deadline || "løpende"})`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
