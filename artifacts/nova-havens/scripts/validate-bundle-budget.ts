/**
 * Ensures the JavaScript entry shipped from dist/public/index.html stays
 * within Vite's 500 kB minified bundle budget.
 *
 * Run with: node --experimental-strip-types scripts/validate-bundle-budget.ts
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENTRY_BUDGET_BYTES = 500_000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist', 'public');
const indexPath = join(distDir, 'index.html');

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

console.log('Bundle budget validation passed.');