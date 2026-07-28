/**
 * validate-prerender.ts — verifies that the *shipped* HTML contains the
 * structured data search engines see.
 *
 * validate-jsonld.ts checks the metadata source (routeMeta.ts); this check
 * closes the loop on the build output: for every route in ALL_ROUTE_META that
 * declares `jsonLd`, the prerendered file under dist/public/ must exist and
 * contain a parseable <script type="application/ld+json" id="jsonld-route">
 * whose content matches the route's declared jsonLd exactly.
 *
 * If dist/public/index.html is missing (no build yet), it runs the build
 * first (set SKIP_BUILD=1 to fail fast instead).
 *
 * Run with: node --experimental-strip-types scripts/validate-prerender.ts
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

import { ALL_ROUTE_META } from '../src/lib/routeMeta.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgDir = join(__dirname, '..');
const distDir = join(pkgDir, 'dist', 'public');

// ── Ensure a build exists ──────────────────────────────────────────────────

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
}

// ── Helpers ────────────────────────────────────────────────────────────────

function routeToFilePath(route: string): string {
  if (route === '/') return join(distDir, 'index.html');
  const segments = route.replace(/^\//, '').split('/');
  return join(distDir, ...segments, 'index.html');
}

const SCRIPT_RE =
  /<script type="application\/ld\+json" id="jsonld-route">([\s\S]*?)<\/script>/g;

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

if (failures > 0) {
  console.error(
    `\nPrerender JSON-LD validation FAILED: ${failures} problem(s) across ${Object.keys(ALL_ROUTE_META).length} routes.`,
  );
  process.exit(1);
}

console.log(
  `Prerender JSON-LD validation passed: ${checked} route(s) with structured data verified in dist/public/ (${Object.keys(ALL_ROUTE_META).length} routes total).`,
);
