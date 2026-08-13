import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke-test configuration for Nova Havens.
 *
 * The Vite dev server requires PORT and BASE_PATH env vars (see vite.config.ts).
 * We pick a fixed port (5174) that won't collide with the managed dev workflow,
 * and use BASE_PATH=/ so all routes resolve at their canonical paths.
 *
 * Run:
 *   pnpm test:smoke              – compare against saved snapshots
 *   pnpm test:smoke:update       – (re-)create baseline snapshots
 *
 * NixOS compatibility: the npm scripts prefix LD_LIBRARY_PATH with the Nix
 * store paths that Chromium headless shell needs (see package.json).
 */

const TEST_PORT = 5174;
const BASE_URL = `http://localhost:${TEST_PORT}`;

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',

  /* Fail fast in CI; keep going locally so you see all failures. */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // serial – single dev-server instance

  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],

  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  snapshotDir: './tests/__snapshots__',
  snapshotPathTemplate: '{snapshotDir}/{testFilePath}/{arg}{ext}',

  webServer: {
    /**
     * Start a fresh Vite dev server exclusively for tests.
     * REPL_ID is intentionally absent so the Replit-specific plugins are
     * skipped (they don't affect the rendered output but pull in network calls).
     */
    command: `PORT=${TEST_PORT} BASE_PATH=/ pnpm dev`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      PORT: String(TEST_PORT),
      BASE_PATH: '/',
    },
  },
});
