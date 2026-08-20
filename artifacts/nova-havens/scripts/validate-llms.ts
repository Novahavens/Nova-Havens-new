/**
 * validate-llms.ts — verifies that the shipped raw llms.txt matches the
 * canonical content rendered by the human-readable llms.txt page.
 *
 * Run with: node --experimental-strip-types scripts/validate-llms.ts
 * Exits non-zero when the raw file has drifted from the shared content source.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  LLMS_TXT_SECTIONS,
  renderLlmsTxt,
  renderLlmsTxtPrerenderHtml,
} from '../src/data/llmsContent.ts';
import { BLOG_POSTS } from '../src/data/blogPosts.ts';
import { getRouteBodyHtml } from '../src/lib/routeContent.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rawFilePath = join(__dirname, '..', 'public', 'llms.txt');
const expected = renderLlmsTxt();
const actual = readFileSync(rawFilePath, 'utf-8');
const blogIndex = LLMS_TXT_SECTIONS.find(
  (section) => section.heading === 'Blog Content Index',
);

if (!blogIndex?.subsections) {
  console.error(
    'llms.txt validation FAILED: the canonical content model is missing its Blog Content Index.',
  );
  process.exit(1);
}

const indexedBlogUrls = new Set(
  blogIndex.subsections.flatMap((subsection) =>
    [...subsection.content.matchAll(/^URL:\s*(https:\/\/novahavens\.com\/blog\/\S+)\s*$/gm)]
      .map((match) => match[1]),
  ),
);
const publishedBlogUrls = new Set(
  BLOG_POSTS.map((post) => `https://novahavens.com/blog/${post.slug}`),
);
const missingBlogUrls = [...publishedBlogUrls].filter((url) => !indexedBlogUrls.has(url));
const staleBlogUrls = [...indexedBlogUrls].filter((url) => !publishedBlogUrls.has(url));

if (missingBlogUrls.length > 0 || staleBlogUrls.length > 0) {
  console.error('llms.txt validation FAILED: Blog Content Index is out of sync with published posts.');

  if (missingBlogUrls.length > 0) {
    console.error(`Missing article URL(s): ${missingBlogUrls.join(', ')}`);
  }

  if (staleBlogUrls.length > 0) {
    console.error(`Stale article URL(s): ${staleBlogUrls.join(', ')}`);
  }

  console.error(
    'Add or remove the corresponding Blog Content Index entry in src/data/llmsContent.ts.',
  );
  process.exit(1);
}

if (actual !== expected) {
  const expectedLines = expected.split('\n');
  const actualLines = actual.split('\n');
  const firstDifference = expectedLines.findIndex(
    (line, index) => line !== actualLines[index],
  );
  const lineNumber = firstDifference === -1
    ? Math.min(expectedLines.length, actualLines.length) + 1
    : firstDifference + 1;

  console.error(
    `llms.txt validation FAILED: public/llms.txt differs from the canonical content source at line ${lineNumber}.`,
  );
  console.error(
    'Update the canonical content in src/data/llmsContent.ts, then run `pnpm run sync:llms`.',
  );
  process.exit(1);
}

if (getRouteBodyHtml('/llms-txt') !== renderLlmsTxtPrerenderHtml()) {
  console.error(
    'llms.txt validation FAILED: the prerendered /llms-txt body is not generated from the canonical content source.',
  );
  process.exit(1);
}

console.log(
  'llms.txt validation passed: raw file and prerender source both match the canonical content model.',
);