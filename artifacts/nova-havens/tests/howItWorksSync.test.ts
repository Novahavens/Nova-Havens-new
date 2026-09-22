/**
 * Fails when the homepage's "How It Works" HowTo JSON-LD (routeMeta.ts) or
 * crawler-facing HTML (routeContent.ts) drifts from HomePage.tsx's live copy.
 *
 * All three surfaces render from the shared src/data/howItWorks.ts model, so
 * this test mostly guards against someone reintroducing a hardcoded copy in
 * routeMeta.ts or routeContent.ts instead of deriving it from
 * HOW_IT_WORKS_TRACKS — the same drift this task fixed.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { HOW_IT_WORKS_TRACKS } from '../src/data/howItWorks.ts';
import { getRouteBodyHtml } from '../src/lib/routeContent.ts';
import { resolveRouteMeta } from '../src/lib/routeMeta.ts';

/** Mirrors the escaping routeContent.ts applies before embedding text in HTML. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

test('homepage HowTo JSON-LD matches the canonical How It Works tracks', () => {
  const homepageJsonLd = resolveRouteMeta('/').jsonLd as {
    '@graph': Array<{
      '@type': string;
      name?: string;
      description?: string;
      step?: Array<{ '@type': string; position: number; name: string; text: string }>;
    }>;
  };

  const howToNodes = homepageJsonLd['@graph'].filter(
    (node) => node['@type'] === 'HowTo',
  );

  assert.equal(howToNodes.length, HOW_IT_WORKS_TRACKS.length);

  HOW_IT_WORKS_TRACKS.forEach((track, index) => {
    const node = howToNodes[index];
    assert.equal(node.name, track.schemaName);
    assert.equal(node.description, track.schemaDescription);
    assert.deepEqual(
      node.step,
      track.steps.map((step, stepIndex) => ({
        '@type': 'HowToStep',
        position: stepIndex + 1,
        name: step.name,
        text: step.text,
      })),
    );
  });
});

test('every How It Works step is present in the prerendered body', () => {
  const homepageHtml = getRouteBodyHtml('/');
  assert.ok(homepageHtml);

  for (const track of HOW_IT_WORKS_TRACKS) {
    assert.ok(
      homepageHtml.includes(`<h3>${esc(track.htmlHeading)}</h3>`),
      `Missing heading for "${track.htmlHeading}" track in prerendered body`,
    );

    for (const step of track.steps) {
      const expectedListItem = `<li><strong>${esc(step.name)}</strong> — ${esc(step.text)}</li>`;
      assert.ok(
        homepageHtml.includes(expectedListItem),
        `Missing step "${step.name}" for "${track.htmlHeading}" track in prerendered body`,
      );
    }
  }
});
