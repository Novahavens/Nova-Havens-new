import React, { useState } from 'react';
import { Link } from 'wouter';
import { Zap, Users, Globe, Heart, BedDouble, Tv, MoveRight, PawPrint, PhoneCall, Map, Phone, ChevronDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';

const FAQ_ITEMS = [
  {
    question: "How quickly can Nova Havens place a displaced family?",
    answer: "Nova Havens places most families into a verified furnished home within 5 days of the first contact — and often within 24–48 hours in major markets. Our automated claim-intake system surfaces matched properties within hours so coordinators can reach the family the same day a claim is submitted."
  },
  {
    question: "Does Nova Havens work with all insurance carriers?",
    answer: "Nova Havens coordinates with a wide range of insurance carriers and independent adjusters nationwide, including Allstate, Travelers, Farmers Insurance, and State Farm. If your carrier uses Additional Living Expenses (ALE) coverage, Nova Havens can typically bill them directly — so families pay nothing out of pocket for housing."
  },
  {
    question: "Are pet-friendly furnished homes available nationwide?",
    answer: "Yes. Nova Havens maintains a dedicated segment of pet-friendly properties across its network of 20,000+ verified homes. When you contact Nova Havens, simply share your pet's species, breed, and weight and a coordinator will match your family to a compatible property. Most pet deposits are covered under ALE policies."
  },
  {
    question: "Which states does Nova Havens operate in?",
    answer: "Nova Havens operates in all 48 contiguous US states, as of 2025. This includes major metros and rural areas, so families displaced in smaller communities receive the same quality of service as those in large cities."
  },
  {
    question: "What does a 'fully furnished' Nova Havens home include?",
    answer: "Every Nova Havens property includes beds with quality linens, a fully equipped kitchen with cookware and dishes, high-speed Wi-Fi, a streaming-ready TV, and washer/dryer access. Properties are verified by Nova Havens coordinators before being listed in the network — so what you see is what you get."
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

export default function HomePage() {
  // Title/description/OG tags are applied centrally by useRouteMeta (App.tsx).
  // LocalBusiness structured data is emitted statically via routeMeta.ts ('/').
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="w-full overflow-hidden">
      {/* 1. Hero */}
      <section className="relative min-h-[100dvh] flex items-center justify-center flex-col px-4 pt-16" style={{ background: 'radial-gradient(ellipse 800px 400px at 50% 50%, rgba(212,162,76,0.06) 0%, transparent 70%)' }}>
        <div className="text-center max-w-[900px] z-10 flex flex-col items-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full mb-8 font-semibold" style={{ backgroundColor: 'rgba(242,205,107,0.12)', color: '#F2CD6B', fontSize: '13px' }} data-testid="tag-hero">
            Nationwide Furnished Housing Coordination
          </div>
          <h1 className="font-extrabold tracking-tight mb-6" style={{ fontSize: 'clamp(48px, 6vw, 80px)', color: '#F5F5F2', lineHeight: 1.1 }} data-testid="heading-hero">
            A safe place to land, fast.
          </h1>
          <p className="text-[18px] md:text-[20px] max-w-[680px] mb-10 mx-auto" style={{ color: '#9BA3AF' }} data-testid="text-hero-subtitle">
            Nova Havens is a nationwide insurance housing coordination company based in Nashville, TN. When a family is displaced by fire, water, or mold damage, Nova Havens works directly with insurance carriers and adjusters to place them into a fully furnished home — typically within 5 days, across all 48 contiguous US states.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center justify-center whitespace-nowrap text-base font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-[#0A0C10] hover:brightness-105 rounded-full px-8 py-4 w-full sm:w-auto" data-testid="btn-hero-primary">
              Request Housing
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center whitespace-nowrap text-base font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-primary text-primary hover:brightness-105 rounded-full px-8 py-4 w-full sm:w-auto" data-testid="btn-hero-secondary">
              Submit Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Trust Strip */}
      <section className="w-full border-y" style={{ backgroundColor: '#111318', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-[1200px] mx-auto py-12 px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="flex flex-col items-center justify-center py-4 md:py-0" data-testid="stat-homes">
              <span className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: '#F2CD6B' }}>20,000+</span>
              <span className="text-sm font-medium uppercase tracking-wider mb-2" style={{ color: '#9BA3AF' }}>Verified homes nationwide</span>
              <span className="text-xs leading-relaxed max-w-[220px]" style={{ color: '#6B7280' }}>Nova Havens maintains 20,000+ verified furnished homes across 48 contiguous US states, as of 2025.</span>
            </div>
            <div className="flex flex-col items-center justify-center py-4 md:py-0" data-testid="stat-families">
              <span className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: '#F2CD6B' }}>531+</span>
              <span className="text-sm font-medium uppercase tracking-wider mb-2" style={{ color: '#9BA3AF' }}>Families assisted this year</span>
              <span className="text-xs leading-relaxed max-w-[220px]" style={{ color: '#6B7280' }}>Nova Havens has assisted 531+ families displaced by property damage in 2025, placing each into a verified furnished home.</span>
            </div>
            <div className="flex flex-col items-center justify-center py-4 md:py-0" data-testid="stat-days">
              <span className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: '#F2CD6B' }}>&lt; 5 Days</span>
              <span className="text-sm font-medium uppercase tracking-wider mb-2" style={{ color: '#9BA3AF' }}>Average days to place</span>
              <span className="text-xs leading-relaxed max-w-[220px]" style={{ color: '#6B7280' }}>Nova Havens achieves an average placement time of under 5 days from first contact to move-in, as of 2025.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Choose Nova Havens */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16" data-testid="heading-why">Why Choose Nova Havens for Insurance Housing?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-card rounded-[16px] border border-white/10 p-8 md:p-10 flex flex-col items-start gap-4" data-testid="card-why-1">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Rapid Placements</h3>
            <p className="text-muted-foreground leading-relaxed">Nova Havens uses automation and agentic technology to process claims with precision — surfacing matched housing options within hours and completing most placements in under 5 days.</p>
          </div>
          <div className="bg-card rounded-[16px] border border-white/10 p-8 md:p-10 flex flex-col items-start gap-4" data-testid="card-why-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">One Team, One Point of Contact</h3>
            <p className="text-muted-foreground leading-relaxed">Nova Havens handles every step in-house — from processing the claim to delivering housing options and managing the stay. Families, carriers, and adjusters always have a single dedicated contact.</p>
          </div>
          <div className="bg-card rounded-[16px] border border-white/10 p-8 md:p-10 flex flex-col items-start gap-4" data-testid="card-why-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Vetted Nationwide Network</h3>
            <p className="text-muted-foreground leading-relaxed">Nova Havens' housing network is purpose-built for insurance workflows, with 20,000+ verified furnished properties across 48 states — each inspected and ready for immediate placement.</p>
          </div>
          <div className="bg-card rounded-[16px] border border-white/10 p-8 md:p-10 flex flex-col items-start gap-4" data-testid="card-why-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Care, Not Just Logistics</h3>
            <p className="text-muted-foreground leading-relaxed">Nova Havens treats every placement as a human moment. Families in crisis get compassion, clear communication, and a home that accounts for their pets, routines, and sense of normal — not just a place to sleep.</p>
          </div>
        </div>
      </section>

      {/* 4. Our Mission */}
      <section className="py-24 px-4 md:px-8 w-full border-y border-white/5" style={{ backgroundColor: '#0D0F14' }}>
        <div className="max-w-[800px] mx-auto text-center flex flex-col items-center">
          <span className="text-[13px] font-bold tracking-widest uppercase mb-4" style={{ color: '#D4A24C' }} data-testid="eyebrow-mission">OUR MISSION</span>
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

      {/* 5. The Nova Havens Experience */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4" data-testid="heading-experience">What Does a Nova Havens Furnished Home Include?</h2>
          <p className="text-lg text-muted-foreground" data-testid="subtitle-experience">Every verified Nova Havens property is move-in ready from day one</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-[16px] border border-white/5 p-8 flex flex-col gap-4" data-testid="card-exp-1">
            <BedDouble className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Cozy Bedding</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Every Nova Havens home is furnished with quality linens and bedding so families can rest from the first night — no shopping required.</p>
          </div>
          <div className="bg-card rounded-[16px] border border-white/5 p-8 flex flex-col gap-4" data-testid="card-exp-2">
            <Tv className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Entertainment & Connectivity</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Streaming-ready TVs, high-speed internet, and fully equipped living spaces keep families connected, comfortable, and productive throughout their stay.</p>
          </div>
          <div className="bg-card rounded-[16px] border border-white/5 p-8 flex flex-col gap-4" data-testid="card-exp-3">
            <MoveRight className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Seamless Transition</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Nova Havens coordinates move-in logistics directly with carriers and adjusters — so families focus on recovery, not paperwork or scheduling.</p>
          </div>
          <div className="bg-card rounded-[16px] border border-white/5 p-8 flex flex-col gap-4" data-testid="card-exp-4">
            <PawPrint className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Pet Friendly</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Nova Havens maintains a dedicated pool of pet-friendly verified properties. Tell your coordinator about your pets on the first call and they'll match accordingly.</p>
          </div>
          <div className="bg-card rounded-[16px] border border-white/5 p-8 flex flex-col gap-4" data-testid="card-exp-5">
            <PhoneCall className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">24/7 Support</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Nova Havens' coordination team is reachable around the clock. Emergency claims receive the same same-day response as weekday business hours.</p>
          </div>
          <div className="bg-card rounded-[16px] border border-white/5 p-8 flex flex-col gap-4" data-testid="card-exp-6">
            <Map className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Nationwide Network</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">With 20,000+ verified homes across every major metro and many rural areas in 48 states, Nova Havens places families close to their schools, workplaces, and community.</p>
          </div>
        </div>
      </section>

      {/* 6. Pet-Friendly Feature */}
      <section className="w-full bg-card border-y border-white/5 overflow-hidden">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row min-h-[500px]">
          <div className="w-full md:w-1/2 p-10 md:p-16 lg:p-20 flex flex-col justify-center items-start">
            <span className="text-[13px] font-bold tracking-widest uppercase mb-4" style={{ color: '#D4A24C' }} data-testid="eyebrow-pets">PET-FRIENDLY PROPERTIES</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-foreground leading-tight" data-testid="heading-pets">Your furry friends are welcome</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-md" data-testid="text-pets">
              Nova Havens maintains a growing network of verified pet-friendly furnished homes across 48 states — so displaced families never have to choose between a safe place to stay and bringing their pets along. Share your pet details on the first call and Nova Havens will match your family to a compatible home.
            </p>
            <Link href="/contact" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-colors bg-primary text-[#0A0C10] hover:brightness-105 rounded-full px-8 py-4" data-testid="btn-pets">
              Find Pet-Friendly Homes
            </Link>
          </div>
          <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-full">
            <img 
              src="/pet-friendly.webp" 
              alt="Cozy pet-friendly living room in a Nova Havens verified furnished home" 
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="absolute inset-0 bg-[#1A1D24] flex items-center justify-center p-8 text-center text-muted-foreground border-l border-white/5"><div class="flex flex-col items-center gap-4"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/50"><path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 1-3 3H5a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h1a3 3 0 0 1 3 3v1a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-1a3 3 0 0 1 3-3h1a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3h-1a3 3 0 0 1-3-3V5a3 3 0 0 0-3-3h-2Z"></path></svg><span>Cozy interior image loading...</span></div></div>';
              }}
              data-testid="img-pets"
            />
          </div>
        </div>
      </section>

      {/* 7. Where We Operate */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" data-testid="heading-map">Where Does Nova Havens Operate?</h2>
        
        <div className="w-full min-h-[350px] bg-card rounded-[16px] border border-white/10 flex flex-col items-center justify-center mb-12 relative overflow-hidden" data-testid="card-map">
          {/* Subtle grid pattern background for the map placeholder */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #F5F5F2 1px, transparent 1px), linear-gradient(to bottom, #F5F5F2 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          <Map className="w-12 h-12 text-[#F2CD6B] mb-4 z-10" />
          <span className="text-lg font-medium text-foreground z-10">Live property map — coming soon</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-white/5 rounded-[16px] p-8 text-center" data-testid="stat-card-properties">
            <div className="text-4xl font-extrabold text-[#F2CD6B] mb-2">12,000+</div>
            <div className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-2">Active Properties</div>
            <div className="text-xs text-muted-foreground/60 leading-relaxed">Nova Havens has 12,000+ active furnished properties available for placement at any given time, as of 2025.</div>
          </div>
          <div className="bg-card border border-white/5 rounded-[16px] p-8 text-center" data-testid="stat-card-states">
            <div className="text-4xl font-extrabold text-[#F2CD6B] mb-2">48</div>
            <div className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-2">States Covered</div>
            <div className="text-xs text-muted-foreground/60 leading-relaxed">Nova Havens operates in all 48 contiguous US states, serving families in both major metros and rural communities.</div>
          </div>
          <div className="bg-card border border-white/5 rounded-[16px] p-8 text-center" data-testid="stat-card-speed">
            <div className="text-4xl font-extrabold text-[#F2CD6B] mb-2">&lt; 5 Days</div>
            <div className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-2">Average Days to Place</div>
            <div className="text-xs text-muted-foreground/60 leading-relaxed">Nova Havens' average time from first contact to family move-in is under 5 days, as of 2025.</div>
          </div>
        </div>
      </section>

      {/* 8. Property Photo Showcase */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-[1200px] mx-auto w-full border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4" data-testid="heading-showcase">What Do Nova Havens Properties Look Like?</h2>
          <p className="text-lg text-muted-foreground" data-testid="subtitle-showcase">Every property in the Nova Havens network is verified, fully furnished, and ready for immediate occupancy.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "Bright furnished living room with modern sofa and open-plan kitchen — Nova Havens verified property",
            "Spacious master bedroom with quality linens and ample closet space — Nova Havens furnished home",
            "Well-equipped kitchen with full appliances, ready for immediate move-in — Nova Havens network property",
            "Cozy furnished bedroom in a Nova Havens temporary housing property",
            "Open dining and living area in a furnished home available for placement through Nova Havens",
            "Comfortable furnished home exterior — part of the Nova Havens 20,000+ property network",
          ].map((altText, idx) => (
            <div key={idx + 1} className="rounded-[16px] overflow-hidden aspect-[4/3] bg-card border border-white/10 relative group" data-testid={`card-photo-${idx + 1}`}>
              <img 
                src={`/property-${idx + 1}.webp`} 
                alt={altText} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `<div class="absolute inset-0 bg-[#1A1D24] flex items-center justify-center flex-col gap-3 text-muted-foreground"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg><span class="text-xs font-medium uppercase tracking-wider">Image ${idx + 1}</span></div>`;
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 9. Trusted Partnerships */}
      <section className="py-20 px-4 md:px-8 w-full bg-[#0D0F14] border-y border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3" data-testid="heading-partners">Which Insurance Carriers Does Nova Havens Work With?</h2>
            <p className="text-muted-foreground" data-testid="subtitle-partners">Nova Havens coordinates placements alongside the nation's leading insurance carriers, including:</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {["Allstate", "Travelers", "Farmers Insurance", "State Farm"].map((partner, idx) => (
              <div key={idx} className="bg-card border border-white/5 rounded-[12px] p-6 md:p-8 flex items-center justify-center" data-testid={`card-partner-${idx}`}>
                <span className="font-extrabold text-lg md:text-xl text-[#F5F5F2] tracking-tight">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. How It Works */}
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16" data-testid="heading-how-it-works">How Does Nova Havens Place Families?</h2>
        
        <Tabs defaultValue="adjusters" className="w-full flex flex-col items-center">
          <TabsList className="bg-card border border-white/10 p-1 rounded-full h-auto flex flex-col sm:flex-row w-full sm:w-auto mb-12" data-testid="tabs-how-it-works">
            <TabsTrigger value="adjusters" className="rounded-full px-6 py-3 text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-[#0A0C10] w-full sm:w-auto" data-testid="tab-adjusters">Adjusters & Carriers</TabsTrigger>
            <TabsTrigger value="families" className="rounded-full px-6 py-3 text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-[#0A0C10] w-full sm:w-auto" data-testid="tab-families">Displaced Families</TabsTrigger>
            <TabsTrigger value="owners" className="rounded-full px-6 py-3 text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-[#0A0C10] w-full sm:w-auto" data-testid="tab-owners">Property Owners</TabsTrigger>
          </TabsList>
          
          <TabsContent value="adjusters" className="w-full mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-6 left-[16.66%] right-[16.66%] h-[1px] bg-primary/30 z-0"></div>
              
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-adjusters-1">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[0_0_15px_rgba(212,162,76,0.15)]">1</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Submit a Claim</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">Share the claim details with Nova Havens via phone or portal — household size, location, pets, and accessibility needs</p>
              </div>
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-adjusters-2">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[0_0_15px_rgba(212,162,76,0.15)]">2</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Review Placement Options</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">Nova Havens surfaces verified homes within your parameters within hours — scored by suitability, proximity, and availability</p>
              </div>
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-adjusters-3">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[0_0_15px_rgba(212,162,76,0.15)]">3</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Approve & Coordinate</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">Nova Havens handles all logistics with the family directly and keeps you updated with proactive status notifications</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="families" className="w-full mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-6 left-[16.66%] right-[16.66%] h-[1px] bg-primary/30 z-0"></div>
              
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-families-1">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[0_0_15px_rgba(212,162,76,0.15)]">1</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Receive Your Options</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">Your adjuster or carrier connects you with Nova Havens — typically within hours of your ALE coverage being confirmed</p>
              </div>
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-families-2">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[0_0_15px_rgba(212,162,76,0.15)]">2</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Choose Your Home</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">Browse furnished options matched to your family's size, location, school district, pet needs, and accessibility requirements</p>
              </div>
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-families-3">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[0_0_15px_rgba(212,162,76,0.15)]">3</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Move In</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">Nova Havens coordinates move-in logistics with your carrier and the property owner — you get the keys and a direct line to your coordinator</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="owners" className="w-full mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-6 left-[16.66%] right-[16.66%] h-[1px] bg-primary/30 z-0"></div>
              
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-owners-1">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[0_0_15px_rgba(212,162,76,0.15)]">1</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Submit Your Property</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">Tell Nova Havens about your furnished home — location, size, amenities, pet policy, and availability</p>
              </div>
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-owners-2">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[0_0_15px_rgba(212,162,76,0.15)]">2</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Get Verified</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">A Nova Havens coordinator inspects and onboards your property into the network, verifying it meets our furnishing and safety standards</p>
              </div>
              <div className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4" data-testid="step-owners-3">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[0_0_15px_rgba(212,162,76,0.15)]">3</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Start Hosting</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">Nova Havens matches your property with displaced families and handles all coordination — you deal with us, not the family directly</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* 11. Reviews Carousel */}
      <section className="py-20 md:py-24 w-full bg-[#0D0F14] border-y border-white/5 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold" data-testid="heading-reviews">What Our Clients Say</h2>
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
                  <div className="bg-card rounded-[16px] p-8 md:p-10 border border-white/5 h-full flex flex-col hover:border-white/10 transition-colors">
                    <span className="text-5xl font-serif text-primary leading-none mb-4 inline-block">"</span>
                    <p className="text-lg text-foreground mb-8 flex-1 leading-relaxed">
                      {review.quote}
                    </p>
                    <div className="w-12 h-[1px] bg-white/10 mb-6"></div>
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
      <section className="py-20 md:py-24 px-4 md:px-8 max-w-[800px] mx-auto w-full" data-testid="section-faq">
        <div className="text-center mb-12">
          <span className="text-[13px] font-bold tracking-widest uppercase mb-4 block" style={{ color: '#D4A24C' }}>COMMON QUESTIONS</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="bg-card rounded-[16px] border border-white/10 overflow-hidden"
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
      <section className="w-full bg-primary py-12 px-4 text-[#0A0C10]">
        <div className="max-w-[800px] mx-auto text-center flex flex-col items-center gap-4">
          <Phone className="w-8 h-8" />
          <a href="tel:6294010054" className="text-4xl md:text-5xl font-extrabold hover:opacity-80 transition-opacity" data-testid="link-emergency-phone">
            (629) 401-0054
          </a>
          <p className="text-base md:text-lg font-medium opacity-90" data-testid="text-emergency-desc">
            Nova Havens is available 24/7 for emergency housing claims and placement inquiries
          </p>
        </div>
      </section>

      {/* 13. Closing CTA Band */}
      <section className="py-24 px-4 md:px-8 w-full bg-card">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-foreground" data-testid="heading-cta">Ready to get started with Nova Havens?</h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed" data-testid="subtitle-cta">
            Request emergency furnished housing for a displaced family, or join our network as a property owner — Nova Havens responds to both 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center justify-center whitespace-nowrap text-base font-bold transition-colors bg-primary text-[#0A0C10] hover:brightness-105 rounded-full px-8 py-4 w-full sm:w-auto" data-testid="btn-cta-primary">
              Start a Housing Request
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center whitespace-nowrap text-base font-bold transition-colors border border-primary text-primary hover:brightness-105 rounded-full px-8 py-4 w-full sm:w-auto" data-testid="btn-cta-secondary">
              Submit Property Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
