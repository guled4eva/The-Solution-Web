/**
 * ============================================================
 *  PÅMELDING – The Solution
 *  Google Apps Script som tar imot påmeldinger fra nettsiden,
 *  lagrer dem i et Google-regneark, viser dem på /admin og sender
 *  en oppsummering på e-post når påmeldingsfristen har gått ut, og
 *  sletter påmeldingene automatisk 1 måned etter arrangementet.
 *
 *  Oppsett: se README.md, avsnittet «Påmelding og /admin».
 *  Kort fortalt:
 *    1. Lag et Google-regneark med foreningens Gmail-konto.
 *    2. Utvidelser → Apps Script → lim inn hele denne filen.
 *    3. Prosjektinnstillinger → Skriptegenskaper:
 *         ADMIN_PASSWORD = et sterkt passord for /admin
 *         ADMIN_EMAIL    = e-posten som skal få oppsummeringene (valgfritt)
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
