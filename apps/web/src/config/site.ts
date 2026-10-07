/**
 * site.ts — the single source of truth for company and brand facts.
 *
 * Every phone number, email, address, social profile, legal name and intake
 * form URL on the site comes from here. Change a fact once and every page,
 * every JSON-LD block, llms.txt and the sitemap update together.
 *
 * Keep this file free of browser APIs and React: it is imported by route
 * handlers, metadata generators and the sync scripts.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://novahavens.com').replace(/\/+$/, '');

export const COMPANY = {
  /** Short brand name used in titles and the logo. */
  name: 'Nova Havens',
  /** Full trading name used in the canonical definition and structured data. */
  legalName: 'Nova Havens Temporary Housing',
  tagline: 'Nationwide Furnished Housing Coordination',
  /** Canonical one-sentence definition. Used verbatim in JSON-LD and llms.txt. */
  definition:
    'Nova Havens Temporary Housing is an insurance relocation housing company headquartered in Nashville, Tennessee, that coordinates furnished temporary housing for policyholders displaced by insured property damage under Additional Living Expense (ALE) coverage.',
  description:
    'Nova Havens places insurance-displaced families into verified furnished homes nationwide within 24–48 hours — so families pay nothing out of pocket and can focus on recovery.',
  founded: undefined as string | undefined, // e.g. '2021' — add when confirmed
  category: 'Additional Living Expense (ALE) housing',
  serviceType: 'Insurance Housing Coordination',
  hoursNote:
    'Urgent housing requests are answered 24 hours a day, 7 days a week. General enquiries receive a reply within one business day.',
} as const;

export const CONTACT = {
  /** Main line — 24/7 for emergency claims and placements. */
  phone: { display: '(629) 401-0054', e164: '+16294010054', href: 'tel:+16294010054' },
  /** After-hours specialty line shown on the homepage emergency band and Contact page. */
  afterHoursPhone: { display: '(629) 206-2360', e164: '+16292062360', href: 'tel:+16292062360' },
  email: 'info@novahavens.com',
  /** Bulk routing addresses published in llms.txt. */
  claimsEmail: 'claims@novahavens.com',
  propertiesEmail: 'properties@novahavens.com',
  /** Named fallback used when the embedded contact form cannot load. */
  fallbackEmail: 'william@novahavens.com',
  address: {
    locality: 'Nashville',
    region: 'TN',
    regionName: 'Tennessee',
    country: 'US',
    countryName: 'United States',
    /** Street address intentionally unpublished; add here if it should appear. */
    street: undefined as string | undefined,
    postalCode: undefined as string | undefined,
  },
} as const;

export const SOCIAL = {
  linkedin: 'https://www.linkedin.com/company/novahavenshousing',
  instagram: 'https://www.instagram.com/novahavenshousing/',
  facebook: 'https://www.facebook.com/novahavenshousing',
} as const;

export const SOCIAL_PROFILE_URLS = Object.values(SOCIAL);

/** Hosted Jotform intake forms. The site links to these; it does not re-implement them. */
export const INTAKE_FORMS = {
  housing: 'https://form.jotform.com/233367822228156',
  property: 'https://form.jotform.com/233211031603032',
  /** Embedded on the Contact page. */
  contact: 'https://form.jotform.com/262575434019055',
} as const;

export const EXTERNAL_LINK_PROPS = { target: '_blank', rel: 'noopener noreferrer' } as const;

/** Authoritative service-area facts shared by every surface. */
export const SERVICE_AREA = {
  stateCount: 48,
  name: '48 contiguous United States',
  usName: '48 contiguous US states',
  coverageSentence: 'Nova Havens operates across the 48 contiguous United States.',
} as const;

/** Verified public stats. Update here when the year-end figures are refreshed. */
export const PUBLIC_STATS = {
  familiesAssisted: { value: '531+', year: 2025 },
  averageDaysToPlace: { value: '< 5 Days', year: 2025 },
  googleRating: { value: 4.8, outOf: 5 },
} as const;

/** The network property figure published site-wide (rendered as "60,000+"). */
export const PUBLISHED_PROPERTY_COUNT = 60_000;

export const BRAND = {
  /** The only gold in the system. Mirrors --primary in src/styles/tokens.css. */
  primaryHex: '#D4A24C',
  backgroundHex: '#0A0C10',
  foregroundHex: '#F5F5F2',
  cardHex: '#111318',
  mutedHex: '#9BA3AF',
  fontFamily: 'Plus Jakarta Sans',
  /** Brand assets — see public/brand/README.md and docs/BRAND.md. */
  assets: {
    /** Heart-house mark + "Nova Havens Home Rentals" wordmark, transparent background. */
    logoHorizontal: '/brand/logo-horizontal.png',
    /** Square heart-house mark, transparent background. */
    logoMark: '/brand/logo-mark.png',
    favicon: '/favicon.ico',
    ogImage: '/og-image.png',
  },
} as const;

export const COMPANY_FACTS: { term: string; definition: string }[] = [
  {
    term: 'Who Nova Havens serves',
    definition:
      'Displaced families and property owners seeking temporary housing solutions.',
  },
  { term: 'Coverage area', definition: `Properties across all ${SERVICE_AREA.usName}.` },
  {
    term: 'Headquarters',
    definition: `${CONTACT.address.locality}, ${CONTACT.address.regionName}, ${CONTACT.address.countryName}.`,
  },
  { term: 'Phone', definition: CONTACT.phone.display },
  { term: 'Email', definition: CONTACT.email },
  { term: 'Category', definition: `${COMPANY.category}.` },
];

export const PARTNERS: { name: string; websiteUrl: string; logo?: string; logoClass?: string; showName: boolean }[] = [
  {
    name: 'Allstate',
    websiteUrl: 'https://www.allstate.com/',
    logo: '/logos/allstate.png',
    logoClass: 'h-8',
    showName: true,
  },
  {
    name: 'Travelers',
    websiteUrl: 'https://www.travelers.com/',
    logo: '/logos/travelers.png',
    logoClass: 'h-8',
    showName: true,
  },
  {
    name: 'Farmers Insurance',
    websiteUrl: 'https://www.farmers.com/',
    logo: '/logos/farmers.svg',
    logoClass: 'h-9',
    showName: true,
  },
  {
    name: 'State Farm',
    websiteUrl: 'https://www.statefarm.com/',
    logo: '/logos/state-farm.svg',
    logoClass: 'h-6',
    showName: false,
  },
  { name: 'Mercury', websiteUrl: 'https://www.mercuryinsurance.com/', showName: true },
  {
    name: 'Lemonade',
    websiteUrl: 'https://www.lemonade.com/',
    logo: '/logos/lemonade.svg',
    logoClass: 'h-8 brightness-0 invert',
    showName: false,
  },
  { name: 'Chubb', websiteUrl: 'https://www.chubb.com/', logo: '/logos/chubb.png', logoClass: 'h-7', showName: false },
];

/** Primary navigation, shared by the header and footer. */
export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/meet-the-team', label: 'Team' },
  { href: '/about-us', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export const FOOTER_LINKS = [
  { href: '/about-us', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/meet-the-team', label: 'Meet the Team' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/llms-txt', label: 'llms.txt' },
  { href: '/sitemap', label: 'Site Map' },
] as const;
