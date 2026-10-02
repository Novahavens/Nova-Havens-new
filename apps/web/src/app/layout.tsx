import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';

import { AnalyticsScripts } from '@/components/layout/analytics-scripts';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { BRAND, COMPANY, SITE_URL } from '@/config/site';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';

import '@/styles/globals.css';

/** Self-hosted by next/font: no external request, no layout shift. */
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${COMPANY.name} | ${COMPANY.tagline}`,
    template: `%s | ${COMPANY.name}`,
  },
  description: COMPANY.description,
  applicationName: COMPANY.name,
  keywords: [
    'temporary furnished housing',
    'insurance housing coordinator',
    'ALE housing',
    'displaced family housing',
    'nationwide housing coordination for insurance claims',
  ],
  openGraph: {
    type: 'website',
    siteName: COMPANY.name,
    locale: 'en_US',
    url: `${SITE_URL}/`,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: COMPANY.name }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: BRAND.backgroundHex,
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Nova Havens is a dark-first brand: the `dark` class selects the
    // source-faithful palette in src/styles/tokens.css.
    <html lang="en" className={`dark ${plusJakarta.variable}`} suppressHydrationWarning>
      <body className="min-h-[100dvh] flex flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <AnalyticsScripts />
      </body>
    </html>
  );
}
