/**
 * Regression test for the *wiring* of the stale-build guard into prerender.ts
 * and scripts/validate-prerender.ts.
 *
 * scripts/lib/buildFreshness.ts (the shared assertBuildFresh check) already
 * has its own unit tests in buildFreshness.test.ts. Those tests cannot catch
 * someone later reordering, weakening, or removing the call to
 * assertBuildFresh inside prerender.ts or validate-prerender.ts themselves —
 * only running the real scripts proves the call site is still there and
 * still runs before either script trusts (or "heals") stale output.
 *
 * Each script hard-codes dist/public as its own package directory + 'dist/public'
 * so it always operates on the real build in normal operation. To test the
 * stale-output path without touching real build output, both scripts accept a
 * test-only environment variable that redirects just that path to a disposable
 * fixture (see PRERENDER_TEST_DIST_DIR / VALIDATE_PRERENDER_TEST_DIST_DIR in
 * the scripts themselves). The source side of the comparison is left as the
 * real artifact root, so the test never has to fake or touch real source
 * files — a fixture dated to year 2000 is unambiguously older than any file
 * in the checked-out source tree, regardless of when this repo was last
 * edited.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  readdirSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const artifactRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const createdDirs: string[] = [];

test.after(() => {
  for (const dir of createdDirs) rmSync(dir, { recursive: true, force: true });
});

/**
 * A dist/public fixture containing only an ancient index.html: enough to
 * satisfy each script's "does a build exist at all" check, and old enough
 * (year 2000) to be unambiguously older than every file in the real source
 * tree this repo runs from, no matter when it was last edited.
 */
function makeStaleDist(): string {
  const distDir = mkdtempSync(join(tmpdir(), 'prerender-stale-dist-'));
  createdDirs.push(distDir);

  writeFileSync(
    join(distDir, 'index.html'),
    '<!doctype html><html><head><title>t</title></head><body><div id="root"></div></body></html>',
  );
  const ancient = new Date(2000, 0, 1);
  utimesSync(join(distDir, 'index.html'), ancient, ancient);

  return distDir;
}

type RunResult = { status: number | null; stdout: string; stderr: string };

/** Runs one of the artifact's own scripts exactly as its usage comment does. */
function runScript(relativeScriptPath: string, env: Record<string, string>): RunResult {
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', relativeScriptPath],
    {
      cwd: artifactRoot,
      env: { ...process.env, ...env },
      encoding: 'utf-8',
      timeout: 60_000,
    },
  );

  if (result.error) throw result.error;

  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

test('prerender.ts refuses a stale dist/public instead of relabeling it', () => {
  const distDir = makeStaleDist();
  const before = readdirSync(distDir).sort();

  const { status, stdout, stderr } = runScript('prerender.ts', {
    PRERENDER_TEST_DIST_DIR: distDir,
  });

  assert.equal(status, 2, `expected exit code 2, got ${status}. stderr:\n${stderr}`);
  assert.match(stderr, /stale build output/);
  assert.match(stderr, /Prerender SKIPPED/);
  assert.match(stderr, /Run `pnpm run build` and check again\./);

  // Nothing route-related should ever have been logged or written: the guard
  // must fire before the per-route write loop starts.
  assert.doesNotMatch(stdout, /prerender:/);
  assert.deepEqual(
    readdirSync(distDir).sort(),
    before,
    'prerender.ts must not write any files once the freshness guard has fired',
  );
});

test('validate-prerender.ts refuses a stale dist/public before attempting to heal it', () => {
  const distDir = makeStaleDist();
  const before = readdirSync(distDir).sort();

  const { status, stdout, stderr } = runScript('scripts/validate-prerender.ts', {
    VALIDATE_PRERENDER_TEST_DIST_DIR: distDir,
  });

  assert.equal(status, 2, `expected exit code 2, got ${status}. stderr:\n${stderr}`);
  assert.match(stderr, /stale build output/);
  assert.match(stderr, /Prerender metadata validation SKIPPED/);
  assert.match(stderr, /Run `pnpm run build` and check again\./);

  // The missing-routes healing branch (which would re-run prerender.ts and
  // write into distDir) must never run once the guard has fired.
  assert.doesNotMatch(stdout, /route\(s\) missing prerendered HTML/);
  assert.doesNotMatch(stdout, /re-running prerender step/);
  assert.deepEqual(
    readdirSync(distDir).sort(),
    before,
    'validate-prerender.ts must not write or heal any files once the freshness guard has fired',
  );
});

test('a fresh, non-stale dist/public is not affected by the test override', () => {
  // Sanity check on the override itself: pointing distDir at a fixture that
  // is *not* stale must not trip the guard, so the two failing tests above
  // are really exercising staleness and not just "the override was set".
  const distDir = mkdtempSync(join(tmpdir(), 'prerender-fresh-dist-'));
  createdDirs.push(distDir);
  const indexPath = join(distDir, 'index.html');
  writeFileSync(
    indexPath,
    '<!doctype html><html><head><title>t</title></head><body><div id="root"></div></body></html>',
  );
  // Explicitly dated a few minutes into the future so this passes regardless
  // of filesystem mtime resolution or exactly when the checked-out source
  // was last touched — this test only cares that non-stale output sails
  // through, not about pinning an exact real-world timestamp.
  const future = new Date(Date.now() + 5 * 60_000);
  utimesSync(indexPath, future, future);

  const { status, stderr } = runScript('prerender.ts', {
    PRERENDER_TEST_DIST_DIR: distDir,
  });

  assert.notEqual(status, 2, `guard fired unexpectedly on fresh output. stderr:\n${stderr}`);
  assert.doesNotMatch(stderr, /stale build output/);
});

test('the freshness-guard regression test is wired into package.json', async () => {
  const packageJson = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ) as { scripts: Record<string, string> };

  assert.match(
    packageJson.scripts['test:prerender-freshness-guard'],
    /tests\/prerenderFreshnessGuard\.test\.ts/,
  );
  assert.match(packageJson.scripts.build, /pnpm run test:prerender-freshness-guard/);
});
