/**
 * prerender.ts — post-build static HTML generator
 *
 * Generates one index.html per public route under dist/public/, with per-route
 * <title>, <meta description>, robots, og:*, twitter:*, canonical URL, and
 * structured data (JSON-LD) baked into the HTML bytes. Additionally, static
 * body HTML (H1, key content, article bodies) is injected into <div id="root">
 * so AI crawlers (GPTBot, ClaudeBot, PerplexityBot) and social bots that do
 * not execute JavaScript receive both correct metadata AND readable page content.
 * React replaces the injected content on client-side mount (no hydration
 * mismatch — this is a plain SPA, not SSR).
 *
 * Usage (run after `vite build`):
 *   node --experimental-strip-types prerender.ts
 *
 * Node.js 22.6+ / 24 is required for --experimental-strip-types.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ALL_ROUTES, resolveRouteMeta } from './src/lib/routeMeta.ts';

const DEFAULT_OG_IMAGE = 'https://novahavens.com/og-image.png';
import { getRouteBodyHtml } from './src/lib/routeContent.ts';
import { StaleBuildOutputError, assertBuildFresh } from './scripts/lib/buildFreshness.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Test-only override: lets tests point this script at a disposable dist/public
// fixture (e.g. to prove the freshness guard below fires) without touching
// real build output. Unset in normal operation (`pnpm run build`, or running
// this script directly) — see tests/prerenderFreshnessGuard.test.ts.
const distDir = process.env.PRERENDER_TEST_DIST_DIR
  ? resolve(process.env.PRERENDER_TEST_DIST_DIR)
  : join(__dirname, 'dist', 'public');
const templatePath = join(distDir, 'index.html');

// ── Freshness guard ────────────────────────────────────────────────────────
// prerender.ts only rewrites HTML shells with the current route metadata; it
// never touches the JS/CSS bundle. If dist/public was built before the latest
// source change, re-running this script would relabel a stale bundle with
// today's metadata and titles, making it look freshly published when the code
// it ships is not. Refuse instead of writing anything.

if (!existsSync(templatePath)) {
  console.error(
    'prerender: dist/public/index.html not found — run `pnpm run build` first (this script runs after `vite build`).',
  );
  process.exit(1);
}

try {
  assertBuildFresh({
    sourceRoot: __dirname,
    distDir,
    label: 'Prerender',
    consequence: 'so the HTML it writes would relabel a stale bundle as current.',
  });
} catch (error) {
  if (error instanceof StaleBuildOutputError) {
    console.error(error.message);
    process.exit(2);
  }
  throw error;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function injectMeta(html: string, pathname: string): string {
  const meta = resolveRouteMeta(pathname);

  let result = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escapeAttr(meta.description)}" />`,
    )
    .replace(
      /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/,
      `<meta name="robots" content="noindex, nofollow" />`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${escapeAttr(meta.title)}" />`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${escapeAttr(meta.description)}" />`,
    )
    .replace(
      /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:type" content="${escapeAttr(meta.ogType)}" />`,
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${escapeAttr(meta.canonicalUrl)}" />`,
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`,
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`,
    )
    .replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:image" content="${escapeAttr(meta.ogImage ?? DEFAULT_OG_IMAGE)}" />`,
    )
    .replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:image" content="${escapeAttr(meta.ogImage ?? DEFAULT_OG_IMAGE)}" />`,
    )
    // Update canonical link
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${escapeAttr(meta.canonicalUrl)}" />`,
    );

  // Remove any JSON-LD block that vitePluginMetaInject baked into the build
  // template (it runs at build time with originalUrl='/' and injects the home
  // schema into the SPA shell). prerender.ts owns the per-route block, so we
  // strip the template copy first, then inject the correct one.
  result = result.replace(
    /<script type="application\/ld\+json" id="jsonld-route">[\s\S]*?<\/script>\n?/,
    '',
  );

  // Inject per-route JSON-LD (BlogPosting etc.) before </head>
  if (meta.jsonLd) {
    const scriptTag = `<script type="application/ld+json" id="jsonld-route">\n${JSON.stringify(meta.jsonLd, null, 2)}\n</script>`;
    result = result.replace('</head>', `${scriptTag}\n</head>`);
  }

  // Inject static body content into <div id="root"> so AI crawlers and social
  // bots that don't execute JavaScript can read the page content.
  // React replaces this content when it mounts (no hydration mismatch — this
  // is a plain SPA, not SSR, so React does a full client-side render).
  const bodyHtml = getRouteBodyHtml(pathname);
  if (bodyHtml) {
    result = result.replace(
      /<div id="root"><\/div>/,
      `<div id="root">${bodyHtml}</div>`,
    );
  }

  return result;
}

function routeToFilePath(route: string): string {
  if (route === '/') return join(distDir, 'index.html');
  // /blog → dist/public/blog/index.html
  // /blog/slug → dist/public/blog/slug/index.html
  const segments = route.replace(/^\//, '').split('/');
  return join(distDir, ...segments, 'index.html');
}

// ── Main ───────────────────────────────────────────────────────────────────

const template = readFileSync(templatePath, 'utf-8').replace(
  /<div id="root">[\s\S]*?<\/div>(?=\s*<\/body>)/,
  '<div id="root"></div>',
);

let written = 0;
for (const route of ALL_ROUTES) {
  const html = injectMeta(template, route);
  const filePath = routeToFilePath(route);
  const dir = dirname(filePath);

  mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, html, 'utf-8');
  written++;
  console.log(`  prerender: ${route.padEnd(60)} → ${filePath.replace(__dirname + '/', '')}`);
}

console.log(`\nPrerender complete: ${written} routes written to dist/public/`);
