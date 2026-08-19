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
 * Route discovery is DYNAMIC: the suite iterates `ALL_ROUTES` from
 * src/lib/routeMeta.ts (static pages + every blog post slug), so adding a
 * page to the routeMeta manifest automatically adds it here — no manual
 * edits to this file.  A separate guard test parses src/App.tsx and fails
 * if any route registered in the router is missing from the manifest.
 */

import { test, expect, Page, ConsoleMessage, Response, Request } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ALL_ROUTES } from '../src/lib/routeMeta.ts';

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
 * Allowlist for uncaught page errors (window.onerror / unhandledrejection,
 * both surfaced by Playwright as `pageerror`).  Each entry is matched against
 * the error TYPE (e.g. 'TypeError'), the MESSAGE, and every STACK FRAME, so
 * you can allowlist by any of:
 *   - error type:   'ResizeObserver'          (matches the error name)
 *   - message text: 'loop completed with undelivered notifications'
 *   - stack frame:  'third-party-widget.js'   (matches a file in the stack)
 */
const ALLOWLISTED_PAGE_ERRORS: readonly string[] = [
  // Add known-safe patterns here, e.g.:
  // 'ResizeObserver loop',
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
  /**
   * Uncaught JS exceptions and unhandled promise rejections captured via
   * `page.on('pageerror')` (which surfaces both `window.onerror` and
   * `unhandledrejection` events).  Each entry includes the full stack trace
   * when available so the failing component/file can be identified.
   */
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

  // ── Uncaught JS exceptions & unhandled promise rejections ────────────────
  // Playwright's `pageerror` event fires for both `window.onerror` and
  // `unhandledrejection`.  We record the full stack trace (which includes
  // component/file frames) so failures point at the offending code, not just
  // a cryptic message.
  page.on('pageerror', (err: Error) => {
    const stack = err.stack ?? '';
    // Match the allowlist against error type, message, and every stack frame.
    const haystack = `${err.name}\n${err.message}\n${stack}`;
    const isAllowlisted = ALLOWLISTED_PAGE_ERRORS.some((pattern) =>
      haystack.includes(pattern),
    );
    if (isAllowlisted) return;

    // Prefer the stack (it usually starts with "Name: message" and then the
    // frames); fall back to name/message when no stack is available.
    const detail =
      stack && stack.includes(err.message)
        ? stack
        : [`${err.name}: ${err.message}`, stack].filter(Boolean).join('\n');
    errors.pageErrors.push(detail);
  });

  // ── console.error() calls ─────────────────────────────────────────────────
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    const isAllowlisted = ALLOWLISTED_CONSOLE_ERRORS.some((pattern) =>
      text.includes(pattern),
    );
    if (!isAllowlisted) {
      const loc = msg.location();
      errors.consoleErrors.push(loc?.url ? `${text} (${loc.url})` : text);
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

/**
 * Tablet pages must fit their viewport horizontally. Components may use
 * internally clipped overflow (for example, the home-page partner marquee),
 * but no route may make the document itself scroll sideways.
 */
async function expectPageToFitTabletViewport(page: Page, path: string): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    pageWidth: Math.max(
      document.documentElement.scrollWidth,
      document.body?.scrollWidth ?? 0,
    ),
  }));

  expect(
    dimensions.pageWidth,
    `The page is wider than the ${dimensions.viewportWidth}px tablet viewport on ${path}: ${dimensions.pageWidth}px`,
  ).toBeLessThanOrEqual(dimensions.viewportWidth);
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
 *   - On tablet projects, assert the document does not scroll horizontally.
 *   - Assert the full-page screenshot matches the stored baseline.
 *
 * <img> elements are masked (replaced with a solid box) so that external or
 * lazily-decoded image bytes don't cause spurious diffs.  Layout, typography,
 * colours, and spacing are still fully compared.
 */
async function smokeTest(page: Page, path: string): Promise<void> {
  // Dark-mode projects deliberately use page.emulateMedia rather than relying
  // on the browser's ambient preference, so the visual variant is explicit
  // and stable across local runs and CI.
  if (test.info().project.name.endsWith('-dark')) {
    await page.emulateMedia({ colorScheme: 'dark' });
  }

  // Attach collectors BEFORE navigation so no events are missed.
  const errors = attachRuntimeCollectors(page);

  await page.goto(path);
  await waitForStable(page);

  // ── Runtime-error assertions ──────────────────────────────────────────────

  expect(
    errors.pageErrors,
    `Uncaught JS exception(s) / unhandled rejection(s) on ${path}:\n\n${errors.pageErrors.join('\n\n')}`,
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

  // Keep the width check beside the existing per-route runtime and visual
  // checks. All tablet projects are configured at a 768px-wide viewport.
  if (test.info().project.name.startsWith('tablet-chrome')) {
    await expectPageToFitTabletViewport(page, path);
  }

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

/**
 * Turn a route path into a stable, readable test title (also used for
 * snapshot file names). '/' → 'home'; other paths lose the leading slash
 * and use '-' for nested segments: '/blog/foo' → 'blog-foo'.
 */
function routeTitle(path: string): string {
  return path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '-');
}

test.describe('Page smoke tests', () => {
  for (const route of ALL_ROUTES) {
    test(`${routeTitle(route)} renders correctly`, async ({ page }) => {
      await smokeTest(page, route);
    });
  }
});

// ---------------------------------------------------------------------------
// Mobile layout regression checks
// ---------------------------------------------------------------------------

test.describe('Mobile layout regressions', () => {
  test('about-us stays usable at 375px', async ({ page }) => {
    test.skip(
      !test.info().project.name.startsWith('mobile-chrome'),
      'This regression check belongs to the mobile-chrome projects',
    );

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/about-us');
    await waitForStable(page);

    const dimensions = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      pageWidth: Math.max(
        document.documentElement.scrollWidth,
        document.body?.scrollWidth ?? 0,
      ),
    }));
    expect(
      dimensions.pageWidth,
      `The page is wider than the 375px viewport: ${dimensions.pageWidth}px`,
    ).toBeLessThanOrEqual(dimensions.viewportWidth);

    await expect(page.getByTestId('heading-about-title')).toBeVisible();
    await expect(page.getByTestId('link-about-team')).toBeVisible();
    await expect(page.getByTestId('section-about-faq')).toBeVisible();
  });

  test('llms-txt stays usable at 375px', async ({ page }) => {
    test.skip(
      !test.info().project.name.startsWith('mobile-chrome'),
      'This regression check belongs to the mobile-chrome projects',
    );

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/llms-txt');
    await waitForStable(page);

    const dimensions = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      pageWidth: Math.max(
        document.documentElement.scrollWidth,
        document.body?.scrollWidth ?? 0,
      ),
    }));
    expect(
      dimensions.pageWidth,
      `The page is wider than the 375px viewport: ${dimensions.pageWidth}px`,
    ).toBeLessThanOrEqual(dimensions.viewportWidth);

    const banner = page.getByTestId('banner-llms-txt');
    await expect(banner).toBeVisible();

    const rawFileLink = banner.getByTestId('link-raw-llms-txt');
    await expect(rawFileLink).toBeVisible();
    await expect(rawFileLink).toHaveAttribute('href', '/llms.txt');

    await expect(page.locator('section h2').first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Route-coverage guard
// ---------------------------------------------------------------------------

/**
 * Fails when a route registered in the wouter router (src/App.tsx) is
 * missing from the ALL_ROUTES manifest (src/lib/routeMeta.ts).  This keeps
 * the dynamic discovery honest: a new page added to App.tsx without a
 * routeMeta entry breaks this test instead of silently going untested.
 */
test.describe('Route coverage', () => {
  test('every route in App.tsx is covered by the routeMeta manifest', () => {
    const testDir = dirname(fileURLToPath(import.meta.url));
    const appSource = readFileSync(resolve(testDir, '../src/App.tsx'), 'utf8');

    const registeredPaths = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(registeredPaths.length, 'No <Route path="..."> found in App.tsx').toBeGreaterThan(0);

    const uncovered = registeredPaths.filter((routePattern) => {
      if (routePattern.includes(':')) {
        // Dynamic route (e.g. /blog/:slug) — require at least one concrete
        // manifest entry matching the pattern.
        const regex = new RegExp(
          '^' + routePattern.replace(/:[^/]+/g, '[^/]+') + '$',
        );
        return !ALL_ROUTES.some((r) => regex.test(r));
      }
      return !ALL_ROUTES.includes(routePattern);
    });

    expect(
      uncovered,
      `Routes registered in App.tsx but missing from ALL_ROUTES (src/lib/routeMeta.ts) — ` +
        `add routeMeta entries so they are smoke-tested:\n${uncovered.join('\n')}`,
    ).toHaveLength(0);
  });
});
