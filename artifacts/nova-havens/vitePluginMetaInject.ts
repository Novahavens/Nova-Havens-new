/**
 * vitePluginMetaInject.ts
 *
 * Vite plugin that injects per-route <title>, <meta description>, and Open
 * Graph / Twitter tags into the HTML shell *before* JavaScript executes.
 *
 * Runs inside Vite's transformIndexHtml hook (dev: per request, build: once per
 * entry). Combined with the post-build prerender.ts step, every public route has
 * correct metadata in both dev previews and the static production build.
 *
 * Route metadata is imported from src/lib/routeMeta.ts — the single source of
 * truth shared with prerender.ts. No metadata is duplicated in this file.
 */

import type { Plugin, IndexHtmlTransformContext } from 'vite';
import { resolveRouteMeta } from './src/lib/routeMeta.ts';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function metaInjectPlugin(): Plugin {
  return {
    name: 'nova-havens-meta-inject',

    transformIndexHtml: {
      order: 'pre',
      handler(html: string, ctx: IndexHtmlTransformContext): string {
        const originalUrl: string = ctx.originalUrl ?? '/';

        let pathname = '/';
        try {
          pathname = new URL(originalUrl, 'http://localhost').pathname;
        } catch {
          pathname = originalUrl.split('?')[0].split('#')[0] || '/';
        }

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
      },
    },
  };
}
