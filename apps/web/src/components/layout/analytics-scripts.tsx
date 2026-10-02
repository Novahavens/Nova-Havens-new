import Script from 'next/script';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

/**
 * Third-party analytics, all optional and loaded after hydration so they
 * never compete with page content. Configure via environment variables —
 * see .env.example.
 */
export function AnalyticsScripts() {
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ?? 'https://cloud.umami.is/script.js';
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const onVercel = Boolean(process.env.VERCEL);

  return (
    <>
      {umamiId ? <Script src={umamiSrc} data-website-id={umamiId} strategy="afterInteractive" /> : null}
      {gaId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}
      {onVercel ? (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      ) : null}
    </>
  );
}
