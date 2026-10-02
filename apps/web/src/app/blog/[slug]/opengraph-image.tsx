import { ImageResponse } from 'next/og';

import { BRAND } from '@/config/site';
import { getAllPostSlugs, getPostBySlug } from '@/content/source';

/**
 * Generated 1200×630 social card for each post (replaces the old sharp
 * script). Served at /blog/<slug>/opengraph-image and referenced from the
 * page's og:image and BlogPosting schema.
 */
export const alt = 'Nova Havens article';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  return (await getAllPostSlugs()).map((slug) => ({ slug }));
}

/**
 * Google Fonts serves TTF (which next/og can embed) only to legacy user
 * agents; modern UAs get woff2. Try a few, fall back to the default font.
 */
const LEGACY_USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
  'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:30.0) Gecko/20100101 Firefox/30.0',
];

async function loadFont(): Promise<ArrayBuffer | null> {
  for (const userAgent of LEGACY_USER_AGENTS) {
    try {
      const css = await fetch('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800', {
        headers: { 'User-Agent': userAgent },
      }).then((r) => r.text());
      const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
      if (url) return await fetch(url).then((r) => r.arrayBuffer());
    } catch {
      // try the next user agent
    }
  }
  return null;
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const font = await loadFont();
  const title = post?.title ?? 'Nova Havens';
  const category = post?.category ?? 'Insurance Housing Insights';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: `linear-gradient(135deg, #12151C 0%, ${BRAND.backgroundHex} 55%, #0B0E14 100%)`,
        color: BRAND.foregroundHex,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 8, background: BRAND.primaryHex }} />
      <div
        style={{
          position: 'absolute',
          right: -120,
          top: 80,
          width: 520,
          height: 520,
          borderRadius: 9999,
          background: `radial-gradient(circle, ${BRAND.primaryHex}26 0%, transparent 70%)`,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 8, color: BRAND.primaryHex }}>NOVA HAVENS</div>
        <div style={{ display: 'flex' }}>
          <div
            style={{
              fontSize: 21,
              fontWeight: 600,
              color: BRAND.primaryHex,
              border: `1px solid ${BRAND.primaryHex}80`,
              background: BRAND.cardHex,
              borderRadius: 22,
              padding: '10px 24px',
            }}
          >
            {category}
          </div>
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.15, maxWidth: 980, display: 'flex' }}>{title}</div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '2px solid #222732',
          paddingTop: 28,
          fontSize: 24,
        }}
      >
        <div style={{ color: BRAND.mutedHex }}>novahavens.com</div>
        <div style={{ color: BRAND.primaryHex, fontWeight: 600 }}>Insurance Housing Insights</div>
      </div>
    </div>,
    {
      ...size,
      fonts: font ? [{ name: 'Plus Jakarta Sans', data: font, style: 'normal', weight: 800 }] : undefined,
    },
  );
}
