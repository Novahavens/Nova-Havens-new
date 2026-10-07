import 'server-only';

import { geoAlbersUsa, geoPath } from 'd3-geo';
import type { FeatureCollection, Geometry } from 'geojson';
import { feature } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';
import type { GeometryCollection, Topology } from 'topojson-specification';
import statesTopology from 'us-atlas/states-10m.json';

import { BRAND, SERVICE_AREA } from '@/config/site';

/** The metros pinned on the coverage map. Order is only used for label placement. */
export const FEATURED_METROS: { city: string; state: string; lat: number; lng: number }[] = [
  { city: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
  { city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
  { city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
  { city: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784 },
  { city: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.074 },
  { city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
  { city: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.797 },
  { city: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
  { city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
  { city: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816 },
  { city: 'Memphis', state: 'TN', lat: 35.1495, lng: -90.049 },
  { city: 'Atlanta', state: 'GA', lat: 33.749, lng: -84.388 },
  { city: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431 },
  { city: 'Washington', state: 'DC', lat: 38.9072, lng: -77.0369 },
  { city: 'New York', state: 'NY', lat: 40.7128, lng: -74.006 },
];

/**
 * us-map.ts — real US geometry and the two coverage-map SVGs.
 *
 * Source: us-atlas (US Census Bureau boundaries, 1:10m), simplified with
 * Visvalingam weighting and projected with Albers USA (Alaska/Hawaii inset).
 * The maps are emitted as standalone SVG files by route handlers
 * (app/maps/*.svg/route.ts) and embedded with <img>, so the ~50 KB of path
 * data is cached once by the browser instead of being inlined into every
 * page's HTML and RSC payload. Everything here runs at build time.
 */

export const MAP_WIDTH = 960;
export const MAP_HEIGHT = 600;

/** Visvalingam area threshold (degrees²). Higher = fewer points. Tuned for ≈45 KB of path data. */
const SIMPLIFY_MIN_WEIGHT = 0.01;

/** FIPS code → USPS postal code for the 50 states + DC. Territories are excluded. */
const FIPS_TO_CODE: Record<string, string> = {
  '01': 'AL',
  '02': 'AK',
  '04': 'AZ',
  '05': 'AR',
  '06': 'CA',
  '08': 'CO',
  '09': 'CT',
  '10': 'DE',
  '11': 'DC',
  '12': 'FL',
  '13': 'GA',
  '15': 'HI',
  '16': 'ID',
  '17': 'IL',
  '18': 'IN',
  '19': 'IA',
  '20': 'KS',
  '21': 'KY',
  '22': 'LA',
  '23': 'ME',
  '24': 'MD',
  '25': 'MA',
  '26': 'MI',
  '27': 'MN',
  '28': 'MS',
  '29': 'MO',
  '30': 'MT',
  '31': 'NE',
  '32': 'NV',
  '33': 'NH',
  '34': 'NJ',
  '35': 'NM',
  '36': 'NY',
  '37': 'NC',
  '38': 'ND',
  '39': 'OH',
  '40': 'OK',
  '41': 'OR',
  '42': 'PA',
  '44': 'RI',
  '45': 'SC',
  '46': 'SD',
  '47': 'TN',
  '48': 'TX',
  '49': 'UT',
  '50': 'VT',
  '51': 'VA',
  '53': 'WA',
  '54': 'WV',
  '55': 'WI',
  '56': 'WY',
};

const NON_CONTIGUOUS = new Set(['AK', 'HI', 'DC']);

export interface StateShape {
  code: string;
  name: string;
  d: string;
  centroid: [number, number];
  contiguous: boolean;
}

interface UsMapGeometry {
  states: StateShape[];
  nationPath: string;
  project: (lngLat: [number, number]) => [number, number] | null;
}

type StatesTopology = Topology<{ states: GeometryCollection<{ name: string }> }>;

let cached: UsMapGeometry | null = null;

function getUsMapGeometry(): UsMapGeometry {
  if (cached) return cached;

  // simplify() mutates its input, so work on a copy of the imported JSON.
  const topology = simplify(
    presimplify(structuredClone(statesTopology) as unknown as StatesTopology),
    SIMPLIFY_MIN_WEIGHT,
  );
  const collection = feature(topology, topology.objects.states) as FeatureCollection<Geometry, { name: string }>;
  const stateFeatures = collection.features.filter((f) => FIPS_TO_CODE[String(f.id)]);

  const projection = geoAlbersUsa().fitSize([MAP_WIDTH, MAP_HEIGHT], {
    type: 'FeatureCollection',
    features: stateFeatures,
  });
  const path = geoPath(projection).digits(1);

  const states: StateShape[] = stateFeatures
    .map((f) => {
      const code = FIPS_TO_CODE[String(f.id)]!;
      const [cx, cy] = path.centroid(f);
      return {
        code,
        name: f.properties.name,
        d: path(f) ?? '',
        centroid: [Math.round(cx), Math.round(cy)] as [number, number],
        contiguous: !NON_CONTIGUOUS.has(code),
      };
    })
    .filter((s) => s.d.length > 0)
    .sort((a, b) => a.code.localeCompare(b.code));

  const nationPath =
    path({
      type: 'FeatureCollection',
      features: stateFeatures.filter((f) => !NON_CONTIGUOUS.has(FIPS_TO_CODE[String(f.id)]!)),
    }) ?? '';

  cached = {
    states,
    nationPath,
    project: (lngLat) => {
      const p = projection(lngLat);
      return p ? [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10] : null;
    },
  };
  return cached;
}

export type CoverageMapVariant = 'compact' | 'detailed';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hexAlpha = (hex: string, alpha: number) =>
  `${hex}${Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0')}`;

/**
 * Renders a complete SVG document. Colours are literal (from BRAND) because an
 * SVG loaded through <img> cannot read the page's CSS variables.
 */
export function buildCoverageMapSvg(variant: CoverageMapVariant): string {
  const { states, nationPath, project } = getUsMapGeometry();
  const detailed = variant === 'detailed';
  const gold = BRAND.primaryHex;
  const bg = BRAND.backgroundHex;
  const fg = BRAND.foregroundHex;
  const muted = BRAND.mutedHex;

  const metros = FEATURED_METROS.map((c) => ({ ...c, point: project([c.lng, c.lat]) })).filter(
    (c): c is typeof c & { point: [number, number] } => c.point !== null,
  );
  const collides = (c: [number, number]) =>
    metros.some((m) => Math.abs(m.point[0] - c[0]) < 70 && Math.abs(m.point[1] - c[1]) < 34);

  const fillFor = (contiguous: boolean) => (contiguous ? hexAlpha(gold, 0.3) : hexAlpha(fg, 0.05));

  const statePaths = states
    .map(
      (s) =>
        `<path d="${s.d}" fill="${fillFor(s.contiguous)}" stroke="${bg}" stroke-width="${detailed ? 1.4 : 1.1}" stroke-linejoin="round"><title>${esc(
          `${s.name}${s.contiguous ? ' — served by Nova Havens' : ' — outside the contiguous service area'}`,
        )}</title></path>`,
    )
    .join('');

  const stateLabels = detailed
    ? states
        .filter((s) => s.contiguous && !collides(s.centroid))
        .map(
          (s) =>
            `<text x="${s.centroid[0]}" y="${s.centroid[1]}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="700" fill="${hexAlpha(muted, 0.7)}">${s.code}</text>`,
        )
        .join('')
    : '';

  const r = detailed ? 9 : 6;
  const pins = metros
    .map(
      (c) =>
        `<g transform="translate(${c.point[0]} ${c.point[1]})"><circle r="${r}" fill="${hexAlpha(gold, 0.28)}"/><circle r="${(r * 0.4).toFixed(1)}" fill="${gold}" stroke="${bg}" stroke-width="1.5"/><title>${esc(`${c.city}, ${c.state}`)}</title></g>`,
    )
    .join('');

  // Label on the left for metros whose label would otherwise run off the East Coast or into a neighbour.
  const labelLeft = new Set(['Washington', 'New York', 'Houston', 'Memphis', 'Los Angeles']);
  const cityLabels = detailed
    ? metros
        .map((c) => {
          const left = labelLeft.has(c.city);
          return `<text x="${c.point[0] + (left ? -12 : 12)}" y="${c.point[1] + (left ? 14 : -8)}" text-anchor="${left ? 'end' : 'start'}" font-size="12" font-weight="600" fill="${fg}" stroke="${bg}" stroke-width="3" paint-order="stroke">${esc(c.city)}</text>`;
        })
        .join('')
    : '';

  const title = `Map of the United States showing Nova Havens coverage across all ${SERVICE_AREA.usName}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" width="${MAP_WIDTH}" height="${MAP_HEIGHT}" role="img" aria-labelledby="t" font-family="Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif">
<title id="t">${esc(title)}</title>
<defs><filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<path d="${nationPath}" transform="translate(0 6)" fill="${hexAlpha(bg, 0.6)}"/>
${statePaths}
<path d="${nationPath}" fill="none" stroke="${hexAlpha(gold, 0.55)}" stroke-width="${detailed ? 1.6 : 1.3}" stroke-linejoin="round"/>
${stateLabels}
<g filter="url(#glow)">${pins}</g>
${cityLabels}
</svg>
`;
}
