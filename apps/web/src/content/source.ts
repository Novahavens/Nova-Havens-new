/**
 * source.ts — the content access layer.
 *
 * Pages never import blog.ts / team.ts directly; they call these functions.
 * Today they read local TypeScript data. To move to a CMS (Payload, Sanity,
 * Contentful, …) replace the bodies here — and only here. See docs/CMS.md.
 *
 * All functions are async so the CMS swap does not change call sites.
 */
import { BLOG_POSTS, type BlogPost } from './blog';

export type { BlogPost };

export async function getAllPosts(): Promise<BlogPost[]> {
  return [...BLOG_POSTS].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export async function getAllPostSlugs(): Promise<string[]> {
  return BLOG_POSTS.map((post) => post.slug);
}
