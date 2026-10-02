/**
 * routes.ts — the registry of every public page.
 *
 * Used by app/sitemap.ts (sitemap.xml), app/sitemap/page.tsx (the HTML site
 * map) and the smoke tests, so the three can never disagree. Blog posts are
 * appended at build time from the content source.
 *
 * Update `lastModified` when a page's content materially changes — Google
 * trusts <lastmod> only if it is honest (see docs/SEO.md).
 */
export type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitePage {
  path: string;
  label: string;
  description: string;
  lastModified: string;
  changeFrequency: ChangeFrequency;
  priority: number;
  /** Grouping on the HTML site map. */
  group: 'Main' | 'Resources' | 'Legal & machine-readable';
}

export const SITE_PAGES: SitePage[] = [
  {
    path: '/',
    label: 'Home',
    description: 'Nationwide furnished housing coordination for insurance-displaced families.',
    lastModified: '2026-08-13',
    changeFrequency: 'weekly',
    priority: 1.0,
    group: 'Main',
  },
  {
    path: '/about-us',
    label: 'About Us',
    description: 'Who Nova Havens is, the problem it solves, and the principles behind every placement.',
    lastModified: '2026-07-27',
    changeFrequency: 'monthly',
    priority: 0.6,
    group: 'Main',
  },
  {
    path: '/meet-the-team',
    label: 'Meet the Team',
    description: 'The coordinators and family advocates you will work with directly.',
    lastModified: '2026-07-27',
    changeFrequency: 'monthly',
    priority: 0.6,
    group: 'Main',
  },
  {
    path: '/contact',
    label: 'Contact',
    description: 'Request emergency housing, submit a property, or send a general enquiry.',
    lastModified: '2026-07-27',
    changeFrequency: 'monthly',
    priority: 0.6,
    group: 'Main',
  },
  {
    path: '/blog',
    label: 'Blog & Resources',
    description: 'Guides for insurance professionals and displaced families.',
    lastModified: '2026-08-13',
    changeFrequency: 'weekly',
    priority: 0.8,
    group: 'Resources',
  },
  {
    path: '/sitemap',
    label: 'Site Map',
    description: 'Every page on novahavens.com, in one place.',
    lastModified: '2026-10-02',
    changeFrequency: 'monthly',
    priority: 0.3,
    group: 'Resources',
  },
  {
    path: '/llms-txt',
    label: 'llms.txt (readable)',
    description: 'Human-readable version of the machine-readable company index for AI assistants.',
    lastModified: '2026-08-13',
    changeFrequency: 'monthly',
    priority: 0.4,
    group: 'Legal & machine-readable',
  },
  {
    path: '/privacy-policy',
    label: 'Privacy Policy',
    description: 'How Nova Havens collects, uses and protects information.',
    lastModified: '2026-07-27',
    changeFrequency: 'yearly',
    priority: 0.3,
    group: 'Legal & machine-readable',
  },
  {
    path: '/terms-of-service',
    label: 'Terms of Service',
    description: 'The agreements governing use of Nova Havens services.',
    lastModified: '2026-07-27',
    changeFrequency: 'yearly',
    priority: 0.3,
    group: 'Legal & machine-readable',
  },
];

/** Non-HTML resources listed on the HTML site map for completeness (not in sitemap.xml). */
export const MACHINE_READABLE_FILES = [
  { path: '/sitemap.xml', label: 'sitemap.xml', description: 'XML sitemap submitted to search engines.' },
  { path: '/robots.txt', label: 'robots.txt', description: 'Crawler permissions; all search and AI crawlers allowed.' },
  { path: '/llms.txt', label: 'llms.txt', description: 'Plain-text company index for large language models.' },
] as const;
