/**
 * useRouteMeta — applies per-route SEO metadata on client-side navigation.
 *
 * Reads the current wouter location and applies title, description, canonical,
 * and OG/Twitter tags from src/lib/routeMeta.ts — the same single source of
 * truth used by the dev-time Vite plugin and the build-time prerender step.
 * Pages must NOT set document.title or meta tags themselves.
 */

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { resolveRouteMeta } from './routeMeta.ts';

function setMeta(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute('content', content);
}

export function useRouteMeta() {
  const [location] = useLocation();

  useEffect(() => {
    const meta = resolveRouteMeta(location || '/');

    const ogImage = meta.ogImage ?? 'https://novahavens.com/og-image.png';

    document.title = meta.title;
    setMeta('meta[name="description"]', meta.description);
    setMeta('meta[property="og:title"]', meta.title);
    setMeta('meta[property="og:description"]', meta.description);
    setMeta('meta[property="og:type"]', meta.ogType);
    setMeta('meta[property="og:url"]', meta.canonicalUrl);
    setMeta('meta[property="og:image"]', ogImage);
    setMeta('meta[name="twitter:title"]', meta.title);
    setMeta('meta[name="twitter:description"]', meta.description);
    setMeta('meta[name="twitter:image"]', ogImage);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', meta.canonicalUrl);
  }, [location]);
}
