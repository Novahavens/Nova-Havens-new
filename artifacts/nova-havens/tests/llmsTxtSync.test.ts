/**
 * Fails when the shipped public/llms.txt has drifted from the canonical
 * content model in src/data/llmsContent.ts.
 *
 * The build already runs scripts/validate-llms.ts, but a blog edit that skips
 * `pnpm run sync:llms` can otherwise sit in the repo unnoticed until then.
 * This test puts the same check in the regular test run.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { renderLlmsTxt } from '../src/data/llmsContent.ts';
import { HOME_FAQS } from '../src/data/homeFaqs.ts';
import {
  SERVICE_AREA_COVERAGE_SENTENCE,
  SERVICE_AREA_US_NAME,
} from '../src/lib/companyFacts.ts';
import { getRouteBodyHtml } from '../src/lib/routeContent.ts';
import { resolveRouteMeta } from '../src/lib/routeMeta.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rawFilePath = join(__dirname, '..', 'public', 'llms.txt');

const describeDrift = (expected: string, actual: string) => {
  const expectedLines = expected.split('\n');
  const actualLines = actual.split('\n');
  const firstDifference = expectedLines.findIndex(
    (line, index) => line !== actualLines[index],
  );
  const lineNumber = firstDifference === -1
    ? Math.min(expectedLines.length, actualLines.length) + 1
    : firstDifference + 1;

  return [
    `public/llms.txt is out of sync with src/data/llmsContent.ts (first difference at line ${lineNumber}).`,
    `  expected: ${JSON.stringify(expectedLines[lineNumber - 1] ?? '<end of file>')}`,
    `  actual:   ${JSON.stringify(actualLines[lineNumber - 1] ?? '<end of file>')}`,
    'Run `pnpm run sync:llms` to regenerate the file from the canonical content source.',
  ].join('\n');
};

test('public/llms.txt matches the generated canonical content', () => {
  const expected = renderLlmsTxt();
  const actual = readFileSync(rawFilePath, 'utf-8');

  // assert.ok (not assert.equal) so a failure prints the actionable message
  // instead of dumping both copies of the whole file.
  assert.ok(actual === expected, describeDrift(expected, actual));
});

test('crawler-facing service-area claims match the canonical company facts', () => {
  const llmsText = renderLlmsTxt();
  const homepageHtml = getRouteBodyHtml('/');

  assert.ok(llmsText.includes(SERVICE_AREA_US_NAME));
  assert.ok(homepageHtml?.includes(SERVICE_AREA_COVERAGE_SENTENCE));
});

test('every structured homepage FAQ is present in the prerendered body', () => {
  const homepageHtml = getRouteBodyHtml('/');
  const homepageJsonLd = resolveRouteMeta('/').jsonLd as {
    '@graph': Array<{
      '@type': string;
      mainEntity?: Array<{
        name: string;
        acceptedAnswer: { text: string };
      }>;
    }>;
  };
  const faqSchema = homepageJsonLd['@graph'].find(
    (node) => node['@type'] === 'FAQPage',
  );

  assert.ok(homepageHtml);
  assert.deepEqual(
    faqSchema?.mainEntity?.map((faq) => ({
      question: faq.name,
      answer: faq.acceptedAnswer.text,
    })),
    HOME_FAQS,
  );

  for (const faq of HOME_FAQS) {
    assert.ok(homepageHtml.includes(`<h4>${faq.question}</h4>`));
    assert.ok(homepageHtml.includes(`<p>${faq.answer}</p>`));
  }
});
