import { useEffect } from 'react';
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
    bio: "Alexandra founded Nova Havens after coordinating housing for her own family following a house fire — an experience that revealed how fragmented and impersonal the insurance housing process had become. She leads Nova Havens' overall strategy, carrier partnerships, and vision for compassionate, technology-assisted placement.",
    initials: 'AR',
  },
  {
    name: 'Marcus Whitfield',
    role: 'Head of Carrier Relations',
    bio: 'Marcus brings 14 years of large-loss adjuster experience to Nova Havens. As Head of Carrier Relations, he manages all insurer partnerships, ensures documentation meets carrier standards, and trains the coordination team on claims-specific communication and compliance.',
    initials: 'MW',
  },
  {
    name: 'Priya Natarajan',
    role: 'Director of Placements',
    bio: 'Priya leads the Nova Havens placement team responsible for matching displaced households to verified homes nationwide. Her expertise spans ALE policy interpretation, school-district proximity matching, pet-accommodation logistics, and multi-family accessibility requirements.',
    initials: 'PN',
  },
  {
    name: 'Daniel Okafor',
    role: 'Property Network Manager',
    bio: "Daniel oversees the growth and quality of Nova Havens' 20,000+ verified furnished property network across 48 states. As Property Network Manager, he sets inspection standards, manages property owner relationships, and ensures every listing meets the same livability benchmark.",
    initials: 'DO',
  },
  {
    name: 'Sofia Marchetti',
    role: 'Claims Coordination Lead',
    bio: 'Sofia manages the active-placement lifecycle for Nova Havens — extensions, adjuster updates, property adjustments, and move-out coordination. Her role as Claims Coordination Lead ensures that adjusters receive proactive status notifications without having to follow up.',
    initials: 'SM',
  },
  {
    name: 'James Calloway',
    role: 'Family Support Specialist',
    bio: 'James is typically the first Nova Havens voice a displaced family hears. As Family Support Specialist, he guides households through every step of the placement process — from the initial needs assessment to move-in day — with empathy, clarity, and 24/7 availability.',
    initials: 'JC',
  },
];

const VALUES = [
  {
    icon: HeartHandshake,
    title: 'Families first',
    text: 'Every placement decision at Nova Havens starts with the household — their needs, their pets, their routines, and the specific details that make a temporary place feel like home.',
  },
  {
    icon: Clock,
    title: 'Around the clock',
    text: 'Disasters don\u2019t keep business hours. Nova Havens coordinates emergency placements 24/7 — the team is reachable at (629) 401-0054 at any hour for urgent claims.',
  },
  {
    icon: ShieldCheck,
    title: 'Carrier-grade rigor',
    text: 'Nova Havens delivers clean documentation, transparent pricing, and proactive status updates on every file — the standard insurance carriers need to keep claims moving.',
  },
];

export default function TeamPage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'jsonld-team';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'Meet the Nova Havens Team',
      description: 'The coordinators, carrier specialists, and family advocates behind Nova Havens.',
      url: 'https://novahavens.com/meet-the-team',
    });
    document.head.appendChild(script);
    return () => document.getElementById('jsonld-team')?.remove();
  }, []);

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
            Meet the <span className="text-[#D4A24C]">Nova Havens Team</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto" data-testid="text-team-intro">
            Nova Havens was founded on the belief that displaced families deserve more than a transactional housing placement — they deserve a coordinated, compassionate team that handles every detail from first call to move-in. Behind every placement is a group of coordinators, carrier specialists, and family advocates who bring that founding mission to life, 24 hours a day.
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
            <p className="text-sm uppercase tracking-widest text-[#D4A24C] font-semibold mb-4">How Nova Havens Works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              What every Nova Havens team member is accountable for
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
              No phone trees, no ticket queues. Reach the Nova Havens coordination team directly — 24/7 for emergency housing claims.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:+16294010054"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#D4A24C] text-[#0A0C10] font-bold text-sm hover:brightness-105 transition-all"
                data-testid="link-team-call"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                Call (629) 401-0054
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-[#D4A24C] text-[#D4A24C] font-bold text-sm hover:bg-[#D4A24C]/10 transition-all"
                data-testid="link-team-contact"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                Send a Message
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
