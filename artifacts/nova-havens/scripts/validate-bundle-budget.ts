/**
 * Ensures the JavaScript entry shipped from dist/public/index.html stays
 * within Vite's 500 kB minified bundle budget, and that each lazy-loaded
 * route chunk stays within its own page-specific budget.
 *
 * Route chunks are discovered from the Vite build manifest
 * (dist/public/.vite/manifest.json): every dynamic entry sourced from
 * src/pages/ is a lazy-loaded page.
 *
 * Before measuring anything, the output is dated against the tracked build
 * inputs. Output older than the current source is reported as stale (exit 2)
 * rather than as a budget violation, so a leftover dist/public from an old
 * build never looks like a size regression.
 *
 * Run with: node --experimental-strip-types scripts/validate-bundle-budget.ts
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ENTRY_BUDGET_BYTES = 500_000;

/**
 * Minified budgets for the largest lazy-loaded page chunks. Each budget leaves
 * roughly 30% headroom over the current size so ordinary content edits pass
 * while a new heavy dependency on a page trips the check.
 */
export const ROUTE_BUDGET_BYTES: Record<string, number> = {
  'src/pages/ContactPage.tsx': 62_000,
  'src/pages/HomePage.tsx': 105_000,
  'src/pages/LlmsTxtPage.tsx': 30_000,
  'src/pages/AboutPage.tsx': 30_000,
  'src/pages/TeamPage.tsx': 30_000,
};

/** Applied to any other lazy-loaded page chunk. */
export const DEFAULT_ROUTE_BUDGET_BYTES = 30_000;

const __dirname = dirname(fileURLToPath(import.meta.url));

export const DEFAULT_DIST_DIR = join(__dirname, '..', 'dist', 'public');

export const DEFAULT_SOURCE_ROOT = join(__dirname, '..');

/**
 * Files and directories (relative to the artifact root) whose contents end up
 * in dist/public. If any of them is newer than the build output, whatever is
 * in dist/public was produced by a different build and its sizes say nothing
 * about the current source.
 */
export const SOURCE_PATHS = [
  'index.html',
  'src',
  'public',
  'package.json',
  'vite.config.ts',
  'vitePluginMetaInject.ts',
  'vitePluginValidateColors.ts',
  'vitePluginValidateTokens.ts',
];

/** Newest modification time (ms) across the tracked source paths, or 0. */
function newestSourceMtime(sourceRoot: string): { mtimeMs: number; path: string | null } {
  let newest = 0;
  let newestPath: string | null = null;

  const visit = (path: string): void => {
    let stats;

    try {
      stats = statSync(path);
    } catch {
      return;
    }

    if (stats.isDirectory()) {
      for (const child of readdirSync(path)) visit(join(path, child));
      return;
    }

    if (stats.mtimeMs > newest) {
      newest = stats.mtimeMs;
      newestPath = relative(sourceRoot, path);
    }
  };

  for (const entry of SOURCE_PATHS) visit(join(sourceRoot, entry));

  return { mtimeMs: newest, path: newestPath };
}

/**
 * Oldest modification time (ms) across every emitted file, which is what dates
 * the build: a stale dist can have a freshly rewritten index.html
 * (prerendering) or a current entry bundle sitting beside old route chunks.
 */
function oldestOutputMtime(distDir: string): number {
  let oldest = Number.POSITIVE_INFINITY;

  const visit = (path: string): void => {
    let stats;

    try {
      stats = statSync(path);
    } catch {
      return;
    }

    if (stats.isDirectory()) {
      for (const child of readdirSync(path)) visit(join(path, child));
      return;
    }

    if (stats.mtimeMs < oldest) oldest = stats.mtimeMs;
  };

  visit(distDir);

  return oldest;
}

type ManifestEntry = {
  file?: string;
  src?: string;
  isDynamicEntry?: boolean;
};

export type ValidateBundleBudgetOptions = {
  /** Directory holding the built site (index.html plus .vite/manifest.json). */
  distDir?: string;
  /** Artifact root the build output is compared against for staleness. */
  sourceRoot?: string;
  /** Skip the stale-output check (used when the caller just built). */
  skipStaleCheck?: boolean;
  /** Where progress lines go; defaults to console.log. */
  log?: (message: string) => void;
};

class StaleBuildOutputError extends Error {
  constructor(message: string) {
    super(`Bundle budget check SKIPPED — stale build output: ${message}`);
    this.name = 'StaleBuildOutputError';
  }
}

export { StaleBuildOutputError };

class BundleBudgetError extends Error {
  constructor(message: string) {
    super(`Bundle budget validation FAILED: ${message}`);
    this.name = 'BundleBudgetError';
  }
}

/**
 * Throws a BundleBudgetError describing the first hard failure, or a summary of
 * every route chunk that exceeded its budget. Returns the measured sizes so
 * callers can assert on what was actually checked.
 */
export function validateBundleBudget(
  options: ValidateBundleBudgetOptions = {},
): {
  entry: { file: string; size: number };
  routeChunks: { src: string; file: string; size: number; budget: number }[];
} {
  const distDir = normalize(options.distDir ?? DEFAULT_DIST_DIR);
  const log = options.log ?? ((message: string) => console.log(message));
  const indexPath = join(distDir, 'index.html');
  const manifestPath = join(distDir, '.vite', 'manifest.json');

  const fail = (message: string): never => {
    throw new BundleBudgetError(message);
  };

  if (!existsSync(indexPath)) {
    fail('dist/public/index.html not found — run `pnpm run build` first.');
  }

  if (options.skipStaleCheck !== true) {
    const sourceRoot = normalize(options.sourceRoot ?? DEFAULT_SOURCE_ROOT);
    const newestSource = newestSourceMtime(sourceRoot);

    if (newestSource.mtimeMs > oldestOutputMtime(distDir)) {
      const relativeDist = relative(sourceRoot, distDir);
      const displayDist = relativeDist.startsWith('..') ? distDir : relativeDist;

      throw new StaleBuildOutputError(
        `${displayDist} contains output built before ${newestSource.path} was last changed, `
          + 'so its sizes do not describe the current source. Run `pnpm run build` and check again.',
      );
    }
  }

  const html = readFileSync(indexPath, 'utf8');
  const moduleScript = html.match(
    /<script\b(?=[^>]*\btype=(["'])module\1)(?=[^>]*\bsrc=(["'])([^"']+)\2)[^>]*>/i,
  );
  const entrySrc = moduleScript?.[3];

  if (!entrySrc) {
    fail('could not find a <script type="module" src="…"> entry in dist/public/index.html.');
  }

  const entryUrl = new URL(entrySrc as string, 'https://bundle-budget.invalid');
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

  log(
    `Bundle budget: ${displayPath} is ${entrySizeKb} kB minified (budget: ${budgetKb} kB).`,
  );

  if (entrySize > ENTRY_BUDGET_BYTES) {
    fail(
      `${displayPath} is ${entrySizeKb} kB, exceeding the ${budgetKb} kB minified entry budget.`,
    );
  }

  // --- Lazy-loaded route chunks ----------------------------------------------

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

  const routeChunks = Object.entries(manifest!)
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
  const measuredChunks: {
    src: string;
    file: string;
    size: number;
    budget: number;
  }[] = [];

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

    measuredChunks.push({ src: chunk.src, file: chunk.file, size, budget });

    log(
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

  return {
    entry: { file: displayPath, size: entrySize },
    routeChunks: measuredChunks,
  };
}

if (import.meta.main) {
  try {
    validateBundleBudget();
    console.log('Bundle budget validation passed.');
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    // Stale output is not a budget violation: exit 2 so callers can tell the
    // two apart, and never report an old bundle as over budget.
    process.exit(error instanceof StaleBuildOutputError ? 2 : 1);
  }
}
