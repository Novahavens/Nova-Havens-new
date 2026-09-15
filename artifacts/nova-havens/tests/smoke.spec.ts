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
import { BLOG_POSTS } from '../src/data/blogPosts.ts';
import { INTAKE_FORMS } from '../src/lib/intakeForms.ts';

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
 * Compact-navigation pages must fit their viewport horizontally. Components may use
 * internally clipped overflow (for example, the home-page partner marquee),
 * but no route may make the document itself scroll sideways.
 */
async function expectPageToFitViewport(page: Page, path: string): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    pageWidth: Math.max(
      document.documentElement.scrollWidth,
      document.body?.scrollWidth ?? 0,
    ),
  }));

  expect(
    dimensions.pageWidth,
    `The page is wider than the ${dimensions.viewportWidth}px compact-navigation viewport on ${path}: ${dimensions.pageWidth}px`,
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

  // Keep the 768px width check beside the existing per-route runtime and
  // visual checks. The 1023px compact-nav projects reuse the same assertion
  // in their dedicated route-width regression check below.
  if (test.info().project.name.startsWith('tablet-chrome')) {
    await expectPageToFitViewport(page, path);
  }

  // ── Visual snapshot ───────────────────────────────────────────────────────
  // Pause autoplaying carousels before the screenshot so a slide transition
  // cannot change the document height between Playwright's stability samples.
  const carousel = page.getByTestId('carousel-showcase');
  if (await carousel.count()) await carousel.hover();

  const imgLocators = page.locator('img');

  await expect(page).toHaveScreenshot({
    fullPage: true,
    // Allow minor sub-pixel anti-aliasing drift between runs.
    maxDiffPixelRatio: 0.01,
    animations: 'disabled',
    mask: await imgLocators.all(),
    // On the tallest pages (e.g. mobile viewports), a full-page screenshot
    // is stitched from many scroll tiles, each re-checking every mask
    // locator's bounding box. That gives Playwright's internal
    // stability polling more tiles to reconcile than the default 5s
    // budget reliably allows, so a still-settling tile can be misread as
    // "unstable" even though the page itself has stopped changing. The
    // default timeout is too tight for that case; a longer one gives the
    // same poll loop room to converge without loosening maxDiffPixelRatio.
    timeout: 20_000,
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
      test.skip(
        test.info().project.name.startsWith('compact-nav-chrome'),
        'Compact-navigation projects use the dedicated route-width regression check below.',
      );
      await smokeTest(page, route);
    });
  }
});

// ---------------------------------------------------------------------------
// Trust Strip section regression
// ---------------------------------------------------------------------------

/**
 * The full-page homepage screenshot's `maxDiffPixelRatio` (0.01) is measured
 * against the ENTIRE page's pixel count. A small alignment regression inside
 * one above-the-fold section — e.g. a stray negative-margin utility class
 * shifting the large "60,000+ verified homes" tile out of alignment with its
 * sibling cards — can be too small a fraction of the full screenshot to cross
 * that threshold on a tall page, even though it is plainly visible in the
 * section itself. This happened for real: that exact bug only failed the
 * mobile-chrome smoke tests, because on chromium/tablet-chrome the full page
 * is much taller relative to the Trust Strip, diluting the same pixel delta
 * below 1%. Those projects stayed green the whole time the bug was live.
 *
 * This check screenshots ONLY the Trust Strip section, independent of the
 * full-page homepage screenshot, with a far tighter tolerance so the same
 * class of regression fails at every viewport — not just the ones where it
 * happens to be a large-enough fraction of total page height.
 */
test.describe('Trust Strip section regression', () => {
  test('stat tiles stay aligned with their siblings', async ({ page }) => {
    if (test.info().project.name.endsWith('-dark')) {
      await page.emulateMedia({ colorScheme: 'dark' });
    }

    await page.goto('/');
    await waitForStable(page);

    const trustStrip = page.locator('#trust-strip');
    await expect(trustStrip).toBeVisible();
    // Confirm all three tiles this section protects are present before
    // trusting the screenshot below to catch a regression among them.
    await expect(page.getByTestId('stat-homes')).toBeVisible();
    await expect(page.getByTestId('stat-families')).toBeVisible();
    await expect(page.getByTestId('stat-days')).toBeVisible();

    await expect(trustStrip).toHaveScreenshot({
      // Far tighter than the full-page homepage screenshot's 1%: this
      // section-scoped capture is small enough that the same tolerance would
      // let a several-pixel misalignment slip through again. Tight enough to
      // fail on a reintroduced stray margin/alignment regression, loose
      // enough to absorb sub-pixel anti-aliasing drift between runs.
      maxDiffPixelRatio: 0.002,
      animations: 'disabled',
    });
  });
});

// ---------------------------------------------------------------------------
// Feature and stat grid regressions
// ---------------------------------------------------------------------------

/**
 * Same failure mode as the Trust Strip check above (task #152): the
 * full-page homepage screenshot's 1% `maxDiffPixelRatio` is measured against
 * the ENTIRE page, so a small alignment regression inside one card/stat grid
 * — e.g. a stray margin utility class knocking one card out of line with its
 * siblings — can be too small a fraction of a tall page to cross that
 * threshold on chromium/tablet-chrome, even though it is plainly visible in
 * the grid itself. The "Why Choose Nova Havens", "Amenities", and "Where We
 * Operate" stat-card grids share the exact card-grid structure that let that
 * class of bug ship undetected in the Trust Strip, so each gets the same
 * section-scoped, tightly-toleranced screenshot independent of the full-page
 * homepage screenshot — failing at every viewport, not just the ones where
 * the regression happens to be a large-enough fraction of total page height.
 *
 * Each grid is captured on its own (not the whole enclosing <section>) so
 * unrelated content sharing that section — the state-coverage map and Google
 * rating badge above the "Where We Operate" stat row, in particular — can't
 * dilute the tolerance or introduce unrelated diff noise.
 */
test.describe('Feature and stat grid regressions', () => {
  test('"Why Choose Nova Havens" cards stay aligned with their siblings', async ({ page }) => {
    if (test.info().project.name.endsWith('-dark')) {
      await page.emulateMedia({ colorScheme: 'dark' });
    }

    await page.goto('/');
    await waitForStable(page);

    const whyGrid = page.getByTestId('grid-why');
    await expect(whyGrid).toBeVisible();
    // Confirm all four cards this section protects are present before
    // trusting the screenshot below to catch a regression among them.
    await expect(page.getByTestId('card-why-1')).toBeVisible();
    await expect(page.getByTestId('card-why-2')).toBeVisible();
    await expect(page.getByTestId('card-why-3')).toBeVisible();
    await expect(page.getByTestId('card-why-4')).toBeVisible();

    await expect(whyGrid).toHaveScreenshot({
      // Far tighter than the full-page homepage screenshot's 1% — see the
      // Trust Strip check above for why that matters.
      maxDiffPixelRatio: 0.002,
      animations: 'disabled',
    });
  });

  test('"Amenities" cards stay aligned with their siblings', async ({ page }) => {
    if (test.info().project.name.endsWith('-dark')) {
      await page.emulateMedia({ colorScheme: 'dark' });
    }

    await page.goto('/');
    await waitForStable(page);

    const amenitiesGrid = page.getByTestId('grid-experience');
    await expect(amenitiesGrid).toBeVisible();
    // Confirm all six cards this section protects are present before
    // trusting the screenshot below to catch a regression among them.
    await expect(page.getByTestId('card-exp-1')).toBeVisible();
    await expect(page.getByTestId('card-exp-2')).toBeVisible();
    await expect(page.getByTestId('card-exp-3')).toBeVisible();
    await expect(page.getByTestId('card-exp-4')).toBeVisible();
    await expect(page.getByTestId('card-exp-5')).toBeVisible();
    await expect(page.getByTestId('card-exp-6')).toBeVisible();

    await expect(amenitiesGrid).toHaveScreenshot({
      maxDiffPixelRatio: 0.002,
      animations: 'disabled',
    });
  });

  test('"Where We Operate" stat cards stay aligned with their siblings', async ({ page }) => {
    if (test.info().project.name.endsWith('-dark')) {
      await page.emulateMedia({ colorScheme: 'dark' });
    }

    await page.goto('/');
    await waitForStable(page);

    const statsGrid = page.getByTestId('grid-stats');
    await expect(statsGrid).toBeVisible();
    // Confirm all three stat cards this section protects are present before
    // trusting the screenshot below to catch a regression among them.
    await expect(page.getByTestId('stat-card-properties')).toBeVisible();
    await expect(page.getByTestId('stat-card-states')).toBeVisible();
    await expect(page.getByTestId('stat-card-speed')).toBeVisible();

    await expect(statsGrid).toHaveScreenshot({
      maxDiffPixelRatio: 0.002,
      animations: 'disabled',
    });
  });
});

// ---------------------------------------------------------------------------
// Mobile layout regression checks
// ---------------------------------------------------------------------------

test.describe('Mobile layout regressions', () => {
  test('a blog article stays usable at 375px', async ({ page }) => {
    test.skip(
      !test.info().project.name.startsWith('mobile-chrome'),
      'This regression check belongs to the mobile-chrome projects',
    );

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/blog/details-that-speed-up-housing-placement');
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
      `The blog article is wider than the 375px viewport: ${dimensions.pageWidth}px`,
    ).toBeLessThanOrEqual(dimensions.viewportWidth);

    await expect(page.getByTestId('btn-mobile-menu')).toBeVisible();
    await expect(page.getByTestId('heading-post-title')).toBeVisible();
    await expect(page.getByTestId('article-body')).toBeVisible();
  });

  for (const post of BLOG_POSTS.filter((post) => post.cta !== 'none')) {
    test(`the closing ${post.cta} CTA is usable on "${post.slug}" at 375px`, async ({ page }) => {
      test.skip(
        !test.info().project.name.startsWith('mobile-chrome'),
        'This regression check belongs to the mobile-chrome projects',
      );

      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(`/blog/${post.slug}`);
      await waitForStable(page);

      const ctaCard = page.getByTestId('card-post-cta');
      const ctaButton = ctaCard.getByTestId(
        post.cta === 'property' ? 'btn-submit-property-cta' : 'btn-submit-housing-cta',
      );

      await expect(ctaCard).toBeVisible();
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toHaveAttribute(
        'href',
        post.cta === 'property' ? INTAKE_FORMS.property : INTAKE_FORMS.housing,
      );
    });
  }

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

  test('mobile navigation reaches About and targets both intake forms', async ({ page }) => {
    test.skip(
      !test.info().project.name.startsWith('mobile-chrome'),
      'This regression check belongs to the mobile-chrome projects',
    );

    await page.setViewportSize({ width: 375, height: 812 });
    const errors = attachRuntimeCollectors(page);
    await page.goto('/');
    await waitForStable(page);

    const menuButton = page.getByTestId('btn-mobile-menu');
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    await expect(page.getByTestId('link-mobile-home')).toBeVisible();
    await expect(page.getByTestId('link-mobile-blog')).toBeVisible();
    await expect(page.getByTestId('link-mobile-team')).toBeVisible();
    await expect(page.getByTestId('link-mobile-about')).toBeVisible();
    await expect(page.getByTestId('link-mobile-contact')).toBeVisible();
    const submitPropertyButton = page.getByTestId('btn-mobile-submit-property');
    await expect(submitPropertyButton).toBeVisible();
    await expect(submitPropertyButton).toHaveAttribute('href', INTAKE_FORMS.property);
    await expect(submitPropertyButton).toHaveAttribute('target', '_blank');

    const requestHousingButton = page.getByTestId('btn-mobile-request-housing');
    await expect(requestHousingButton).toBeVisible();
    await expect(requestHousingButton).toHaveAttribute('href', INTAKE_FORMS.housing);
    await expect(requestHousingButton).toHaveAttribute('target', '_blank');

    await page.getByTestId('link-mobile-about').click();
    await expect(page).toHaveURL(/\/about-us$/);
    await expect(page.getByTestId('heading-about-title')).toBeVisible();
    await expect(page.getByTestId('link-mobile-about')).toBeHidden();

    expect(errors.pageErrors, `Uncaught errors:\n${errors.pageErrors.join('\n')}`).toHaveLength(0);
    expect(errors.consoleErrors, `Console errors:\n${errors.consoleErrors.join('\n')}`).toHaveLength(0);
    expect(
      errors.httpFailures,
      `HTTP failures:\n${errors.httpFailures.map((failure) => `${failure.status} ${failure.url}`).join('\n')}`,
    ).toHaveLength(0);
    expect(
      errors.requestFailures,
      `Request failures:\n${errors.requestFailures.map((failure) => `${failure.errorText} — ${failure.url}`).join('\n')}`,
    ).toHaveLength(0);
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
// Reduced-motion carousel behavior
// ---------------------------------------------------------------------------

test.describe('Reduced-motion carousel behavior', () => {
  test('keeps direct navigation instant and disables autoplay progress', async ({ page }) => {
    test.skip(
      test.info().project.name !== 'chromium',
      'Behavioral preference check — one viewport is enough; other projects cover layout.',
    );

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const carousel = page.getByTestId('carousel-showcase');
    await expect(carousel).toHaveAttribute('data-reduced-motion', 'true');
    await expect(carousel.getByRole('heading', { name: 'Living Spaces' })).toBeVisible();
    await expect(page.getByTestId('carousel-progress-1')).toHaveCSS('width', '0px');

    await carousel.getByTestId('btn-carousel-slide-2').click();

    await expect(carousel).toHaveAttribute('data-transitioning', 'false');
    await expect(carousel.getByRole('heading', { name: 'Walk in showers' })).toBeVisible();
    await expect(carousel.getByRole('heading', { name: 'Walk in showers' })).toHaveCSS(
      'transition-duration',
      '0s',
    );
    await expect(page.getByTestId('carousel-progress-2')).toHaveCSS('width', '0px');

    await page.waitForTimeout(6_250);

    await expect(
      carousel.getByRole('heading', { name: 'Walk in showers' }),
      'Reduced-motion visitors should not be moved to another slide by autoplay',
    ).toBeVisible();
    await expect(page.getByTestId('carousel-progress-2')).toHaveCSS('width', '0px');
  });

  test('pauses and cleanly resumes autoplay when the motion preference changes mid-visit', async ({ page }) => {
    test.skip(
      test.info().project.name !== 'chromium',
      'Behavioral preference check — one viewport is enough; other projects cover layout.',
    );

    await page.goto('/');

    const carousel = page.getByTestId('carousel-showcase');
    await expect(carousel).toHaveAttribute('data-reduced-motion', 'false');
    await expect(carousel.getByRole('heading', { name: 'Living Spaces' })).toBeVisible();

    // Let autoplay run for a moment so there is real progress to freeze.
    await page.waitForTimeout(1_500);
    const progressWhileRunning = await page
      .getByTestId('carousel-progress-1')
      .evaluate((el) => (el as HTMLElement).style.width);
    expect(
      parseFloat(progressWhileRunning),
      'Autoplay should already be advancing progress before the preference change',
    ).toBeGreaterThan(0);

    // The OS-level preference changes while the page stays open.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(carousel).toHaveAttribute('data-reduced-motion', 'true');

    const progressAtSwitch = await page
      .getByTestId('carousel-progress-1')
      .evaluate((el) => (el as HTMLElement).style.width);

    // Wait well past a full slide duration -- autoplay must stay stopped and
    // progress must stay frozen, not merely slow down.
    await page.waitForTimeout(6_800);
    await expect(
      carousel.getByRole('heading', { name: 'Living Spaces' }),
      'Autoplay must not advance once reduced motion is detected mid-visit',
    ).toBeVisible();
    const progressAfterWait = await page
      .getByTestId('carousel-progress-1')
      .evaluate((el) => (el as HTMLElement).style.width);
    expect(
      progressAfterWait,
      'Progress must stay frozen while reduced motion is active, not merely slow down',
    ).toBe(progressAtSwitch);

    // The preference clears while the page is still open.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(carousel).toHaveAttribute('data-reduced-motion', 'false');

    // One slide duration later, autoplay should have advanced exactly once --
    // resuming, not staying stuck.
    await page.waitForTimeout(6_800);
    await expect(
      carousel.getByRole('heading', { name: 'Walk in showers' }),
      'Autoplay should resume automatically once normal motion returns',
    ).toBeVisible();

    // A second slide duration should advance exactly one more slide. If the
    // resume left a duplicate timer running, this would instead have already
    // skipped past "Full Kitchens" to a later slide.
    await page.waitForTimeout(6_800);
    await expect(
      carousel.getByRole('heading', { name: 'Full Kitchens' }),
      'Only one autoplay timer should drive advances after resuming -- no skipped slides',
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Compact-navigation breakpoint regressions
// ---------------------------------------------------------------------------

test.describe('Compact-navigation breakpoint regressions', () => {
  test('every route fits while compact navigation is active at 1023px', async ({ page }) => {
    test.skip(
      !test.info().project.name.startsWith('compact-nav-chrome'),
      'This regression check belongs to the compact-navigation projects',
    );

    if (test.info().project.name.endsWith('-dark')) {
      await page.emulateMedia({ colorScheme: 'dark' });
    }

    for (const path of ALL_ROUTES) {
      await page.goto(path);
      await waitForStable(page);
      await expectPageToFitViewport(page, path);
    }

    // 1023px is still below Tailwind's lg breakpoint, so this project protects
    // the actual compact menu rather than only a similarly sized desktop page.
    await page.goto('/');
    await expect(page.getByTestId('btn-mobile-menu')).toBeVisible();
    await expect(page.getByTestId('link-nav-home')).toBeHidden();
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
