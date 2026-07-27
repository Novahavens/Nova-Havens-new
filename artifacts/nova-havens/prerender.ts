/**
 * prerender.ts — post-build static HTML generator
 *
 * Generates one index.html per public route under dist/public/, with per-route
 * <title>, <meta description>, robots, og:*, and twitter:* tags baked into the
 * HTML bytes. This means social preview bots and AI crawlers that don't execute
 * JavaScript receive the correct metadata without any JS execution.
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

  return html
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
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`,
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`,
    );
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
