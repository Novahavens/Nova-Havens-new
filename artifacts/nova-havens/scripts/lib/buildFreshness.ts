/**
 * buildFreshness.ts — shared "is dist/public newer than the source that
 * produced it" check.
 *
 * Any script that reads build output (bundle sizes, prerendered HTML,
 * shipped structured data, …) can be fooled by a dist/public left over from
 * an earlier build: the files are real and readable, they just don't
 * describe the current source. Comparing the newest tracked source mtime
 * against the oldest output mtime catches that case before the script draws
 * any conclusion from stale bytes.
 *
 * Originally lived only in validate-bundle-budget.ts; extracted so
 * prerender.ts and validate-prerender.ts can refuse stale output the same
 * way instead of reimplementing the mtime walk.
 */

import { readdirSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Artifact root (scripts/lib/../..). */
export const DEFAULT_SOURCE_ROOT = join(__dirname, '..', '..');

/**
 * Paths (relative to the artifact root, '/'-separated) that cannot change what
 * lands in dist/public, so touching them must not make an existing build look
 * stale.
 *
 * This is deliberately an *exclude* list rather than the include list it
 * replaced. An include list drifts silently: add a fourth vite plugin, a new
 * root config file, or a codegen step whose output vite reads, forget to list
 * it, and edits to it never register as staling the build — the guard keeps
 * reporting "fresh" over output that no longer matches its source. With an
 * exclude list the same forgetfulness fails the safe way instead: an
 * unrecognised new entry counts as a build input, and the worst case is being
 * told to rebuild when strictly you didn't have to.
 *
 * Only add an entry here when it genuinely cannot affect build output, and
 * keep entries as specific as possible: excluding a whole directory reopens
 * the same drift hole for anything added inside it later.
 */
export const NON_BUILD_INPUTS: ReadonlySet<string> = new Set([
  // The build output itself, plus generated caches.
  'dist',
  'node_modules',
  '.vite',
  '.cache',
  '.turbo',
  'coverage',
  'tsconfig.tsbuildinfo',
  // Test-only surfaces: they read the build, they never produce it.
  'tests',
  'test-results',
  'playwright-report',
  'playwright.config.ts',
  'scripts/with-nix-chromium-libs.sh',
  // Build *consumers*. These run after the build and date themselves against
  // it; tracking them would mean editing a staleness check declares every
  // build stale — including, circularly, this file and its own callers.
  // Everything else under scripts/ stays tracked: generators like the OG
  // image script and the sync scripts genuinely shape what gets built.
  'scripts/validate-bundle-budget.ts',
  'scripts/validate-prerender.ts',
  'scripts/lib/buildFreshness.ts',
  // Documentation and repo metadata. Named individually rather than matched
  // by extension so a future Markdown file that the build actually imports is
  // tracked by default.
  'SCHEDULED_DEPLOYMENT.md',
  'TESTING.md',
  '.gitignore',
  '.replit-artifact',
]);

/** Whether an artifact-root-relative path counts as a build input. */
export function isBuildInput(relativePath: string): boolean {
  return !NON_BUILD_INPUTS.has(relativePath.split(sep).join('/'));
}

/**
 * Artifact-root entries whose contents end up in dist/public — everything in
 * the root that is not excluded above. If any of them is newer than the build
 * output, whatever is in dist/public was produced by a different build and
 * nothing that reads it (bundle sizes, prerendered HTML, structured data)
 * describes the current source.
 */
export function resolveSourcePaths(
  sourceRoot: string = DEFAULT_SOURCE_ROOT,
): string[] {
  let entries: string[];

  try {
    entries = readdirSync(sourceRoot);
  } catch {
    return [];
  }

  return entries.filter((entry) => isBuildInput(entry)).sort();
}

/** Newest modification time (ms) across the tracked source paths, or 0. */
export function newestSourceMtime(
  sourceRoot: string,
  sourcePaths: readonly string[] = resolveSourcePaths(sourceRoot),
): { mtimeMs: number; path: string | null } {
  let newest = 0;
  let newestPath: string | null = null;

  const visit = (path: string): void => {
    const relativePath = relative(sourceRoot, path);

    // Exclusions are checked at every depth, not just at the root, so a
    // nested entry (e.g. a validator that reads the build it would otherwise
    // stale) can be excluded without excluding its whole directory.
    if (relativePath !== '' && !isBuildInput(relativePath)) return;

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
      newestPath = relativePath;
    }
  };

  for (const entry of sourcePaths) visit(join(sourceRoot, entry));

  return { mtimeMs: newest, path: newestPath };
}

/**
 * Oldest modification time (ms) across every emitted file, which is what dates
 * the build: a stale dist can have a freshly rewritten index.html
 * (prerendering) or a current entry bundle sitting beside old route chunks.
 * Returns +Infinity for a missing/empty directory so callers that need a
 * distinct "no build output at all" error can check for that separately
 * instead of it masquerading as "fresh".
 */
export function oldestOutputMtime(distDir: string): number {
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

export class StaleBuildOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StaleBuildOutputError';
  }
}

export type AssertBuildFreshOptions = {
  /** Artifact root the build output is compared against for staleness. */
  sourceRoot: string;
  /** Directory holding the build output (dist/public). */
  distDir: string;
  /**
   * Source paths (relative to sourceRoot) to check; defaults to every tracked
   * entry resolved from sourceRoot (see resolveSourcePaths).
   */
  sourcePaths?: readonly string[];
  /** Short name of the caller, shown before "SKIPPED — stale build output". */
  label: string;
  /** Completes "…was last changed, {consequence}" in the thrown message. */
  consequence: string;
};

/**
 * Throws StaleBuildOutputError when any tracked source path is newer than
 * the oldest file in distDir. Callers that just produced distDir themselves
 * (e.g. right after `vite build`) can skip calling this per their own logic —
 * see skipStaleCheck in validate-bundle-budget.ts for that convention.
 *
 * Does not check whether distDir exists at all: a missing/empty distDir is a
 * different failure ("no build yet") that callers should report separately,
 * since oldestOutputMtime returns +Infinity for it, which never registers as
 * stale here.
 */
export function assertBuildFresh(options: AssertBuildFreshOptions): void {
  const sourceRoot = normalize(options.sourceRoot);
  const distDir = normalize(options.distDir);
  const newestSource = newestSourceMtime(sourceRoot, options.sourcePaths);

  if (newestSource.mtimeMs > oldestOutputMtime(distDir)) {
    const relativeDist = relative(sourceRoot, distDir);
    const displayDist = relativeDist.startsWith('..') ? distDir : relativeDist;

    throw new StaleBuildOutputError(
      `${options.label} SKIPPED — stale build output: ${displayDist} contains output built `
        + `before ${newestSource.path} was last changed, ${options.consequence} `
        + 'Run `pnpm run build` and check again.',
    );
  }
}
