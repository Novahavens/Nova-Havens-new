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
}

const SITE_NAME = 'Nova Havens';
export const DEFAULT_DESCRIPTION =
  'Nova Havens places displaced families into fully furnished homes nationwide — coordinated with insurance carriers and relocation specialists from the first call.';

// ── Static route metadata ──────────────────────────────────────────────────

const STATIC_META: Record<string, RouteMeta> = {
  '/': {
    title: `${SITE_NAME} | Nationwide Furnished Housing Coordination`,
    description: DEFAULT_DESCRIPTION,
    ogType: 'website',
  },
  '/blog': {
    title: `Blog & Resources | ${SITE_NAME}`,
    description:
      'Industry knowledge for insurance professionals, displaced families, and property owners — from the Nova Havens team.',
    ogType: 'website',
  },
  '/contact': {
    title: `Contact Us | ${SITE_NAME}`,
    description:
      'Get in touch with Nova Havens — request temporary housing, submit your property, or ask a general question. Available 24/7 for emergency claims.',
    ogType: 'website',
  },
  '/privacy-policy': {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: 'Nova Havens privacy policy — how we collect, use, and protect your information.',
    ogType: 'website',
  },
  '/terms-of-service': {
    title: `Terms of Service | ${SITE_NAME}`,
    description:
      'Nova Havens terms of service — the rules and agreements governing use of our housing coordination services.',
    ogType: 'website',
  },
};

// ── Blog post routes derived from blogPosts.ts — no manual duplication ─────

const BLOG_POST_META: Record<string, RouteMeta> = Object.fromEntries(
  BLOG_POSTS.map((post) => [
    `/blog/${post.slug}`,
    { title: `${post.title} | ${SITE_NAME}`, description: post.excerpt, ogType: 'article' },
  ]),
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
    }
  );
}
