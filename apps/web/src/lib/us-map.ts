import 'server-only';

import { geoAlbersUsa, geoPath } from 'd3-geo';
import type { FeatureCollection, Geometry } from 'geojson';
import { feature } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';
import type { GeometryCollection, Topology } from 'topojson-specification';
import statesTopology from 'us-atlas/states-10m.json';

import { BRAND, SERVICE_AREA } from '@/config/site';
import { PROPERTY_STATS } from './property-stats';

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

export interface CoverageMapSummary {
  statesWithRecords: number;
  topStates: { code: string; name: string; count: number }[];
  topCities: { city: string; count: number }[];
}

/** Facts the page prints next to the map (and uses for alt text). */
export function getCoverageSummary(): CoverageMapSummary {
  const { states } = getUsMapGeometry();
  const counts = PROPERTY_STATS.byState;
  const topStates = states
    .filter((s) => (counts[s.code] ?? 0) > 0)
    .map((s) => ({ code: s.code, name: s.name, count: counts[s.code] ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  return {
    statesWithRecords: Object.values(counts).filter((n) => n > 0).length,
    topStates,
    topCities: [...PROPERTY_STATS.cities]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((c) => ({ city: c.city, count: c.count })),
  };
}

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

  const counts = PROPERTY_STATS.byState;
  const maxCount = Math.max(1, ...Object.values(counts));
  const cities = PROPERTY_STATS.cities
    .map((c) => ({ ...c, point: project([c.lng, c.lat]) }))
    .filter((c): c is typeof c & { point: [number, number] } => c.point !== null)
    .sort((a, b) => b.count - a.count)
    .slice(0, detailed ? 10 : 8);
  const topCityCount = Math.max(1, cities[0]?.count ?? 1);
  const labelledCities = detailed ? cities.slice(0, 6) : [];
  const collides = (c: [number, number]) =>
    labelledCities.some((l) => Math.abs(l.point[0] - c[0]) < 70 && Math.abs(l.point[1] - c[1]) < 34);

  const fillFor = (code: string, contiguous: boolean) => {
    const n = counts[code] ?? 0;
    if (!contiguous) return n > 0 ? hexAlpha(gold, 0.14) : hexAlpha(fg, 0.05);
    return hexAlpha(gold, n > 0 ? 0.18 + 0.42 * Math.sqrt(n / maxCount) : 0.12);
  };

  const statePaths = states
    .map(
      (s) =>
        `<path d="${s.d}" fill="${fillFor(s.code, s.contiguous)}" stroke="${bg}" stroke-width="${detailed ? 1.4 : 1.1}" stroke-linejoin="round"><title>${esc(
          `${s.name}${s.contiguous ? ' — served by Nova Havens' : ' — outside the contiguous service area'}${
            (counts[s.code] ?? 0) > 0
              ? ` · ${(counts[s.code] ?? 0).toLocaleString('en-US')} verified property records`
              : ''
          }`,
        )}</title></path>`,
    )
    .join('');

  const stateLabels = detailed
    ? states
        .filter((s) => s.contiguous && !collides(s.centroid))
        .map(
          (s) =>
            `<text x="${s.centroid[0]}" y="${s.centroid[1]}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="700" fill="${
              (counts[s.code] ?? 0) > 0 ? hexAlpha(fg, 0.85) : hexAlpha(muted, 0.7)
            }">${s.code}</text>`,
        )
        .join('')
    : '';

  const pins = cities
    .map((c) => {
      const r = detailed ? 5 + 9 * Math.sqrt(c.count / topCityCount) : 4 + 5 * Math.sqrt(c.count / topCityCount);
      return `<g transform="translate(${c.point[0]} ${c.point[1]})"><circle r="${r.toFixed(1)}" fill="${hexAlpha(gold, 0.28)}"/><circle r="${Math.max(
        2.5,
        r * 0.4,
      ).toFixed(
        1,
      )}" fill="${gold}" stroke="${bg}" stroke-width="1.5"/><title>${esc(`${c.city} · ${c.count.toLocaleString('en-US')} verified property records`)}</title></g>`;
    })
    .join('');

  const cityLabels = labelledCities
    .map(
      (c) =>
        `<text x="${c.point[0] + 12}" y="${c.point[1] - 8}" font-size="12" font-weight="600" fill="${fg}" stroke="${bg}" stroke-width="3" paint-order="stroke">${esc(
          c.city.split(',')[0] ?? c.city,
        )}</text>`,
    )
    .join('');

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
