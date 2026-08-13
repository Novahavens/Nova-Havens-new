/**
 * Visual smoke tests for Nova Havens.
 *
 * Each test navigates to a route, waits for the page to settle, and:
 *   1. Asserts that no uncaught JavaScript error occurred (`pageerror`).
 *   2. Asserts that no `console.error` was emitted.
 *   3. Asserts that no non-image network request failed (4xx/5xx or
 *      connection-level failure such as DNS / TLS / `net::ERR_*`).
 *   4. Compares a full-page screenshot against a saved baseline.
 *
 * On first run (or after `pnpm test:smoke:update`) Playwright writes the
 * baseline; subsequent runs report any visual drift.
 *
 * Routes covered: /, /about-us, /blog, /blog/:slug, /meet-the-team,
 *   /contact, /privacy-policy, /terms-of-service
 */

import { test, expect, Page, ConsoleMessage, Response, Request } from '@playwright/test';

// ---------------------------------------------------------------------------
// Allowlists
// ---------------------------------------------------------------------------

/**
 * Console error message substrings that are known-safe and should not fail
 * the test.  Each entry is matched against the full message text.
 *
 * Example patterns worth allowlisting:
 *   'ERR_BLOCKED_BY_CLIENT'   – analytics blocked by the headless ad-filter
 */
const ALLOWLISTED_CONSOLE_ERRORS: readonly string[] = [
  // Add known-safe patterns here, e.g.:
  // 'ERR_BLOCKED_BY_CLIENT',
];

/**
 * URL substrings for requests that may legitimately fail and should not fail
 * the test.  Typically third-party analytics / tracking endpoints that a
 * headless browser blocks.
 *
 * Images are always excluded from network-failure checks regardless of this
 * list (checked by Content-Type header and URL extension).
 */
const ALLOWLISTED_FAILED_URLS: readonly string[] = [
  // Add known-safe URL substrings here, e.g.:
  // 'analytics.google.com',
  // 'fonts.googleapis.com',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true when a URL looks like an image resource. */
function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg|ico|avif)(\?|$)/i.test(url);
}

/** Returns true when a response Content-Type indicates an image. */
function isImageContentType(contentType: string): boolean {
  return contentType.startsWith('image/');
}

/** Returns true when the URL is in the failure allowlist. */
function isAllowlistedUrl(url: string): boolean {
  return ALLOWLISTED_FAILED_URLS.some((pattern) => url.includes(pattern));
}

// ---------------------------------------------------------------------------
// Runtime-error collector
// ---------------------------------------------------------------------------

interface RuntimeErrors {
  /** Uncaught JS exceptions captured via `page.on('pageerror')`. */
  pageErrors: string[];
  /** `console.error(...)` calls not covered by the allowlist. */
  consoleErrors: string[];
  /**
   * HTTP 4xx/5xx responses for non-image requests not covered by the
   * allowlist.
   */
  httpFailures: Array<{ url: string; status: number }>;
  /**
   * Connection-level failures (DNS, TLS, `net::ERR_*`) for non-image
   * requests not covered by the allowlist.
   */
  requestFailures: Array<{ url: string; errorText: string }>;
}

/**
 * Attach all runtime-error listeners to `page` before navigation so no
 * events are missed.  Returns the live error record; its arrays are populated
 * as events fire during the test.
 */
function attachRuntimeCollectors(page: Page): RuntimeErrors {
  const errors: RuntimeErrors = {
    pageErrors: [],
    consoleErrors: [],
    httpFailures: [],
    requestFailures: [],
  };

  // ── Uncaught JS exceptions ────────────────────────────────────────────────
  page.on('pageerror', (err: Error) => {
    errors.pageErrors.push(`${err.name}: ${err.message}`);
  });

  // ── console.error() calls ─────────────────────────────────────────────────
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    const isAllowlisted = ALLOWLISTED_CONSOLE_ERRORS.some((pattern) =>
      text.includes(pattern),
    );
    if (!isAllowlisted) {
      errors.consoleErrors.push(text);
    }
  });

  // ── HTTP 4xx / 5xx responses ──────────────────────────────────────────────
  page.on('response', (response: Response) => {
    const status = response.status();
    if (status < 400) return; // 1xx–3xx are fine

    const url = response.url();
    if (isAllowlistedUrl(url)) return;

    // Skip image resources — a missing decorative image isn't a runtime error.
    const contentType = response.headers()['content-type'] ?? '';
    if (isImageContentType(contentType) || isImageUrl(url)) return;

    errors.httpFailures.push({ url, status });
  });

  // ── Connection-level failures (DNS / TLS / net::ERR_*) ───────────────────
  // These never produce a `response` event, so they require a separate listener.
  page.on('requestfailed', (request: Request) => {
    const url = request.url();
    if (isAllowlistedUrl(url)) return;
    if (isImageUrl(url)) return;

    const errorText = request.failure()?.errorText ?? 'unknown error';
    errors.requestFailures.push({ url, errorText });
  });

  return errors;
}

// ---------------------------------------------------------------------------
// Page-stability helpers
// ---------------------------------------------------------------------------

/**
 * Wait for the page to be visually stable:
 *   1. Network idle (no in-flight XHR/fetch for 500 ms)
 *   2. No CSS animations running
 *   3. All <img> elements decoded
 */
async function waitForStable(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');

  // Wait for any CSS transition / animation to finish.
  await page.evaluate(() =>
    document.fonts.ready.then(() => {
      return new Promise<void>((resolve) => {
        // If nothing is animating, resolve immediately on next frame.
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    }),
  );

  // Ensure every <img> has loaded (or errored) so screenshots are consistent.
  // Use a per-image 5 s deadline so a slow/missing external image doesn't
  // block the whole test.
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images).map(
        (img) =>
          img.complete
            ? Promise.resolve()
            : Promise.race([
                new Promise<void>((res) => {
                  img.addEventListener('load', () => res(), { once: true });
                  img.addEventListener('error', () => res(), { once: true });
                }),
                new Promise<void>((res) => setTimeout(res, 5_000)),
              ]),
      ),
    ),
  );
}

// ---------------------------------------------------------------------------
// Core smoke-test helper
// ---------------------------------------------------------------------------

/**
 * Navigate to `path`, wait for stability, then:
 *   - Assert no uncaught JavaScript exception was thrown (`pageerror`).
 *   - Assert no `console.error` was emitted.
 *   - Assert no non-image HTTP request returned 4xx/5xx.
 *   - Assert no non-image request failed at the connection level.
 *   - Assert the full-page screenshot matches the stored baseline.
 *
 * <img> elements are masked (replaced with a solid box) so that external or
 * lazily-decoded image bytes don't cause spurious diffs.  Layout, typography,
 * colours, and spacing are still fully compared.
 */
async function smokeTest(page: Page, path: string): Promise<void> {
  // Attach collectors BEFORE navigation so no events are missed.
  const errors = attachRuntimeCollectors(page);

  await page.goto(path);
  await waitForStable(page);

  // ── Runtime-error assertions ──────────────────────────────────────────────

  expect(
    errors.pageErrors,
    `Uncaught JS exception(s) on ${path}:\n${errors.pageErrors.join('\n')}`,
  ).toHaveLength(0);

  expect(
    errors.consoleErrors,
    `console.error(s) on ${path}:\n${errors.consoleErrors.join('\n')}`,
  ).toHaveLength(0);

  expect(
    errors.httpFailures,
    `HTTP error response(s) on ${path}:\n` +
      errors.httpFailures.map((f) => `  ${f.status} ${f.url}`).join('\n'),
  ).toHaveLength(0);

  expect(
    errors.requestFailures,
    `Connection-level request failure(s) on ${path}:\n` +
      errors.requestFailures
        .map((f) => `  ${f.errorText} — ${f.url}`)
        .join('\n'),
  ).toHaveLength(0);

  // ── Visual snapshot ───────────────────────────────────────────────────────
  const imgLocators = page.locator('img');

  await expect(page).toHaveScreenshot({
    fullPage: true,
    // Allow minor sub-pixel anti-aliasing drift between runs.
    maxDiffPixelRatio: 0.01,
    animations: 'disabled',
    mask: await imgLocators.all(),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Page smoke tests', () => {
  test('home page renders correctly', async ({ page }) => {
    await smokeTest(page, '/');
  });

  test('about-us page renders correctly', async ({ page }) => {
    await smokeTest(page, '/about-us');
  });

  test('blog index renders correctly', async ({ page }) => {
    await smokeTest(page, '/blog');
  });

  test('blog post renders correctly', async ({ page }) => {
    // Use the first real post slug from blogPosts.ts.
    await smokeTest(page, '/blog/details-that-speed-up-housing-placement');
  });

  test('meet-the-team renders correctly', async ({ page }) => {
    await smokeTest(page, '/meet-the-team');
  });

  test('contact page renders correctly', async ({ page }) => {
    await smokeTest(page, '/contact');
  });

  test('privacy-policy renders correctly', async ({ page }) => {
    await smokeTest(page, '/privacy-policy');
  });

  test('terms-of-service renders correctly', async ({ page }) => {
    await smokeTest(page, '/terms-of-service');
  });
});
