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
 * NixOS compatibility: the npm smoke-test scripts resolve Chromium's Nix
 * store libraries at runtime (see scripts/with-nix-chromium-libs.sh).
 */

const TEST_PORT = 5174;
const BASE_URL = `http://localhost:${TEST_PORT}`;

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',

  /* Fail fast in CI; keep going locally so you see all failures. */
  forbidOnly: !!process.env.CI,
  // One retry everywhere: absorbs transient dev-server flakes (e.g. a
  // one-off 404 during warm-up) while still failing on persistent errors.
  retries: 1,
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
    {
      name: 'tablet-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: true,
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        // iPhone 14 logical dimensions: 390 × 844
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
    },
    {
      name: 'chromium-dark',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'tablet-chrome-dark',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: true,
      },
    },
    {
      name: 'mobile-chrome-dark',
      use: {
        ...devices['Pixel 5'],
        // iPhone 14 logical dimensions: 390 × 844
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
    },
  ],

  snapshotDir: './tests/__snapshots__',
  // Include {projectName} so desktop, tablet, and mobile baselines live in separate dirs.
  snapshotPathTemplate: '{snapshotDir}/{projectName}/{testFilePath}/{arg}{ext}',

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
