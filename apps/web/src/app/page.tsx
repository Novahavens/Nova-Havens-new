import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  BedDouble,
  Building2,
  Clock,
  Globe,
  Heart,
  HeartHandshake,
  Map,
  MoveRight,
  PawPrint,
  Phone,
  PhoneCall,
  Tv,
  Users,
  Zap,
} from 'lucide-react';

import { HowItWorksTabs } from '@/components/home/how-it-works-tabs';
import { PartnersMarquee } from '@/components/home/partners-marquee';
import { PetCounters } from '@/components/home/pet-counters';
import { ReviewsCarousel, type Review } from '@/components/home/reviews-carousel';
import { ShowcaseCarousel, type ShowcaseSlide } from '@/components/home/showcase-carousel';
import { UsCoverageMap } from '@/components/home/us-coverage-map';
import { IntakeCta } from '@/components/shared/cta-button';
import { FaqAccordion } from '@/components/shared/faq-accordion';
import { GoogleRating } from '@/components/shared/google-rating';
import { JsonLd } from '@/components/shared/json-ld';
import { TrackedAnchor } from '@/components/shared/tracked-link';
import { COMPANY, CONTACT, PUBLIC_STATS, SERVICE_AREA } from '@/config/site';
import { HOME_FAQ_GROUPS } from '@/content/faqs';
import { HOW_IT_WORKS_TRACKS } from '@/content/how-it-works';
import { PROPERTY_STATS_NOTE, VERIFIED_PROPERTY_COUNT } from '@/lib/property-stats';
import { HOME_SCHEMA, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: `${COMPANY.name} | ${COMPANY.tagline}`,
  description: COMPANY.description,
  path: '/',
});

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    title: 'Living Spaces',
    subtitle: 'Move-In Ready Comfort',
    description:
      'Bright, open-plan living rooms with modern furnishings — every home is verified before a family ever sees it.',
    imageUrl: '/property-1.webp',
    imageAlt: 'Bright furnished living room with modern sofa and open-plan kitchen — Nova Havens verified property',
  },
  {
    title: 'Walk in showers',
    subtitle: 'Rest, Restored',
    description:
      'Spacious walk-in showers with easy, low-threshold entry — a practical comfort detail for families settling into a temporary home.',
    imageUrl: '/walk-in-shower.webp',
    imageAlt: 'Modern walk-in shower with frameless glass and tiled walls — Nova Havens furnished home',
  },
  {
    title: 'Full Kitchens',
    subtitle: 'Everything Included',
    description:
      'Well-equipped kitchens with full appliances, cookware, and dishes — ready for the first meal on day one.',
    imageUrl: '/property-3.webp',
    imageAlt: 'Well-equipped kitchen with full appliances, ready for immediate move-in — Nova Havens network property',
  },
  {
    title: 'Guest Bedrooms',
    subtitle: 'Room for the Whole Family',
    description: 'Cozy additional bedrooms mean families of any size stay together under one roof during recovery.',
    imageUrl: '/property-4.webp',
    imageAlt: 'Cozy furnished bedroom in a Nova Havens temporary housing property',
  },
  {
    title: 'Dining & Gathering',
    subtitle: 'A Place to Regroup',
    description:
      'Open dining and living areas give families a comfortable place to gather while their home is restored.',
    imageUrl: '/property-5.webp',
    imageAlt: 'Open dining and living area in a furnished home available for placement through Nova Havens',
  },
  {
    title: 'Home Exteriors',
    subtitle: 'Part of Our Verified Network',
    description: `Comfortable, well-kept homes in real neighborhoods — nationwide coverage across ${SERVICE_AREA.usName}.`,
    imageUrl: '/property-6.webp',
    imageAlt: 'Comfortable furnished home exterior — part of the Nova Havens verified property network',
  },
  {
    title: 'Fenced-In Yards',
    subtitle: 'Room to Play',
    description:
      'Secure fenced-in yards give families and pets a comfortable outdoor space to relax, play, and settle in.',
    imageUrl: '/fenced-yard-home.webp',
    imageAlt: 'Well-kept furnished home with a secure fenced-in backyard and outdoor play space',
  },
  {
    title: 'ADA-Compliant Homes',
    subtitle: 'Designed for Access',
    description:
      'Accessible homes with step-free entries, ramps, and thoughtful layouts help every family feel at home.',
    imageUrl: '/ada-compliant-home.webp',
    imageAlt: 'Furnished accessible home with a step-free entry, ramp, and handrails',
  },
  {
    title: 'Pet-Friendly Homes',
    subtitle: 'Pets Are Family',
    description:
      'Pet-friendly furnished homes help families stay together with the companions they love during recovery.',
    imageUrl: '/pet-friendly-family.webp',
    imageAlt: 'Family relaxing with their dog in a bright Nova Havens furnished home',
  },
];

const REVIEWS: Review[] = [
  {
    quote:
      'Nova Havens had our family in a beautiful furnished home within 48 hours of the claim. Absolute lifesavers.',
    name: 'Sarah M.',
    role: 'Displaced Homeowner',
  },
  {
    quote:
      "After losing everything in a flood, Nova Havens gave us stability when we needed it most. The home felt welcoming from day one.",
    name: 'Maria L.',
    role: 'Water Damage Displacement',
  },
  {
    quote: "The team checked in on us every step of the way. We didn't feel like a case number — we felt cared for.",
    name: 'The Rodriguez Family',
    role: 'Fire Displacement',
  },
  {
    quote:
      "Our property has been in Nova Havens' network for two years. The coordination is seamless and the families they place are wonderful.",
    name: 'David K.',
    role: 'Property Owner',
  },
];

const WHY_CARDS = [
  {
    icon: Zap,
    title: 'Rapid Placements',
    text: 'Nova Havens uses automation and agentic technology to process claims with precision — surfacing matched housing options in minutes, not days, and completing most placements in under 5 days.',
  },
  {
    icon: Users,
    title: 'One Team, One Point of Contact',
    text: 'Nova Havens handles every step in-house — from processing the claim to delivering housing options and managing the stay. Families always have a single dedicated contact.',
  },
  {
    icon: Globe,
    title: 'Vetted Nationwide Network',
    text: `Nova Havens' housing network is purpose-built for insurance workflows across ${SERVICE_AREA.stateCount} states. Our team confirms a suitable property's availability for each placement.`,
  },
  {
    icon: Heart,
    title: 'Care, Not Just Logistics',
    text: 'Nova Havens treats every placement as a human moment. Families in crisis get compassion, clear communication, and a home that accounts for their pets, routines, and sense of normal — not just a place to sleep.',
  },
];

const AMENITIES = [
  {
    icon: BedDouble,
    title: 'Cozy Bedding',
    text: 'Every Nova Havens home is furnished with quality linens and bedding so families can rest from the first night — no shopping required.',
  },
  {
    icon: Tv,
    title: 'Entertainment & Connectivity',
    text: 'Streaming-ready TVs, high-speed internet, and fully equipped living spaces keep families connected, comfortable, and productive throughout their stay.',
  },
  {
    icon: MoveRight,
    title: 'Seamless Transition',
    text: 'Nova Havens coordinates move-in logistics seamlessly — so families can focus on recovery, not paperwork or scheduling.',
  },
  {
    icon: PawPrint,
    title: 'Pet Friendly',
    text: "Nova Havens maintains a dedicated pool of pet-friendly verified properties. Tell your coordinator about your pets on the first call and they'll match accordingly.",
  },
  {
    icon: PhoneCall,
    title: '24/7 Support',
    text: "Nova Havens' coordination team is reachable around the clock. Emergency claims receive the same same-day response as weekday business hours.",
  },
  {
    icon: Map,
    title: 'Nationwide Network',
    text: `Across ${SERVICE_AREA.stateCount} states, Nova Havens works to place families close to their schools, workplaces, and community.`,
  },
];

export default function HomePage() {
  return (
    <div className="w-full overflow-hidden">
      <JsonLd data={HOME_SCHEMA} />

      {/* 1. Hero */}
      <section
        className="relative min-h-[100dvh] flex items-center justify-center flex-col px-4 pt-16"
        style={{
          background: 'radial-gradient(ellipse 800px 400px at 50% 50%, hsl(var(--primary)/0.06) 0%, transparent 70%)',
        }}
      >
        <div className="text-center max-w-content z-10 flex flex-col items-center">
          <p
            className="inline-flex items-center px-4 py-1.5 rounded-full mb-8 font-semibold text-xs bg-primary/10 text-primary"
            data-testid="tag-hero"
          >
            {COMPANY.tagline}
          </p>
          <h1
            className="font-extrabold tracking-tight mb-6 text-foreground"
            style={{ fontSize: 'var(--text-hero)', lineHeight: 1.1 }}
            data-testid="heading-hero"
          >
            A safe place to land, fast.
          </h1>
          <p
            className="text-lg md:text-xl max-w-2xl mb-10 mx-auto text-muted-foreground"
            data-testid="text-hero-subtitle"
          >
            At Nova Havens, we specialize in providing prompt and compassionate relocation services for families in
            need. We understand the stress that comes with displacement, and it&apos;s our priority to ensure a seamless
            experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <IntakeCta form="housing" location="home_hero" className="w-full sm:w-auto" data-testid="btn-hero-primary">
              Request Housing
            </IntakeCta>
            <IntakeCta
              form="property"
              location="home_hero"
              variant="outline"
              className="w-full sm:w-auto"
              data-testid="btn-hero-secondary"
            >
              Submit Your Property
            </IntakeCta>
          </div>
        </div>
      </section>

      {/* 2. Trust Strip */}
      <section id="trust-strip" className="w-full border-y bg-card border-white/10" aria-label="Key figures">
        <div className="max-w-site mx-auto py-12 px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">
            <div
              className="md:col-span-4 relative overflow-hidden rounded-2xl border border-white/10 bg-surface-1 p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 items-center gap-8 transition-colors hover:border-primary/30"
              data-testid="stat-homes"
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse 480px 300px at 90% 110%, hsl(var(--primary)/0.07) 0%, transparent 70%)',
                }}
                aria-hidden="true"
              />
              <div className="relative flex flex-col items-start gap-6">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <span className="block text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
                    {VERIFIED_PROPERTY_COUNT}
                  </span>
                  <span className="mt-3 block text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Verified network property records
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed max-w-cta text-tertiary text-left">
                    {PROPERTY_STATS_NOTE}. Nova Havens coordinates furnished housing across {SERVICE_AREA.usName};
                    availability is confirmed for each request.
                  </span>
                </div>
              </div>
              <UsCoverageMap variant="compact" priority />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 gap-4 md:gap-5">
              <div
                className="rounded-2xl border border-white/[0.08] bg-surface-1 p-6 md:p-7 flex flex-col items-start justify-between gap-6 transition-colors hover:border-primary/30"
                data-testid="stat-families"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <span className="block text-4xl font-extrabold tracking-tight text-foreground">
                    {PUBLIC_STATS.familiesAssisted.value}
                  </span>
                  <span className="mt-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Families assisted this year
                  </span>
                  <span className="mt-2 block text-xs leading-relaxed text-tertiary">
                    Nova Havens has assisted {PUBLIC_STATS.familiesAssisted.value} families displaced by property damage
                    in {PUBLIC_STATS.familiesAssisted.year}, placing each into a verified furnished home.
                  </span>
                </div>
              </div>
              <div
                className="rounded-2xl border border-primary/30 bg-surface-1 p-6 md:p-7 flex flex-col items-start justify-between gap-6 transition-colors hover:border-primary/50"
                data-testid="stat-days"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <span className="block text-4xl font-extrabold tracking-tight text-foreground">
                    {PUBLIC_STATS.averageDaysToPlace.value}
                  </span>
                  <span className="mt-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Average days to place
                  </span>
                  <span className="mt-2 block text-xs leading-relaxed text-tertiary">
                    Nova Havens achieves an average placement time of under 5 days from first contact to move-in, as of{' '}
                    {PUBLIC_STATS.averageDaysToPlace.year}.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Choose */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-site mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16" data-testid="heading-why">
          Why Choose Nova Havens for Insurance Housing?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8" data-testid="grid-why">
          {WHY_CARDS.map((card) => (
            <article
              key={card.title}
              className="bg-card rounded-lg border border-white/10 p-8 md:p-10 flex flex-col items-start gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <card.icon className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-foreground">{card.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Mission */}
      <section className="py-24 px-4 md:px-8 w-full border-y border-white/5 bg-surface-1">
        <div className="max-w-prose-wide mx-auto text-center flex flex-col items-center">
          <span className="text-xs font-bold tracking-widest uppercase mb-4 text-primary">Our Mission</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-8 text-foreground" data-testid="heading-mission">
            What Is Nova Havens&apos; Mission?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            We are here to provide a safe haven for families in their time of need.
          </p>
        </div>
      </section>

      {/* 5. Amenities */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-site mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4" data-testid="heading-experience">
            Amenities Nova Havens families need most
          </h2>
          <p className="text-lg text-muted-foreground">
            Every verified Nova Havens property is move-in ready from day one
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-experience">
          {AMENITIES.map((item) => (
            <article key={item.title} className="bg-card rounded-lg border border-white/5 p-8 flex flex-col gap-4">
              <item.icon className="w-8 h-8 text-primary" aria-hidden="true" />
              <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 6. Pet-Friendly */}
      <section className="w-full bg-card border-y border-white/5 overflow-hidden">
        <div className="max-w-site mx-auto flex flex-col md:flex-row min-h-[var(--min-h-map-lg)]">
          <div className="w-full md:w-1/2 p-10 md:p-16 lg:p-20 flex flex-col justify-center items-start">
            <span className="text-xs font-bold tracking-widest uppercase mb-4 text-primary">
              Pet-Friendly Properties
            </span>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-foreground leading-tight"
              data-testid="heading-pets"
            >
              Your furry friends are welcome
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-md">
              Nova Havens maintains a growing network of verified pet-friendly furnished homes across{' '}
              {SERVICE_AREA.stateCount} states — so displaced families never have to choose between a safe place to stay
              and bringing their pets along. Share your pet details on the first call and Nova Havens will match your
              family to a compatible home.
            </p>
            <PetCounters />
            <IntakeCta form="housing" location="home_pets" size="lg" data-testid="btn-pets">
              Find Pet-Friendly Homes
            </IntakeCta>
          </div>
          <div className="w-full md:w-1/2 relative min-h-[var(--min-h-map)] md:min-h-full">
            <Image
              src="/pet-friendly-family.webp"
              alt="Family relaxing with their dog in a Nova Havens verified furnished home"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              data-testid="img-pets"
            />
          </div>
        </div>
      </section>

      {/* 7. Where We Operate */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-site mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4" data-testid="heading-map">
          Where Does Nova Havens Operate?
        </h2>
        <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          {SERVICE_AREA.coverageSentence}
        </p>
        <div className="mb-8">
          <UsCoverageMap variant="detailed" />
        </div>
        <GoogleRating />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="grid-stats">
          <div className="bg-card border border-white/5 rounded-lg p-8 text-center">
            <div className="text-4xl font-extrabold text-foreground mb-2">{VERIFIED_PROPERTY_COUNT}</div>
            <div className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Verified Network Property Records
            </div>
            <div className="text-xs text-tertiary leading-relaxed">{PROPERTY_STATS_NOTE}.</div>
          </div>
          <div className="bg-card border border-white/5 rounded-lg p-8 text-center">
            <div className="text-4xl font-extrabold text-foreground mb-2">{SERVICE_AREA.stateCount}</div>
            <div className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-2">
              States Covered
            </div>
            <div className="text-xs text-tertiary leading-relaxed">
              Distinct states with at least one approved property in the live database.
            </div>
          </div>
          <div className="bg-card border border-white/5 rounded-lg p-8 text-center">
            <div className="text-4xl font-extrabold text-foreground mb-2">{PUBLIC_STATS.averageDaysToPlace.value}</div>
            <div className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Average Days to Place
            </div>
            <div className="text-xs text-tertiary leading-relaxed">
              Nova Havens&apos; average time from first contact to family move-in is under 5 days, as of{' '}
              {PUBLIC_STATS.averageDaysToPlace.year}.
            </div>
          </div>
        </div>
      </section>

      {/* 8. Showcase */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-site mx-auto w-full border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4" data-testid="heading-showcase">
            What Do Nova Havens Properties Look Like?
          </h2>
          <p className="text-lg text-muted-foreground">
            Every property in the Nova Havens network is verified, fully furnished, and ready for immediate occupancy.
          </p>
        </div>
        <ShowcaseCarousel slides={SHOWCASE_SLIDES} />
      </section>

      {/* 9. Partners */}
      <section className="py-20 px-4 md:px-8 w-full bg-surface-1 border-y border-white/5">
        <div className="max-w-site mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-extrabold mb-3" data-testid="heading-partners">
              Our trusted network.
            </h2>
            <p className="text-muted-foreground">Nova Havens partners with leading housing companies and platforms nationwide.</p>
          </div>
          <PartnersMarquee />
        </div>
      </section>

      {/* 10. How It Works */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-site mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16" data-testid="heading-how-it-works">
          How Does Nova Havens Place Families?
        </h2>
        <HowItWorksTabs tracks={HOW_IT_WORKS_TRACKS} />
        <div className="flex justify-center mt-12">
          <IntakeCta
            form="housing"
            location="home_how_it_works"
            className="w-full sm:w-auto"
            data-testid="btn-how-it-works-submit-claim"
          >
            Request Housing
          </IntakeCta>
        </div>
      </section>

      {/* 11. Reviews */}
      <section className="py-20 md:py-24 w-full bg-surface-1 border-y border-white/5 overflow-hidden">
        <ReviewsCarousel reviews={REVIEWS} />
      </section>

      {/* 12. FAQ */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-prose-wide mx-auto w-full" data-testid="section-faq">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest uppercase mb-4 block text-primary">Common Questions</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Frequently Asked Questions</h2>
        </div>
        <FaqAccordion groups={HOME_FAQ_GROUPS} location="home_faq" />
      </section>

      {/* 13. Emergency band */}
      <section className="w-full py-12 px-4 bg-surface-1 border-y border-white/5">
        <div className="max-w-prose-wide mx-auto text-center flex flex-col items-center gap-4 text-foreground">
          <Phone className="w-8 h-8 text-primary" aria-hidden="true" />
          <TrackedAnchor
            href={CONTACT.afterHoursPhone.href}
            event="contact_link_click"
            data={{ method: 'phone', location: 'home_emergency' }}
            className="text-4xl md:text-5xl font-extrabold hover:opacity-80 transition-opacity"
            data-testid="link-emergency-after-hours-phone"
          >
            {CONTACT.afterHoursPhone.display}
          </TrackedAnchor>
          <p className="text-sm md:text-base font-semibold uppercase tracking-widest text-primary">
            After Hours Specialty Line
          </p>
          <p className="text-base md:text-lg font-medium text-muted-foreground">
            Displaced and need somewhere to stay tonight? Call Nova Havens — someone answers 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <IntakeCta
              form="housing"
              location="home_emergency"
              className="w-full sm:w-auto"
              data-testid="btn-emergency-request-housing"
            >
              Request Housing
            </IntakeCta>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center whitespace-nowrap text-base font-bold transition-colors border border-primary text-primary hover:bg-primary/10 rounded-full px-8 py-4 w-full sm:w-auto"
              data-testid="btn-emergency-contact-page"
            >
              Contact Page
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
