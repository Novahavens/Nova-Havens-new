/**
 * seo.ts — metadata and structured-data builders.
 *
 * One canonical business entity (`#organization`) and one WebSite node
 * (`#website`) are referenced from every page graph, so search engines and
 * AI crawlers see a single consistent Nova Havens.
 */
import type { Metadata } from 'next';

import { BRAND, COMPANY, CONTACT, SERVICE_AREA, SITE_URL, SOCIAL_PROFILE_URLS } from '@/config/site';
import type { BlogPost } from '@/content/blog';
import { HOME_FAQS, type Faq } from '@/content/faqs';
import { HOW_IT_WORKS_TRACKS } from '@/content/how-it-works';
import type { TeamMember } from '@/content/team';
import { parseFaqsFromContent } from './faq-parser';
import { absoluteUrl } from './utils';

export const BUSINESS_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const DEFAULT_OG_IMAGE = `${SITE_URL}${BRAND.assets.ogImage}`;

type JsonLd = Record<string, unknown>;

export const WEBSITE_SCHEMA: JsonLd = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: COMPANY.name,
  url: `${SITE_URL}/`,
  publisher: { '@id': BUSINESS_ID },
};

export const BUSINESS_SCHEMA: JsonLd = {
  '@type': 'LocalBusiness',
  '@id': BUSINESS_ID,
  name: COMPANY.name,
  legalName: COMPANY.legalName,
  url: `${SITE_URL}/`,
  logo: { '@type': 'ImageObject', url: DEFAULT_OG_IMAGE },
  image: DEFAULT_OG_IMAGE,
  description: COMPANY.definition,
  telephone: CONTACT.phone.e164,
  email: CONTACT.email,
  address: {
    '@type': 'PostalAddress',
    ...(CONTACT.address.street ? { streetAddress: CONTACT.address.street } : {}),
    addressLocality: CONTACT.address.locality,
    addressRegion: CONTACT.address.region,
    ...(CONTACT.address.postalCode ? { postalCode: CONTACT.address.postalCode } : {}),
    addressCountry: CONTACT.address.country,
  },
  areaServed: { '@type': 'Country', name: CONTACT.address.countryName },
  sameAs: SOCIAL_PROFILE_URLS,
  serviceType: COMPANY.serviceType,
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
};

export function faqPageSchema(faqs: Faq[]): JsonLd {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function graph(...nodes: JsonLd[]): JsonLd {
  return { '@context': 'https://schema.org', '@graph': [WEBSITE_SCHEMA, BUSINESS_SCHEMA, ...nodes] };
}

export function webPageSchema(opts: {
  type?: string;
  path: string;
  name: string;
  description: string;
  about?: boolean;
}): JsonLd {
  const url = absoluteUrl(opts.path, SITE_URL);
  return {
    '@type': opts.type ?? 'WebPage',
    '@id': url,
    name: opts.name,
    description: opts.description,
    url,
    isPartOf: { '@id': WEBSITE_ID },
    ...(opts.about ? { about: { '@id': BUSINESS_ID } } : {}),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, SITE_URL),
    })),
  };
}

export const HOME_SCHEMA = graph(
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
  faqPageSchema(HOME_FAQS),
);

export function blogIndexSchema(posts: BlogPost[]): JsonLd {
  return graph(
    {
      '@type': 'ItemList',
      name: 'Nova Havens Blog & Resources',
      description:
        'Guides and resources for insurance professionals and displaced families on temporary housing, ALE coverage, and claims coordination.',
      url: `${SITE_URL}/blog`,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/blog/${post.slug}`,
        name: post.title,
        description: post.excerpt,
      })),
    },
    faqPageSchema(posts.flatMap((post) => parseFaqsFromContent(post.content).slice(0, 2)).slice(0, 10)),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
    ]),
  );
}

export function blogPostImage(post: BlogPost): string {
  return post.image ?? `${SITE_URL}/blog/${post.slug}/opengraph-image`;
}

export function blogPostSchema(post: BlogPost): JsonLd {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const faqs = parseFaqsFromContent(post.content);
  const nodes: JsonLd[] = [
    {
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: blogPostImage(post),
      datePublished: post.dateISO,
      dateModified: post.dateISO,
      url,
      author: post.author
        ? { '@type': 'Person', name: post.author.name, jobTitle: post.author.role, worksFor: { '@id': BUSINESS_ID } }
        : { '@id': BUSINESS_ID },
      publisher: { '@id': BUSINESS_ID },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      articleSection: post.category,
      keywords: post.keywords.join(', '),
      isPartOf: { '@id': WEBSITE_ID },
    },
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  ];
  if (faqs.length > 0) nodes.push(faqPageSchema(faqs));
  return graph(...nodes);
}

/** Person schema for real team members. Placeholder roles like "[Role TBC]" are never published. */
export function teamSchema(members: TeamMember[]): JsonLd {
  return graph(
    webPageSchema({
      type: 'AboutPage',
      path: '/meet-the-team',
      name: 'Meet the Nova Havens Team',
      description: `The coordinators, carrier specialists, and family advocates behind Nova Havens — managing furnished housing placements across all ${SERVICE_AREA.usName}.`,
    }),
    ...members.map((member) => ({
      '@type': 'Person',
      name: member.name,
      ...(member.role && !/^\[.*\]$/.test(member.role.trim()) ? { jobTitle: member.role } : {}),
      worksFor: { '@id': BUSINESS_ID },
    })),
  );
}

/** Per-route metadata helper so every page carries canonical + OG + Twitter tags. */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const canonical = absoluteUrl(opts.path, SITE_URL);
  const image = opts.image ?? DEFAULT_OG_IMAGE;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical },
    robots: opts.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: canonical,
      type: opts.type ?? 'website',
      siteName: COMPANY.name,
      locale: 'en_US',
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}
