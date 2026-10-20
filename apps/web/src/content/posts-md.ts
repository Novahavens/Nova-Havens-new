import 'server-only';

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import matter from 'gray-matter';

import { BLOG_POSTS, type BlogPost, type BlogPostCta, type BlogPostMotif } from './blog';
import { BLOG_CATEGORIES, BLOG_CTAS, BLOG_MOTIFS, type BlogCategory } from './categories';

/**
 * Markdown posts live in apps/web/content/posts/*.md with YAML front matter
 * (see the README there). They are read at build time and merged with
 * BLOG_POSTS by src/content/source.ts. Any malformed file throws so a bad PR
 * fails the build instead of publishing.
 */
const POSTS_DIR = join(process.cwd(), 'content', 'posts');
const ID_BASE = 1000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type FrontMatter = Record<string, unknown>;

function fail(file: string, message: string): never {
  throw new Error(`content/posts/${file}: ${message}`);
}

function requireString(file: string, data: FrontMatter, key: string): string {
  const value = data[key];
  if (typeof value !== 'string' || value.trim() === '') fail(file, `front matter "${key}" must be a non-empty string`);
  return value.trim();
}

function optionalString(file: string, data: FrontMatter, key: string): string | undefined {
  const value = data[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string' || value.trim() === '') fail(file, `front matter "${key}" must be a non-empty string`);
  return value.trim();
}

function requireOneOf<T extends string>(file: string, key: string, value: string, allowed: readonly T[]): T {
  if (!(allowed as readonly string[]).includes(value)) {
    fail(file, `front matter "${key}" must be one of: ${allowed.join(', ')} (got "${value}")`);
  }
  return value as T;
}

function formatDate(dateISO: string): string {
  return new Date(`${dateISO}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function parseAuthor(file: string, data: FrontMatter): BlogPost['author'] {
  const value = data.author;
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'object') fail(file, 'front matter "author" must be an object with name and role');
  const author = value as FrontMatter;
  return { name: requireString(file, author, 'name'), role: requireString(file, author, 'role') };
}

function parseKeywords(file: string, data: FrontMatter): string[] {
  const value = data.keywords;
  if (!Array.isArray(value) || value.length === 0 || !value.every((k) => typeof k === 'string' && k.trim() !== '')) {
    fail(file, 'front matter "keywords" must be a non-empty list of strings');
  }
  return value.map((k: string) => k.trim());
}

function parsePost(file: string, raw: string): Omit<BlogPost, 'id'> {
  const { data, content } = matter(raw) as { data: FrontMatter; content: string };
  const dateISO = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : requireString(file, data, 'date');
  if (!DATE_RE.test(dateISO) || Number.isNaN(Date.parse(`${dateISO}T00:00:00Z`))) {
    fail(file, 'front matter "date" must be YYYY-MM-DD');
  }
  const motif = optionalString(file, data, 'motif');
  const body = content.trim();
  if (body === '') fail(file, 'post body is empty');

  return {
    slug: optionalString(file, data, 'slug') ?? file.replace(/\.md$/, ''),
    title: requireString(file, data, 'title'),
    category: requireOneOf<BlogCategory>(file, 'category', requireString(file, data, 'category'), BLOG_CATEGORIES),
    date: formatDate(dateISO),
    dateISO,
    excerpt: requireString(file, data, 'excerpt'),
    keywords: parseKeywords(file, data),
    motif: motif === undefined ? undefined : requireOneOf<BlogPostMotif>(file, 'motif', motif, BLOG_MOTIFS),
    cta: requireOneOf<BlogPostCta>(file, 'cta', optionalString(file, data, 'cta') ?? 'housing', BLOG_CTAS),
    author: parseAuthor(file, data),
    image: optionalString(file, data, 'image'),
    content: body,
  };
}

export function getMarkdownPosts(): BlogPost[] {
  if (!existsSync(POSTS_DIR)) return [];
  const files = readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith('.md') && name.toLowerCase() !== 'readme.md')
    .sort();

  const seen = new Map<string, string>(BLOG_POSTS.map((post) => [post.slug, 'src/content/blog.ts']));
  const posts: BlogPost[] = [];
  for (const file of files) {
    const post = parsePost(file, readFileSync(join(POSTS_DIR, file), 'utf8'));
    const existing = seen.get(post.slug);
    if (existing) fail(file, `slug "${post.slug}" is already used by ${existing}`);
    seen.set(post.slug, `content/posts/${file}`);
    posts.push({ id: ID_BASE + posts.length, ...post });
  }
  return posts;
}
