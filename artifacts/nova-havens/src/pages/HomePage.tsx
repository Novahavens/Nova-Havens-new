import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Zap, Users, Globe, Heart, BedDouble, Tv, MoveRight, PawPrint, PhoneCall, Map, Phone, ChevronDown, Building2, HeartHandshake, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { EXTERNAL_FORM_LINK_PROPS, INTAKE_FORMS } from '@/lib/intakeForms';
import ElegantCarousel, { type ElegantSlide } from '@/components/ui/elegant-carousel';
import AskAiAboutUs from '@/components/AskAiAboutUs';

type PartnerLogo = { name: string; logo?: string; logoClass?: string; showName: boolean };

const PARTNER_LOGOS: PartnerLogo[] = [
  { name: 'Allstate', logo: '/logos/allstate.png', logoClass: 'h-8', showName: true },
  { name: 'Travelers', logo: '/logos/travelers.png', logoClass: 'h-8', showName: true },
  { name: 'Farmers Insurance', logo: '/logos/farmers.svg', logoClass: 'h-9', showName: true },
  { name: 'State Farm', logo: '/logos/state-farm.svg', logoClass: 'h-6', showName: false },
  { name: 'Mercury', showName: true },
  { name: 'Lemonade', showName: true },
  { name: 'Chubb', showName: true },
];

const SHOWCASE_SLIDES: ElegantSlide[] = [
  {
    title: 'Living Spaces',
    subtitle: 'Move-In Ready Comfort',
    description: 'Bright, open-plan living rooms with modern furnishings — every home is verified before a family ever sees it.',
    imageUrl: '/property-1.webp',
    imageAlt: 'Bright furnished living room with modern sofa and open-plan kitchen — Nova Havens verified property',
  },
  {
    title: 'Walk in showers',
    subtitle: 'Rest, Restored',
    description: 'Spacious bedrooms with quality linens and ample closet space, so displaced families can settle in immediately.',
    imageUrl: '/property-2.webp',
    imageAlt: 'Spacious master bedroom with quality linens and ample closet space — Nova Havens furnished home',
  },
  {
    title: 'Full Kitchens',
    subtitle: 'Everything Included',
    description: 'Well-equipped kitchens with full appliances, cookware, and dishes — ready for the first meal on day one.',
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
    description: 'Open dining and living areas give families a comfortable place to gather while their home is restored.',
    imageUrl: '/property-5.webp',
    imageAlt: 'Open dining and living area in a furnished home available for placement through Nova Havens',
  },
  {
    title: 'Home Exteriors',
    subtitle: 'Part of a 20,000+ Network',
    description: 'Comfortable, well-kept homes in real neighborhoods — nationwide coverage across 48 contiguous states.',
    imageUrl: '/property-6.webp',
    imageAlt: 'Comfortable furnished home exterior — part of the Nova Havens 20,000+ property network',
  },
];

const FAQ_ITEMS = [
  {
    question: "How quickly can Nova Havens place a displaced family?",
    answer: "Nova Havens places most families into a verified furnished home within 5 days of the first contact — and often within 24–48 hours in major markets."
  },
  {
    question: "Does Nova Havens work with all insurance carriers?",
    answer: "Nova Havens coordinates with a wide range of insurance carriers and independent adjusters nationwide, including Allstate, Travelers, Farmers Insurance, and State Farm. If your carrier uses Additional Living Expenses (ALE) coverage, Nova Havens can typically bill them directly — so families pay nothing out of pocket for housing."
  },
  {
    question: "Are pet-friendly furnished homes available nationwide?",
    answer: "Yes. Nova Havens maintains a dedicated segment of pet-friendly properties across its network of 20,000+ verified homes. All Nova Havens needs for placement is your pet's species, breed, and weight — a coordinator will match your family to a compatible property."
  },
  {
    question: "Which states does Nova Havens operate in?",
    answer: "Nova Havens operates in all 48 contiguous US states, as of 2025. This includes major metros and rural areas, so families displaced in smaller communities receive the same quality of service as those in large cities."
  },
  {
    question: "How do I request emergency housing through Nova Havens?",
    answer: "To request emergency furnished housing through Nova Havens, call (629) 401-0054 or submit a request through the Contact page. Nova Havens responds to urgent housing requests 24/7. Your insurance carrier or adjuster can also initiate a placement on your behalf by contacting our team directly."
  },
  {
    question: "How does Nova Havens coordinate with my insurance adjuster?",
    answer: "Nova Havens assigns one dedicated coordinator to each placement. That coordinator communicates directly with your adjuster and carrier — handling documentation, extensions, and status updates — so you don't have to relay messages between parties. Adjusters receive proactive updates throughout the placement."
  },
  {
    question: "Can I list my furnished property with Nova Havens?",
    answer: "Yes. Property owners with fully furnished homes anywhere in the 48 contiguous US states can apply to join the Nova Havens network. Nova Havens conducts an inspection, verifies the property meets its standards, and then matches it with displaced families whose needs align. Contact (629) 401-0054 or visit the Contact page to get started."
  }
];

type PropertyCity = { city: string; lat: number; lng: number; count: number };
type PropertyStats = {
  totalProperties: number;
  statesCovered: number;
  byState: Record<string, number>;
  cities: PropertyCity[];
};

type StateCentroid = { name: string; lat: number; lng: number };

const STATE_CENTROIDS: Record<string, StateCentroid> = {
  AL: { name: 'Alabama', lat: 32.8067, lng: -86.7911 },
  AK: { name: 'Alaska', lat: 61.3707, lng: -152.4044 },
  AZ: { name: 'Arizona', lat: 33.7298, lng: -111.4312 },
  AR: { name: 'Arkansas', lat: 34.9697, lng: -92.3731 },
  CA: { name: 'California', lat: 36.1162, lng: -119.6816 },
  CO: { name: 'Colorado', lat: 39.0598, lng: -105.3111 },
  CT: { name: 'Connecticut', lat: 41.5978, lng: -72.7554 },
  DE: { name: 'Delaware', lat: 39.3185, lng: -75.5071 },
  FL: { name: 'Florida', lat: 27.7663, lng: -81.6868 },
  GA: { name: 'Georgia', lat: 33.0406, lng: -83.6431 },
  HI: { name: 'Hawaii', lat: 21.0943, lng: -157.4983 },
  ID: { name: 'Idaho', lat: 44.2405, lng: -114.4788 },
  IL: { name: 'Illinois', lat: 40.3495, lng: -88.9861 },
  IN: { name: 'Indiana', lat: 39.8494, lng: -86.2583 },
  IA: { name: 'Iowa', lat: 42.0115, lng: -93.2105 },
  KS: { name: 'Kansas', lat: 38.5266, lng: -96.7265 },
  KY: { name: 'Kentucky', lat: 37.6681, lng: -84.6701 },
  LA: { name: 'Louisiana', lat: 31.1695, lng: -91.8678 },
  ME: { name: 'Maine', lat: 44.6939, lng: -69.3819 },
  MD: { name: 'Maryland', lat: 39.0639, lng: -76.8021 },
  MA: { name: 'Massachusetts', lat: 42.2302, lng: -71.5301 },
  MI: { name: 'Michigan', lat: 43.3266, lng: -84.5361 },
  MN: { name: 'Minnesota', lat: 45.6945, lng: -93.9002 },
  MS: { name: 'Mississippi', lat: 32.7416, lng: -89.6787 },
  MO: { name: 'Missouri', lat: 38.4561, lng: -92.2884 },
  MT: { name: 'Montana', lat: 47.0529, lng: -110.3626 },
  NE: { name: 'Nebraska', lat: 41.1254, lng: -98.2681 },
  NV: { name: 'Nevada', lat: 38.3135, lng: -117.0554 },
  NH: { name: 'New Hampshire', lat: 43.4525, lng: -71.5639 },
  NJ: { name: 'New Jersey', lat: 40.2989, lng: -74.521 },
  NM: { name: 'New Mexico', lat: 34.8405, lng: -106.2485 },
  NY: { name: 'New York', lat: 42.1657, lng: -74.9481 },
  NC: { name: 'North Carolina', lat: 35.6301, lng: -79.8064 },
  ND: { name: 'North Dakota', lat: 47.5289, lng: -99.784 },
  OH: { name: 'Ohio', lat: 40.3888, lng: -82.7649 },
  OK: { name: 'Oklahoma', lat: 35.5653, lng: -96.9289 },
  OR: { name: 'Oregon', lat: 44.572, lng: -120.155 },
  PA: { name: 'Pennsylvania', lat: 40.5908, lng: -77.2098 },
  RI: { name: 'Rhode Island', lat: 41.6809, lng: -71.5118 },
  SC: { name: 'South Carolina', lat: 33.8569, lng: -80.8964 },
  SD: { name: 'South Dakota', lat: 44.2998, lng: -99.4388 },
  TN: { name: 'Tennessee', lat: 35.7478, lng: -86.6923 },
  TX: { name: 'Texas', lat: 31.0545, lng: -97.5635 },
  UT: { name: 'Utah', lat: 40.1501, lng: -111.8624 },
  VT: { name: 'Vermont', lat: 44.0459, lng: -72.7107 },
  VA: { name: 'Virginia', lat: 37.7693, lng: -78.17 },
  WA: { name: 'Washington', lat: 47.4009, lng: -121.4905 },
  WV: { name: 'West Virginia', lat: 38.4912, lng: -80.9545 },
  WI: { name: 'Wisconsin', lat: 44.2685, lng: -89.6165 },
  WY: { name: 'Wyoming', lat: 42.7559, lng: -107.3025 },
  DC: { name: 'Washington, DC', lat: 38.9072, lng: -77.0369 },
};

/**
 * Tile-grid layout of the 48 contiguous states, arranged in a rough US shape.
 * Used for the coverage map — no counts, clusters, or sized markers.
 */
const STATE_TILE_GRID: (string | null)[][] = [
  [null, null, null, null, null, null, null, null, null, null, 'ME'],
  [null, null, null, null, null, null, null, null, null, 'VT', 'NH'],
  ['WA', 'ID', 'MT', 'ND', 'MN', 'WI', null, 'MI', 'NY', 'CT', 'MA'],
  ['OR', 'NV', 'WY', 'SD', 'IA', 'IL', 'IN', 'OH', 'PA', 'NJ', 'RI'],
  ['CA', 'UT', 'CO', 'NE', 'MO', 'KY', 'WV', 'VA', 'MD', 'DE', null],
  [null, 'AZ', 'NM', 'KS', 'AR', 'TN', 'NC', 'SC', null, null, null],
  [null, null, null, 'OK', 'LA', 'MS', 'AL', 'GA', null, null, null],
  [null, null, null, 'TX', null, null, null, 'FL', null, null, null],
];

const CONTIGUOUS_STATE_CODES = STATE_TILE_GRID.flat().filter((code): code is string => Boolean(code));

const FALLBACK_CITIES: PropertyCity[] = [
  { city: 'Nashville, TN', lat: 36.1627, lng: -86.7816, count: 1 },
  { city: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437, count: 1 },
  { city: 'Phoenix, AZ', lat: 33.4484, lng: -112.074, count: 1 },
  { city: 'Dallas, TX', lat: 32.7767, lng: -96.797, count: 1 },
  { city: 'Seattle, WA', lat: 47.6062, lng: -122.3321, count: 1 },
  { city: 'Atlanta, GA', lat: 33.749, lng: -84.388, count: 1 },
  { city: 'Chicago, IL', lat: 41.8781, lng: -87.6298, count: 1 },
  { city: 'Denver, CO', lat: 39.7392, lng: -104.9903, count: 1 },
  { city: 'Miami, FL', lat: 25.7617, lng: -80.1918, count: 1 },
  { city: 'Portland, OR', lat: 45.5152, lng: -122.6784, count: 1 },
];

export default function HomePage() {
  // Title/description/OG tags are applied centrally by useRouteMeta (App.tsx).
  // LocalBusiness structured data is emitted statically via routeMeta.ts ('/').
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [propertyStats, setPropertyStats] = useState<PropertyStats>({
    totalProperties: 12000,
    statesCovered: 48,
  byState: {},
    cities: FALLBACK_CITIES,
  });
  // The map represents Nova Havens' service footprint, not only the states
  // that happen to have a property count in the latest stats snapshot.
  const coveredStates = new Set(CONTIGUOUS_STATE_CODES);

  useEffect(() => {
    fetch('/property-stats.json', { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) throw new Error(`Stats request failed: ${response.status}`);
        return response.json() as Promise<PropertyStats>;
      })
      .then((stats) => {
        if (
          typeof stats.totalProperties !== 'number' ||
          typeof stats.statesCovered !== 'number' ||
          !stats.byState ||
          !Array.isArray(stats.cities) ||
          stats.totalProperties === 0
        ) throw new Error('Invalid or not-yet-synced property stats');
        setPropertyStats(stats);
      })
      .catch(() => {
        // Keep the established sample map and safe fallback values if the
        // daily sync has not produced a file yet or the request is unavailable.
      });
  }, []);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="w-full overflow-hidden">
      {/* 1. Hero */}
      <section className="relative min-h-[100dvh] flex items-center justify-center flex-col px-4 pt-16" style={{ background: 'radial-gradient(ellipse 800px 400px at 50% 50%, hsl(var(--primary)/0.06) 0%, transparent 70%)' }}>
        <div className="text-center max-w-content z-10 flex flex-col items-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full mb-8 font-semibold text-xs bg-primary/10 text-primary" data-testid="tag-hero">
            Nationwide Furnished Housing Coordination
          </div>
          <h1 className="font-extrabold tracking-tight mb-6 text-foreground" style={{ fontSize: 'var(--text-hero)', lineHeight: 1.1 }} data-testid="heading-hero">
            A safe place to land, fast.
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-10 mx-auto text-muted-foreground" data-testid="text-hero-subtitle">At Nova Havens, we specialize in providing prompt and compassionate relocation services for families in need. We understand the stress that comes with displacement, and it's our priority to ensure a seamless experience.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={INTAKE_FORMS.housing} {...EXTERNAL_FORM_LINK_PROPS} className="inline-flex items-center justify-center whitespace-nowrap text-base font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:brightness-105 rounded-full px-8 py-4 w-full sm:w-auto" data-testid="btn-hero-primary">
              Request Housing
            </a>
            <a href={INTAKE_FORMS.property} {...EXTERNAL_FORM_LINK_PROPS} className="inline-flex items-center justify-center whitespace-nowrap text-base font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-primary text-primary hover:brightness-105 rounded-full px-8 py-4 w-full sm:w-auto" data-testid="btn-hero-secondary">
              Submit Your Property
            </a>
          </div>
        </div>
      </section>
      {/* 2. Trust Strip */}
      <section className="w-full border-y bg-card border-white/[0.08]">
        <div className="max-w-site mx-auto py-12 px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">
            {/* Large tile */}
            <div
              className="md:col-span-4 relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-1 p-8 md:p-10 flex flex-col items-start justify-between gap-8 transition-colors hover:border-primary/30"
              data-testid="stat-homes"
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(ellipse 480px 300px at 90% 110%, hsl(var(--primary)/0.07) 0%, transparent 70%)' }}
                aria-hidden="true"
              />
              <div className="relative w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div className="relative">
                <span className="block text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">20,000+</span>
                <span className="mt-3 block text-sm font-medium uppercase tracking-wider text-muted-foreground">Verified homes nationwide</span>
                <span className="mt-2 block text-sm leading-relaxed max-w-cta text-tertiary">Nova Havens maintains 20,000+ verified furnished homes across 48 contiguous US states, as of 2025.</span>
              </div>
            </div>
            {/* Stacked pair */}
            <div className="md:col-span-2 grid grid-cols-1 gap-4 md:gap-5">
              <div
                className="rounded-2xl border border-white/[0.08] bg-surface-1 p-6 md:p-7 flex flex-col items-start justify-between gap-6 transition-colors hover:border-primary/30"
                data-testid="stat-families"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <span className="block text-4xl font-extrabold tracking-tight text-foreground">531+</span>
                  <span className="mt-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Families assisted this year</span>
                  <span className="mt-2 block text-xs leading-relaxed text-tertiary">Nova Havens has assisted 531+ families displaced by property damage in 2025, placing each into a verified furnished home.</span>
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
                  <span className="block text-4xl font-extrabold tracking-tight text-foreground">&lt; 5 Days</span>
                  <span className="mt-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Average days to place</span>
                  <span className="mt-2 block text-xs leading-relaxed text-tertiary">Nova Havens achieves an average placement time of under 5 days from first contact to move-in, as of 2025.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 3. Why Choose Nova Havens */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-site mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16" data-testid="heading-why">Why Choose Nova Havens for Insurance Housing?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-card rounded-lg border border-white/10 p-8 md:p-10 flex flex-col items-start gap-4" data-testid="card-why-1">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Rapid Placements</h3>
            <p className="text-muted-foreground leading-relaxed">Nova Havens uses automation and agentic technology to process claims with precision — surfacing matched housing options within hours and completing most placements in under 5 days.</p>
          </div>
          <div className="bg-card rounded-lg border border-white/10 p-8 md:p-10 flex flex-col items-start gap-4" data-testid="card-why-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">One Team, One Point of Contact</h3>
            <p className="text-muted-foreground leading-relaxed">Nova Havens handles every step in-house — from processing the claim to delivering housing options and managing the stay. Families, carriers, and adjusters always have a single dedicated contact.</p>
          </div>
          <div className="bg-card rounded-lg border border-white/10 p-8 md:p-10 flex flex-col items-start gap-4" data-testid="card-why-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Vetted Nationwide Network</h3>
            <p className="text-muted-foreground leading-relaxed">Nova Havens' housing network is purpose-built for insurance workflows, with 20,000+ verified furnished properties across 48 states — each inspected and ready for immediate placement.</p>
          </div>
          <div className="bg-card rounded-lg border border-white/10 p-8 md:p-10 flex flex-col items-start gap-4" data-testid="card-why-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Care, Not Just Logistics</h3>
            <p className="text-muted-foreground leading-relaxed">Nova Havens treats every placement as a human moment. Families in crisis get compassion, clear communication, and a home that accounts for their pets, routines, and sense of normal — not just a place to sleep.</p>
          </div>
        </div>
      </section>
      {/* 3b. Ask AI About Us */}
      <AskAiAboutUs />
      {/* 4. Our Mission */}
      <section className="py-24 px-4 md:px-8 w-full border-y border-white/5 bg-surface-1">
        <div className="max-w-prose-wide mx-auto text-center flex flex-col items-center">
          <span className="text-xs font-bold tracking-widest uppercase mb-4 text-primary" data-testid="eyebrow-mission">OUR MISSION</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-8 text-foreground" data-testid="heading-mission">What Is Nova Havens' Mission?</h2>
          <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
            <p data-testid="text-mission-p1">
              Nova Havens was founded to provide fast, compassionate housing for families displaced by water, fire, or mold damage. Losing your home — even temporarily — disrupts every part of family life: schools, routines, pets, and the sense of stability children depend on.
            </p>
            <p data-testid="text-mission-p2">
              Nova Havens works directly with insurance carriers, adjusters, and relocation specialists to make that transition as smooth as possible. Every coordinator is trained on insurance workflows, carrier documentation standards, and the specific needs of displaced households — so nothing falls through the cracks.
            </p>
          </div>
        </div>
      </section>
      {/* 5. Amenities */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-site mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4" data-testid="heading-experience">Amenities Nova Havens families need most</h2>
          <p className="text-lg text-muted-foreground" data-testid="subtitle-experience">Every verified Nova Havens property is move-in ready from day one</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg border border-white/5 p-8 flex flex-col gap-4" data-testid="card-exp-1">
            <BedDouble className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Cozy Bedding</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Every Nova Havens home is furnished with quality linens and bedding so families can rest from the first night — no shopping required.</p>
          </div>
          <div className="bg-card rounded-lg border border-white/5 p-8 flex flex-col gap-4" data-testid="card-exp-2">
            <Tv className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Entertainment & Connectivity</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Streaming-ready TVs, high-speed internet, and fully equipped living spaces keep families connected, comfortable, and productive throughout their stay.</p>
          </div>
          <div className="bg-card rounded-lg border border-white/5 p-8 flex flex-col gap-4" data-testid="card-exp-3">
            <MoveRight className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Seamless Transition</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Nova Havens coordinates move-in logistics directly with carriers and adjusters — so families focus on recovery, not paperwork or scheduling.</p>
          </div>
          <div className="bg-card rounded-lg border border-white/5 p-8 flex flex-col gap-4" data-testid="card-exp-4">
            <PawPrint className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Pet Friendly</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Nova Havens maintains a dedicated pool of pet-friendly verified properties. Tell your coordinator about your pets on the first call and they'll match accordingly.</p>
          </div>
          <div className="bg-card rounded-lg border border-white/5 p-8 flex flex-col gap-4" data-testid="card-exp-5">
            <PhoneCall className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">24/7 Support</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Nova Havens' coordination team is reachable around the clock. Emergency claims receive the same same-day response as weekday business hours.</p>
          </div>
          <div className="bg-card rounded-lg border border-white/5 p-8 flex flex-col gap-4" data-testid="card-exp-6">
            <Map className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Nationwide Network</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">With 20,000+ verified homes across every major metro and many rural areas in 48 states, Nova Havens places families close to their schools, workplaces, and community.</p>
          </div>
        </div>
      </section>
      {/* 6. Pet-Friendly Feature */}
      <section className="w-full bg-card border-y border-white/5 overflow-hidden">
        <div className="max-w-site mx-auto flex flex-col md:flex-row min-h-[var(--min-h-map-lg)]">
          <div className="w-full md:w-1/2 p-10 md:p-16 lg:p-20 flex flex-col justify-center items-start">
            <span className="text-xs font-bold tracking-widest uppercase mb-4 text-primary" data-testid="eyebrow-pets">PET-FRIENDLY PROPERTIES</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-foreground leading-tight" data-testid="heading-pets">Your furry friends are welcome</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-md" data-testid="text-pets">
              Nova Havens maintains a growing network of verified pet-friendly furnished homes across 48 states — so displaced families never have to choose between a safe place to stay and bringing their pets along. Share your pet details on the first call and Nova Havens will match your family to a compatible home.
            </p>
            <a href={INTAKE_FORMS.housing} {...EXTERNAL_FORM_LINK_PROPS} className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-colors bg-primary text-primary-foreground hover:brightness-105 rounded-full px-8 py-4" data-testid="btn-pets">
              Find Pet-Friendly Homes
            </a>
          </div>
          <div className="w-full md:w-1/2 relative min-h-[var(--min-h-map)] md:min-h-full">
            <img 
              src="/pet-friendly.webp" 
              alt="Cozy pet-friendly living room in a Nova Havens verified furnished home" 
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="absolute inset-0 bg-surface-3 flex items-center justify-center p-8 text-center text-muted-foreground border-l border-white/5"><div class="flex flex-col items-center gap-4"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/50"><path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 1-3 3H5a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h1a3 3 0 0 1 3 3v1a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-1a3 3 0 0 1 3-3h1a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3h-1a3 3 0 0 1-3-3V5a3 3 0 0 0-3-3h-2Z"></path></svg><span>Cozy interior image loading...</span></div></div>';
              }}
              data-testid="img-pets"
            />
          </div>
        </div>
      </section>
      {/* 7. Where We Operate */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-site mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4" data-testid="heading-map">Where Does Nova Havens Operate?</h2>
        <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto" data-testid="text-map-coverage">
          Nova Havens operates across the 48 contiguous United States.
        </p>

        <div className="w-full bg-card rounded-lg border border-white/10 mb-12 relative overflow-hidden p-6 md:p-10" data-testid="card-map">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          <div className="relative flex flex-col gap-1.5 md:gap-2" role="img" aria-label="Map of the 48 contiguous United States with the states Nova Havens serves highlighted">
            {STATE_TILE_GRID.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-11 gap-1.5 md:gap-2">
                {row.map((stateCode, colIdx) => {
                  if (!stateCode) return <div key={`empty-${rowIdx}-${colIdx}`} aria-hidden="true" />;
                  const covered = coveredStates.has(stateCode);
                  return (
                    <div
                      key={stateCode}
                      className={`aspect-square rounded-sm flex items-center justify-center text-xs font-bold tracking-tight transition-colors ${
                        covered
                          ? 'bg-primary/20 border border-primary/40 text-primary'
                          : 'bg-surface-3 border border-white/5 text-muted-foreground/40'
                      }`}
                      title={`${STATE_CENTROIDS[stateCode]?.name ?? stateCode}${covered ? ' — served by Nova Havens' : ''}`}
                    >
                      {stateCode}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="relative mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/40" aria-hidden="true" /> States served by Nova Havens
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-white/5 rounded-lg p-8 text-center" data-testid="stat-card-properties">
            <div className="text-4xl font-extrabold text-foreground mb-2">{propertyStats.totalProperties.toLocaleString()}</div>
            <div className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-2">Active Properties</div>
            <div className="text-xs text-tertiary leading-relaxed">Live property count from the Nova Havens PROPERTY DATABASE board.</div>
          </div>
          <div className="bg-card border border-white/5 rounded-lg p-8 text-center" data-testid="stat-card-states">
            <div className="text-4xl font-extrabold text-foreground mb-2">{propertyStats.statesCovered}</div>
            <div className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-2">States Covered</div>
            <div className="text-xs text-tertiary leading-relaxed">Distinct states with at least one approved property in the live database.</div>
          </div>
          <div className="bg-card border border-white/5 rounded-lg p-8 text-center" data-testid="stat-card-speed">
            <div className="text-4xl font-extrabold text-foreground mb-2">&lt; 5 Days</div>
            <div className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-2">Average Days to Place</div>
            <div className="text-xs text-tertiary leading-relaxed">Nova Havens' average time from first contact to family move-in is under 5 days, as of 2025.</div>
          </div>
        </div>
      </section>
      {/* 8. Property Photo Showcase */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-site mx-auto w-full border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4" data-testid="heading-showcase">What Do Nova Havens Properties Look Like?</h2>
          <p className="text-lg text-muted-foreground" data-testid="subtitle-showcase">Every property in the Nova Havens network is verified, fully furnished, and ready for immediate occupancy.</p>
        </div>
        
        <ElegantCarousel slides={SHOWCASE_SLIDES} />
      </section>
      {/* 9. Trusted Partnerships */}
      <section className="py-20 px-4 md:px-8 w-full bg-surface-1 border-y border-white/5">
        <div className="max-w-site mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-3 text-left" data-testid="heading-partners">Our trusted industry partners.</h2>
            <p className="text-muted-foreground" data-testid="subtitle-partners">Nova Havens works with leading insurance carriers nationwide.</p>
          </div>
          
          <div className="relative overflow-hidden" data-testid="marquee-partners">
            {/* Edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 z-10 bg-gradient-to-r from-surface-1 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 z-10 bg-gradient-to-l from-surface-1 to-transparent" aria-hidden="true" />
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
                  {PARTNER_LOGOS.map((partner, idx) => (
                    <div key={partner.name} className="flex items-center gap-4 bg-card border border-white/5 rounded-sm px-8 py-6 mx-3 shrink-0" data-testid={copy === 0 ? `card-partner-${idx}` : undefined}>
                      {partner.logo && (
                        <img src={partner.logo} alt={copy === 0 ? `${partner.name} logo` : ''} className={`w-auto object-contain ${partner.logoClass ?? 'h-8'}`} loading="lazy" />
                      )}
                      {partner.showName && (
                        <span className="font-extrabold text-lg md:text-xl text-foreground tracking-tight whitespace-nowrap">{partner.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* 10. How It Works */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-site mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16" data-testid="heading-how-it-works">How Does Nova Havens Place Families?</h2>
        
        <Tabs defaultValue="adjusters" className="w-full flex flex-col items-center">
          <TabsList className="bg-card border border-white/10 p-1 rounded-full h-auto flex flex-col sm:flex-row w-full sm:w-auto mb-12" data-testid="tabs-how-it-works">
            <TabsTrigger value="adjusters" className="rounded-full px-6 py-3 text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full sm:w-auto" data-testid="tab-adjusters">Carriers & Relocation Specialists</TabsTrigger>
            <TabsTrigger value="families" className="rounded-full px-6 py-3 text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full sm:w-auto" data-testid="tab-families">Displaced Families</TabsTrigger>
            <TabsTrigger value="owners" className="rounded-full px-6 py-3 text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full sm:w-auto" data-testid="tab-owners">Property Owners</TabsTrigger>
          </TabsList>
          
          <TabsContent value="adjusters" className="w-full mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-6 left-[16.66%] right-[16.66%] h-px bg-primary/30 z-0"></div>
              
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-adjusters-1">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[var(--shadow-glow-sm)]">1</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Submit a Claim</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">Send Nova Havens the claim details — household size, location, and pets</p>
              </div>
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-adjusters-2">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[var(--shadow-glow-sm)]">2</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Review Placement Options</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">Nova Havens sends back verified homes that match, usually within hours</p>
              </div>
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-adjusters-3">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[var(--shadow-glow-sm)]">3</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Approve & Coordinate</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">Nova Havens handles move-in with the family and keeps carriers and relocation specialists updated</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="families" className="w-full mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-6 left-[16.66%] right-[16.66%] h-px bg-primary/30 z-0"></div>
              
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-families-1">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[var(--shadow-glow-sm)]">1</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Receive Your Options</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">Your adjuster or carrier connects you with Nova Havens — typically within hours of your ALE coverage being confirmed</p>
              </div>
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-families-2">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[var(--shadow-glow-sm)]">2</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Choose Your Home</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">Browse furnished options matched to your family's size, location, school district, pet needs, and accessibility requirements</p>
              </div>
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-families-3">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[var(--shadow-glow-sm)]">3</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Move In</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">Nova Havens coordinates move-in logistics with your carrier and the property owner — you get the keys and a direct line to your coordinator</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="owners" className="w-full mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-6 left-[16.66%] right-[16.66%] h-px bg-primary/30 z-0"></div>
              
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-owners-1">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[var(--shadow-glow-sm)]">1</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Submit Your Property</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">Tell Nova Havens about your furnished home — location, size, and availability</p>
              </div>
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-owners-2">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[var(--shadow-glow-sm)]">2</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Get Verified</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">A coordinator checks your property against Nova Havens furnishing and safety standards</p>
              </div>
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-owners-3">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[var(--shadow-glow-sm)]">3</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Start Hosting</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">Nova Havens matches your home with displaced families and handles the coordination</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center mt-12">
          <a href={INTAKE_FORMS.housing} {...EXTERNAL_FORM_LINK_PROPS} className="inline-flex items-center justify-center whitespace-nowrap text-base font-bold transition-colors bg-primary text-primary-foreground hover:brightness-105 rounded-full px-8 py-4 w-full sm:w-auto" data-testid="btn-how-it-works-submit-claim">
            Request Housing
          </a>
        </div>
      </section>
      {/* 11. Reviews Carousel */}
      <section className="py-20 md:py-24 w-full bg-surface-1 border-y border-white/5 overflow-hidden">
        <div className="max-w-site mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold" data-testid="heading-reviews">What displaced families say</h2>
            <div className="hidden md:flex gap-3">
              <Button aria-label="Previous review" variant="outline" size="icon" onClick={scrollPrev} className="rounded-full border-white/20 hover:bg-white/5 text-foreground hover:text-primary border bg-transparent" data-testid="btn-carousel-prev">
                <MoveRight className="w-4 h-4 rotate-180" aria-hidden="true" />
              </Button>
              <Button aria-label="Next review" variant="outline" size="icon" onClick={scrollNext} className="rounded-full border-white/20 hover:bg-white/5 text-foreground hover:text-primary border bg-transparent" data-testid="btn-carousel-next">
                <MoveRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
          
          <div className="embla" ref={emblaRef} data-testid="carousel-reviews">
            <div className="embla__container flex">
              {[
                {
                  quote: "Nova Havens had our family in a beautiful furnished home within 48 hours of the claim. Absolute lifesavers.",
                  name: "Sarah M.",
                  role: "Displaced Homeowner"
                },
                {
                  quote: "As an adjuster, I rely on vendors who deliver. Nova Havens is the most reliable housing coordinator I've worked with.",
                  name: "James T.",
                  role: "Independent Adjuster"
                },
                {
                  quote: "The team checked in on us every step of the way. We didn't feel like a case number — we felt cared for.",
                  name: "The Rodriguez Family",
                  role: "Fire Displacement"
                },
                {
                  quote: "Our property has been in Nova Havens' network for two years. The coordination is seamless and the families they place are wonderful.",
                  name: "David K.",
                  role: "Property Owner"
                }
              ].map((review, idx) => (
                <div key={idx} className="embla__slide flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-6 first:pl-0 group">
                  <div className="bg-card rounded-lg p-8 md:p-10 border border-white/5 h-full flex flex-col hover:border-white/10 transition-colors">
                    <span className="text-5xl font-serif text-primary leading-none mb-4 inline-block">"</span>
                    <p className="text-lg text-foreground mb-8 flex-1 leading-relaxed">
                      {review.quote}
                    </p>
                    <div className="w-12 h-px bg-white/10 mb-6"></div>
                    <div>
                      <p className="font-bold text-foreground">{review.name}</p>
                      <p className="text-sm text-muted-foreground">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex md:hidden justify-center gap-3 mt-8">
            <Button aria-label="Previous review" variant="outline" size="icon" onClick={scrollPrev} className="rounded-full border-white/20 text-foreground bg-transparent">
              <MoveRight className="w-4 h-4 rotate-180" aria-hidden="true" />
            </Button>
            <Button aria-label="Next review" variant="outline" size="icon" onClick={scrollNext} className="rounded-full border-white/20 text-foreground bg-transparent">
              <MoveRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>
      {/* 11.5 FAQ */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-prose-wide mx-auto w-full" data-testid="section-faq">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest uppercase mb-4 block text-primary">COMMON QUESTIONS</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="bg-card rounded-lg border border-white/10 overflow-hidden"
              data-testid={`faq-item-${idx + 1}`}
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left gap-4 hover:bg-white/[0.02] transition-colors"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                aria-expanded={openFaq === idx}
              >
                <span className="font-semibold text-foreground text-base leading-snug">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-6 text-muted-foreground leading-relaxed text-sm md:text-base">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      {/* 12. Emergency Contact Band */}
      <section className="w-full py-12 px-4 bg-surface-1 border-y border-white/5">
        <div className="max-w-prose-wide mx-auto text-center flex flex-col items-center gap-4 text-foreground">
          <Phone className="w-8 h-8 text-primary" />
          <a href="tel:6292062360" className="text-4xl md:text-5xl font-extrabold hover:opacity-80 transition-opacity" data-testid="link-emergency-after-hours-phone">
            (629) 206-2360
          </a>
          <p className="text-sm md:text-base font-semibold uppercase tracking-widest text-primary" data-testid="text-emergency-after-hours-label">
            After Hours Specialty Line
          </p>
          <p className="text-base md:text-lg font-medium text-muted-foreground" data-testid="text-emergency-desc">
            Displaced and need somewhere to stay tonight? Call Nova Havens — someone answers 24/7.
          </p>
          <p className="text-sm md:text-base text-muted-foreground" data-testid="text-emergency-main-line">
            Main line:{' '}
            <a href="tel:6294010054" className="font-bold text-foreground hover:text-primary transition-colors" data-testid="link-emergency-phone">
              (629) 401-0054
            </a>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={INTAKE_FORMS.housing} {...EXTERNAL_FORM_LINK_PROPS} className="inline-flex items-center justify-center whitespace-nowrap text-base font-bold transition-colors bg-primary text-primary-foreground hover:brightness-105 rounded-full px-8 py-4 w-full sm:w-auto" data-testid="btn-emergency-request-housing">
              Request Housing
            </a>
            <Link href="/contact" className="inline-flex items-center justify-center whitespace-nowrap text-base font-bold transition-colors border border-primary text-primary hover:bg-primary/10 rounded-full px-8 py-4 w-full sm:w-auto" data-testid="btn-emergency-contact-page">
              Contact Page
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
