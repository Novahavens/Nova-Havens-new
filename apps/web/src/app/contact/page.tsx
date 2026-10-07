import type { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';

import { ContactFormEmbed } from '@/components/contact/contact-form-embed';
import { IntakeCta } from '@/components/shared/cta-button';
import { JsonLd } from '@/components/shared/json-ld';
import { TrackedAnchor } from '@/components/shared/tracked-link';
import { COMPANY, CONTACT, SERVICE_AREA } from '@/config/site';
import { VERIFIED_PROPERTY_COUNT } from '@/lib/property-stats';
import { graph, pageMetadata, webPageSchema } from '@/lib/seo';

const DESCRIPTION = `Reach Nova Havens at ${CONTACT.phone.display} — available 24/7 for emergency claims and placements. Request housing, submit a property, or ask a general question.`;

export const metadata: Metadata = pageMetadata({ title: 'Contact Us', description: DESCRIPTION, path: '/contact' });

function PhoneLink({
  location,
  which = 'phone',
  className,
}: {
  location: string;
  which?: 'phone' | 'afterHoursPhone';
  className: string;
}) {
  const number = CONTACT[which];
  return (
    <TrackedAnchor
      href={number.href}
      event="contact_link_click"
      data={{ method: 'phone', location }}
      className={className}
    >
      {number.display}
    </TrackedAnchor>
  );
}

export default function ContactPage() {
  return (
    <div className="w-full">
      <JsonLd
        data={graph(
          webPageSchema({
            type: 'ContactPage',
            path: '/contact',
            name: `Contact ${COMPANY.name}`,
            description: DESCRIPTION,
            about: true,
          }),
        )}
      />

      <section className="bg-background pt-24 pb-16 px-4 md:px-8 border-b border-white/10">
        <div className="mx-auto max-w-site w-full">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-4">Contact Nova Havens</p>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6"
              data-testid="heading-contact-hero"
            >
              Request Emergency Housing or Get in Touch
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              To request emergency furnished housing through Nova Havens, call{' '}
              <PhoneLink
                location="contact_hero"
                className="text-primary font-semibold hover:brightness-110 transition-colors"
              />{' '}
              or submit the form below. Nova Havens responds to urgent housing requests 24 hours a day, 7 days a week.
              For general inquiries, expect a response within one business day.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-8 max-w-site mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-card rounded-lg border border-white/10 p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-3 text-foreground">Displaced Family?</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              If you have an active insurance claim and need immediate furnished housing placement, Nova Havens responds
              24/7. Start your request here.
            </p>
            <IntakeCta
              form="housing"
              location="contact_quick_action"
              size="md"
              className="w-full md:w-auto"
              data-testid="btn-action-request-housing"
            >
              Request Housing Now
            </IntakeCta>
          </div>
          <div className="bg-card rounded-lg border border-white/10 p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-3 text-foreground">Own a Furnished Property?</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Join the Nova Havens network of {VERIFIED_PROPERTY_COUNT} verified furnished property records.
              Availability is confirmed for each request.
            </p>
            <IntakeCta
              form="property"
              location="contact_quick_action"
              variant="outline"
              size="md"
              className="w-full md:w-auto"
              data-testid="btn-action-submit-property"
            >
              Submit Your Property
            </IntakeCta>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8" id="contact-form">
          <div className="lg:col-span-2 space-y-6">
            <div
              className="bg-card rounded-lg border border-white/5 p-6 flex items-start gap-4"
              data-testid="card-contact-phone"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Phone — 24/7 for emergency claims</h3>
                <PhoneLink
                  location="contact_info"
                  className="text-lg font-bold text-foreground hover:text-primary transition-colors block"
                />
                <h3 className="text-sm font-semibold text-muted-foreground mt-3 mb-1">After Hours Specialty Line</h3>
                <PhoneLink
                  which="afterHoursPhone"
                  location="contact_info"
                  className="text-lg font-bold text-foreground hover:text-primary transition-colors block"
                />
              </div>
            </div>

            <div
              className="bg-card rounded-lg border border-white/5 p-6 flex items-start gap-4"
              data-testid="card-contact-email"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Email — general inquiries</h3>
                <TrackedAnchor
                  href={`mailto:${CONTACT.email}`}
                  event="contact_link_click"
                  data={{ method: 'email', location: 'contact_info' }}
                  className="text-lg font-bold text-foreground hover:text-primary transition-colors block"
                >
                  {CONTACT.email}
                </TrackedAnchor>
              </div>
            </div>

            <div
              className="bg-card rounded-lg border border-white/5 p-6 flex items-start gap-4"
              data-testid="card-contact-location"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Headquarters</h3>
                <span className="text-lg font-bold text-foreground block">
                  {CONTACT.address.locality}, {CONTACT.address.region}
                </span>
                <span className="text-sm text-muted-foreground">Serving all {SERVICE_AREA.usName}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-card rounded-lg border border-white/10 p-8 md:p-10 max-w-contact-form w-full">
            <h2 className="text-2xl font-bold mb-2 text-foreground" data-testid="heading-form">
              Send a Message to Nova Havens
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              For urgent housing placements, call{' '}
              <PhoneLink location="contact_form_side" className="text-primary font-semibold" /> directly — 24/7.
            </p>
            <ContactFormEmbed />
          </div>
        </div>
      </section>
    </div>
  );
}
