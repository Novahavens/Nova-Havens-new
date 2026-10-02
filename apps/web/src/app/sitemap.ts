import type { MetadataRoute } from 'next';

import { SITE_PAGES } from '@/config/routes';
import { SITE_URL } from '@/config/site';
import { getAllPosts } from '@/content/source';

/**
 * /sitemap.xml — generated at build time from the route registry
 * (src/config/routes.ts) and every blog post. Google reads <lastmod>;
 * <changefreq>/<priority> are ignored by Google but harmless elsewhere.
 * See docs/SEO.md for submitting it. For sites beyond ~50k URLs, switch to
 * `generateSitemaps()` to emit an index of chunked sitemaps.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const newestPost = posts
    .map((p) => p.dateISO)
    .sort()
    .at(-1);

  const staticRoutes: MetadataRoute.Sitemap = SITE_PAGES.map((page) => ({
    url: page.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${page.path}`,
    // Pages that list posts move whenever a post is published.
    lastModified:
      (page.path === '/blog' || page.path === '/') && newestPost && newestPost > page.lastModified
        ? newestPost
        : page.lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.dateISO,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
