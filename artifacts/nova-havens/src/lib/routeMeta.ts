/**
 * routeMeta.ts — single source of truth for per-route SEO metadata.
 *
 * Consumed by:
 *   - vitePluginMetaInject.ts  (Vite plugin — dev + build time, Node.js)
 *   - prerender.ts             (post-build static HTML generator, Node.js)
 *
 * Must stay free of browser APIs and React so it runs safely in Node.js.
 * Blog post meta is derived directly from blogPosts.ts to avoid drift.
 */

import { BLOG_POSTS } from '../data/blogPosts.ts';
import { HOME_FAQS } from '../data/homeFaqs.ts';
import { HOW_IT_WORKS_TRACKS } from '../data/howItWorks.ts';
import { COMPANY_DEFINITION } from './companyFacts.ts';
import { TEAM_MEMBERS } from '../data/teamMembers.ts';

export interface RouteMeta {
  title: string;
  description: string;
  ogType: string;
  canonicalUrl: string;
  /**
   * Absolute URL for og:image / twitter:image.
   * Defaults to the site-wide og-image.png when omitted.
   */
  ogImage?: string;
  /** Structured data object to inject as a <script type="application/ld+json"> in the <head>. */
  jsonLd?: Record<string, unknown> | null;
}

const SITE_NAME = 'Nova Havens';
const BASE_URL = 'https://novahavens.com';
/** Official profiles linked from the public site footer. */
const SOCIAL_PROFILE_URLS = [
  'https://www.linkedin.com/company/novahavenshousing',
  'https://www.instagram.com/novahavenshousing/',
  'https://www.facebook.com/novahavenshousing',
];
/** Single canonical business @id — every business reference resolves to this node. */
const BUSINESS_ID = `${BASE_URL}/#organization`;
/** Canonical WebSite node @id — referenced via `isPartOf` on page schemas. */
const WEBSITE_ID = `${BASE_URL}/#website`;
/**
 * WebSite schema node emitted on every page that has structured data, so all
 * `isPartOf: { '@id': WEBSITE_ID }` references resolve within the graph.
 */
const WEBSITE_SCHEMA = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE_NAME,
  url: `${BASE_URL}/`,
  publisher: { '@id': BUSINESS_ID },
};
const BUSINESS_PHONE = '+16294010054';
const BUSINESS_EMAIL = 'info@novahavens.com';
const BUSINESS_ADDRESS = {
  '@type': 'PostalAddress',
  addressLocality: 'Nashville',
  addressRegion: 'TN',
  addressCountry: 'US',
};
const BUSINESS_AREA_SERVED = {
  '@type': 'Country',
  name: 'United States',
};
const BUSINESS_SCHEMA = {
  '@type': 'LocalBusiness',
  '@id': BUSINESS_ID,
  name: SITE_NAME,
  url: `${BASE_URL}/`,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/og-image.png`,
  },
  description: COMPANY_DEFINITION,
  telephone: BUSINESS_PHONE,
  email: BUSINESS_EMAIL,
  address: BUSINESS_ADDRESS,
  areaServed: BUSINESS_AREA_SERVED,
  sameAs: SOCIAL_PROFILE_URLS,
  serviceType: 'Insurance Housing Coordination',
};

/**
 * Person schema for each real team member. Members without a confirmed role
 * simply omit jobTitle — we only publish verified facts about real people.
 */
const TEAM_PERSON_SCHEMAS = TEAM_MEMBERS.map((member) => ({
  '@type': 'Person',
  name: member.name,
  // A bracketed placeholder role (e.g. "[Role TBC]") is shown on the page as a
  // visible to-do, but must never be published as a verified fact.
  ...(member.role && !/^\[.*\]$/.test(member.role.trim())
    ? { jobTitle: member.role }
    : {}),
  worksFor: {
    '@id': BUSINESS_ID,
  },
}));
export const DEFAULT_DESCRIPTION =
  'Nova Havens places insurance-displaced families into verified furnished homes nationwide within 24–48 hours — billed directly to carriers so families pay nothing out of pocket.';

// ── FAQ parser: extracts Q&A pairs from blog post content ──────────────────
// FAQ sections follow the pattern:
//   ## Frequently Asked Questions: ...
//   (blank line)
//   **Question text?**
//   Answer text on subsequent lines (same \n\n block)

export function parseFaqsFromContent(
  content: string,
): { question: string; answer: string }[] {
  const blocks = content.split(/\n\n+/);
  const faqIdx = blocks.findIndex((b) =>
    /^## Frequently Asked Questions/.test(b),
  );
  if (faqIdx === -1) return [];

  const faqs: { question: string; answer: string }[] = [];
  for (let i = faqIdx + 1; i < blocks.length; i++) {
    const lines = blocks[i].split('\n');
    const firstLine = lines[0].trim();
    // Match bold question: **Question text?**
    if (
      firstLine.startsWith('**') &&
      firstLine.endsWith('**') &&
      firstLine.includes('?')
    ) {
      const question = firstLine.slice(2, -2);
      const answer = lines.slice(1).join(' ').trim();
      if (question && answer) {
        faqs.push({ question, answer });
      }
    }
  }
  return faqs;
}

// ── Static route metadata ──────────────────────────────────────────────────

const STATIC_META: Record<string, RouteMeta> = {
  '/': {
    title: `${SITE_NAME} | Nationwide Furnished Housing Coordination`,
    description: DEFAULT_DESCRIPTION,
    ogType: 'website',
    canonicalUrl: `${BASE_URL}/`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        WEBSITE_SCHEMA,
        BUSINESS_SCHEMA,
        ...HOW_IT_WORKS_TRACKS.map((track) => ({
          '@type': 'HowTo',
          name: track.schemaName,
          description: track.schemaDescription,
          step: track.steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text,
          })),
        })),
        {
          '@type': 'FAQPage',
          mainEntity: HOME_FAQS.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        },
      ],
    },
  },
  '/blog': {
    title: `Blog & Resources | ${SITE_NAME}`,
    description:
      'Nova Havens publishes guides for insurance professionals and displaced families on temporary housing, ALE coverage, and claims coordination.',
    ogType: 'website',
    canonicalUrl: `${BASE_URL}/blog`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        WEBSITE_SCHEMA,
        BUSINESS_SCHEMA,
        {
          '@type': 'ItemList',
          name: 'Nova Havens Blog & Resources',
          description:
            'Guides and resources for insurance professionals and displaced families on temporary housing, ALE coverage, and claims coordination.',
          url: `${BASE_URL}/blog`,
          itemListElement: BLOG_POSTS.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${BASE_URL}/blog/${post.slug}`,
            name: post.title,
            description: post.excerpt,
          })),
        },
        {
          '@type': 'FAQPage',
          mainEntity: BLOG_POSTS.flatMap((post) =>
            parseFaqsFromContent(post.content).slice(0, 2),
          )
            .slice(0, 10)
            .map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
        },
      ],
    },
  },
  '/meet-the-team': {
    title: `Meet the Team | ${SITE_NAME}`,
    description:
      'Nova Havens is staffed by coordinators, carrier specialists, and family advocates who manage furnished housing placements across all 48 contiguous US states.',
    ogType: 'website',
    canonicalUrl: `${BASE_URL}/meet-the-team`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        WEBSITE_SCHEMA,
        BUSINESS_SCHEMA,
        {
          '@type': 'AboutPage',
          '@id': `${BASE_URL}/meet-the-team`,
          name: 'Meet the Nova Havens Team',
          description:
            'The coordinators, carrier specialists, and family advocates behind Nova Havens — managing furnished housing placements across all 48 contiguous US states.',
          url: `${BASE_URL}/meet-the-team`,
          isPartOf: { '@id': `${BASE_URL}/#website` },
        },
        ...TEAM_PERSON_SCHEMAS,
      ],
    },
  },
  '/about-us': {
    title: `About Us | ${SITE_NAME}`,
    description:
      'Nova Havens coordinates furnished temporary housing for insurance-displaced families — placing them in verified homes within 24–48 hours, billed directly to carriers nationwide.',
    ogType: 'website',
    canonicalUrl: `${BASE_URL}/about-us`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        WEBSITE_SCHEMA,
        BUSINESS_SCHEMA,
        {
          '@type': 'AboutPage',
          '@id': `${BASE_URL}/about-us`,
          name: `About ${SITE_NAME}`,
          description:
            'Nova Havens coordinates furnished temporary housing for insurance-displaced families — placing them in verified homes within 24–48 hours, billed directly to carriers nationwide.',
          url: `${BASE_URL}/about-us`,
          isPartOf: { '@id': `${BASE_URL}/#website` },
          about: { '@id': BUSINESS_ID },
        },
        {
          '@type': 'FAQPage',
          mainEntity: HOME_FAQS.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        },
      ],
    },
  },
  '/contact': {
    title: `Contact Us | ${SITE_NAME}`,
    description:
      'Reach Nova Havens at (629) 401-0054 — available 24/7 for emergency claims and placements. Request housing, submit a property, or ask a general question.',
    ogType: 'website',
    canonicalUrl: `${BASE_URL}/contact`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        WEBSITE_SCHEMA,
        BUSINESS_SCHEMA,
        {
          '@type': 'ContactPage',
          '@id': `${BASE_URL}/contact`,
          name: `Contact ${SITE_NAME}`,
          description:
            'Reach Nova Havens at (629) 401-0054 — available 24/7 for emergency claims and placements. Request housing, submit a property, or ask a general question.',
          url: `${BASE_URL}/contact`,
          isPartOf: { '@id': `${BASE_URL}/#website` },
          about: { '@id': BUSINESS_ID },
        },
      ],
    },
  },
  '/privacy-policy': {
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      'Nova Havens privacy policy — how we collect, use, and protect your information when you use our temporary housing coordination services.',
    ogType: 'website',
    canonicalUrl: `${BASE_URL}/privacy-policy`,
  },
  '/terms-of-service': {
    title: `Terms of Service | ${SITE_NAME}`,
    description:
      'Nova Havens terms of service — the agreements governing use of our furnished housing coordination services for families, carriers, and property owners.',
    ogType: 'website',
    canonicalUrl: `${BASE_URL}/terms-of-service`,
  },
  '/llms-txt': {
    title: `llms.txt — AI & Machine-Readable Site Index | ${SITE_NAME}`,
    description:
      'A human-readable version of the Nova Havens llms.txt file — the machine-readable document that helps AI assistants understand who we are, what we do, and how to reach us.',
    ogType: 'website',
    canonicalUrl: `${BASE_URL}/llms-txt`,
  },
};

// ── Blog post routes derived from blogPosts.ts — no manual duplication ─────

const BLOG_POST_META: Record<string, RouteMeta> = Object.fromEntries(
  BLOG_POSTS.map((post) => {
    const faqs = parseFaqsFromContent(post.content);
    const faqSchema =
      faqs.length > 0
        ? {
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }
        : null;

    const authorSchema = post.author
      ? {
          '@type': 'Person',
          name: post.author.name,
          jobTitle: post.author.role,
          worksFor: { '@id': BUSINESS_ID },
        }
      : { '@id': BUSINESS_ID };

    const postOgImage = post.image ?? `${BASE_URL}/og-image.png`;

    const blogPostingSchema: Record<string, unknown> = {
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: postOgImage,
      datePublished: post.dateISO,
      dateModified: post.dateISO,
      url: `${BASE_URL}/blog/${post.slug}`,
      author: authorSchema,
      publisher: {
        '@id': BUSINESS_ID,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/blog/${post.slug}`,
      },
      articleSection: post.category,
      keywords: post.keywords.join(', '),
      isPartOf: {
        '@id': `${BASE_URL}/#website`,
      },
    };

    const graph: Record<string, unknown>[] = [
      WEBSITE_SCHEMA,
      BUSINESS_SCHEMA,
      blogPostingSchema,
    ];
    if (faqSchema) graph.push(faqSchema);

    return [
      `/blog/${post.slug}`,
      {
        title: `${post.title} | ${SITE_NAME}`,
        description: post.excerpt,
        ogType: 'article',
        canonicalUrl: `${BASE_URL}/blog/${post.slug}`,
        ogImage: postOgImage,
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': graph,
        },
      } satisfies RouteMeta,
    ];
  }),
);

// ── Combined map and helpers ───────────────────────────────────────────────

export const ALL_ROUTE_META: Record<string, RouteMeta> = {
  ...STATIC_META,
  ...BLOG_POST_META,
};

/** Every pathname that should have a pre-rendered HTML file. */
export const ALL_ROUTES: readonly string[] = Object.keys(ALL_ROUTE_META);

/**
 * Resolve meta for a given URL pathname.
 * Normalises trailing slashes and casing; falls back to site defaults.
 */
export function resolveRouteMeta(pathname: string): RouteMeta {
  const p = pathname === '/' ? '/' : pathname.replace(/\/+$/, '').toLowerCase();
  return (
    ALL_ROUTE_META[p] ?? {
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      ogType: 'website',
      canonicalUrl: `${BASE_URL}${pathname === '/' ? '/' : pathname.replace(/\/+$/, '')}`,
    }
  );
}
