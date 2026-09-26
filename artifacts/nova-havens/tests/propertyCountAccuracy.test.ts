import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { formatVerifiedPropertyCount, propertyCountSnapshotNote } from '../src/lib/companyFacts.ts';
import { getRouteBodyHtml } from '../src/lib/routeContent.ts';

const propertyStats = JSON.parse(
  readFileSync(new URL('../public/property-stats.json', import.meta.url), 'utf8'),
) as { generatedAt: string; totalProperties: number };

const publishedCount = formatVerifiedPropertyCount(propertyStats.totalProperties);
const homeHtml = getRouteBodyHtml('/');
const homeSource = readFileSync(new URL('../src/pages/HomePage.tsx', import.meta.url), 'utf8');
const contactSource = readFileSync(new URL('../src/pages/ContactPage.tsx', import.meta.url), 'utf8');
const prerenderSource = readFileSync(new URL('../src/lib/routeContent.ts', import.meta.url), 'utf8');
const publicContentFiles = [homeSource, contactSource, prerenderSource].join('\n');

test('crawler-facing homepage uses the verified property snapshot', () => {
  const datedClaim = `${publishedCount} verified network property records — ${propertyCountSnapshotNote(propertyStats.generatedAt)}`;
  assert.equal(homeHtml.split(datedClaim).length - 1, 2);
  assert.doesNotMatch(homeHtml, /\b(?:20[,\s]?000|60[,\s]?000)\+?\b/);
  assert.doesNotMatch(homeHtml, /(?:available homes|ready for immediate placement|active properties)/i);
});

test('every count-bearing React section includes snapshot context, with honest fallback', () => {
  assert.equal(homeSource.split('{verifiedPropertyCount}').length - 1, 2);
  assert.match(homeSource, /\{propertyStatsNote\}/);
  assert.match(homeSource, /propertyCountSnapshotNote\(propertyStats\.generatedAt\)/);
  assert.match(contactSource, /propertyCountSnapshotNote\(propertyStats\.generatedAt\)/);
  assert.equal(contactSource.split('{verifiedPropertyCount}').length - 1, 1);
  assert.match(prerenderSource, /\$\{esc\(PROPERTY_STATS_NOTE\)\}/);
  assert.match(propertyCountSnapshotNote(), /snapshot date unavailable/);
  assert.match(propertyCountSnapshotNote('not-a-date'), /snapshot date unavailable/);
  assert.doesNotMatch(propertyCountSnapshotNote(), /as of \w+ \d/);
});

test('public sources do not reintroduce legacy or availability claims tied to the count', () => {
  assert.doesNotMatch(publicContentFiles, /\b(?:20[,\s]?000|60[,\s]?000)\+?\b/);
  assert.doesNotMatch(publicContentFiles, />Active Properties</);
  assert.doesNotMatch(publicContentFiles, /Live property count/);
  assert.doesNotMatch(publicContentFiles, /\{verifiedPropertyCount\}\s*(?:available homes|ready for immediate placement)/i);
  assert.doesNotMatch(publicContentFiles, /verified furnished properties across the country ready for immediate placement/i);
});