import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, CheckCircle2, ChevronDown, Heart, Home, ShieldCheck, Users } from 'lucide-react';

const PRINCIPLES = [
  {
    icon: Heart,
    title: 'Human before housing',
    text: 'A temporary home is more than an address. Nova Havens listens for the details that make a place feel steady, familiar, and safe — school districts, pet needs, accessibility, and routines.',
  },
  {
    icon: ShieldCheck,
    title: 'Built for the insurance claim',
    text: "Nova Havens' coordination is designed around the pace, documentation, and accountability insurance teams need — so claims keep moving and families aren't waiting on paperwork.",
  },
  {
    icon: Home,
    title: 'Quality you can feel',
    text: "Every property in the Nova Havens network is selected with comfort, cleanliness, location, and real-life household needs in mind. Properties are inspected before they go into inventory.",
  },
  {
    icon: Users,
    title: 'One connected team',
    text: 'Families, carriers, adjusters, and property owners get one responsive Nova Havens partner from the first call through move-out — never a phone tree or ticket queue.',
  },
];

const DIFFERENTIATORS = [
  'Nationwide furnished housing coordination across 48 contiguous US states',
  'A single dedicated point of contact for every placement',
  'Proactive status updates for adjusters and families throughout the stay',
  'Pet-friendly, accessible, and family-ready options in the network',
];

const ABOUT_FAQ = [
  {
    question: "Who does Nova Havens serve?",
    answer: "Nova Havens serves three groups: displaced families who need furnished housing after a covered property loss; insurance carriers and independent adjusters who need a reliable, carrier-aligned housing coordinator; and property owners who want to list their furnished homes in a vetted network. All three are served through one coordinated team based in Nashville, TN."
  },
  {
    question: "What makes Nova Havens different from other relocation companies?",
    answer: "Nova Havens is purpose-built for the insurance housing workflow. Unlike general relocation companies, Nova Havens assigns a single coordinator to each claim, bills carriers directly under ALE coverage, provides proactive documentation updates adjusters need, and operates a verified property network — not a third-party listing marketplace. As of 2025, Nova Havens operates across all 48 contiguous US states."
  },
  {
    question: "How does Nova Havens verify its properties?",
    answer: "Every property in the Nova Havens network is inspected by a Nova Havens coordinator before being listed. The inspection covers furnishing standards (beds with linens, stocked kitchen, Wi-Fi, washer/dryer), safety conditions, and overall livability. Properties that don't meet the standard are not added to the network. Nova Havens maintains 20,000+ verified homes as of 2025."
  },
  {
    question: "Does Nova Havens handle billing with insurance carriers directly?",
    answer: "Yes. When a family's Additional Living Expenses (ALE) coverage is active, Nova Havens bills the insurance carrier or adjuster directly — so the displaced family typically pays nothing out of pocket for housing. Nova Havens works with carriers including Allstate, Travelers, Farmers Insurance, State Farm, and others."
  },
  {
    question: "Where is Nova Havens headquartered?",
    answer: "Nova Havens is headquartered in Nashville, Tennessee, and operates nationwide across all 48 contiguous US states. The company can be reached at (629) 401-0054 or info@novahavens.com."
  }
];

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="w-full">
      <section className="bg-background pt-24 pb-16 px-4 md:px-8 border-b border-white/10">
        <div className="mx-auto max-w-[1100px] w-full">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-4">About Nova Havens</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-6" data-testid="heading-about-title">
              A better place to land when life is turned upside down.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl" data-testid="text-about-intro">
              Nova Havens is a Nashville, TN-based furnished housing coordination company that places families displaced by fire, water, or mold damage into verified furnished homes — working directly with insurance carriers, adjusters, and relocation specialists across all 48 contiguous US states. Nova Havens handles the logistics, documentation, and family communication so adjusters can focus on the claim.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 px-4 md:px-8">
        <div className="mx-auto max-w-[1100px] w-full grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-4">Why Nova Havens Exists</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-6">
              What Problem Does Nova Havens Solve?
            </h2>
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                A fire, flood, or covered property loss disrupts every part of a family's life at once. Finding somewhere to sleep is only the beginning. Families need a place that works for their routines, their pets, their schools, and their children's sense of normal.
              </p>
              <p>
                Nova Havens was built to solve the coordination gap between insurance carriers and displaced families. The team connects insurance professionals and displaced households with inspected, fully furnished homes — then stays close to every detail until the placement is complete, the stay is extended, or the family returns home.
              </p>
            </div>
            <Link
              href="/meet-the-team"
              className="inline-flex items-center gap-2 mt-8 text-primary font-bold hover:gap-3 transition-all"
              data-testid="link-about-team"
            >
              Meet the people behind the work
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="bg-card rounded-[16px] border border-white/[0.08] p-8 md:p-10">
            <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-6">Our promise</p>
            <blockquote className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-8">
              "Make the next step feel possible."
            </blockquote>
            <div className="space-y-4">
              {DIFFERENTIATORS.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 px-4 md:px-8 border-t border-white/10">
        <div className="mx-auto max-w-[1100px] w-full">
          <div className="max-w-2xl mb-10">
            <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-4">How Nova Havens Shows Up</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">What Principles Guide Every Nova Havens Placement?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nova Havens applies the same standard to every household, carrier relationship, and property in its network — regardless of claim size or market.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="bg-card rounded-[16px] border border-white/[0.08] p-7">
                <principle.icon className="w-8 h-8 text-primary mb-5" aria-hidden="true" />
                <h3 className="text-lg font-bold text-foreground mb-2">{principle.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{principle.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About FAQ */}
      <section className="py-16 md:py-20 px-4 md:px-8 border-t border-white/10" data-testid="section-about-faq">
        <div className="mx-auto max-w-[760px] w-full">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-4">Common Questions</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Questions About Nova Havens</h2>
          </div>
          <div className="space-y-3">
            {ABOUT_FAQ.map((item, idx) => (
              <div
                key={idx}
                className="bg-card rounded-[16px] border border-white/[0.08] overflow-hidden"
                data-testid={`about-faq-item-${idx + 1}`}
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
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 border-t border-white/10">
        <div className="mx-auto max-w-[760px] w-full">
          <div className="bg-card rounded-[16px] border border-white/[0.08] p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Let's make the next step easier</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Whether you are coordinating an insurance claim, a displaced family searching for a furnished home, or a property owner ready to join the Nova Havens network — contact us to get started.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:brightness-105 transition-all"
                data-testid="link-about-contact"
              >
                Talk with our team
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/meet-the-team"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-primary text-primary font-bold text-sm hover:bg-primary/10 transition-all"
                data-testid="link-about-meet-team"
              >
                Meet the team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
