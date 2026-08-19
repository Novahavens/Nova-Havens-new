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
  renderLlmsTxt,
  renderLlmsTxtPrerenderHtml,
} from '../src/data/llmsContent.ts';
import { getRouteBodyHtml } from '../src/lib/routeContent.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rawFilePath = join(__dirname, '..', 'public', 'llms.txt');
const expected = renderLlmsTxt();
const actual = readFileSync(rawFilePath, 'utf-8');

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