/**
 * analytics.ts — provider-agnostic custom event tracking.
 *
 * Events are forwarded to whichever trackers are present on the page:
 *   - Umami (loaded by <AnalyticsScripts/> when NEXT_PUBLIC_UMAMI_WEBSITE_ID is set)
 *   - Vercel Web Analytics (loaded automatically on Vercel)
 *   - Google Analytics 4 (loaded when NEXT_PUBLIC_GA_MEASUREMENT_ID is set)
 *
 * Event taxonomy (keep names stable — dashboards depend on them):
 *   intake_form_click   { form: 'housing' | 'property', location }
 *   contact_link_click  { method: 'phone' | 'email', location }
 *   social_link_click   { platform }
 *   ask_ai_click        { assistant, location }
 *   faq_expanded        { question, location }
 *   blog_filter_selected{ filter }
 *   team_member_viewed  { member }
 *
 * `location` follows `{page}_{section}` snake_case, e.g. home_hero, navbar_desktop.
 */

export type AnalyticsData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track(name: string, data?: AnalyticsData): void };
    va?: (event: 'event', args: { name: string; data?: AnalyticsData }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/** Safe anywhere: a no-op on the server or before trackers load, and never throws. */
export function trackEvent(name: string, data?: AnalyticsData): void {
  if (typeof window === 'undefined') return;
  try {
    window.umami?.track(name, data);
    window.va?.('event', { name, data });
    window.gtag?.('event', name, data);
  } catch {
    // Analytics must never break the site.
  }
}
