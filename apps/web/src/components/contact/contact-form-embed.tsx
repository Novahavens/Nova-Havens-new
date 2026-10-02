'use client';

import { useEffect, useState } from 'react';

import { TrackedAnchor } from '@/components/shared/tracked-link';
import { CONTACT, INTAKE_FORMS } from '@/config/site';

const EMBED_LOAD_TIMEOUT_MS = 15_000;

type EmbedStatus = 'loading' | 'loaded' | 'error';

/**
 * The hosted Jotform contact form, embedded with a placeholder while loading
 * and an email fallback if it never finishes. A cross-origin iframe has no
 * reliable onError short of a hard network failure, so a timeout catches the rest.
 */
export function ContactFormEmbed() {
  const [status, setStatus] = useState<EmbedStatus>('loading');

  useEffect(() => {
    if (status !== 'loading') return;
    const timer = window.setTimeout(
      () => setStatus((current) => (current === 'loading' ? 'error' : current)),
      EMBED_LOAD_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [status]);

  if (status === 'error') {
    return (
      <div
        className="bg-background border border-white/10 rounded-lg min-h-[var(--min-h-contact-embed)] flex flex-col items-center justify-center gap-3 text-center p-8"
        data-testid="message-embed-error"
      >
        <p className="text-muted-foreground">The contact form couldn&apos;t load.</p>
        <TrackedAnchor
          href={`mailto:${CONTACT.fallbackEmail}`}
          event="contact_link_click"
          data={{ method: 'email', location: 'contact_embed_fallback' }}
          className="text-primary font-semibold hover:brightness-110 transition-colors"
          data-testid="link-embed-fallback-email"
        >
          Email {CONTACT.fallbackEmail}
        </TrackedAnchor>
      </div>
    );
  }

  return (
    <div className="relative min-h-[var(--min-h-contact-embed)]">
      {status === 'loading' ? (
        <div
          className="absolute inset-0 bg-card border border-white/10 rounded-lg animate-pulse"
          aria-hidden="true"
          data-testid="placeholder-contact-embed"
        />
      ) : null}
      <iframe
        src={INTAKE_FORMS.contact}
        title="Contact Nova Havens"
        loading="lazy"
        className={`relative w-full min-h-[var(--min-h-contact-embed)] rounded-lg border-0 transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        data-testid="iframe-contact-form"
      />
    </div>
  );
}
