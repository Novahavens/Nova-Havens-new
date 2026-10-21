/**
 * Validate every Markdown post in content/posts/ against the rules in
 * docs/blog-automation/PLAN.md §8. Runs in CI (verify workflow) and by hand:
 *
 *   pnpm --filter @nova-havens/web validate:posts
 *
 * Exits 1 when any post fails so a bad PR cannot be merged.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import matter from 'gray-matter';

import { BLOG_POSTS } from '../src/content/blog';
import { validatePost, type PostInput } from '../src/lib/post-validator';

const POSTS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'posts');

export function postInputFromMarkdown(file: string, raw: string): PostInput {
  const { data, content } = matter(raw);
  const str = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
  return {
    slug: str(data.slug) || basename(file, '.md'),
    title: str(data.title),
    excerpt: str(data.excerpt),
    keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
    category: str(data.category),
    motif: data.motif === undefined || data.motif === null ? undefined : str(data.motif),
    cta: str(data.cta) || 'housing',
    content,
  };
}

function listPostFiles(): string[] {
  if (!existsSync(POSTS_DIR)) return [];
  return readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith('.md') && name.toLowerCase() !== 'readme.md')
    .sort();
}

function main(): void {
  const files = listPostFiles();
  const existingSlugs = BLOG_POSTS.map((post) => post.slug);
  const seen = new Map<string, string>();
  let failures = 0;

  for (const file of files) {
    const post = postInputFromMarkdown(file, readFileSync(join(POSTS_DIR, file), 'utf8'));
    const result = validatePost(post, [...existingSlugs, ...seen.keys()]);
    const duplicate = seen.get(post.slug);
    if (duplicate) result.errors.push(`slug "${post.slug}" is also used by ${duplicate}`);
    seen.set(post.slug, file);

    if (result.errors.length === 0) {
      console.log(`PASS  ${file}  (${result.wordCount} words)`);
    } else {
      failures++;
      console.log(`FAIL  ${file}  (${result.wordCount} words)`);
      for (const error of result.errors) console.log(`      - ${error}`);
    }
  }

  const summary = `${files.length} post${files.length === 1 ? '' : 's'}, ${failures} failed`;
  if (failures > 0) {
    console.error(`\n${summary}`);
    process.exit(1);
  }
  console.log(files.length === 0 ? '0 posts, OK' : `\n${summary}, OK`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
