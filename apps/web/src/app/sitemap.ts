import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/config/site';
import { getAllPosts } from '@/content/source';

/**
 * /sitemap.xml — generated at build time from the route list and blog posts.
 * Google reads <lastmod>; <changefreq>/<priority> are ignored by Google but
 * harmless for other engines. See docs/SEO.md for submitting it.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const newestPost =
    posts
      .map((p) => p.dateISO)
      .sort()
      .at(-1) ?? '2026-08-13';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: newestPost, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/blog`, lastModified: newestPost, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/meet-the-team`, lastModified: '2026-07-27', changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/about-us`, lastModified: '2026-07-27', changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: '2026-07-27', changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/llms-txt`, lastModified: newestPost, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: '2026-07-27', changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms-of-service`, lastModified: '2026-07-27', changeFrequency: 'yearly', priority: 0.3 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.dateISO,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
