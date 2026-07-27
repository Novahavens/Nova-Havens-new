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

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ALL_ROUTES, resolveRouteMeta } from './src/lib/routeMeta.ts';
import { getRouteBodyHtml } from './src/lib/routeContent.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, 'dist', 'public');
const templatePath = join(distDir, 'index.html');

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
    // Update canonical link
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${escapeAttr(meta.canonicalUrl)}" />`,
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

const template = readFileSync(templatePath, 'utf-8');

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
