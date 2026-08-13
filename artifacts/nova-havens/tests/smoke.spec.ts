/**
 * Visual smoke tests for Nova Havens.
 *
 * Each test navigates to a route, waits for the page to settle, and compares a
 * full-page screenshot against a saved baseline.  On first run (or after
 * `pnpm test:smoke:update`) Playwright writes the baseline; subsequent runs
 * report any visual drift.
 *
 * Routes covered: /, /about-us, /blog, /blog/:slug, /meet-the-team,
 *   /contact, /privacy-policy, /terms-of-service
 */

import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
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
 * Navigate to `path`, wait for stability, then assert the full-page screenshot
 * matches the stored baseline (created automatically on first run).
 *
 * <img> elements are masked (replaced with a solid box) so that external or
 * lazily-decoded image bytes don't cause spurious diffs.  Layout, typography,
 * colours, and spacing are still fully compared.
 */
async function smokeTest(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await waitForStable(page);

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
