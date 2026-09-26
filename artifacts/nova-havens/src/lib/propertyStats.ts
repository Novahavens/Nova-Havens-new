/**
 * propertyStats.ts — shared client-side accessor for the live property
 * count snapshot synced from Monday.com (scripts/sync-property-stats.ts →
 * public/property-stats.json).
 *
 * Every page that states the network's property count must read it through
 * `usePropertyStats`, not fetch or hardcode it separately — that is what
 * previously let the homepage and Contact page drift to different numbers.
 */
import { useEffect, useState } from 'react';

import { FALLBACK_TOTAL_PROPERTIES } from './companyFacts';

export type PropertyCity = { city: string; lat: number; lng: number; count: number };

export type PropertyStats = {
  generatedAt?: string;
  totalProperties: number;
  statesCovered: number;
  byState: Record<string, number>;
  cities: PropertyCity[];
};

const DEFAULT_FALLBACK_STATS: PropertyStats = {
  totalProperties: FALLBACK_TOTAL_PROPERTIES,
  statesCovered: 48,
  byState: {},
  cities: [],
};

/**
 * Fetches the live property-stats snapshot on mount and returns it once
 * loaded. Returns `fallback` (a safe, non-zero default) before the fetch
 * resolves and if it fails or the response is malformed or not-yet-synced,
 * so the page never renders an empty or zero count.
 */
export function usePropertyStats(fallback: PropertyStats = DEFAULT_FALLBACK_STATS): PropertyStats {
  const [stats, setStats] = useState<PropertyStats>(fallback);

  useEffect(() => {
    fetch('/property-stats.json', { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) throw new Error(`Stats request failed: ${response.status}`);
        return response.json() as Promise<PropertyStats>;
      })
      .then((data) => {
        if (
          typeof data.totalProperties !== 'number' ||
          typeof data.statesCovered !== 'number' ||
          !data.byState ||
          !Array.isArray(data.cities) ||
          data.totalProperties === 0
        ) throw new Error('Invalid or not-yet-synced property stats');
        setStats(data);
      })
      .catch(() => {
        // Keep the fallback if the daily sync has not produced a file yet
        // or the request is unavailable.
      });
    // Only ever run once per mount — the fallback object identity is not a
    // meaningful dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return stats;
}
