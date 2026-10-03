import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, HeartHandshake, Mail, Phone, ShieldCheck } from 'lucide-react';

import { JsonLd } from '@/components/shared/json-ld';
import { TrackedAnchor } from '@/components/shared/tracked-link';
import { TeamGrid } from '@/components/team/team-grid';
import { CONTACT, SERVICE_AREA } from '@/config/site';
import { pageMetadata, teamSchema } from '@/lib/seo';
import { getTeamRoster } from '@/lib/team';

const DESCRIPTION = `Nova Havens is staffed by coordinators and family advocates who manage furnished housing placements across all ${SERVICE_AREA.usName}.`;

export const metadata: Metadata = pageMetadata({
  title: 'Meet the Team',
  description: DESCRIPTION,
  path: '/meet-the-team',
});

const GIVE_VALUES = [
  { letter: 'G', title: 'Give a damn' },
  { letter: 'I', title: 'Integrity' },
  { letter: 'V', title: 'Value' },
  { letter: 'E', title: 'Efficiency' },
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
    text: `Disasters don’t keep business hours. Nova Havens coordinates emergency placements 24/7 — the team is reachable at ${CONTACT.phone.display} at any hour for urgent claims.`,
  },
  {
    icon: ShieldCheck,
    title: 'Reliable documentation',
    text: 'Nova Havens delivers clean documentation, transparent pricing, and proactive status updates on every placement — so families and property owners have clear information throughout the stay.',
  },
];

export default function TeamPage() {
  const members = getTeamRoster();

  return (
    <div className="w-full">
      <JsonLd data={teamSchema(members)} />

      <section className="bg-background pt-24 pb-16 px-4 md:px-8 border-b border-white/10">
        <div className="mx-auto max-w-section w-full text-center">
          <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-4">Our People</p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-6"
            data-testid="heading-team-title"
          >
            Meet the Nova Havens Team
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Nova Havens was founded on the belief that displaced families deserve more than a transactional housing
            placement — they deserve a coordinated, compassionate team that handles every detail from first call to
            move-in. Below, meet the coordinators and family advocates you&apos;ll work with directly — the people who
            bring that founding mission to life, 24 hours a day.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8">
        <div className="mx-auto max-w-section w-full">
          <TeamGrid members={members} />

          <div
            className="mt-16 bg-card rounded-lg border border-white/[0.08] p-8 md:p-10"
            data-testid="block-give-values"
          >
            <div className="text-center mb-8">
              <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-3">Our Values</p>
              <p className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                A home when you need it most.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {GIVE_VALUES.map((value) => (
                <div key={value.title} className="bg-surface-1 rounded-lg border border-white/[0.08] p-5 text-center">
                  <span className="block text-sm font-extrabold tracking-widest text-primary mb-2" aria-hidden="true">
                    {value.letter}
                  </span>
                  <span className="block text-base font-bold text-foreground">{value.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 border-t border-white/10">
        <div className="mx-auto max-w-section w-full">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-4">How Nova Havens Works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              What every Nova Havens team member is accountable for
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((value) => (
              <article key={value.title} className="bg-card rounded-lg border border-white/[0.08] p-8">
                <value.icon className="w-8 h-8 text-primary mb-4" aria-hidden="true" />
                <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 border-t border-white/10">
        <div className="mx-auto max-w-prose w-full">
          <div
            className="bg-card rounded-lg border border-white/[0.08] p-8 md:p-12 text-center"
            data-testid="card-team-cta"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Talk to a real person, right now</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              No phone trees, no ticket queues. Reach the Nova Havens coordination team directly — 24/7 for emergency
              housing claims.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <TrackedAnchor
                href={CONTACT.phone.href}
                event="contact_link_click"
                data={{ method: 'phone', location: 'team_cta' }}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:brightness-105 transition-all"
                data-testid="link-team-call"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                Call {CONTACT.phone.display}
              </TrackedAnchor>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-primary text-primary font-bold text-sm hover:bg-primary/10 transition-all"
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
