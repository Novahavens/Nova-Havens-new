/**
 * validate-jsonld.ts — automated check for broken structured-data references.
 *
 * Iterates over every route in ALL_ROUTE_META, walks each page's JSON-LD
 * graph, and verifies that every `@id` referenced anywhere (isPartOf, about,
 * publisher, worksFor, …) resolves to a node emitted on that same page —
 * and verifies that the canonical business entity is emitted exactly once
 * with the same type and verified facts in every structured-data graph.
 *
 * Run with: node --experimental-strip-types scripts/validate-jsonld.ts
 * Exits non-zero (with a per-route report) if any reference is unresolved.
 */

import { ALL_ROUTE_META } from '../src/lib/routeMeta.ts';

const BASE_URL = 'https://novahavens.com';

const BUSINESS_ID = `${BASE_URL}/#organization`;

interface Analysis {
  defined: Set<string>;
  referenced: Set<string>;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Recursively collect defined and referenced @ids in a JSON-LD value. */
function walk(value: unknown, acc: Analysis): void {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, acc);
    return;
  }
  if (!isPlainObject(value)) return;

  const id = value['@id'];
  if (typeof id === 'string') {
    const keys = Object.keys(value);
    // A node that carries data beyond just `@id` *defines* that identifier;
    // a bare `{ '@id': ... }` (or `{ '@type', '@id' }`-only stub used purely
    // as a pointer) still defines it if it has a @type, since it emits a
    // typed node into the graph. Only a pure `{ '@id' }` object is a reference.
    if (keys.length === 1) {
      acc.referenced.add(id);
    } else {
      acc.defined.add(id);
    }
  }

  for (const [key, child] of Object.entries(value)) {
    if (key === '@id') continue;
    walk(child, acc);
  }
}

function collectNodesById(value: unknown, id: string): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectNodesById(item, id));
  }
  if (!isPlainObject(value)) return [];

  const matches =
    value['@id'] === id && Object.keys(value).length > 1 ? [value] : [];
  return matches.concat(
    Object.entries(value)
      .filter(([key]) => key !== '@id')
      .flatMap(([, child]) => collectNodesById(child, id)),
  );
}

let failures = 0;
const routes = Object.keys(ALL_ROUTE_META);

for (const route of routes) {
  const meta = ALL_ROUTE_META[route];
  if (!meta.jsonLd) continue;

  const acc: Analysis = { defined: new Set(), referenced: new Set() };
  walk(meta.jsonLd, acc);

  const unresolved = [...acc.referenced].filter(
    (id) => !acc.defined.has(id),
  );

  if (unresolved.length > 0) {
    failures++;
    console.error(`✗ ${route} — unresolved @id reference(s):`);
    for (const id of unresolved) console.error(`    ${id}`);
  }

  const businessNodes = collectNodesById(meta.jsonLd, BUSINESS_ID);
  if (businessNodes.length !== 1) {
    failures++;
    console.error(
      `✗ ${route} — expected exactly one canonical business node; found ${businessNodes.length}.`,
    );
  } else {
    const business = businessNodes[0];
    if (
      business['@type'] !== 'LocalBusiness' ||
      business.name !== 'Nova Havens' ||
      business.url !== `${BASE_URL}/`
    ) {
      failures++;
      console.error(`✗ ${route} — canonical business type or identity facts differ.`);
    }
  }
}

const checked = routes.filter((r) => ALL_ROUTE_META[r].jsonLd).length;

if (failures > 0) {
  console.error(
    `\nJSON-LD validation FAILED: ${failures} route(s) with dangling @id references (of ${checked} checked).`,
  );
  process.exit(1);
}

console.log(
  `JSON-LD validation passed: all @id references resolve across ${checked} route graphs (${routes.length} routes total).`,
);
