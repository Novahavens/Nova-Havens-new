import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Phone } from 'lucide-react';

import { TrackedAnchor } from '@/components/shared/tracked-link';
import { CONTACT } from '@/config/site';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-[70dvh] w-full flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-lg bg-card rounded-lg border border-white/10 p-8 md:p-12 text-center">
        <p className="text-xs font-bold tracking-widest uppercase text-primary mb-4">404</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">We couldn&apos;t find that page</h1>
        <p className="text-muted-foreground mb-8">
          The link may be out of date. If you need housing tonight, call us — someone answers 24/7.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:brightness-105 transition-all"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Back to home
          </Link>
          <TrackedAnchor
            href={CONTACT.phone.href}
            event="contact_link_click"
            data={{ method: 'phone', location: 'not_found' }}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-primary text-primary font-bold text-sm hover:bg-primary/10 transition-all"
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            Call {CONTACT.phone.display}
          </TrackedAnchor>
        </div>
      </div>
    </div>
  );
}
