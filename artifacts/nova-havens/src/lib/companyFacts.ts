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
