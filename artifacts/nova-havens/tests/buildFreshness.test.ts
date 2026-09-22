/**
 * Guards the shared staleness check that validate-bundle-budget.ts,
 * prerender.ts, and validate-prerender.ts all rely on to refuse build output
 * older than the source that should have produced it.
 */

import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import {
  DEFAULT_SOURCE_ROOT,
  NON_BUILD_INPUTS,
  StaleBuildOutputError,
  assertBuildFresh,
  isBuildInput,
  newestSourceMtime,
  oldestOutputMtime,
  resolveSourcePaths,
} from '../scripts/lib/buildFreshness.ts';

const createdDirs: string[] = [];

test.after(() => {
  for (const dir of createdDirs) rmSync(dir, { recursive: true, force: true });
});

/** Writes a file backdated to `when`, returning the mtime the filesystem
 * actually recorded (utimesSync's precision is platform-dependent, so tests
 * compare against this instead of `when.getTime()` directly). */
function writeAt(path: string, contents: string, when: Date): number {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
  utimesSync(path, when, when);
  return statSync(path).mtimeMs;
}

function tempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  createdDirs.push(dir);
  return dir;
}

test('newestSourceMtime finds the newest file among the tracked paths', () => {
  const sourceRoot = tempDir('freshness-src-');
  const old = new Date(Date.now() - 120_000);
  const newer = new Date(Date.now() - 60_000);

  writeAt(join(sourceRoot, 'index.html'), '<!doctype html>', old);
  const newerMtimeMs = writeAt(join(sourceRoot, 'src', 'App.tsx'), 'export default null;\n', newer);

  const result = newestSourceMtime(sourceRoot, ['index.html', 'src']);

  assert.equal(result.mtimeMs, newerMtimeMs);
  assert.equal(result.path, join('src', 'App.tsx'));
});

test('newestSourceMtime ignores tracked paths that do not exist', () => {
  const sourceRoot = tempDir('freshness-src-');
  const when = new Date(Date.now() - 60_000);
  const mtimeMs = writeAt(join(sourceRoot, 'index.html'), '<!doctype html>', when);

  const result = newestSourceMtime(sourceRoot, ['index.html', 'does-not-exist']);

  assert.equal(result.mtimeMs, mtimeMs);
  assert.equal(result.path, 'index.html');
});

test('oldestOutputMtime finds the oldest file across nested directories', () => {
  const distDir = tempDir('freshness-dist-');
  const older = new Date(Date.now() - 120_000);
  const newer = new Date(Date.now() - 10_000);

  writeAt(join(distDir, 'index.html'), '<!doctype html>', newer);
  const olderMtimeMs = writeAt(join(distDir, 'assets', 'index-abc123.js'), '// entry', older);

  assert.equal(oldestOutputMtime(distDir), olderMtimeMs);
});

test('oldestOutputMtime is +Infinity for a missing or empty directory', () => {
  const distDir = tempDir('freshness-dist-empty-');
  assert.equal(oldestOutputMtime(distDir), Number.POSITIVE_INFINITY);
  assert.equal(oldestOutputMtime(join(distDir, 'does-not-exist')), Number.POSITIVE_INFINITY);
});

test('assertBuildFresh passes silently when output is newer than source', () => {
  const sourceRoot = tempDir('freshness-src-');
  const distDir = tempDir('freshness-dist-');
  writeAt(join(sourceRoot, 'src', 'App.tsx'), 'export default null;\n', new Date(Date.now() - 60_000));
  writeAt(join(distDir, 'index.html'), '<!doctype html>', new Date());

  assert.doesNotThrow(() =>
    assertBuildFresh({
      sourceRoot,
      distDir,
      sourcePaths: ['src'],
      label: 'Example check',
      consequence: 'so it would be wrong.',
    }),
  );
});

test('assertBuildFresh throws a labeled StaleBuildOutputError when source is newer', () => {
  const sourceRoot = tempDir('freshness-src-');
  const distDir = tempDir('freshness-dist-');
  writeAt(join(distDir, 'index.html'), '<!doctype html>', new Date(Date.now() - 120_000));
  writeAt(join(sourceRoot, 'src', 'App.tsx'), 'export default null;\n', new Date());

  assert.throws(
    () =>
      assertBuildFresh({
        sourceRoot,
        distDir,
        sourcePaths: ['src'],
        label: 'Example check',
        consequence: 'so it would be wrong.',
      }),
    (error: unknown) => {
      assert.ok(error instanceof StaleBuildOutputError);
      assert.match((error as Error).message, /^Example check SKIPPED — stale build output:/);
      assert.match((error as Error).message, /so it would be wrong\./);
      assert.match((error as Error).message, /src\/App\.tsx/);
      assert.match((error as Error).message, /Run `pnpm run build` and check again\./);
      return true;
    },
  );
});

test('assertBuildFresh does not flag a missing distDir as stale', () => {
  const sourceRoot = tempDir('freshness-src-');
  writeAt(join(sourceRoot, 'src', 'App.tsx'), 'export default null;\n', new Date());

  // No build output exists at all. That is a different failure ("no build
  // yet") than staleness, and callers are expected to check existence
  // themselves before relying on this — see validate-bundle-budget.ts's
  // and prerender.ts's own "not found" checks.
  assert.doesNotThrow(() =>
    assertBuildFresh({
      sourceRoot,
      distDir: join(sourceRoot, 'dist-that-does-not-exist'),
      sourcePaths: ['src'],
      label: 'Example check',
      consequence: 'so it would be wrong.',
    }),
  );
});

test('a directory that only contains empty subdirectories never registers as newer', () => {
  const distDir = tempDir('freshness-dist-');
  mkdirSync(join(distDir, 'assets', 'nested'), { recursive: true });

  assert.equal(oldestOutputMtime(distDir), Number.POSITIVE_INFINITY);
});

test('a build input nobody thought to list still stales the output', () => {
  const sourceRoot = tempDir('freshness-src-');
  const distDir = tempDir('freshness-dist-');

  writeAt(join(sourceRoot, 'index.html'), '<!doctype html>', new Date(Date.now() - 180_000));
  writeAt(join(distDir, 'index.html'), '<!doctype html>', new Date(Date.now() - 120_000));

  // A build input this guard has never heard of — the "someone adds a fourth
  // vite plugin / a new root config and forgets to register it" case that an
  // enumerated include list would miss entirely.
  writeAt(
    join(sourceRoot, 'vitePluginInventedLater.ts'),
    'export const invented = () => ({ name: "invented" });\n',
    new Date(),
  );

  assert.throws(
    () =>
      // No sourcePaths override: the tracked surface is whatever is in the
      // artifact root, so no list needed editing for this to be caught.
      assertBuildFresh({
        sourceRoot,
        distDir,
        label: 'Example check',
        consequence: 'so it would be wrong.',
      }),
    (error: unknown) => {
      assert.ok(error instanceof StaleBuildOutputError);
      assert.match((error as Error).message, /vitePluginInventedLater\.ts/);
      return true;
    },
  );
});

test('entries that cannot reach the bundle never stale the output', () => {
  const sourceRoot = tempDir('freshness-src-');
  const distDir = tempDir('freshness-dist-');

  writeAt(join(sourceRoot, 'index.html'), '<!doctype html>', new Date(Date.now() - 180_000));
  writeAt(join(distDir, 'index.html'), '<!doctype html>', new Date(Date.now() - 120_000));

  // All newer than the build output, none of them a build input.
  const now = new Date();
  writeAt(join(sourceRoot, 'tests', 'smoke.spec.ts'), '// test\n', now);
  writeAt(join(sourceRoot, 'dist', 'public', 'index.html'), '<!doctype html>', now);
  writeAt(join(sourceRoot, 'node_modules', 'dep', 'index.js'), '// dep\n', now);
  writeAt(join(sourceRoot, 'playwright.config.ts'), '// config\n', now);
  writeAt(join(sourceRoot, 'TESTING.md'), '# testing\n', now);
  // A nested exclusion: a checker that reads the build output it is dating,
  // which must not date itself against that same output.
  writeAt(join(sourceRoot, 'scripts', 'validate-prerender.ts'), '// consumer\n', now);

  assert.doesNotThrow(() =>
    assertBuildFresh({
      sourceRoot,
      distDir,
      label: 'Example check',
      consequence: 'so it would be wrong.',
    }),
  );
});

test('a generator that feeds the build stales the output even though it lives in scripts/', () => {
  const sourceRoot = tempDir('freshness-src-');
  const distDir = tempDir('freshness-dist-');

  writeAt(join(sourceRoot, 'index.html'), '<!doctype html>', new Date(Date.now() - 180_000));
  writeAt(join(distDir, 'index.html'), '<!doctype html>', new Date(Date.now() - 120_000));

  // scripts/ holds both build consumers and build producers — the OG image
  // generator runs before vite and writes into public/. Excluding the whole
  // directory would let edits to it pass as "fresh".
  writeAt(join(sourceRoot, 'scripts', 'generate-og-images.mjs'), '// generator\n', new Date());

  assert.throws(
    () =>
      assertBuildFresh({
        sourceRoot,
        distDir,
        label: 'Example check',
        consequence: 'so it would be wrong.',
      }),
    (error: unknown) => {
      assert.ok(error instanceof StaleBuildOutputError);
      assert.match((error as Error).message, /generate-og-images\.mjs/);
      return true;
    },
  );
});

test('the real artifact root tracks its build inputs and skips the rest', () => {
  const tracked = new Set(resolveSourcePaths(DEFAULT_SOURCE_ROOT));

  for (const entry of [
    'index.html',
    'src',
    'public',
    'package.json',
    'vite.config.ts',
    'vitePluginMetaInject.ts',
    'vitePluginValidateColors.ts',
    'vitePluginValidateTokens.ts',
    // Not in the original hand-maintained list, which is the drift this
    // resolution exists to prevent: all three shape what lands in
    // dist/public (prerender writes the HTML, tsconfig shapes the transpile,
    // scripts/ holds the OG image generator that writes into public/).
    'prerender.ts',
    'tsconfig.json',
    'scripts',
  ]) {
    assert.ok(tracked.has(entry), `${entry} affects build output but is not tracked`);
  }

  for (const entry of ['dist', 'node_modules', 'tests', 'playwright.config.ts']) {
    assert.ok(NON_BUILD_INPUTS.has(entry), `${entry} should be excluded by name`);
    assert.ok(!tracked.has(entry), `${entry} cannot affect build output but is tracked`);
  }

  // Nested exclusions: the checks that read dist/public are the only part of
  // scripts/ held back, so editing one cannot declare the build it inspects
  // stale.
  for (const entry of [
    'scripts/validate-bundle-budget.ts',
    'scripts/validate-prerender.ts',
    'scripts/lib/buildFreshness.ts',
  ]) {
    assert.ok(existsSync(join(DEFAULT_SOURCE_ROOT, entry)), `${entry} is excluded but does not exist`);
    assert.ok(!isBuildInput(entry), `${entry} reads the build and must not date it`);
  }

  assert.ok(
    isBuildInput('scripts/generate-og-images.mjs'),
    'the OG image generator feeds public/ and must stay tracked',
  );
});

test('readdirSync-based walk tolerates unreadable/odd entries without throwing', () => {
  const distDir = tempDir('freshness-dist-');
  writeAt(join(distDir, 'index.html'), '<!doctype html>', new Date());

  // Sanity check the walk actually visits real siblings, not just the root.
  writeAt(join(distDir, 'assets', 'a.js'), '// a', new Date(Date.now() - 5_000));
  writeAt(join(distDir, 'assets', 'b.js'), '// b', new Date(Date.now() - 1_000));

  const allFiles = readdirSync(join(distDir, 'assets'));
  assert.deepEqual(allFiles.sort(), ['a.js', 'b.js']);
  assert.equal(oldestOutputMtime(distDir), oldestOutputMtime(join(distDir, 'assets')));
});
