/**
 * sync-team.mjs — team-profile sync for the Meet the Team page.
 *
 * Reads the published CSV of the team-profile Google Form responses sheet,
 * downloads each member's Drive photo into public/team/<slug>.<ext>, and
 * writes data/team.json. The page merges that file over the fallback roster
 * in src/content/team.ts at build time. A failed run never overwrites the
 * last good team.json.
 *
 * Google prerequisites (one-time): the responses sheet AND the Drive folder
 * holding the photo uploads must be shared as "Anyone with the link can view".
 *
 *   pnpm --filter @nova-havens/web sync:team
 *
 * Override the sheet with TEAM_SHEET_CSV_URL if the form is ever recreated.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';

const PACKAGE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_PATH = resolve(PACKAGE_DIR, 'data/team.json');
const PHOTO_DIR = resolve(PACKAGE_DIR, 'public/team');

const SHEET_CSV_URL =
  process.env.TEAM_SHEET_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1o0gu36md6JGGbP2NH5NZaKJWtMXAc5lrlCibxfnikFo/gviz/tq?tqx=out:csv';

/** Job titles are maintained here because the form does not collect them. Keyed on first name. */
const ROLE_BY_FIRST_NAME = {
  paulina: 'Senior Property Coordinator',
  alishia: 'Housing Coordination',
  sydney: 'Leasing & Move-In Coordination',
  chane: 'Client Coordination',
  brenda: 'Client Support',
  fazal: 'AI Engineer',
};

const COL = {
  timestamp: 'Timestamp',
  name: 'Name',
  help: 'How I help our Nova Havens clients',
  favouritePart: 'My favorite part of working at Nova Havens is',
  foods: 'My favorite foods are',
  laugh: 'This is guaranteed to make me laugh',
  spareTime: 'I like to spend my spare time doing',
  photo: 'Upload your favorite picture of yourself',
};

const ANSWER_KEYS = ['help', 'favouritePart', 'foods', 'laugh', 'spareTime'];
const MIME_EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp' };

const normalizeText = (v) =>
  String(v ?? '')
    .trim()
    .replace(/\s+/g, ' ');
const normalizeName = (v) =>
  normalizeText(v)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
const slugify = (name) =>
  normalizeName(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'member';

function initialsOf(name) {
  const parts = normalizeText(name).split(' ').filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

/** Strip pasted AI preambles ("Here's a concise response:") and bold restatements. */
function stripAiPreamble(text) {
  return text
    .trim()
    .replace(/^here(?:'| i)s\b[^:\n]{0,120}:\s*/i, '')
    .replace(/^\*\*[^*]+\*\*\s*/, '')
    .replace(/^#{1,6}\s+[^\n]+\n?/, '')
    .trim();
}

/** Strip a restated question ("My favorite part of working at Nova Havens is …"). */
function stripQuestionEcho(text, question) {
  const pattern = new RegExp(
    `^${question
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\s+/g, '\\s+')}`,
    'i',
  );
  let out = text
    .trim()
    .replace(pattern, '')
    .trim()
    .replace(/^[-–—:.]+\s*/, '');
  return out.length > 0 ? out[0].toUpperCase() + out.slice(1) : out;
}

const cleanAnswer = (raw, question) => stripQuestionEcho(stripAiPreamble(String(raw ?? '')), question);

function makeColumnGetter(row) {
  const lookup = new Map(Object.keys(row).map((key) => [normalizeText(key).toLowerCase(), key]));
  return (header) => {
    const key = lookup.get(normalizeText(header).toLowerCase());
    return key === undefined ? '' : String(row[key] ?? '');
  };
}

function extractDriveFileId(url) {
  const match = String(url).match(/[?&]id=([\w-]+)/) ?? String(url).match(/\/file\/d\/([\w-]+)/);
  return match ? match[1] : null;
}

async function syncPhoto(name, slug, photoUrl) {
  const fileId = extractDriveFileId(photoUrl);
  if (!fileId) {
    console.warn(`[sync-team] WARNING: ${name} — no usable Drive file ID; photo set to null.`);
    return null;
  }
  const response = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`, { redirect: 'follow' });
  if (!response.ok) throw new Error(`Drive download failed with HTTP ${response.status}`);
  const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  if (!contentType.startsWith('image/')) {
    throw new Error(
      `Drive returned "${contentType || 'unknown'}" instead of an image — is the photo folder shared as "Anyone with the link can view"?`,
    );
  }
  const ext = MIME_EXT[contentType];
  if (!ext) throw new Error(`photo is "${contentType}"; accepted: JPEG, PNG, GIF, WebP`);
  await mkdir(PHOTO_DIR, { recursive: true });
  await writeFile(resolve(PHOTO_DIR, `${slug}${ext}`), Buffer.from(await response.arrayBuffer()));
  return `/team/${slug}${ext}`;
}

async function transformRow(row, rowIndex) {
  const get = makeColumnGetter(row);
  const name = normalizeText(get(COL.name));
  if (!name) return null;
  const slug = slugify(name);
  const firstName = normalizeName(name).split(' ')[0];
  const answers = Object.fromEntries(ANSWER_KEYS.map((key) => [key, cleanAnswer(get(COL[key]), COL[key])]));

  let photo = null;
  const photoUrl = normalizeText(get(COL.photo));
  if (photoUrl) {
    try {
      photo = await syncPhoto(name, slug, photoUrl);
    } catch (error) {
      console.warn(`[sync-team] WARNING: ${name} — ${error.message} Photo set to null; continuing.`);
    }
  }

  const timestamp = Date.parse(get(COL.timestamp));
  return {
    name,
    slug,
    role: ROLE_BY_FIRST_NAME[firstName] ?? '',
    initials: initialsOf(name),
    photo,
    ...answers,
    _sortKey: Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp,
    _rowIndex: rowIndex,
  };
}

async function main() {
  console.log('[sync-team] Fetching form responses…');
  const response = await fetch(SHEET_CSV_URL, { redirect: 'follow' });
  if (!response.ok)
    throw new Error(
      `could not fetch the responses sheet (HTTP ${response.status}). Is it shared as "Anyone with the link can view"?`,
    );
  const rows = parse(await response.text(), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_column_count: true,
    trim: false,
  });

  const headers = new Set(Object.keys(rows[0] ?? {}).map((k) => normalizeText(k).toLowerCase()));
  const missing = Object.values(COL).filter((h) => !headers.has(normalizeText(h).toLowerCase()));
  if (rows.length === 0 || missing.length > 0)
    throw new Error(`sheet is missing required column(s): ${missing.join(', ') || '(no data rows)'}`);

  const members = [];
  for (const [index, row] of rows.entries()) {
    const member = await transformRow(row, index);
    if (member) members.push(member);
  }
  if (members.length === 0) throw new Error('parsed zero valid members from the sheet');
  members.sort((a, b) => a._sortKey - b._sortKey || a._rowIndex - b._rowIndex);

  const payload = {
    generatedAt: new Date().toISOString(),
    count: members.length,
    members: members.map((member) =>
      Object.fromEntries(Object.entries(member).filter(([key]) => !key.startsWith('_'))),
    ),
  };
  await mkdir(dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  const withPhotos = payload.members.filter((m) => m.photo).length;
  console.log(`[sync-team] Done. ${payload.count} member(s) written to data/team.json (${withPhotos} with photos).`);
}

main().catch((error) => {
  console.error(`[sync-team] ERROR: ${error.message}. Leaving existing team.json untouched.`);
  process.exit(1);
});
