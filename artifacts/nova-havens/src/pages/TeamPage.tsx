import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'wouter';
import { Phone, Mail, HeartHandshake, Clock, ShieldCheck } from 'lucide-react';
import { TEAM_MEMBERS, type TeamMember, type TeamMemberProfile } from '@/data/teamMembers';
import TeamMemberModal from '@/components/TeamMemberModal';

/** Shape of one member in the synced team/team.json (see scripts/sync-team.js). */
interface SyncedMember {
  name: string;
  slug: string;
  role: string;
  initials: string;
  photo: string | null;
  help: string;
  favouritePart: string;
  foods: string;
  laugh: string;
  spareTime: string;
}

const ANSWER_KEYS = ['help', 'favouritePart', 'foods', 'laugh', 'spareTime'] as const;

function isSyncedMember(value: unknown): value is SyncedMember {
  if (typeof value !== 'object' || value === null) return false;
  const member = value as Record<string, unknown>;
  return (
    typeof member.name === 'string' &&
    member.name.trim().length > 0 &&
    typeof member.initials === 'string' &&
    (member.photo === null || typeof member.photo === 'string') &&
    ANSWER_KEYS.every((key) => typeof member[key] === 'string')
  );
}

/** team/ photo keys are served through the API server. */
function photoUrlFor(key: string): string {
  return `${import.meta.env.BASE_URL}api/team/images/${key.replace(/^team\//, '')}`;
}

function toTeamMember(synced: SyncedMember): TeamMember {
  const profile = {} as TeamMemberProfile;
  for (const key of ANSWER_KEYS) profile[key] = synced[key];
  return {
    name: synced.name.trim(),
    role: synced.role || undefined,
    initials: synced.initials,
    profile,
    photoUrl: synced.photo ? photoUrlFor(synced.photo) : null,
  };
}

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

function memberTestId(member: TeamMember): string {
  return `card-team-${member.name.toLowerCase().replace(/\s+/g, '-')}`;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  // Photos that failed to load fall back to the initials avatar.
  const [failedPhotos, setFailedPhotos] = useState<ReadonlySet<string>>(new Set());
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const markPhotoFailed = (url: string) => {
    setFailedPhotos((prev) => (prev.has(url) ? prev : new Set(prev).add(url)));
  };

  // The live roster is synced daily into Object Storage (scripts/sync-team.js)
  // and served at /api/team/team.json. On any failure the hardcoded fallback
  // list stays in place — the page never renders empty.
  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}api/team/team.json`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data: { members?: unknown }) => {
        if (cancelled || !Array.isArray(data?.members)) return;
        const synced = data.members.filter(isSyncedMember).map(toTeamMember);
        if (synced.length > 0) setMembers(synced);
      })
      .catch(() => {
        /* fallback list already rendered */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Staggered fade-and-rise as cards scroll into view. Skipped entirely for
  // users with prefers-reduced-motion (cards render visible immediately).
  // Re-runs when the member list changes so async-synced cards get observed too.
  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!cards || cards.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cards.forEach((card) => card.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [members]);

  const openProfile = (member: TeamMember, trigger: HTMLElement) => {
    lastTriggerRef.current = trigger;
    setActiveMember(member);
  };

  const closeProfile = () => {
    setActiveMember(null);
    lastTriggerRef.current?.focus();
    lastTriggerRef.current = null;
  };

  // On desktop the grid is 6 columns with each card spanning 2. Center a
  // partial last row: two cards shift right one column (start at col 2), a
  // lone card shifts two (start at col 3).
  const lastRowCount = members.length % 3;
  const centerRowClass = (idx: number) => {
    if (lastRowCount === 2 && idx === members.length - 2) return ' lg:col-start-2';
    if (lastRowCount === 1 && idx === members.length - 1) return ' lg:col-start-3';
    return '';
  };

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="bg-background pt-24 pb-16 px-4 md:px-8 border-b border-white/10">
        <div className="mx-auto max-w-section w-full text-center">
          <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-4">Our People</p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-6"
            data-testid="heading-team-title"
          >
            Meet the <span className="text-foreground">Nova Havens Team</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto" data-testid="text-team-intro">
            Nova Havens was founded on the belief that displaced families deserve more than a transactional housing placement — they deserve a coordinated, compassionate team that handles every detail from first call to move-in. Below, meet the coordinators and family advocates you'll work with directly — the people who bring that founding mission to life, 24 hours a day.
          </p>
        </div>
      </section>

      {/* Team grid */}
      <section className="py-16 px-4 md:px-8">
        <div className="mx-auto max-w-section w-full">
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
            {members.map((member, idx) => {
              const delay = { '--reveal-delay': `${(idx % 3) * 70}ms` } as CSSProperties;

              return (
                <div
                  key={member.name}
                  data-reveal
                  style={delay}
                  className={`team-card-reveal lg:col-span-2${centerRowClass(idx)}`}
                >
                  <button
                    type="button"
                    className="team-card-interactive w-full h-full bg-card rounded-lg border border-white/[0.08] p-8 flex flex-col items-center text-center"
                    onClick={(event) => openProfile(member, event.currentTarget)}
                    aria-haspopup="dialog"
                    data-testid={memberTestId(member)}
                  >
                    {member.photoUrl && !failedPhotos.has(member.photoUrl) ? (
                      <img
                        src={member.photoUrl}
                        alt={`Portrait of ${member.name}`}
                        className="w-20 h-20 rounded-full border border-primary/60 object-cover object-center mb-5"
                        loading="lazy"
                        onError={() => markPhotoFailed(member.photoUrl as string)}
                      />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-full bg-surface-1 border border-primary/60 flex items-center justify-center mb-5"
                        aria-hidden="true"
                      >
                        <span className="text-xl font-extrabold text-primary">{member.initials}</span>
                      </div>
                    )}
                    <span className="text-lg font-bold text-foreground mb-1">{member.name}</span>
                    {member.role && (
                      <span className="text-sm font-semibold text-primary">{member.role}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
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
              <div
                key={value.title}
                className="bg-card rounded-lg border border-white/[0.08] p-8"
                data-testid={`card-value-${value.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <value.icon className="w-8 h-8 text-primary mb-4" aria-hidden="true" />
                <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 md:px-8 border-t border-white/10">
        <div className="mx-auto max-w-prose w-full">
          <div className="bg-card rounded-lg border border-white/[0.08] p-8 md:p-12 text-center" data-testid="card-team-cta">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Talk to a real person, right now</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              No phone trees, no ticket queues. Reach the Nova Havens coordination team directly — 24/7 for emergency housing claims.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:+16294010054"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:brightness-105 transition-all"
                data-testid="link-team-call"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                Call (629) 401-0054
              </a>
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

      {activeMember && <TeamMemberModal member={activeMember} onClose={closeProfile} />}
    </div>
  );
}
