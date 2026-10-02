import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/config/site';

/**
 * /robots.txt — everyone may crawl. AI crawlers are explicitly allowed so
 * Nova Havens is visible to answer engines; flip any entry to `disallow: '/'`
 * to withdraw that permission.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'anthropic-ai',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }, ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' }))],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
