import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { BLOG_CATEGORIES, BLOG_CTAS, BLOG_MOTIFS } from '../src/content/categories';
import { VALIDATOR_CATEGORIES, VALIDATOR_CTAS, VALIDATOR_MOTIFS, validatePost } from '../src/lib/post-validator';
import { postInputFromMarkdown } from './validate-posts';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '__fixtures__');
const fixture = (name: string) => postInputFromMarkdown(name, readFileSync(join(FIXTURES, name), 'utf8'));

test('validator enums mirror src/content/categories.ts', () => {
  assert.deepEqual([...VALIDATOR_CATEGORIES], [...BLOG_CATEGORIES]);
  assert.deepEqual([...VALIDATOR_MOTIFS], [...BLOG_MOTIFS]);
  assert.deepEqual([...VALIDATOR_CTAS], [...BLOG_CTAS]);
});

test('a well-formed post passes', () => {
  const result = validatePost(fixture('valid-post.md'));
  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
  assert.ok(result.wordCount >= 800 && result.wordCount <= 1700);
});

test('a duplicate slug fails', () => {
  const post = fixture('valid-post.md');
  const result = validatePost(post, [post.slug]);
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /already exists/);
});

test('a malformed post reports every broken rule', () => {
  const result = validatePost(fixture('invalid-post.md'));
  assert.equal(result.ok, false);
  const report = result.errors.join('\n');
  for (const expected of [
    /slug .* kebab-case/,
    /title is \d+ chars/,
    /excerpt is \d+ chars/,
    /keywords has 2 items/,
    /category "For Adjusters"/,
    /motif "rocket"/,
    /cta "email"/,
    /start with a "> "/,
    /"## \.\.\.\?" headings/,
    /Frequently Asked Questions/,
    /word count is \d+/,
    /"Nova Havens" appears 1 times/,
    /\(629\) 401-0054/,
    /forbidden property count: "2,000\+ properties"/,
    /forbidden coverage claim: "your policy covers"/,
    /forbidden carrier\/adjuster audience framing: "for adjusters"/,
    /link "https:\/\/example\.com\/listings" is not on the allow-list/,
  ]) {
    assert.match(report, expected);
  }
});
