import 'server-only';

import { FALLBACK_TOTAL_PROPERTIES, SERVICE_AREA } from '@/config/site';
import snapshot from '@data/property-stats.json';

/**
 * property-stats.ts — the verified network property count.
 *
 * data/property-stats.json is written by scripts/sync-property-stats.ts from
 * the Monday.com PROPERTY DATABASE board. It is imported at build time, so
 * every page states the same figure and a rebuild publishes a new one.
 */
export type PropertyStats = {
  generatedAt?: string;
  totalProperties: number;
  statesCovered: number;
  byState: Record<string, number>;
};

function readSnapshot(): PropertyStats {
  const data = snapshot as Partial<PropertyStats>;
  if (typeof data.totalProperties === 'number' && data.totalProperties > 0) {
    return {
      generatedAt: typeof data.generatedAt === 'string' ? data.generatedAt : undefined,
      totalProperties: data.totalProperties,
      statesCovered: typeof data.statesCovered === 'number' ? data.statesCovered : SERVICE_AREA.stateCount,
      byState: data.byState ?? {},
    };
  }
  return { totalProperties: FALLBACK_TOTAL_PROPERTIES, statesCovered: SERVICE_AREA.stateCount, byState: {} };
}

export const PROPERTY_STATS: PropertyStats = readSnapshot();

/** Floors to the nearest thousand so the "+" claim is literally true between syncs. */
export function formatVerifiedPropertyCount(totalProperties: number): string {
  const floored = Math.max(0, Math.floor(totalProperties / 1000) * 1000);
  return `${floored.toLocaleString('en-US')}+`;
}

/** A network-record snapshot does not establish current availability. */
export function propertyCountSnapshotNote(generatedAt?: string): string {
  const date = generatedAt ? new Date(generatedAt) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Last known network baseline; snapshot date unavailable';
  const formatted = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return `Network snapshot as of ${formatted}`;
}

export const VERIFIED_PROPERTY_COUNT = formatVerifiedPropertyCount(PROPERTY_STATS.totalProperties);
export const PROPERTY_STATS_NOTE = propertyCountSnapshotNote(PROPERTY_STATS.generatedAt);
