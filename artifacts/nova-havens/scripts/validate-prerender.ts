/**
 * validate-prerender.ts — verifies that the *shipped* HTML contains the
 * structured data and social metadata search engines see.
 *
 * validate-jsonld.ts checks the metadata source (routeMeta.ts); this check
 * closes the loop on the build output: for every route in ALL_ROUTE_META that
 * declares `jsonLd`, the prerendered file under dist/public/ must exist and
 * contain a parseable <script type="application/ld+json" id="jsonld-route">
 * whose content matches the route's declared jsonLd exactly. It also verifies
 * title, description, canonical, Open Graph, and Twitter card values for every
 * route, so a broken template replacement cannot silently ship bad previews.
 *
 * If dist/public/index.html is missing (no build yet), it runs the build
 * first (set SKIP_BUILD=1 to fail fast instead). If dist/public exists but
 * was built before the current source (e.g. this script is run standalone,
 * well after the last `pnpm run build`), it refuses rather than validating —
 * and possibly "healing" — output that no longer matches the source it would
 * be reporting on.
 *
 * Run with: node --experimental-strip-types scripts/validate-prerender.ts
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

import { ALL_ROUTE_META } from '../src/lib/routeMeta.ts';
import { renderLlmsTxtPrerenderHtml } from '../src/data/llmsContent.ts';
import { StaleBuildOutputError, assertBuildFresh } from './lib/buildFreshness.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgDir = join(__dirname, '..');
// Test-only override: lets tests point this script at a disposable dist/public
// fixture (e.g. to prove the freshness guard below fires before the
// missing-routes healing logic runs) without touching real build output.
// Unset in normal operation — see tests/prerenderFreshnessGuard.test.ts.
const distDir = process.env.VALIDATE_PRERENDER_TEST_DIST_DIR
  ? resolve(process.env.VALIDATE_PRERENDER_TEST_DIST_DIR)
  : join(pkgDir, 'dist', 'public');

// ── Ensure a build exists ──────────────────────────────────────────────────

function routeToFilePath(route: string): string {
  if (route === '/') return join(distDir, 'index.html');
  const segments = route.replace(/^\//, '').split('/');
  return join(distDir, ...segments, 'index.html');
}

if (!existsSync(join(distDir, 'index.html'))) {
  if (process.env.SKIP_BUILD === '1') {
    console.error(
      'validate-prerender: dist/public/index.html not found and SKIP_BUILD=1 — run `pnpm run build` first.',
    );
    process.exit(1);
  }
  console.log('validate-prerender: no build output found — running build…');
  execSync('pnpm run build', {
    cwd: pkgDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      // vite.config.ts requires these; defaults are fine for a validation build.
      PORT: process.env.PORT ?? '5000',
      BASE_PATH: process.env.BASE_PATH ?? '/',
    },
  });
} else {
  // dist/public exists, but it may predate the current source if this script
  // is run standalone (its own workflow) rather than right after `pnpm run
  // build`. Validating — or worse, healing missing routes into — a stale
  // build would report the old bundle as matching today's routeMeta.ts.
  try {
    assertBuildFresh({
      sourceRoot: pkgDir,
      distDir,
      label: 'Prerender metadata validation',
      consequence: 'so it cannot confirm the shipped HTML matches the current source.',
    });
  } catch (error) {
    if (error instanceof StaleBuildOutputError) {
      console.error(error.message);
      process.exit(2);
    }
    throw error;
  }

  // The Vite build exists but individual prerendered route files may be missing
  // if new routes were added to routeMeta.ts after the last full build.
  // Re-running prerender.ts is much faster than a full rebuild and keeps the
  // prerendered HTML in sync with routeMeta.ts without requiring MONDAY_API_TOKEN.
  const missingRoutes = Object.keys(ALL_ROUTE_META).filter(
    (route) => !existsSync(routeToFilePath(route)),
  );
  if (missingRoutes.length > 0) {
    console.log(
      `validate-prerender: ${missingRoutes.length} route(s) missing prerendered HTML — re-running prerender step…`,
    );
    console.log('  Missing:', missingRoutes.join(', '));
    execSync('node --experimental-strip-types prerender.ts', {
      cwd: pkgDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: process.env.PORT ?? '5000',
        BASE_PATH: process.env.BASE_PATH ?? '/',
      },
    });
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

const SCRIPT_RE =
  /<script type="application\/ld\+json" id="jsonld-route">([\s\S]*?)<\/script>/g;

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function extractAttribute(
  html: string,
  tagPattern: string,
  attribute: string,
): string | null {
  const tag = html.match(new RegExp(`<${tagPattern}(?=\\s|>)\\s[^>]*>`, 'i'))?.[0]
    ?? html.match(new RegExp(`<${tagPattern}(?=\\s|>)[^>]*>`, 'i'))?.[0];
  if (!tag) return null;
  const value = tag.match(
    new RegExp(`${attribute}="([^"]*)"`, 'i'),
  )?.[1];
  return value === undefined ? null : decodeHtmlEntities(value);
}

function extractTitle(html: string): string | null {
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  return title === undefined ? null : decodeHtmlEntities(title);
}

function checkValue(
  route: string,
  relPath: string,
  label: string,
  actual: string | null,
  expected: string,
): void {
  if (actual === null) {
    fail(route, `${label} missing from ${relPath}`);
  } else if (actual !== expected) {
    fail(route, `${label} mismatch in ${relPath}: expected "${expected}", got "${actual}"`);
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

let failures = 0;
let checked = 0;

function fail(route: string, message: string): void {
  failures++;
  console.error(`✗ ${route} — ${message}`);
}

for (const [route, meta] of Object.entries(ALL_ROUTE_META)) {
  const filePath = routeToFilePath(route);
  const relPath = filePath.replace(pkgDir + '/', '');

  if (!existsSync(filePath)) {
    fail(route, `prerendered file missing: ${relPath}`);
    continue;
  }

  const html = readFileSync(filePath, 'utf-8');
  const matches = [...html.matchAll(SCRIPT_RE)];

  checkValue(route, relPath, '<title>', extractTitle(html), meta.title);
  checkValue(
    route,
    relPath,
    'meta description',
    extractAttribute(html, 'meta\\s+name="description"', 'content'),
    meta.description,
  );
  checkValue(
    route,
    relPath,
    'canonical URL',
    extractAttribute(html, 'link\\s+rel="canonical"', 'href'),
    meta.canonicalUrl,
  );
  checkValue(
    route,
    relPath,
    'og:title',
    extractAttribute(html, 'meta\\s+property="og:title"', 'content'),
    meta.title,
  );
  checkValue(
    route,
    relPath,
    'og:description',
    extractAttribute(html, 'meta\\s+property="og:description"', 'content'),
    meta.description,
  );
  checkValue(
    route,
    relPath,
    'og:url',
    extractAttribute(html, 'meta\\s+property="og:url"', 'content'),
    meta.canonicalUrl,
  );
  const expectedImage = meta.ogImage ?? 'https://novahavens.com/og-image.png';
  checkValue(
    route,
    relPath,
    'og:image',
    extractAttribute(html, 'meta\\s+property="og:image"', 'content'),
    expectedImage,
  );
  checkValue(
    route,
    relPath,
    'twitter:title',
    extractAttribute(html, 'meta\\s+name="twitter:title"', 'content'),
    meta.title,
  );
  checkValue(
    route,
    relPath,
    'twitter:description',
    extractAttribute(html, 'meta\\s+name="twitter:description"', 'content'),
    meta.description,
  );
  checkValue(
    route,
    relPath,
    'twitter:image',
    extractAttribute(html, 'meta\\s+name="twitter:image"', 'content'),
    expectedImage,
  );

  if (!meta.jsonLd) {
    // Routes without structured data must not ship a stale block.
    if (matches.length > 0) {
      fail(route, `unexpected JSON-LD block in ${relPath} (route declares none)`);
    }
    continue;
  }

  checked++;

  if (matches.length === 0) {
    fail(route, `no <script type="application/ld+json" id="jsonld-route"> in ${relPath}`);
    continue;
  }
  if (matches.length > 1) {
    fail(route, `${matches.length} JSON-LD route blocks found in ${relPath} (expected 1)`);
    continue;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(matches[0][1]);
  } catch (err) {
    fail(route, `JSON-LD block is not parseable JSON: ${(err as Error).message}`);
    continue;
  }

  const expected = JSON.stringify(meta.jsonLd);
  const actual = JSON.stringify(parsed);
  if (expected !== actual) {
    fail(route, `JSON-LD in ${relPath} does not match routeMeta.ts declaration`);
  }
}

const llmsTxtFilePath = routeToFilePath('/llms-txt');
if (!existsSync(llmsTxtFilePath)) {
  fail('/llms-txt', `prerendered file missing: ${llmsTxtFilePath.replace(pkgDir + '/', '')}`);
} else {
  const llmsTxtHtml = readFileSync(llmsTxtFilePath, 'utf-8');
  const expectedBody = `<div id="root">${renderLlmsTxtPrerenderHtml()}</div>`;
  if (!llmsTxtHtml.includes(expectedBody)) {
    fail('/llms-txt', 'prerendered body does not match the canonical llms.txt content model');
  }
}

if (failures > 0) {
  console.error(
    `\nPrerender metadata validation FAILED: ${failures} problem(s) across ${Object.keys(ALL_ROUTE_META).length} routes.`,
  );
  process.exit(1);
}

console.log(
  `Prerender metadata validation passed: titles, descriptions, canonical URLs, Open Graph, Twitter cards, and ${checked} route(s) with structured data verified in dist/public/ (${Object.keys(ALL_ROUTE_META).length} routes total).`,
);
