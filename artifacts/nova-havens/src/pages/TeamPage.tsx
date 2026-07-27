import { Link } from 'wouter';
import { Phone, Mail, HeartHandshake, Clock, ShieldCheck } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
}

const TEAM: TeamMember[] = [
  {
    name: 'Alexandra Reyes',
    role: 'Founder & CEO',
    bio: 'After coordinating housing for her own family following a house fire, Alexandra founded Nova Havens to make displacement less traumatic for every family that follows.',
    initials: 'AR',
  },
  {
    name: 'Marcus Whitfield',
    role: 'Head of Carrier Relations',
    bio: 'A former large-loss adjuster with 14 years in the field, Marcus speaks fluent claims — and makes sure carriers get documentation the way they need it.',
    initials: 'MW',
  },
  {
    name: 'Priya Natarajan',
    role: 'Director of Placements',
    bio: 'Priya leads the team that matches displaced households to homes nationwide, balancing school districts, pets, accessibility needs, and claim budgets.',
    initials: 'PN',
  },
  {
    name: 'Daniel Okafor',
    role: 'Property Network Manager',
    bio: 'Daniel builds and vets our network of furnished properties across 48 states, holding every listing to the same standard: would we place our own family here?',
    initials: 'DO',
  },
  {
    name: 'Sofia Marchetti',
    role: 'Claims Coordination Lead',
    bio: 'Sofia keeps every placement moving — extensions, adjustments, and check-ins — so adjusters always know the status without having to ask.',
    initials: 'SM',
  },
  {
    name: 'James Calloway',
    role: 'Family Support Specialist',
    bio: 'James is often the first voice a displaced family hears. He walks households through every step, from the first call to move-in day.',
    initials: 'JC',
  },
];

const VALUES = [
  {
    icon: HeartHandshake,
    title: 'Families first',
    text: 'Every placement decision starts with the household — their needs, their pets, their routines.',
  },
  {
    icon: Clock,
    title: 'Around the clock',
    text: 'Disasters don\u2019t keep business hours. Neither do we — our team is reachable 24/7 for emergency claims.',
  },
  {
    icon: ShieldCheck,
    title: 'Carrier-grade rigor',
    text: 'Clean documentation, transparent pricing, and proactive updates on every file, every time.',
  },
];

export default function TeamPage() {
  // Title/description/OG tags are applied centrally by useRouteMeta (App.tsx).
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="bg-background pt-24 pb-16 px-4 md:px-8 border-b border-white/10">
        <div className="mx-auto max-w-[1100px] w-full text-center">
          <p className="text-sm uppercase tracking-widest text-[#D4A24C] font-semibold mb-4">Our People</p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-6"
            data-testid="heading-team-title"
          >
            Meet the <span className="text-[#D4A24C]">Team</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto" data-testid="text-team-intro">
            Behind every placement is a team of coordinators, carrier specialists, and family advocates
            who treat your claim like it's their own family being displaced.
          </p>
        </div>
      </section>

      {/* Team grid */}
      <section className="py-16 px-4 md:px-8">
        <div className="mx-auto max-w-[1100px] w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="bg-[#111318] rounded-[16px] border border-white/[0.08] p-8 flex flex-col items-center text-center hover:border-[#D4A24C]/30 transition-colors"
                data-testid={`card-team-${member.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4A24C] to-[#8a6a2e] flex items-center justify-center mb-5"
                  aria-hidden="true"
                >
                  <span className="text-xl font-extrabold text-[#0A0C10]">{member.initials}</span>
                </div>
                <h2 className="text-lg font-bold text-foreground mb-1">{member.name}</h2>
                <p className="text-sm font-semibold text-[#F2CD6B] mb-4">{member.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 md:px-8 border-t border-white/10">
        <div className="mx-auto max-w-[1100px] w-full">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-[#D4A24C] font-semibold mb-4">How We Work</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              What every team member signs up for
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="bg-[#111318] rounded-[16px] border border-white/[0.08] p-8"
                data-testid={`card-value-${value.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <value.icon className="w-8 h-8 text-[#D4A24C] mb-4" aria-hidden="true" />
                <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 md:px-8 border-t border-white/10">
        <div className="mx-auto max-w-[760px] w-full">
          <div className="bg-[#111318] rounded-[16px] border border-white/[0.08] p-8 md:p-12 text-center" data-testid="card-team-cta">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Talk to a real person, right now</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              No phone trees, no ticket queues. Reach our coordination team directly — 24/7 for emergency claims.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:+16294010054"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#D4A24C] text-[#0A0C10] font-bold text-sm hover:brightness-105 transition-all"
                data-testid="link-team-call"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                (629) 401-0054
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-[#D4A24C] text-[#D4A24C] font-bold text-sm hover:bg-[#D4A24C]/10 transition-all"
                data-testid="link-team-contact"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
