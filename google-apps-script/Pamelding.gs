/**
 * ============================================================
 *  PÅMELDING – The Solution
 *  Google Apps Script som tar imot påmeldinger fra nettsiden,
 *  lagrer dem i et Google-regneark, viser dem på /admin og sender
 *  en oppsummering på e-post når påmeldingsfristen har gått ut, og
 *  sletter påmeldingene automatisk 1 måned etter arrangementet.
 *  Teller også besøk på nettsiden (anonymt: ingen IP, ingen
 *  informasjonskapsler) og viser dem på /admin.
 *  Lagrer endringer fra redigeringspanelet på /loggin i GitHub
 *  (krever GITHUB_TOKEN – se README.md, «Redigering på /loggin»).
 *
 *  Oppsett: se README.md, avsnittet «Påmelding og /admin».
 *  Kort fortalt:
 *    1. Lag et Google-regneark med foreningens Gmail-konto.
 *    2. Utvidelser → Apps Script → lim inn hele denne filen.
 *    3. Prosjektinnstillinger → Skriptegenskaper:
 *         ADMIN_PASSWORD = et sterkt passord for /admin
 *         ADMIN_EMAIL    = e-posten som skal få oppsummeringene (valgfritt)
 *         GITHUB_TOKEN   = GitHub-nøkkel som kan endre nettsiden (for /loggin)
 *         GITHUB_REPO    = guled4eva/The-Solution-Web (valgfritt, dette er standard)
 *    4. Kjør funksjonen «setup» én gang og godkjenn tilgangene.
 *    5. Distribuer → Ny distribusjon → Nettapp:
 *         Kjør som: Meg   ·   Hvem har tilgang: Alle
 *       Kopier nettapp-adressen og lim den inn på /loggin
 *       under Innstillinger → «Påmelding – Google Apps Script-adresse».
 *
 *  Passordet ligger bare her (i skriptegenskapene), aldri i nettsiden.
 * ============================================================
 */

const SHEET_NAME = 'Påmeldinger';
const HEADERS = [
  'Tidspunkt', 'Arrangement-ID', 'Arrangement', 'Dato', 'Påmeldingsfrist',
  'Navn', 'E-post', 'Halal', 'Vegansk', 'Nøtteallergi', 'Annet', 'Annet (tekst)', 'ID', 'Arrangementsdato',
];
const MAX_FAILED_LOGINS = 10; // per 10 minutter
const DELETE_AFTER_DAYS = 30; // påmeldinger slettes så mange dager etter arrangementet

const VISITS_SHEET = 'Besøk';
const VISIT_HEADERS = ['Dato', 'Side', 'Kanal', 'Kilde', 'Sidevisninger', 'Besøk'];
const VISIT_CHANNELS = ['Direkte', 'Søk', 'Sosiale medier', 'Lenke', 'Kampanje'];
const KEEP_VISITS_DAYS = 400; // besøkstall slettes etter ca. 13 måneder
const TIME_ZONE = 'Europe/Oslo';

const DEFAULT_REPO = 'guled4eva/The-Solution-Web';
const DEFAULT_BRANCH = 'main';
// Bare disse filene og mappene kan endres fra /loggin
const CONTENT_PATH = /^content\/(arrangementer\/[a-z0-9][a-z0-9-]{0,80}|styret\/styret|tekster\/tekster|historie\/historie|innstillinger\/nettside)\.json$/;
const UPLOAD_FOLDERS = ['arrangementer', 'styret', 'dokumenter', 'logo', 'diverse'];
const UPLOAD_TYPES = { jpg: 'image', jpeg: 'image', png: 'image', webp: 'image', gif: 'image', pdf: 'pdf' };
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const WEAK_PASSWORDS = ['oslomet2025', 'biokjemi2025', 'passord', 'password'];

// ------------------------------------------------------------
// Inngang fra nettsiden
// ------------------------------------------------------------
function doPost(e) {
  let body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'invalid-json' });
  }
  try {
    switch (body.action) {
      case 'register':
        return json_(register_(body));
      case 'visit':
        return json_(visit_(body));
      case 'content-load':
        return json_(withEditAuth_(body, () => contentLoad_()));
      case 'content-save':
        return json_(withEditAuth_(body, () => contentSave_(body)));
      case 'content-delete':
        return json_(withEditAuth_(body, () => contentDelete_(body)));
      case 'upload':
        return json_(withEditAuth_(body, () => upload_(body)));
      case 'stats':
        return json_(withAuth_(body, () => ({ ok: true, visits: visitStats_(Number(body.days) || 30) })));
      case 'list':
        return json_(withAuth_(body, () => ({ ok: true, registrations: listAll_() })));
      case 'delete-event':
        return json_(withAuth_(body, () => ({ ok: true, deleted: deleteEvent_(String(body.eventSlug || '')) })));
      default:
        return json_({ ok: false, error: 'unknown-action' });
    }
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server-error', detail: String((err && err.message) || err).slice(0, 300) });
  }
}

function doGet() {
  return json_({ ok: true, service: 'The Solution påmelding' });
}

// ------------------------------------------------------------
// Påmelding
// ------------------------------------------------------------
function register_(b) {
  if (b._gotcha) return { ok: true }; // spam-felle: later som alt gikk bra

  const name = clean_(b.name, 120);
  const email = clean_(b.email, 200);
  const slug = clean_(b.eventSlug, 120);
  if (!name || !slug || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { ok: false, error: 'invalid-input' };
  }

  const deadline = b.deadline ? new Date(b.deadline) : null;
  if (deadline && !isNaN(deadline) && deadline.getTime() < Date.now()) {
    return { ok: false, error: 'deadline-passed' };
  }

  const diet = b.diet || {};
  const id = Utilities.getUuid();
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    sheet_().appendRow([
      new Date(),
      slug,
      clean_(b.eventTitle, 200),
      clean_(b.eventDate, 40),
      deadline && !isNaN(deadline) ? deadline : '',
      name,
      email,
      diet.halal ? 'Ja' : '',
      diet.vegan ? 'Ja' : '',
      diet.nuts ? 'Ja' : '',
      diet.other ? 'Ja' : '',
      diet.other ? clean_(diet.otherText, 500) : '',
      id,
      validDate_(b.eventDateIso),
    ]);
  } finally {
    lock.releaseLock();
  }
  return { ok: true, id: id };
}

// ------------------------------------------------------------
// Besøkstelling – én rad per dag + side + kilde (ikke én rad per besøk)
// ------------------------------------------------------------
function visit_(b) {
  let path = clean_(b.path, 150).toLowerCase();
  if (path.charAt(0) !== '/') return { ok: false, error: 'invalid-input' };
  if (/^\/(admin|loggin)(\/|$)/.test(path)) return { ok: true };
  const channel = VISIT_CHANNELS.indexOf(b.channel) !== -1 ? b.channel : 'Lenke';
  const source = clean_(b.source, 60) || channel;
  const newVisit = b.newSession === true ? 1 : 0;
  const today = dayKey_(new Date());

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = visitsSheet_();
    const last = sh.getLastRow();
    // Dagens rader ligger nederst – les bare de siste radene
    const first = Math.max(2, last - 400);
    if (last >= first) {
      const values = sh.getRange(first, 1, last - first + 1, 6).getValues();
      for (let i = values.length - 1; i >= 0; i--) {
        const r = values[i];
        if (dayKey_(r[0]) !== today) break;
        if (r[1] === path && r[2] === channel && r[3] === source) {
          sh.getRange(first + i, 5, 1, 2).setValues([[Number(r[4]) + 1, Number(r[5]) + newVisit]]);
          return { ok: true };
        }
      }
    }
    sh.appendRow([today, path, channel, source, 1, newVisit]);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function visitStats_(days) {
  days = Math.min(Math.max(days, 1), KEEP_VISITS_DAYS);
  const from = dayKey_(new Date(Date.now() - (days - 1) * 24 * 3600 * 1000));
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(VISITS_SHEET);
  if (!sh) return [];
  return sh
    .getDataRange()
    .getValues()
    .slice(1)
    .map((r) => ({ date: dayKey_(r[0]), path: String(r[1]), channel: String(r[2]), source: String(r[3]), views: Number(r[4]) || 0, visits: Number(r[5]) || 0 }))
    .filter((r) => r.date && r.date >= from);
}

function deleteOldVisits() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(VISITS_SHEET);
  if (!sh) return 0;
  const limit = dayKey_(new Date(Date.now() - KEEP_VISITS_DAYS * 24 * 3600 * 1000));
  const values = sh.getDataRange().getValues();
  // Radene ligger i datorekkefølge: slett de eldste i én operasjon
  let count = 0;
  while (count + 1 < values.length && dayKey_(values[count + 1][0]) < limit) count++;
  if (count) sh.deleteRows(2, count);
  return count;
}

// ------------------------------------------------------------
// Admin (krever passord)
// ------------------------------------------------------------
function withAuth_(b, fn) {
  const cache = CacheService.getScriptCache();
  const failed = Number(cache.get('failed') || 0);
  if (failed >= MAX_FAILED_LOGINS) return { ok: false, error: 'too-many-attempts' };

  const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  if (!expected) return { ok: false, error: 'no-password-configured' };
  if (String(b.password || '') !== expected) {
    cache.put('failed', String(failed + 1), 600);
    Utilities.sleep(800);
    return { ok: false, error: 'unauthorized' };
  }
  return fn();
}

/** Like withAuth_, but also requires a strong password, since it can change the website. */
function withEditAuth_(b, fn) {
  return withAuth_(b, () => {
    const pw = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD') || '';
    if (pw.length < 12 || WEAK_PASSWORDS.indexOf(pw.toLowerCase()) !== -1) return { ok: false, error: 'weak-password' };
    if (!PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN')) return { ok: false, error: 'no-github-token' };
    return fn();
  });
}

// ------------------------------------------------------------
// Redigering (/loggin) – leser og lagrer filer i GitHub
// ------------------------------------------------------------
function github_(method, path, payload) {
  const props = PropertiesService.getScriptProperties();
  const repo = props.getProperty('GITHUB_REPO') || DEFAULT_REPO;
  const options = {
    method: method,
    muteHttpExceptions: true,
    headers: {
      Authorization: 'Bearer ' + props.getProperty('GITHUB_TOKEN'),
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  };
  if (payload) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(payload);
  }
  const res = UrlFetchApp.fetch('https://api.github.com/repos/' + repo + path, options);
  const code = res.getResponseCode();
  let data = null;
  try {
    data = JSON.parse(res.getContentText() || 'null');
  } catch (err) {
    data = null;
  }
  return { code: code, data: data };
}

function githubError_(res) {
  if (res.code === 401) return { ok: false, error: 'github-token-invalid' };
  if (res.code === 403 || res.code === 404) return { ok: false, error: 'github-no-access' };
  if (res.code === 409 || res.code === 422) return { ok: false, error: 'conflict' };
  return { ok: false, error: 'github-error', detail: String(res.code) + ' ' + ((res.data && res.data.message) || '') };
}

function branch_() {
  return PropertiesService.getScriptProperties().getProperty('GITHUB_BRANCH') || DEFAULT_BRANCH;
}

function decode_(base64) {
  return Utilities.newBlob(Utilities.base64Decode(String(base64).replace(/\s/g, ''))).getDataAsString('UTF-8');
}

function encode_(text) {
  return Utilities.base64Encode(text, Utilities.Charset.UTF_8);
}

/** Returns every content file: [{ path, sha, content }]. */
function contentLoad_() {
  const tree = github_('get', '/git/trees/' + encodeURIComponent(branch_()) + '?recursive=1');
  if (tree.code !== 200) return githubError_(tree);
  const files = (tree.data.tree || []).filter((f) => f.type === 'blob' && CONTENT_PATH.test(f.path));
  const props = PropertiesService.getScriptProperties();
  const repo = props.getProperty('GITHUB_REPO') || DEFAULT_REPO;
  const headers = {
    Authorization: 'Bearer ' + props.getProperty('GITHUB_TOKEN'),
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const responses = UrlFetchApp.fetchAll(
    files.map((f) => ({ url: 'https://api.github.com/repos/' + repo + '/git/blobs/' + f.sha, headers: headers, muteHttpExceptions: true }))
  );
  const out = [];
  for (let i = 0; i < files.length; i++) {
    if (responses[i].getResponseCode() !== 200) return githubError_({ code: responses[i].getResponseCode(), data: null });
    out.push({ path: files[i].path, sha: files[i].sha, content: decode_(JSON.parse(responses[i].getContentText()).content) });
  }
  return { ok: true, files: out };
}

function contentSave_(b) {
  const path = String(b.path || '');
  if (!CONTENT_PATH.test(path)) return { ok: false, error: 'invalid-path' };
  const text = String(b.content || '');
  if (text.length > 300000) return { ok: false, error: 'too-large' };
  try {
    JSON.parse(text);
  } catch (err) {
    return { ok: false, error: 'invalid-json' };
  }
  const payload = {
    message: (b.sha ? 'Oppdatert' : 'Lagt til') + ' via /loggin: ' + path.replace(/^content\//, ''),
    content: encode_(text),
    branch: branch_(),
  };
  if (b.sha) payload.sha = String(b.sha);
  const res = github_('put', '/contents/' + path, payload);
  if (res.code !== 200 && res.code !== 201) return githubError_(res);
  return { ok: true, sha: res.data.content.sha };
}

function contentDelete_(b) {
  const path = String(b.path || '');
  if (!/^content\/arrangementer\//.test(path) || !CONTENT_PATH.test(path) || !b.sha) return { ok: false, error: 'invalid-path' };
  const res = github_('delete', '/contents/' + path, {
    message: 'Slettet via /loggin: ' + path.replace(/^content\//, ''),
    sha: String(b.sha),
    branch: branch_(),
  });
  if (res.code !== 200) return githubError_(res);
  return { ok: true };
}

/** Uploads an image or PDF to public/images/<folder>/ and returns its web address. */
function upload_(b) {
  const folder = UPLOAD_FOLDERS.indexOf(b.folder) !== -1 ? b.folder : 'diverse';
  const m = /^(.*?)\.([a-z0-9]+)$/i.exec(String(b.name || ''));
  const ext = m ? m[2].toLowerCase() : '';
  if (!UPLOAD_TYPES[ext]) return { ok: false, error: 'invalid-file-type' };
  const data = String(b.data || '').replace(/^data:[^,]*,/, '');
  if (!data || data.length * 0.75 > MAX_UPLOAD_BYTES) return { ok: false, error: 'too-large' };
  const base = m[1]
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'fil';
  const name = Utilities.formatDate(new Date(), TIME_ZONE, 'yyyyMMdd-HHmmss') + '-' + base + '.' + ext;
  const path = 'public/images/' + folder + '/' + name;
  const res = github_('put', '/contents/' + path, { message: 'Lastet opp via /loggin: ' + folder + '/' + name, content: data, branch: branch_() });
  if (res.code !== 201 && res.code !== 200) return githubError_(res);
  return { ok: true, url: '/images/' + folder + '/' + name };
}

function listAll_() {
  const values = sheet_().getDataRange().getValues();
  return values.slice(1).filter((r) => r[1]).map(rowToObject_);
}

function deleteEvent_(slug) {
  if (!slug) return 0;
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = sheet_();
    const values = sh.getDataRange().getValues();
    let deleted = 0;
    for (let i = values.length - 1; i >= 1; i--) {
      if (String(values[i][1]) === slug) {
        sh.deleteRow(i + 1);
        deleted++;
      }
    }
    return deleted;
  } finally {
    lock.releaseLock();
  }
}

function rowToObject_(r) {
  const iso = (v) => (v instanceof Date ? v.toISOString() : String(v || ''));
  return {
    timestamp: iso(r[0]),
    eventSlug: String(r[1]),
    eventTitle: String(r[2]),
    eventDate: String(r[3]),
    deadline: iso(r[4]),
    name: String(r[5]),
    email: String(r[6]),
    halal: r[7] === 'Ja',
    vegan: r[8] === 'Ja',
    nuts: r[9] === 'Ja',
    other: r[10] === 'Ja',
    otherText: String(r[11] || ''),
    id: String(r[12] || ''),
    eventDateIso: iso(r[13]),
  };
}

// ------------------------------------------------------------
// Kjøres automatisk hver time (satt opp av setup)
// ------------------------------------------------------------
function hourly() {
  sendDeadlineSummaries();
  deleteOldRegistrations();
  deleteOldVisits();
}

/** Sletter påmeldinger når arrangementet er mer enn DELETE_AFTER_DAYS dager siden. */
function deleteOldRegistrations() {
  const limit = Date.now() - DELETE_AFTER_DAYS * 24 * 3600 * 1000;
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = sheet_();
    const values = sh.getDataRange().getValues();
    let deleted = 0;
    for (let i = values.length - 1; i >= 1; i--) {
      // Arrangementsdato, eller (for eldre rader uten dato) tidspunktet for påmeldingen + 60 dager
      const eventDate = values[i][13] instanceof Date ? values[i][13] : null;
      const fallback = values[i][0] instanceof Date ? new Date(values[i][0].getTime() + 30 * 24 * 3600 * 1000) : null;
      const when = eventDate || fallback;
      if (when && when.getTime() < limit) {
        sh.deleteRow(i + 1);
        deleted++;
      }
    }
    return deleted;
  } finally {
    lock.releaseLock();
  }
}

// ------------------------------------------------------------
// Oppsummering på e-post når fristen har gått ut
// ------------------------------------------------------------
function sendDeadlineSummaries() {
  const props = PropertiesService.getScriptProperties();
  const done = JSON.parse(props.getProperty('SUMMARIES_SENT') || '[]');
  const to = props.getProperty('ADMIN_EMAIL') || Session.getEffectiveUser().getEmail();
  const now = Date.now();

  const byEvent = {};
  listAll_().forEach((r) => {
    (byEvent[r.eventSlug] = byEvent[r.eventSlug] || []).push(r);
  });

  Object.keys(byEvent).forEach((slug) => {
    const regs = byEvent[slug];
    const deadline = regs.map((r) => r.deadline).filter(Boolean).pop();
    if (!deadline || new Date(deadline).getTime() > now || done.indexOf(slug) !== -1) return;
    MailApp.sendEmail(to, 'Påmelding stengt: ' + regs[0].eventTitle + ' (' + regs.length + ' påmeldte)', summaryText_(regs));
    done.push(slug);
  });

  props.setProperty('SUMMARIES_SENT', JSON.stringify(done));
}

function summaryText_(regs) {
  const count = (k) => regs.filter((r) => r[k]).length;
  const lines = [
    'Påmeldingen til «' + regs[0].eventTitle + '» (' + regs[0].eventDate + ') er stengt.',
    '',
    'Totalt påmeldte: ' + regs.length,
    'Halal: ' + count('halal'),
    'Vegansk: ' + count('vegan'),
    'Nøtteallergi: ' + count('nuts'),
    'Annet: ' + count('other'),
  ];
  const others = regs.filter((r) => r.other && r.otherText);
  if (others.length) {
    lines.push('', 'Annet (detaljer):');
    others.forEach((r) => lines.push('– ' + r.name + ': ' + r.otherText));
  }
  lines.push('', 'Deltakere:');
  regs.forEach((r, i) => lines.push(i + 1 + '. ' + r.name + ' <' + r.email + '>'));
  lines.push('', 'Se alt på https://www.thesolutionoslomet.no/admin');
  return lines.join('\n');
}

// ------------------------------------------------------------
// Engangsoppsett: lager arket og timer-utløseren
// ------------------------------------------------------------
function setup() {
  sheet_();
  visitsSheet_();
  ScriptApp.getProjectTriggers()
    .filter((t) => ['sendDeadlineSummaries', 'hourly'].indexOf(t.getHandlerFunction()) !== -1)
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('hourly').timeBased().everyHours(1).create();
  if (!PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD')) {
    console.warn('Husk å legge inn ADMIN_PASSWORD under Prosjektinnstillinger → Skriptegenskaper.');
  }
  console.log('Oppsett ferdig.');
}

// ------------------------------------------------------------
// Hjelpere
// ------------------------------------------------------------
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function visitsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(VISITS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(VISITS_SHEET);
    sh.appendRow(VISIT_HEADERS);
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('@'); // datoen lagres som tekst (ÅÅÅÅ-MM-DD)
  }
  return sh;
}

function dayKey_(v) {
  if (v instanceof Date) return isNaN(v) ? '' : Utilities.formatDate(v, TIME_ZONE, 'yyyy-MM-dd');
  const s = String(v || '');
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}

function validDate_(v) {
  const d = v ? new Date(v) : null;
  return d && !isNaN(d) ? d : '';
}

function clean_(v, max) {
  // Strip leading characters that spreadsheets treat as formulas
  return String(v == null ? '' : v).trim().replace(/^[=+\-@]+/, '').slice(0, max);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
