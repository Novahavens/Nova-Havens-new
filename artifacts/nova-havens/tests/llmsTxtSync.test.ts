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
