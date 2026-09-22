/**
 * sync-team.js — daily team-profile sync for the Meet the Team page.
 *
 * ── Google prerequisites (one-time setup) ──────────────────────────────────
 * 1. The Google Sheet holding the form responses must be shared as
 *    "Anyone with the link can view" — otherwise the CSV fetch fails.
 * 2. The Google Drive folder holding the form photo uploads
 *    (folder ID 1JBnfTrWklVqbgaWE_mR4aSr0Yp-0i6hjA4yKw44RErtHUmbGxr3xsdJBtF1dSOOzgBBN3AJe)
 *    must also be shared as "Anyone with the link can view" — otherwise photo
 *    downloads return an HTML sign-in page instead of image bytes, and every
 *    photo will be skipped with a warning.
 *
 * Until BOTH are shared, this script fails with a descriptive error and the
 * Meet the Team page keeps serving the hardcoded fallback list in
 * src/data/teamMembers.ts. A failed run NEVER overwrites the last good
 * team.json in Object Storage.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * What it does:
 *   1. Fetches the published CSV export of the form-responses sheet.
 *   2. Parses rows (quoted fields with commas/newlines handled), matching
 *      columns by header name so the form can gain questions without
 *      breaking the sync.
 *   3. Cleans answers (strips AI preambles and question echoes).
 *   4. Downloads each person's Drive photo into Object Storage under team/.
 *   5. Writes team/team.json — the page reads it via GET /api/team/team.json.
 *
 * Run from a daily Scheduled Deployment:
 *   pnpm --filter @workspace/nova-havens run sync:team
 */

import { parse } from 'csv-parse/sync';
import { Client } from '@replit/object-storage';

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1o0gu36md6JGGbP2NH5NZaKJWtMXAc5lrlCibxfnikFo/gviz/tq?tqx=out:csv';

const TEAM_PREFIX = 'team/';
const TEAM_JSON_KEY = 'team/team.json';

/**
 * Job titles are maintained HERE because the Google Form does not collect
 * them. Keyed on the member's first name (accent- and case-insensitive).
 * Anyone not listed gets an empty role and their card shows no role line.
 */
const ROLE_BY_FIRST_NAME = {
  paulina: 'Senior Property Coordinator',
  alishia: 'Housing Coordination',
  sydney: 'Leasing & Move-In Coordination',
  chane: 'Client Coordination', // Chané
  brenda: 'Client Support',
  fazal: 'AI Engineer',
};

/** Sheet column headers, matched by name (not position). */
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

/**
 * Browser-safe formats only. This whitelist is the single source of truth for
 * what the sync accepts AND what the API route serves — anything else (HEIC,
 * TIFF, SVG, …) is treated as a per-person photo failure (null + initials).
 */
const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

let storage;

function getStorage() {
  storage ??= new Client();
  return storage;
}

export function normalizeText(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

/** Accent/case-insensitive lookup helper ("Chané" -> "chane"). */
export function normalizeName(value) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function slugify(name) {
  const slug = normalizeName(name).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug || 'member';
}

export function initialsOf(name) {
  const parts = normalizeText(name).split(' ').filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || '?';
}

/**
 * Some respondents paste an AI-generated answer including its preamble, e.g.
 * "Here's a concise and professional response you could use:" followed by a
 * bold restatement of the question. Strip the leading "Here's ...:" sentence
 * and any leading bold/markdown heading, keeping only the real answer.
 */
export function stripAiPreamble(text) {
  let out = text.trim();
  out = out.replace(/^here(?:'| i)s\b[^:\n]{0,120}:\s*/i, '');
  out = out.replace(/^\*\*[^*]+\*\*\s*/, '');
  out = out.replace(/^#{1,6}\s+[^\n]+\n?/, '');
  return out.trim();
}

/**
 * Some respondents restate the question before answering, e.g. beginning with
 * "My favorite part of working at Nova Havens is". Strip that echo (matched
 * against the column header) and capitalise what remains.
 */
export function stripQuestionEcho(text, question) {
  // Whitespace-flexible prefix match: the sheet's echo may wrap or add spaces
  // that differ from the header, so match on the normalized shape but strip
  // from the original text by match length.
  // Escape regex specials FIRST, then turn whitespace runs into flexible \s+
  // (doing it in the other order would escape the backslash in \s+ itself).
  const pattern = new RegExp(
    `^${question
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\s+/g, '\\s+')}`,
    'i',
  );
  let out = text.trim().replace(pattern, '').trim();
  out = out.replace(/^[-–—:.]+\s*/, '');
  if (out.length > 0) {
    out = out[0].toUpperCase() + out.slice(1);
  }
  return out;
}

export function cleanAnswer(raw, question) {
  return stripQuestionEcho(stripAiPreamble(String(raw ?? '')), question);
}

/** Find a row's value by header name, tolerating whitespace differences. */
function makeColumnGetter(row) {
  const lookup = new Map(Object.keys(row).map((key) => [normalizeText(key).toLowerCase(), key]));
  return (header) => {
    const actualKey = lookup.get(normalizeText(header).toLowerCase());
    return actualKey === undefined ? '' : String(row[actualKey] ?? '');
  };
}

export function extractDriveFileId(url) {
  const match = String(url).match(/[?&]id=([\w-]+)/) ?? String(url).match(/\/file\/d\/([\w-]+)/);
  return match ? match[1] : null;
}

/**
 * Download one person's photo from Drive and upload it to Object Storage.
 * Returns the storage key on success, or null (with a warning) on failure.
 * Photo failures NEVER break the run.
 */
async function syncPhoto(name, slug, photoUrl) {
  const fileId = extractDriveFileId(photoUrl);
  if (!fileId) {
    console.warn(`[sync-team] WARNING: ${name} — no usable Drive file ID in photo link; photo set to null.`);
    return null;
  }

  const response = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`, {
    redirect: 'follow',
  });
  if (!response.ok) {
    throw new Error(`Drive download for ${name} failed with HTTP ${response.status}`);
  }

  const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  if (!contentType.startsWith('image/')) {
    throw new Error(
      `Drive returned "${contentType || 'unknown'}" instead of an image for ${name}. ` +
        'This means the Drive folder holding the form photo uploads is not shared publicly — ' +
        'set folder 1JBnfTrWklVqbgaWE_mR4aSr0Yp-0i6hjA4yKw44RErtHUmbGxr3xsdJBtF1dSOOzgBBN3AJe ' +
        'to "Anyone with the link can view" and re-run.',
    );
  }

  const ext = MIME_EXT[contentType];
  if (!ext) {
    throw new Error(
      `photo for ${name} is "${contentType}", which browsers may not render — ` +
        'accepted formats: JPEG, PNG, GIF, WebP',
    );
  }
  const key = `${TEAM_PREFIX}${slug}${ext}`;
  const bytes = Buffer.from(await response.arrayBuffer());
  const result = await getStorage().uploadFromBytes(key, bytes);
  if (!result.ok) {
    throw new Error(`Object Storage upload failed for ${name}: ${result.error.message}`);
  }
  return key;
}

export async function transformTeamRow(
  row,
  {
    rowIndex = 0,
    syncPhotoForMember = syncPhoto,
  } = {},
) {
  const get = makeColumnGetter(row);
  const name = normalizeText(get(COL.name));
  if (!name) return null;

  const slug = slugify(name);
  const firstName = normalizeName(name).split(' ')[0];
  const answers = {};
  for (const key of ANSWER_KEYS) {
    answers[key] = cleanAnswer(get(COL[key]), COL[key]);
  }

  let photo = null;
  const photoUrl = normalizeText(get(COL.photo));
  if (photoUrl) {
    try {
      photo = await syncPhotoForMember(name, slug, photoUrl);
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

export async function transformTeamRows(
  rows,
  {
    syncPhotoForMember = syncPhoto,
    generatedAt = new Date().toISOString(),
  } = {},
) {
  const firstRow = rows[0] ?? {};
  const headerLookup = new Set(
    Object.keys(firstRow).map((key) => normalizeText(key).toLowerCase()),
  );
  const missingHeaders = Object.values(COL).filter(
    (header) => !headerLookup.has(normalizeText(header).toLowerCase()),
  );
  if (rows.length === 0 || missingHeaders.length > 0) {
    throw new Error(
      `sheet is missing required column(s): ${missingHeaders.join(', ') || '(no data rows)'}`,
    );
  }

  const members = [];
  let skippedBlank = 0;
  for (const [index, row] of rows.entries()) {
    const member = await transformTeamRow(row, {
      rowIndex: index,
      syncPhotoForMember,
    });
    if (!member) {
      skippedBlank += 1;
      continue;
    }
    members.push(member);
  }

  if (members.length === 0) {
    throw new Error('parsed zero valid members from the sheet');
  }

  members.sort((a, b) => a._sortKey - b._sortKey || a._rowIndex - b._rowIndex);
  return {
    generatedAt,
    count: members.length,
    members: members.map(({ _sortKey, _rowIndex, ...member }) => member),
    skippedBlank,
  };
}

async function main() {
  console.log('[sync-team] Fetching form responses…');
  let csvText;
  try {
    const response = await fetch(SHEET_CSV_URL, { redirect: 'follow' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    csvText = await response.text();
  } catch (error) {
    console.error(
      `[sync-team] ERROR: could not fetch the responses sheet (${error.message}). ` +
        'Is it shared as "Anyone with the link can view"? Leaving existing team.json untouched.',
    );
    process.exit(1);
  }

  let rows;
  try {
    rows = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      relax_column_count: true,
      trim: false,
    });
  } catch (error) {
    console.error(`[sync-team] ERROR: CSV parse failed (${error.message}). Leaving existing team.json untouched.`);
    process.exit(1);
  }

  let transformed;
  try {
    transformed = await transformTeamRows(rows);
  } catch (error) {
    console.error(`[sync-team] ERROR: ${error.message}. Leaving existing team.json untouched.`);
    process.exit(1);
  }
  const { skippedBlank, ...payload } = transformed;
  if (skippedBlank > 0) {
    console.log(`[sync-team] Skipped ${skippedBlank} row(s) with a blank Name.`);
  }

  const upload = await getStorage().uploadFromText(TEAM_JSON_KEY, JSON.stringify(payload, null, 2));
  if (!upload.ok) {
    console.error(`[sync-team] ERROR: failed to write ${TEAM_JSON_KEY}: ${upload.error.message}`);
    process.exit(1);
  }

  const withPhotos = payload.members.filter((m) => m.photo).length;
  console.log(
    `[sync-team] Done. ${payload.count} member(s) written to ${TEAM_JSON_KEY} ` +
      `(${withPhotos} with photos, ${payload.count - withPhotos} initials-only).`,
  );
}

// Run only when invoked directly — the helpers above are exported for tests.
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch((error) => {
    console.error(`[sync-team] ERROR: unexpected failure — ${error.message}`);
    process.exit(1);
  });
}
