'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';

import { trackEvent, type AnalyticsData } from '@/lib/analytics';

type TrackedProps = {
  /** Analytics event name, e.g. "intake_form_click". */
  event: string;
  data?: AnalyticsData;
};

/**
 * An anchor that fires an analytics event on click. Used for external links
 * (Jotform intake forms, tel:, mailto:, social profiles). Tiny client island —
 * the surrounding sections stay Server Components.
 */
export function TrackedAnchor({ event, data, onClick, ...props }: TrackedProps & ComponentProps<'a'>) {
  return (
    <a
      {...props}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        trackEvent(event, data);
        onClick?.(e);
      }}
    />
  );
}

/** Same as TrackedAnchor but for internal routes (client-side navigation). */
export function TrackedLink({ event, data, onClick, ...props }: TrackedProps & ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        trackEvent(event, data);
        onClick?.(e);
      }}
    />
  );
}
