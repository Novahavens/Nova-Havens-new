import { Link } from 'wouter';
import { ArrowRight, CheckCircle2, Heart, Home, ShieldCheck, Users } from 'lucide-react';

const PRINCIPLES = [
  {
    icon: Heart,
    title: 'Human before housing',
    text: 'A temporary home is more than an address. We listen for the details that make a place feel steady, familiar, and safe.',
  },
  {
    icon: ShieldCheck,
    title: 'Built for the claim',
    text: 'Our coordination is designed around the pace, documentation, and accountability insurance teams need to keep claims moving.',
  },
  {
    icon: Home,
    title: 'Quality you can feel',
    text: 'Every property in our network is selected with comfort, cleanliness, location, and real-life household needs in mind.',
  },
  {
    icon: Users,
    title: 'One connected team',
    text: 'Families, carriers, adjusters, and property owners get one responsive partner from the first call through move-out.',
  },
];

const DIFFERENTIATORS = [
  'Nationwide furnished housing coordination',
  'A single point of contact for every placement',
  'Proactive updates for adjusters and families',
  'Pet-friendly, accessible, and family-ready options',
];

export default function AboutPage() {
  return (
    <div className="w-full">
      <section className="bg-background pt-24 pb-16 px-4 md:px-8 border-b border-white/10">
        <div className="mx-auto max-w-[1100px] w-full">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-widest text-[#D4A24C] font-semibold mb-4">About Nova Havens</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-6" data-testid="heading-about-title">
              A better place to land when life is turned upside down.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl" data-testid="text-about-intro">
              Nova Havens coordinates furnished housing for families displaced by property loss — bringing compassion, clarity, and dependable execution to an experience that is anything but simple.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 px-4 md:px-8">
        <div className="mx-auto max-w-[1100px] w-full grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest text-[#D4A24C] font-semibold mb-4">Why we exist</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-6">
              The logistics matter. So does how people feel.
            </h2>
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                A fire, flood, or other covered loss can disrupt every part of a family’s life at once. Finding somewhere to sleep is only the beginning. Families need a place that works for their routines, their pets, their schools, and their sense of normal.
              </p>
              <p>
                We built Nova Havens to make that transition easier. Our team connects insurance professionals and displaced households with thoughtfully furnished homes, then stays close to the details until the placement is complete.
              </p>
            </div>
            <Link
              href="/meet-the-team"
              className="inline-flex items-center gap-2 mt-8 text-[#D4A24C] font-bold hover:gap-3 transition-all"
              data-testid="link-about-team"
            >
              Meet the people behind the work
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="bg-[#111318] rounded-[16px] border border-white/[0.08] p-8 md:p-10">
            <p className="text-sm uppercase tracking-widest text-[#D4A24C] font-semibold mb-6">Our promise</p>
            <blockquote className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-8">
              “Make the next step feel possible.”
            </blockquote>
            <div className="space-y-4">
              {DIFFERENTIATORS.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#F2CD6B] mt-0.5 shrink-0" aria-hidden="true" />
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
            <p className="text-sm uppercase tracking-widest text-[#D4A24C] font-semibold mb-4">How we show up</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">The principles behind every placement</h2>
            <p className="text-muted-foreground leading-relaxed">
              We bring the same standard to every household, carrier relationship, and property in our network.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="bg-[#111318] rounded-[16px] border border-white/[0.08] p-7">
                <principle.icon className="w-8 h-8 text-[#D4A24C] mb-5" aria-hidden="true" />
                <h3 className="text-lg font-bold text-foreground mb-2">{principle.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{principle.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 border-t border-white/10">
        <div className="mx-auto max-w-[760px] w-full">
          <div className="bg-[#111318] rounded-[16px] border border-white/[0.08] p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Let’s make the next step easier</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Whether you are coordinating a claim, searching for a temporary home, or opening your property to families who need it, we are ready to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#D4A24C] text-[#0A0C10] font-bold text-sm hover:brightness-105 transition-all"
                data-testid="link-about-contact"
              >
                Talk with our team
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/meet-the-team"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-[#D4A24C] text-[#D4A24C] font-bold text-sm hover:bg-[#D4A24C]/10 transition-all"
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