/**
 * Guards the bundle size guard itself: the validator must keep measuring real
 * files and keep failing loudly when the build output drifts.
 */

import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import {
  DEFAULT_ROUTE_BUDGET_BYTES,
  DEFAULT_SOURCE_ROOT,
  ENTRY_BUDGET_BYTES,
  ROUTE_BUDGET_BYTES,
  SOURCE_PATHS,
  validateBundleBudget,
} from '../scripts/validate-bundle-budget.ts';

type ManifestEntry = {
  file: string;
  src?: string;
  isDynamicEntry?: boolean;
};

type Fixture = {
  entryBytes?: number;
  manifest?: Record<string, ManifestEntry> | null;
  /** Byte size written for each emitted chunk file, keyed by file name. */
  chunkBytes?: Record<string, number>;
  /** Chunk files listed in the manifest but deliberately not written. */
  omitChunkFiles?: string[];
  indexHtml?: string;
};

const createdDirs: string[] = [];

test.after(() => {
  for (const dir of createdDirs) rmSync(dir, { recursive: true, force: true });
});

function writeSizedFile(path: string, bytes: number): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, 'x'.repeat(bytes));
}

/** Sets the modification time of every file under a directory tree. */
function setMtimes(dir: string, when: Date): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) setMtimes(path, when);
    else utimesSync(path, when, when);
  }
}

/**
 * A throwaway source tree the validator dates the build output against. Its
 * files are backdated by default so a freshly written dist looks current.
 */
function makeSourceRoot({ ageMs = 60_000 }: { ageMs?: number } = {}): string {
  const sourceRoot = mkdtempSync(join(tmpdir(), 'bundle-budget-src-'));
  createdDirs.push(sourceRoot);

  writeFileSync(join(sourceRoot, 'index.html'), '<!doctype html>');
  mkdirSync(join(sourceRoot, 'src'), { recursive: true });
  writeFileSync(join(sourceRoot, 'src', 'App.tsx'), 'export default null;\n');
  setMtimes(sourceRoot, new Date(Date.now() - ageMs));

  return sourceRoot;
}

/** Builds a throwaway dist/public tree that looks like a real Vite build. */
function makeDist(fixture: Fixture = {}): string {
  const distDir = mkdtempSync(join(tmpdir(), 'bundle-budget-'));
  createdDirs.push(distDir);

  const {
    entryBytes = 1_000,
    manifest = {
      'index.html': { file: 'assets/index-abc123.js', src: 'index.html' },
      'src/pages/HomePage.tsx': {
        file: 'assets/HomePage-abc123.js',
        src: 'src/pages/HomePage.tsx',
        isDynamicEntry: true,
      },
    },
    chunkBytes = {},
    omitChunkFiles = [],
    indexHtml = '<!doctype html><script type="module" crossorigin src="/assets/index-abc123.js"></script>',
  } = fixture;

  writeFileSync(join(distDir, 'index.html'), indexHtml);
  writeSizedFile(join(distDir, 'assets', 'index-abc123.js'), entryBytes);

  if (manifest) {
    mkdirSync(join(distDir, '.vite'), { recursive: true });
    writeFileSync(
      join(distDir, '.vite', 'manifest.json'),
      JSON.stringify(manifest, null, 2),
    );

    for (const entry of Object.values(manifest)) {
      if (!entry.isDynamicEntry) continue;
      if (omitChunkFiles.includes(entry.file)) continue;
      writeSizedFile(join(distDir, entry.file), chunkBytes[entry.file] ?? 1_000);
    }
  }

  return distDir;
}

function run(fixture: Fixture = {}) {
  const sourceRoot = makeSourceRoot();

  return validateBundleBudget({
    distDir: makeDist(fixture),
    sourceRoot,
    log: () => {},
  });
}

test('a healthy build passes and reports what it measured', () => {
  const result = run({
    entryBytes: 200_000,
    chunkBytes: { 'assets/HomePage-abc123.js': 50_000 },
  });

  assert.equal(result.entry.size, 200_000);
  assert.deepEqual(result.routeChunks, [
    {
      src: 'src/pages/HomePage.tsx',
      file: 'assets/HomePage-abc123.js',
      size: 50_000,
      budget: ROUTE_BUDGET_BYTES['src/pages/HomePage.tsx'],
    },
  ]);
});

test('an over-budget route chunk fails', () => {
  assert.throws(
    () =>
      run({
        chunkBytes: {
          'assets/HomePage-abc123.js':
            ROUTE_BUDGET_BYTES['src/pages/HomePage.tsx'] + 1,
        },
      }),
    (error: Error) => {
      assert.match(error.message, /route chunk budgets exceeded/);
      assert.match(error.message, /src\/pages\/HomePage\.tsx/);
      return true;
    },
  );
});

test('an unlisted page falls back to the default route budget', () => {
  const manifest = {
    'index.html': { file: 'assets/index-abc123.js', src: 'index.html' },
    'src/pages/NewPage.tsx': {
      file: 'assets/NewPage-abc123.js',
      src: 'src/pages/NewPage.tsx',
      isDynamicEntry: true,
    },
  };

  assert.equal(
    run({
      manifest,
      chunkBytes: { 'assets/NewPage-abc123.js': DEFAULT_ROUTE_BUDGET_BYTES },
    }).routeChunks[0].budget,
    DEFAULT_ROUTE_BUDGET_BYTES,
  );

  assert.throws(
    () =>
      run({
        manifest,
        chunkBytes: {
          'assets/NewPage-abc123.js': DEFAULT_ROUTE_BUDGET_BYTES + 1,
        },
      }),
    /route chunk budgets exceeded/,
  );
});

test('an over-budget entry bundle fails', () => {
  assert.throws(
    () => run({ entryBytes: ENTRY_BUDGET_BYTES + 1 }),
    /exceeding the 500 kB minified entry budget/,
  );
});

test('a missing manifest fails', () => {
  assert.throws(
    () => run({ manifest: null }),
    /manifest\.json not found/,
  );
});

test('an unparseable manifest fails', () => {
  const distDir = makeDist();
  writeFileSync(join(distDir, '.vite', 'manifest.json'), '{ not json');

  assert.throws(
    () => validateBundleBudget({ distDir, log: () => {} }),
    /could not parse/,
  );
});

test('no lazy-loaded route chunks fails instead of silently passing', () => {
  assert.throws(
    () =>
      run({
        manifest: {
          'index.html': { file: 'assets/index-abc123.js', src: 'index.html' },
          // A page that stopped being lazy-loaded is no longer a dynamic entry.
          'src/pages/HomePage.tsx': {
            file: 'assets/HomePage-abc123.js',
            src: 'src/pages/HomePage.tsx',
          },
        },
      }),
    /no lazy-loaded route chunks found/,
  );
});

test('a chunk listed in the manifest but missing on disk fails', () => {
  assert.throws(
    () => run({ omitChunkFiles: ['assets/HomePage-abc123.js'] }),
    /route chunk listed in the manifest does not exist/,
  );
});

test('a missing build output fails', () => {
  const distDir = mkdtempSync(join(tmpdir(), 'bundle-budget-empty-'));
  createdDirs.push(distDir);

  assert.throws(
    () => validateBundleBudget({ distDir, log: () => {} }),
    /index\.html not found/,
  );
});

test('an index.html without a module entry fails', () => {
  assert.throws(
    () => run({ indexHtml: '<!doctype html><p>no script here</p>' }),
    /could not find a <script type="module"/,
  );
});

test('output older than the source is reported as stale, not over budget', () => {
  // An old build that would blow the entry budget: the message must talk about
  // staleness so nobody chases a size regression that no longer exists.
  const distDir = makeDist({ entryBytes: ENTRY_BUDGET_BYTES + 152_000 });
  const sourceRoot = makeSourceRoot({ ageMs: -60_000 });

  assert.throws(
    () => validateBundleBudget({ distDir, sourceRoot, log: () => {} }),
    (error: Error) => {
      assert.match(error.message, /stale build output/);
      assert.match(error.message, /index\.html|src\/App\.tsx/);
      assert.doesNotMatch(error.message, /exceeding/);
      return true;
    },
  );
});

test('a freshly rewritten index.html does not hide stale assets', () => {
  // Prerendering rewrites index.html after the build, so index.html alone is
  // not evidence that the assets beside it are current.
  const distDir = makeDist();
  const sourceRoot = makeSourceRoot({ ageMs: -60_000 });

  writeFileSync(
    join(distDir, 'index.html'),
    '<!doctype html><script type="module" crossorigin src="/assets/index-abc123.js"></script>',
  );

  assert.throws(
    () => validateBundleBudget({ distDir, sourceRoot, log: () => {} }),
    /stale build output/,
  );
});

test('an old route chunk beside fresh output is reported as stale', () => {
  // A rebuilt entry can sit next to a route chunk left over from an earlier
  // build; measuring that chunk's size would be meaningless.
  const distDir = makeDist({
    chunkBytes: {
      'assets/HomePage-abc123.js': ROUTE_BUDGET_BYTES['src/pages/HomePage.tsx'] + 1,
    },
  });
  const sourceRoot = makeSourceRoot({ ageMs: -60_000 });
  const old = new Date(Date.now() - 120_000);

  utimesSync(join(distDir, 'assets', 'HomePage-abc123.js'), old, old);

  assert.throws(
    () => validateBundleBudget({ distDir, sourceRoot, log: () => {} }),
    (error: Error) => {
      assert.match(error.message, /stale build output/);
      assert.doesNotMatch(error.message, /route chunk budgets exceeded/);
      return true;
    },
  );
});

test('the stale check can be skipped for output the caller just built', () => {
  const distDir = makeDist({ entryBytes: 200_000 });
  const sourceRoot = makeSourceRoot({ ageMs: -60_000 });

  assert.equal(
    validateBundleBudget({
      distDir,
      sourceRoot,
      skipStaleCheck: true,
      log: () => {},
    }).entry.size,
    200_000,
  );
});

test('the tracked source paths exist in the artifact', () => {
  for (const entry of SOURCE_PATHS) {
    assert.ok(
      existsSync(join(DEFAULT_SOURCE_ROOT, entry)),
      `${entry} is listed as a build input but does not exist`,
    );
  }
});

test('the validator runs as part of the release and test scripts', async () => {
  const packageJson = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ) as { scripts: Record<string, string> };

  assert.match(packageJson.scripts.build, /pnpm run validate:bundle-budget/);
  assert.match(
    packageJson.scripts['test:bundle-budget'],
    /tests\/validateBundleBudget\.test\.ts/,
  );
});
