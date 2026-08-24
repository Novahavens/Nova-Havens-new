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

export const COMPANY_FACTS: { term: string; definition: string }[] = [
  {
    term: 'Who Nova Havens serves',
    definition:
      'Insurance carriers, adjusters and relocation specialists, displaced policyholders, and property owners.',
  },
  {
    term: 'Coverage area',
    definition: 'Properties across 47 US states.',
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
    term: 'After Hours Specialty Line',
    definition: '(629) 206-2360',
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
