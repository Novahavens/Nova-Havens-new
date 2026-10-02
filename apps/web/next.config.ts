import type { NextConfig } from 'next';

/**
 * Nova Havens — Next.js configuration.
 *
 * Every public route is statically rendered at build time (SSG). There is no
 * per-request server work on the marketing site, so the whole thing can sit
 * behind a CDN. Data that changes (property counts, team roster) is synced
 * into `data/` by scheduled scripts and the site is rebuilt — see
 * docs/DEPLOYMENT.md.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  // `standalone` produces a self-contained server for Docker / Replit; Vercel
  // ignores it and uses its own output. Opt in with NEXT_OUTPUT=standalone.
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  reactStrictMode: true,
  // React Compiler auto-memoises components so client islands re-render less.
  reactCompiler: true,
  typedRoutes: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Team photos synced into public/team are local; allow a remote CDN too
    // (e.g. Vercel Blob / Supabase Storage) when TEAM_PHOTO_HOST is set.
    remotePatterns: process.env.TEAM_PHOTO_HOST ? [{ protocol: 'https', hostname: process.env.TEAM_PHOTO_HOST }] : [],
  },
  async headers() {
    // Next.js already serves /_next/static with immutable caching.
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    return [
      // Legacy Vite build served `/index.html`; keep any old deep links alive.
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/blog/index.html', destination: '/blog', permanent: true },
      { source: '/:path*/index.html', destination: '/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
