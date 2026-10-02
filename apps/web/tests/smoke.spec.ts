import { expect, test, type Page } from '@playwright/test';

const ROUTES: { path: string; heading: RegExp; title: RegExp }[] = [
  { path: '/', heading: /A safe place to land/, title: /Nova Havens \| Nationwide Furnished Housing Coordination/ },
  { path: '/blog', heading: /Insights & Resources/, title: /Blog & Resources \| Nova Havens/ },
  { path: '/blog/details-that-speed-up-housing-placement', heading: /Seven Details/, title: /Seven Details/ },
  { path: '/meet-the-team', heading: /Meet the Nova Havens Team/, title: /Meet the Team \| Nova Havens/ },
  { path: '/about-us', heading: /A better place to land/, title: /About Us \| Nova Havens/ },
  { path: '/contact', heading: /Request Emergency Housing/, title: /Contact Us \| Nova Havens/ },
  { path: '/privacy-policy', heading: /Privacy Policy/, title: /Privacy Policy \| Nova Havens/ },
  { path: '/terms-of-service', heading: /Terms of Service/, title: /Terms of Service \| Nova Havens/ },
  { path: '/llms-txt', heading: /llms\.txt/, title: /llms\.txt/ },
];

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}

test.describe('Page smoke tests', () => {
  for (const route of ROUTES) {
    test(`${route.path} renders with metadata and no console errors`, async ({ page }) => {
      const errors = collectErrors(page);
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(route.heading);
      await expect(page).toHaveTitle(route.title);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        new RegExp(`^https://novahavens\\.com${route.path === '/' ? '/?' : route.path}$`),
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
      await page.waitForLoadState('networkidle');
      // Hydration warnings would surface here as console errors.
      expect(errors.filter((e) => !e.includes('third-party'))).toHaveLength(0);
    });
  }

  test('home page emits a single structured-data graph with the business entity', async ({ page }) => {
    await page.goto('/');
    const scripts = page.locator('script[type="application/ld+json"]');
    await expect(scripts).toHaveCount(1);
    const json = JSON.parse((await scripts.first().textContent()) ?? '{}') as { '@graph'?: { '@type': string }[] };
    const types = (json['@graph'] ?? []).map((n) => n['@type']);
    expect(types).toEqual(expect.arrayContaining(['WebSite', 'LocalBusiness', 'HowTo', 'FAQPage']));
  });

  test('unknown routes return a branded 404', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/couldn.t find that page/);
  });

  test('machine-readable files are served', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain('Sitemap: https://novahavens.com/sitemap.xml');

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBeTruthy();
    const xml = await sitemap.text();
    expect(xml).toContain('<loc>https://novahavens.com/</loc>');
    expect(xml).toContain('<loc>https://novahavens.com/blog/hotel-or-furnished-home-what-to-expect</loc>');

    const llms = await request.get('/llms.txt');
    expect(llms.ok()).toBeTruthy();
    expect(llms.headers()['content-type']).toContain('text/plain');
    expect(await llms.text()).toContain('# Nova Havens');

    const og = await request.get('/blog/details-that-speed-up-housing-placement/opengraph-image');
    expect(og.ok()).toBeTruthy();
    expect(og.headers()['content-type']).toContain('image/png');
  });

  test('FAQ items expand and the mobile menu opens', async ({ page, isMobile }) => {
    await page.goto('/');
    const firstFaq = page.getByTestId('faq-item-1');
    await firstFaq.locator('summary').click();
    await expect(firstFaq).toHaveAttribute('open', '');

    if (isMobile) {
      await page.getByTestId('btn-mobile-menu').click();
      await expect(page.getByTestId('link-mobile-contact')).toBeVisible();
    }
  });

  test('team profile dialog opens and closes', async ({ page }) => {
    await page.goto('/meet-the-team');
    await page.getByTestId('card-team-fazal-abed').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});
