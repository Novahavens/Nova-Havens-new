/**
 * source.ts — the content access layer.
 *
 * Pages never import blog.ts / team.ts directly; they call these functions.
 * Today they read local TypeScript data (blog.ts) merged with the Markdown
 * posts in content/posts/ (posts-md.ts). To move to a CMS (Payload, Sanity,
 * Contentful, …) replace the bodies here — and only here. See docs/CMS.md.
 *
 * All functions are async so the CMS swap does not change call sites.
 */
import { BLOG_POSTS, type BlogPost } from './blog';
import { getMarkdownPosts } from './posts-md';

export type { BlogPost };

function allPosts(): BlogPost[] {
  return [...BLOG_POSTS, ...getMarkdownPosts()];
}

export async function getAllPosts(): Promise<BlogPost[]> {
  return allPosts().sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return allPosts().find((post) => post.slug === slug);
}

export async function getAllPostSlugs(): Promise<string[]> {
  return allPosts().map((post) => post.slug);
}
