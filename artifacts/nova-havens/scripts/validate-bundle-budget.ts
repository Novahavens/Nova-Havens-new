/**
 * Ensures the JavaScript entry shipped from dist/public/index.html stays
 * within Vite's 500 kB minified bundle budget, and that each lazy-loaded
 * route chunk stays within its own page-specific budget.
 *
 * Route chunks are discovered from the Vite build manifest
 * (dist/public/.vite/manifest.json): every dynamic entry sourced from
 * src/pages/ is a lazy-loaded page.
 *
 * Run with: node --experimental-strip-types scripts/validate-bundle-budget.ts
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENTRY_BUDGET_BYTES = 500_000;

/**
 * Minified budgets for the largest lazy-loaded page chunks. Each budget leaves
 * roughly 30% headroom over the current size so ordinary content edits pass
 * while a new heavy dependency on a page trips the check.
 */
const ROUTE_BUDGET_BYTES: Record<string, number> = {
  'src/pages/ContactPage.tsx': 125_000,
  'src/pages/HomePage.tsx': 105_000,
  'src/pages/LlmsTxtPage.tsx': 30_000,
  'src/pages/AboutPage.tsx': 30_000,
  'src/pages/TeamPage.tsx': 30_000,
};

/** Applied to any other lazy-loaded page chunk. */
const DEFAULT_ROUTE_BUDGET_BYTES = 30_000;

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist', 'public');
const indexPath = join(distDir, 'index.html');
const manifestPath = join(distDir, '.vite', 'manifest.json');

function fail(message: string): never {
  console.error(`Bundle budget validation FAILED: ${message}`);
  process.exit(1);
}

if (!existsSync(indexPath)) {
  fail('dist/public/index.html not found — run `pnpm run build` first.');
}

const html = readFileSync(indexPath, 'utf8');
const moduleScript = html.match(
  /<script\b(?=[^>]*\btype=(["'])module\1)(?=[^>]*\bsrc=(["'])([^"']+)\2)[^>]*>/i,
);
const entrySrc = moduleScript?.[3];

if (!entrySrc) {
  fail('could not find a <script type="module" src="…"> entry in dist/public/index.html.');
}

const entryUrl = new URL(entrySrc, 'https://bundle-budget.invalid');
const entryPath = normalize(join(distDir, entryUrl.pathname.replace(/^\/+/, '')));

if (
  entryPath !== distDir
  && !entryPath.startsWith(`${distDir}/`)
) {
  fail(`entry path escapes dist/public: ${entrySrc}`);
}

if (!existsSync(entryPath)) {
  fail(`entry asset referenced by index.html does not exist: ${entrySrc}`);
}

const entrySize = statSync(entryPath).size;
const entrySizeKb = (entrySize / 1000).toFixed(2);
const budgetKb = ENTRY_BUDGET_BYTES / 1000;
const displayPath = relative(distDir, entryPath);

console.log(
  `Bundle budget: ${displayPath} is ${entrySizeKb} kB minified (budget: ${budgetKb} kB).`,
);

if (entrySize > ENTRY_BUDGET_BYTES) {
  fail(
    `${displayPath} is ${entrySizeKb} kB, exceeding the ${budgetKb} kB minified entry budget.`,
  );
}

// --- Lazy-loaded route chunks -------------------------------------------------

type ManifestEntry = {
  file?: string;
  src?: string;
  isDynamicEntry?: boolean;
};

if (!existsSync(manifestPath)) {
  fail(
    'dist/public/.vite/manifest.json not found — the production build must emit a manifest (build.manifest in vite.config.ts).',
  );
}

let manifest: Record<string, ManifestEntry>;

try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<
    string,
    ManifestEntry
  >;
} catch (error) {
  fail(`could not parse dist/public/.vite/manifest.json: ${String(error)}`);
}

const routeChunks = Object.entries(manifest)
  .filter(
    ([, entry]) =>
      entry.isDynamicEntry === true
      && typeof entry.file === 'string'
      && typeof entry.src === 'string'
      && entry.src.startsWith('src/pages/'),
  )
  .map(([, entry]) => ({ src: entry.src as string, file: entry.file as string }))
  .sort((a, b) => a.src.localeCompare(b.src));

if (routeChunks.length === 0) {
  fail(
    'no lazy-loaded route chunks found in the build manifest — expected dynamic entries under src/pages/.',
  );
}

const routeFailures: string[] = [];

for (const chunk of routeChunks) {
  const chunkPath = normalize(join(distDir, chunk.file));

  if (!chunkPath.startsWith(`${distDir}/`)) {
    fail(`route chunk path escapes dist/public: ${chunk.file}`);
  }

  if (!existsSync(chunkPath)) {
    fail(`route chunk listed in the manifest does not exist: ${chunk.file}`);
  }

  const size = statSync(chunkPath).size;
  const budget = ROUTE_BUDGET_BYTES[chunk.src] ?? DEFAULT_ROUTE_BUDGET_BYTES;
  const sizeKb = (size / 1000).toFixed(2);
  const routeBudgetKb = budget / 1000;
  const status = size > budget ? 'OVER BUDGET' : 'ok';

  console.log(
    `Route chunk: ${chunk.src} → ${chunk.file} is ${sizeKb} kB minified (budget: ${routeBudgetKb} kB) — ${status}.`,
  );

  if (size > budget) {
    routeFailures.push(
      `${chunk.src} (${chunk.file}) is ${sizeKb} kB, exceeding its ${routeBudgetKb} kB minified budget`,
    );
  }
}

if (routeFailures.length > 0) {
  fail(`route chunk budgets exceeded:\n  - ${routeFailures.join('\n  - ')}`);
}

console.log('Bundle budget validation passed.');