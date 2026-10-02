/**
 * Sync live property counts from the Monday.com PROPERTY DATABASE board into
 * data/property-stats.json. One-shot: run it from the scheduled GitHub Action
 * (.github/workflows/sync-data.yml) or by hand, then rebuild/deploy the site.
 *
 *   MONDAY_API_TOKEN=... pnpm --filter @nova-havens/web sync:property-stats
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MONDAY_API_URL = 'https://api.monday.com/v2';
const BOARD_ID = process.env.MONDAY_PROPERTY_BOARD_ID?.trim() || '18415735059';
const STATE_COLUMN_ID = 'text_mm3yw9nf';
const CITY_COLUMN_ID = 'text_mm3yzy0x';
const STATUS_COLUMN_ID = 'color_mm44cn9c';
const PACKAGE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_PATH = resolve(PACKAGE_DIR, 'data/property-stats.json');
const PAGE_SIZE = 500;

const STATES: Record<string, string> = {
  alabama: 'AL',
  al: 'AL',
  alaska: 'AK',
  ak: 'AK',
  arizona: 'AZ',
  az: 'AZ',
  arkansas: 'AR',
  ar: 'AR',
  california: 'CA',
  ca: 'CA',
  colorado: 'CO',
  co: 'CO',
  connecticut: 'CT',
  ct: 'CT',
  delaware: 'DE',
  de: 'DE',
  florida: 'FL',
  fl: 'FL',
  georgia: 'GA',
  ga: 'GA',
  hawaii: 'HI',
  hi: 'HI',
  idaho: 'ID',
  id: 'ID',
  illinois: 'IL',
  il: 'IL',
  indiana: 'IN',
  in: 'IN',
  iowa: 'IA',
  ia: 'IA',
  kansas: 'KS',
  ks: 'KS',
  kentucky: 'KY',
  ky: 'KY',
  louisiana: 'LA',
  la: 'LA',
  maine: 'ME',
  me: 'ME',
  maryland: 'MD',
  md: 'MD',
  massachusetts: 'MA',
  ma: 'MA',
  michigan: 'MI',
  mi: 'MI',
  minnesota: 'MN',
  mn: 'MN',
  mississippi: 'MS',
  ms: 'MS',
  missouri: 'MO',
  mo: 'MO',
  montana: 'MT',
  mt: 'MT',
  nebraska: 'NE',
  ne: 'NE',
  nevada: 'NV',
  nv: 'NV',
  'new hampshire': 'NH',
  nh: 'NH',
  'new jersey': 'NJ',
  nj: 'NJ',
  'new mexico': 'NM',
  nm: 'NM',
  'new york': 'NY',
  ny: 'NY',
  'north carolina': 'NC',
  nc: 'NC',
  'north dakota': 'ND',
  nd: 'ND',
  ohio: 'OH',
  oh: 'OH',
  oklahoma: 'OK',
  ok: 'OK',
  oregon: 'OR',
  or: 'OR',
  pennsylvania: 'PA',
  pa: 'PA',
  'rhode island': 'RI',
  ri: 'RI',
  'south carolina': 'SC',
  sc: 'SC',
  'south dakota': 'SD',
  sd: 'SD',
  tennessee: 'TN',
  tn: 'TN',
  texas: 'TX',
  tx: 'TX',
  utah: 'UT',
  ut: 'UT',
  vermont: 'VT',
  vt: 'VT',
  virginia: 'VA',
  va: 'VA',
  washington: 'WA',
  wa: 'WA',
  'west virginia': 'WV',
  wv: 'WV',
  wisconsin: 'WI',
  wi: 'WI',
  wyoming: 'WY',
  wy: 'WY',
};

const CITY_COORDINATES: Record<string, { lat: number; lng: number; name: string; state: string }> = {
  'nashville|tn': { name: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816 },
  'los angeles|ca': { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
  'phoenix|az': { name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.074 },
  'dallas|tx': { name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.797 },
  'seattle|wa': { name: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
  'atlanta|ga': { name: 'Atlanta', state: 'GA', lat: 33.749, lng: -84.388 },
  'chicago|il': { name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
  'denver|co': { name: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
  'miami|fl': { name: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
  'portland|or': { name: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784 },
};

type MondayColumnValue = { id: string; text?: string | null; value?: string | null; label?: string | null };
type MondayItem = { column_values: MondayColumnValue[] };

const normalizedState = (value: string): string | null => STATES[value.trim().toLowerCase()] ?? null;
const normalizedCity = (value: string): string => (value.split(',')[0] ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

function columnText(item: MondayItem, id: string): string {
  const column = item.column_values.find((entry) => entry.id === id);
  return String(column?.text ?? column?.label ?? '').trim();
}

async function mondayRequest<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) throw new Error('MONDAY_API_TOKEN is not available in the environment.');
  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`Monday.com API returned HTTP ${response.status}.`);
  const payload = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (payload.errors?.length) throw new Error(payload.errors.map((e) => e.message).join('; '));
  if (!payload.data) throw new Error('Monday.com API returned no data.');
  return payload.data;
}

const COLUMN_IDS = JSON.stringify([STATE_COLUMN_ID, CITY_COLUMN_ID, STATUS_COLUMN_ID]);

async function fetchAllItems(): Promise<MondayItem[]> {
  const items: MondayItem[] = [];
  let cursor: string | null = null;
  do {
    if (cursor) {
      const data: { next_items_page: { cursor: string | null; items: MondayItem[] } } = await mondayRequest(
        `query ($cursor: String!, $limit: Int!) { next_items_page(limit: $limit, cursor: $cursor) { cursor items { column_values(ids: ${COLUMN_IDS}) { id text value } } } }`,
        { cursor, limit: PAGE_SIZE },
      );
      items.push(...data.next_items_page.items);
      cursor = data.next_items_page.cursor;
    } else {
      const data: { boards: { items_page: { cursor: string | null; items: MondayItem[] } }[] } = await mondayRequest(
        `query ($boardId: ID!, $limit: Int!) { boards(ids: [$boardId]) { items_page(limit: $limit) { cursor items { column_values(ids: ${COLUMN_IDS}) { id text value } } } } }`,
        { boardId: BOARD_ID, limit: PAGE_SIZE },
      );
      const page = data.boards[0]?.items_page;
      if (!page) throw new Error(`Board ${BOARD_ID} was not found or returned no items page.`);
      items.push(...page.items);
      cursor = page.cursor;
    }
    console.log(`Fetched ${items.length} items…`);
  } while (cursor);
  return items;
}

async function main() {
  const items = await fetchAllItems();
  const byState: Record<string, number> = {};
  const cityCounts = new Map<string, number>();
  let skippedNoState = 0;
  let totalProperties = 0;

  for (const item of items) {
    if (columnText(item, STATUS_COLUMN_ID).toUpperCase() === 'DO NOT USE') continue;
    totalProperties++;
    const state = normalizedState(columnText(item, STATE_COLUMN_ID));
    if (!state) {
      skippedNoState++;
      continue;
    }
    byState[state] = (byState[state] ?? 0) + 1;
    const cityKey = `${normalizedCity(columnText(item, CITY_COLUMN_ID))}|${state.toLowerCase()}`;
    if (CITY_COORDINATES[cityKey]) cityCounts.set(cityKey, (cityCounts.get(cityKey) ?? 0) + 1);
  }

  if (totalProperties === 0) throw new Error('Refusing to write a zero-property snapshot.');

  const cities = [...cityCounts.entries()]
    .map(([key, count]) => {
      const place = CITY_COORDINATES[key]!;
      return { city: `${place.name}, ${place.state}`, lat: place.lat, lng: place.lng, count };
    })
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));

  const output = {
    generatedAt: new Date().toISOString(),
    totalProperties,
    statesCovered: Object.keys(byState).length,
    skippedNoState,
    byState: Object.fromEntries(Object.entries(byState).sort(([a], [b]) => a.localeCompare(b))),
    cities,
  };

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(
    `Wrote ${OUTPUT_PATH}: ${totalProperties} properties, ${Object.keys(byState).length} states, ${cities.length} mapped cities.`,
  );
}

main().catch((error) => {
  console.error(`Property stats sync failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
