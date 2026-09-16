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
  LLMS_BLOG_POSTS,
  LLMS_TXT_SECTIONS,
  renderLlmsTxt,
  renderLlmsTxtPrerenderHtml,
} from '../src/data/llmsContent.ts';
import { SERVICE_AREA_US_NAME } from '../src/lib/companyFacts.ts';
import { getRouteBodyHtml } from '../src/lib/routeContent.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rawFilePath = join(__dirname, '..', 'public', 'llms.txt');
const expected = renderLlmsTxt();
const actual = readFileSync(rawFilePath, 'utf-8');
const expectedHeadings = [
  'Core pages',
  'Get started',
  'Guides and articles',
  'Common questions',
];
const actualHeadings = LLMS_TXT_SECTIONS.map((section) => section.heading);

if (
  actualHeadings.length !== expectedHeadings.length ||
  actualHeadings.some((heading, index) => heading !== expectedHeadings[index])
) {
  console.error(
    `llms.txt validation FAILED: expected the standard sections ${expectedHeadings.join(', ')}.`,
  );
  process.exit(1);
}

const articlesSection = LLMS_TXT_SECTIONS.find(
  (section) => section.heading === 'Guides and articles',
);

if (!articlesSection?.content) {
  console.error(
    'llms.txt validation FAILED: the Guides and articles section is missing.',
  );
  process.exit(1);
}

const indexedArticleCount = articlesSection.content.match(
  /^- \[[^\]]+\]\(https:\/\/novahavens\.com\/blog\/[^)]+\)/gm,
)?.length ?? 0;

if (indexedArticleCount !== LLMS_BLOG_POSTS.length) {
  console.error(
    `llms.txt validation FAILED: Guides and articles lists ${indexedArticleCount} article(s), expected ${LLMS_BLOG_POSTS.length}.`,
  );
  process.exit(1);
}

for (const post of LLMS_BLOG_POSTS) {
  const articleUrl = `${'https://novahavens.com/blog/'}${post.slug}`;

  if (!articlesSection.content.includes(articleUrl)) {
    console.error(
      `llms.txt validation FAILED: the Guides and articles section is missing ${articleUrl}.`,
    );
    process.exit(1);
  }
}

const actualText = readFileSync(rawFilePath, 'utf-8');
const forbiddenPatterns: Array<[string, RegExp]> = [
  ['Gemini', /\bgemini\b/i],
  ['the retired general contact email', /info@novahavens\.com/i],
  ['a total property count', /\b\d{1,3}(?:[ ,]\d{3})+(?:\+)?\b/],
];

for (const [description, pattern] of forbiddenPatterns) {
  if (pattern.test(actualText)) {
    console.error(`llms.txt validation FAILED: file contains ${description}.`);
    process.exit(1);
  }
}

if (!actualText.includes(SERVICE_AREA_US_NAME)) {
  console.error(
    `llms.txt validation FAILED: the canonical ${SERVICE_AREA_US_NAME} coverage statement is missing.`,
  );
  process.exit(1);
}

if (actualText !== expected) {
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