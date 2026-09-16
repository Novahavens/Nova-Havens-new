import React, { useEffect, useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { EXTERNAL_FORM_LINK_PROPS, INTAKE_FORMS } from '@/lib/intakeForms';
import { trackEvent } from '@/lib/analytics';

/** Nova Havens' Jotform contact form, embedded directly rather than re-implemented. */
const CONTACT_FORM_URL = 'https://form.jotform.com/262575434019055';

/** How long to wait for the embed to report success before treating it as failed. */
const EMBED_LOAD_TIMEOUT_MS = 15_000;

type EmbedStatus = 'loading' | 'loaded' | 'error';

/**
 * The embedded contact form: a placeholder while it loads (so the page never
 * jumps once it appears), the iframe itself, and an email fallback if it
 * never finishes loading — a cross-origin iframe has no reliable `onError`
 * for anything short of a hard network failure, so a load timeout catches
 * the rest.
 */
function ContactFormEmbed() {
  const [status, setStatus] = useState<EmbedStatus>('loading');

  useEffect(() => {
    if (status !== 'loading') return;

    const timer = window.setTimeout(() => {
      setStatus((current) => (current === 'loading' ? 'error' : current));
    }, EMBED_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [status]);

  if (status === 'error') {
    return (
      <div
        className="bg-background border border-white/10 rounded-lg min-h-[var(--min-h-contact-embed)] flex flex-col items-center justify-center gap-3 text-center p-8"
        data-testid="message-embed-error"
      >
        <p className="text-muted-foreground">The contact form couldn't load.</p>
        <a
          href="mailto:william@novahavens.com"
          className="text-primary font-semibold hover:brightness-110 transition-colors"
          data-testid="link-embed-fallback-email"
          onClick={() => trackEvent('contact_link_click', { method: 'email', location: 'contact_embed_fallback' })}
        >
          Email william@novahavens.com
        </a>
      </div>
    );
  }

  return (
    <div className="relative min-h-[var(--min-h-contact-embed)]">
      {status === 'loading' && (
        <div
          className="absolute inset-0 bg-card border border-white/10 rounded-lg animate-pulse"
          aria-hidden="true"
          data-testid="placeholder-contact-embed"
        />
      )}
      <iframe
        src={CONTACT_FORM_URL}
        title="Contact Nova Havens"
        className={`relative w-full min-h-[var(--min-h-contact-embed)] rounded-lg border-0 transition-opacity duration-300 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        data-testid="iframe-contact-form"
      />
    </div>
  );
}

export default function ContactPage() {
  // Title/description/OG tags are applied centrally by useRouteMeta (App.tsx).
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="bg-background pt-24 pb-16 px-4 md:px-8 border-b border-white/10">
        <div className="mx-auto max-w-site w-full">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-4">Contact Nova Havens</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6" data-testid="heading-contact-hero">
              Request Emergency Housing or Get in Touch
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed" data-testid="text-contact-subtitle">
              To request emergency furnished housing through Nova Havens, call <a href="tel:+16294010054" className="text-primary font-semibold hover:brightness-110 transition-colors" onClick={() => trackEvent('contact_link_click', { method: 'phone', location: 'contact_hero' })}>(629) 401-0054</a> or submit the form below. Nova Havens responds to urgent housing requests 24 hours a day, 7 days a week. For general inquiries, expect a response within one business day.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-8 max-w-site mx-auto w-full">
        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-card rounded-lg border border-white/10 p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-3 text-foreground">Displaced Family or Adjuster?</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              If you have an active insurance claim and need immediate furnished housing placement, Nova Havens responds 24/7. Start your request here.
            </p>
            <a href={INTAKE_FORMS.housing} {...EXTERNAL_FORM_LINK_PROPS} onClick={() => trackEvent('intake_form_click', { form: 'housing', location: 'contact_quick_action' })} className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:brightness-105 rounded-full px-8 py-3.5 w-full md:w-auto" data-testid="btn-action-request-housing">
              Request Housing Now
            </a>
          </div>
          
          <div className="bg-card rounded-lg border border-white/10 p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-3 text-foreground">Own a Furnished Property?</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Join the Nova Havens network of 60,000+ verified furnished homes and start hosting displaced families — with carrier billing handled entirely by Nova Havens.
            </p>
            <a href={INTAKE_FORMS.property} {...EXTERNAL_FORM_LINK_PROPS} onClick={() => trackEvent('intake_form_click', { form: 'property', location: 'contact_quick_action' })} className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-primary text-primary hover:brightness-105 rounded-full px-8 py-3.5 w-full md:w-auto" data-testid="btn-action-submit-property">
              Submit Your Property
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8" id="contact-form">
          
          {/* Contact Info Side */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border border-white/5 p-6 flex items-start gap-4" data-testid="card-contact-phone">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Phone — 24/7 for emergency claims</h3>
                <a
                  href="tel:6294010054"
                  className="text-lg font-bold text-foreground hover:text-primary transition-colors block"
                  onClick={() => trackEvent('contact_link_click', { method: 'phone', location: 'contact_info' })}
                >
                  (629) 401-0054
                </a>
                <h3 className="text-sm font-semibold text-muted-foreground mt-3 mb-1">After Hours Specialty Line</h3>
                <a
                  href="tel:6292062360"
                  className="text-lg font-bold text-foreground hover:text-primary transition-colors block"
                  data-testid="link-contact-after-hours-phone"
                  onClick={() => trackEvent('contact_link_click', { method: 'phone', location: 'contact_info' })}
                >
                  (629) 206-2360
                </a>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-white/5 p-6 flex items-start gap-4" data-testid="card-contact-email">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Email — general inquiries</h3>
                <a
                  href="mailto:info@novahavens.com"
                  className="text-lg font-bold text-foreground hover:text-primary transition-colors block"
                  onClick={() => trackEvent('contact_link_click', { method: 'email', location: 'contact_info' })}
                >
                  info@novahavens.com
                </a>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-white/5 p-6 flex items-start gap-4" data-testid="card-contact-location">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Headquarters</h3>
                <span className="text-lg font-bold text-foreground block">
                  Nashville, TN
                </span>
                <span className="text-sm text-muted-foreground">Serving all 48 contiguous US states</span>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-3 bg-card rounded-lg border border-white/10 p-8 md:p-10 max-w-contact-form w-full">
            <h2 className="text-2xl font-bold mb-2 text-foreground" data-testid="heading-form">Send a Message to Nova Havens</h2>
            <p className="text-sm text-muted-foreground mb-8">For urgent housing placements, call <a href="tel:+16294010054" className="text-primary font-semibold" onClick={() => trackEvent('contact_link_click', { method: 'phone', location: 'contact_form_side' })}>(629) 401-0054</a> directly — 24/7.</p>

            <ContactFormEmbed />
          </div>
        </div>
      </section>
    </div>
  );
}
