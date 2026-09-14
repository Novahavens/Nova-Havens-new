type AnalyticsData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: {
      track(name: string, data?: AnalyticsData): void;
    };
  }
}

/**
 * Fire a custom analytics event through the Umami tracker Replit injects into
 * published app HTML. Safe to call anywhere — a no-op during local
 * development or before the tracker script has loaded, and never throws, so
 * analytics can't break the app.
 */
export function trackEvent(name: string, data?: AnalyticsData): void {
  if (typeof window === 'undefined') return;

  try {
    window.umami?.track(name, data);
  } catch {
    // Analytics must never break the app.
  }
}
