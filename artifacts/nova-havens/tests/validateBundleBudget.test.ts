/**
 * Guards the bundle size guard itself: the validator must keep measuring real
 * files and keep failing loudly when the build output drifts.
 */

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import {
  DEFAULT_ROUTE_BUDGET_BYTES,
  ENTRY_BUDGET_BYTES,
  ROUTE_BUDGET_BYTES,
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
  return validateBundleBudget({ distDir: makeDist(fixture), log: () => {} });
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
