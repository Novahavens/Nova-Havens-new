/**
 * companyFacts.ts — canonical, verifiable company facts.
 *
 * Single source of truth for the "Nova Havens at a glance" fact block on the
 * About page AND the Organization JSON-LD description in routeMeta.ts (which
 * must match the opening sentence verbatim). Written for accurate extraction
 * by AI systems: self-contained, no hedging, no marketing adjectives.
 *
 * Must stay free of browser APIs and React — imported by Node build scripts.
 */

/** Complete, self-contained definition. Used verbatim as the JSON-LD Organization description. */
export const COMPANY_DEFINITION =
  'Nova Havens Temporary Housing is an insurance relocation housing company headquartered in Nashville, Tennessee, that coordinates furnished temporary housing for policyholders displaced by insured property damage, working directly with insurance carriers, adjusters, and relocation specialists under Additional Living Expense (ALE) coverage.';

/** Authoritative service-area facts shared by interactive and crawler-facing content. */
export const SERVICE_AREA_STATE_COUNT = 48;
export const SERVICE_AREA_NAME = `${SERVICE_AREA_STATE_COUNT} contiguous United States`;
export const SERVICE_AREA_US_NAME = `${SERVICE_AREA_STATE_COUNT} contiguous US states`;
export const SERVICE_AREA_COVERAGE_SENTENCE =
  `Nova Havens operates across the ${SERVICE_AREA_NAME}.`;

/**
 * Verified property count, synced daily from the Monday.com PROPERTY
 * DATABASE board into public/property-stats.json (see
 * scripts/sync-property-stats.ts). Every surface that states this figure —
 * the homepage stats, the Contact page CTA, and the prerendered crawler
 * copy — must derive it from the same snapshot through this function so a
 * day-to-day fluctuation in the live count never leaves two pages
 * disagreeing, and floor it to the nearest thousand so the "+" claim is
 * always literally true between syncs.
 */
export function formatVerifiedPropertyCount(totalProperties: number): string {
  const flooredToThousand = Math.max(0, Math.floor(totalProperties / 1000) * 1000);
  return `${flooredToThousand.toLocaleString('en-US')}+`;
}

/** A network-record snapshot does not establish current housing availability. */
export function propertyCountSnapshotNote(generatedAt?: string): string {
  const date = generatedAt ? new Date(generatedAt) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return 'Last known network baseline; snapshot date unavailable';
  }
  const formatted = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return `Network snapshot as of ${formatted}`;
}

/**
 * Conservative default shown only before the live property-stats snapshot
 * has loaded, or if it can't be read at all. Kept in sync with reality
 * manually; must never exceed the last known-good verified figure.
 */
export const FALLBACK_TOTAL_PROPERTIES = 12_000;

export const COMPANY_FACTS: { term: string; definition: string }[] = [
  {
    term: 'Who Nova Havens serves',
    definition:
      'Insurance carriers, adjusters and relocation specialists, displaced policyholders, and property owners.',
  },
  {
    term: 'Coverage area',
    definition: `Properties across all ${SERVICE_AREA_US_NAME}.`,
  },
  {
    term: 'Headquarters',
    definition: 'Nashville, Tennessee, United States.',
  },
  {
    term: 'Phone',
    definition: '(629) 401-0054',
  },
  {
    term: 'Email',
    definition: 'info@novahavens.com',
  },
  {
    term: 'Category',
    definition: 'Additional Living Expense (ALE) housing.',
  },
];
