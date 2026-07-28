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
/** Official social profiles — used in Organization schema `sameAs`. */
const SOCIAL_PROFILE_URLS = [
  'https://www.linkedin.com/company/novahavenshousing',
  'https://www.instagram.com/novahavenshousing/',
  'https://www.facebook.com/novahavenshousing',
];
/** Single canonical entity @id — every Organization/LocalBusiness block must reference this. */
const BUSINESS_ID = `${BASE_URL}/#organization`;
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

const HOME_FAQS = [
  {
    question: 'How quickly can Nova Havens place a displaced family?',
    answer:
      'Nova Havens places most families into a verified furnished home within 5 days of the first contact — and often within 24–48 hours in major markets. Our automated claim-intake system surfaces matched properties within hours so coordinators can reach the family the same day a claim is submitted.',
  },
  {
    question: 'Does Nova Havens work with all insurance carriers?',
    answer:
      'Nova Havens coordinates with a wide range of insurance carriers and independent adjusters nationwide, including Allstate, Travelers, Farmers Insurance, and State Farm. If your carrier uses Additional Living Expenses (ALE) coverage, Nova Havens can typically bill them directly — so families pay nothing out of pocket for housing.',
  },
  {
    question: 'Are pet-friendly furnished homes available nationwide?',
    answer:
      'Yes. Nova Havens maintains a dedicated segment of pet-friendly properties across its network of 20,000+ verified homes. When you contact Nova Havens, simply share your pet\'s species, breed, and weight and a coordinator will match your family to a compatible property. Most pet deposits are covered under ALE policies.',
  },
  {
    question: 'Which states does Nova Havens operate in?',
    answer:
      'Nova Havens operates in all 48 contiguous US states, as of 2025. This includes major metros and rural areas, so families displaced in smaller communities receive the same quality of service as those in large cities.',
  },
  {
    question: "What does a 'fully furnished' Nova Havens home include?",
    answer:
      'Every Nova Havens property includes beds with quality linens, a fully equipped kitchen with cookware and dishes, high-speed Wi-Fi, a streaming-ready TV, and washer/dryer access. Properties are verified by Nova Havens coordinators before being listed in the network — so what you see is what you get.',
  },
  {
    question: 'How do I request emergency housing through Nova Havens?',
    answer:
      'To request emergency furnished housing through Nova Havens, call (629) 401-0054 or submit a request through the Contact page. Nova Havens responds to urgent housing requests 24/7. Your insurance carrier or adjuster can also initiate a placement on your behalf by contacting our team directly.',
  },
  {
    question: 'How does Nova Havens coordinate with my insurance adjuster?',
    answer:
      "Nova Havens assigns one dedicated coordinator to each placement. That coordinator communicates directly with your adjuster and carrier — handling documentation, extensions, and status updates — so you don't have to relay messages between parties. Adjusters receive proactive updates throughout the placement.",
  },
  {
    question: 'Can I list my furnished property with Nova Havens?',
    answer:
      'Yes. Property owners with fully furnished homes anywhere in the 48 contiguous US states can apply to join the Nova Havens network. Nova Havens conducts an inspection, verifies the property meets its standards, and then matches it with displaced families whose needs align. Contact (629) 401-0054 or visit the Contact page to get started.',
  },
];

const STATIC_META: Record<string, RouteMeta> = {
  '/': {
    title: `${SITE_NAME} | Nationwide Furnished Housing Coordination`,
    description: DEFAULT_DESCRIPTION,
    ogType: 'website',
    canonicalUrl: `${BASE_URL}/`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'LocalBusiness',
          '@id': BUSINESS_ID,
          name: SITE_NAME,
          url: `${BASE_URL}/`,
          telephone: BUSINESS_PHONE,
          email: BUSINESS_EMAIL,
          address: BUSINESS_ADDRESS,
          areaServed: BUSINESS_AREA_SERVED,
          sameAs: SOCIAL_PROFILE_URLS,
          serviceType: 'Insurance Housing Coordination',
          description:
            'Nova Havens places displaced families into fully furnished homes nationwide — coordinated with insurance carriers and relocation specialists from the first call.',
        },
        {
          '@type': 'HowTo',
          name: 'How Insurance Adjusters & Carriers Work with Nova Havens',
          description:
            'The step-by-step process for insurance adjusters and carriers to coordinate temporary housing placements through Nova Havens.',
          step: [
            {
              '@type': 'HowToStep',
              position: 1,
              name: 'Submit a Claim',
              text: 'Share the claim details with our team via phone or portal.',
            },
            {
              '@type': 'HowToStep',
              position: 2,
              name: 'Review Placement Options',
              text: 'We surface verified homes within your parameters within hours.',
            },
            {
              '@type': 'HowToStep',
              position: 3,
              name: 'Approve & Coordinate',
              text: 'We handle all logistics with the family directly.',
            },
          ],
        },
        {
          '@type': 'HowTo',
          name: 'How Displaced Families Get Placed with Nova Havens',
          description:
            'The step-by-step process for displaced families to move into temporary furnished housing through Nova Havens.',
          step: [
            {
              '@type': 'HowToStep',
              position: 1,
              name: 'Receive Your Options',
              text: 'Your adjuster or carrier connects you with Nova Havens.',
            },
            {
              '@type': 'HowToStep',
              position: 2,
              name: 'Choose Your Home',
              text: "Browse furnished options matched to your family's needs.",
            },
            {
              '@type': 'HowToStep',
              position: 3,
              name: 'Move In',
              text: 'We coordinate move-in logistics so you can focus on what matters.',
            },
          ],
        },
        {
          '@type': 'HowTo',
          name: 'How Property Owners Join the Nova Havens Network',
          description:
            'The step-by-step process for property owners to list their furnished homes with Nova Havens and start hosting displaced families.',
          step: [
            {
              '@type': 'HowToStep',
              position: 1,
              name: 'Submit Your Property',
              text: 'Tell us about your furnished home and availability.',
            },
            {
              '@type': 'HowToStep',
              position: 2,
              name: 'Get Verified',
              text: 'We inspect and onboard your property into our network.',
            },
            {
              '@type': 'HowToStep',
              position: 3,
              name: 'Start Hosting',
              text: 'We match you with families and handle all coordination.',
            },
          ],
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
  '/blog': {
    title: `Blog & Resources | ${SITE_NAME}`,
    description:
      'Nova Havens publishes guides for insurance professionals, displaced families, and property owners on temporary housing, ALE coverage, and claims coordination.',
    ogType: 'website',
    canonicalUrl: `${BASE_URL}/blog`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ItemList',
          name: 'Nova Havens Blog & Resources',
          description:
            'Guides and resources for insurance professionals, displaced families, and property owners on temporary housing, ALE coverage, and claims coordination.',
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
        {
          '@type': 'AboutPage',
          '@id': `${BASE_URL}/meet-the-team`,
          name: 'Meet the Nova Havens Team',
          description:
            'The coordinators, carrier specialists, and family advocates behind Nova Havens — managing furnished housing placements across all 48 contiguous US states.',
          url: `${BASE_URL}/meet-the-team`,
          isPartOf: { '@id': `${BASE_URL}/#website` },
        },
        {
          '@type': 'Person',
          name: 'Alexandra Reyes',
          jobTitle: 'Founder & CEO',
          description:
            "Alexandra founded Nova Havens after coordinating housing for her own family following a house fire — an experience that revealed how fragmented and impersonal the insurance housing process had become. She leads Nova Havens' overall strategy, carrier partnerships, and vision for compassionate, technology-assisted placement.",
          worksFor: {
            '@type': 'Organization',
            '@id': BUSINESS_ID,
            name: SITE_NAME,
          },
        },
        {
          '@type': 'Person',
          name: 'Marcus Whitfield',
          jobTitle: 'Head of Carrier Relations',
          description:
            'Marcus brings 14 years of large-loss adjuster experience to Nova Havens. As Head of Carrier Relations, he manages all insurer partnerships, ensures documentation meets carrier standards, and trains the coordination team on claims-specific communication and compliance.',
          worksFor: {
            '@type': 'Organization',
            '@id': BUSINESS_ID,
            name: SITE_NAME,
          },
        },
        {
          '@type': 'Person',
          name: 'Priya Natarajan',
          jobTitle: 'Director of Placements',
          description:
            'Priya leads the Nova Havens placement team responsible for matching displaced households to verified homes nationwide. Her expertise spans ALE policy interpretation, school-district proximity matching, pet-accommodation logistics, and multi-family accessibility requirements.',
          worksFor: {
            '@type': 'Organization',
            '@id': BUSINESS_ID,
            name: SITE_NAME,
          },
        },
        {
          '@type': 'Person',
          name: 'Daniel Okafor',
          jobTitle: 'Property Network Manager',
          description:
            "Daniel oversees the growth and quality of Nova Havens' 20,000+ verified furnished property network across 48 states. As Property Network Manager, he sets inspection standards, manages property owner relationships, and ensures every listing meets the same livability benchmark.",
          worksFor: {
            '@type': 'Organization',
            '@id': BUSINESS_ID,
            name: SITE_NAME,
          },
        },
        {
          '@type': 'Person',
          name: 'Sofia Marchetti',
          jobTitle: 'Claims Coordination Lead',
          description:
            'Sofia manages the active-placement lifecycle for Nova Havens — extensions, adjuster updates, property adjustments, and move-out coordination. Her role as Claims Coordination Lead ensures that adjusters receive proactive status notifications without having to follow up.',
          worksFor: {
            '@type': 'Organization',
            '@id': BUSINESS_ID,
            name: SITE_NAME,
          },
        },
        {
          '@type': 'Person',
          name: 'James Calloway',
          jobTitle: 'Family Support Specialist',
          description:
            'James is typically the first Nova Havens voice a displaced family hears. As Family Support Specialist, he guides households through every step of the placement process — from the initial needs assessment to move-in day — with empathy, clarity, and 24/7 availability.',
          worksFor: {
            '@type': 'Organization',
            '@id': BUSINESS_ID,
            name: SITE_NAME,
          },
        },
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
        {
          '@type': 'Organization',
          '@id': BUSINESS_ID,
          name: SITE_NAME,
          url: BASE_URL,
          logo: {
            '@type': 'ImageObject',
            url: `${BASE_URL}/og-image.png`,
          },
          sameAs: SOCIAL_PROFILE_URLS,
          description:
            'Nova Havens is a Nashville, TN-based furnished housing coordination company that places families displaced by fire, water, or mold damage into verified furnished homes — working directly with insurance carriers, adjusters, and relocation specialists across all 48 contiguous US states.',
          address: BUSINESS_ADDRESS,
          telephone: BUSINESS_PHONE,
          email: BUSINESS_EMAIL,
          areaServed: BUSINESS_AREA_SERVED,
          foundingLocation: {
            '@type': 'Place',
            name: 'Nashville, Tennessee',
          },
          knowsAbout: [
            'Insurance housing coordination',
            'Additional Living Expenses (ALE) coverage',
            'Temporary furnished housing',
            'Insurance claims management',
            'Displaced family housing placement',
          ],
        },
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
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Who does Nova Havens serve?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Nova Havens serves three groups: displaced families who need furnished housing after a covered property loss; insurance carriers and independent adjusters who need a reliable, carrier-aligned housing coordinator; and property owners who want to list their furnished homes in a vetted network. All three are served through one coordinated team based in Nashville, TN.',
              },
            },
            {
              '@type': 'Question',
              name: 'What makes Nova Havens different from other relocation companies?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Nova Havens is purpose-built for the insurance housing workflow. Unlike general relocation companies, Nova Havens assigns a single coordinator to each claim, bills carriers directly under ALE coverage, provides proactive documentation updates adjusters need, and operates a verified property network — not a third-party listing marketplace. As of 2025, Nova Havens operates across all 48 contiguous US states.',
              },
            },
            {
              '@type': 'Question',
              name: 'How does Nova Havens verify its properties?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: "Every property in the Nova Havens network is inspected by a Nova Havens coordinator before being listed. The inspection covers furnishing standards (beds with linens, stocked kitchen, Wi-Fi, washer/dryer), safety conditions, and overall livability. Properties that don't meet the standard are not added to the network. Nova Havens maintains 20,000+ verified homes as of 2025.",
              },
            },
            {
              '@type': 'Question',
              name: 'Does Nova Havens handle billing with insurance carriers directly?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: "Yes. When a family's Additional Living Expenses (ALE) coverage is active, Nova Havens bills the insurance carrier or adjuster directly — so the displaced family typically pays nothing out of pocket for housing. Nova Havens works with carriers including Allstate, Travelers, Farmers Insurance, State Farm, and others.",
              },
            },
            {
              '@type': 'Question',
              name: 'Where is Nova Havens headquartered?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Nova Havens is headquartered in Nashville, Tennessee, and operates nationwide across all 48 contiguous US states. The company can be reached at (629) 401-0054 or info@novahavens.com.',
              },
            },
          ],
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
        {
          '@type': 'LocalBusiness',
          '@id': BUSINESS_ID,
          name: SITE_NAME,
          url: BASE_URL,
          logo: {
            '@type': 'ImageObject',
            url: `${BASE_URL}/og-image.png`,
          },
          description:
            'Nova Havens coordinates furnished temporary housing for insurance-displaced families across all 48 contiguous US states, billed directly to carriers.',
          telephone: BUSINESS_PHONE,
          email: BUSINESS_EMAIL,
          address: BUSINESS_ADDRESS,
          areaServed: BUSINESS_AREA_SERVED,
          openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            opens: '00:00',
            closes: '23:59',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: BUSINESS_PHONE,
            contactType: 'customer service',
            email: BUSINESS_EMAIL,
            availableLanguage: 'English',
            hoursAvailable: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
              ],
              opens: '00:00',
              closes: '23:59',
            },
          },
        },
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
          worksFor: {
            '@type': 'Organization',
            '@id': BUSINESS_ID,
            name: SITE_NAME,
          },
        }
      : {
          '@type': 'Organization',
          '@id': BUSINESS_ID,
          name: SITE_NAME,
        };

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
        '@type': 'Organization',
        '@id': BUSINESS_ID,
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/og-image.png`,
        },
        sameAs: SOCIAL_PROFILE_URLS,
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

    const graph: Record<string, unknown>[] = [blogPostingSchema];
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
