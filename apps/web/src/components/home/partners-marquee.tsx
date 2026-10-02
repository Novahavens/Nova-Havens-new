import Image from 'next/image';

import { PARTNERS } from '@/config/site';

/** CSS-only infinite marquee of carrier logos; pauses on hover and for reduced motion. */
export function PartnersMarquee() {
  return (
    <div className="relative overflow-hidden" data-testid="marquee-partners">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 z-10 bg-gradient-to-r from-surface-1 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 z-10 bg-gradient-to-l from-surface-1 to-transparent"
        aria-hidden="true"
      />
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {PARTNERS.map((partner, idx) => (
              <a
                key={partner.name}
                href={partner.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${partner.name} website`}
                tabIndex={copy === 1 ? -1 : undefined}
                data-testid={copy === 0 ? `link-partner-${idx}` : undefined}
                className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-center gap-4 bg-card border border-white/5 rounded-sm px-8 py-6 mx-3 shrink-0">
                  {partner.logo ? (
                    <Image
                      src={partner.logo}
                      alt={copy === 0 ? `${partner.name} logo` : ''}
                      width={120}
                      height={36}
                      className={`w-auto object-contain ${partner.logoClass ?? 'h-8'}`}
                      unoptimized={partner.logo.endsWith('.svg')}
                    />
                  ) : null}
                  {partner.showName ? (
                    <span className="font-extrabold text-lg md:text-xl text-foreground tracking-tight whitespace-nowrap">
                      {partner.name}
                    </span>
                  ) : null}
                </div>
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
