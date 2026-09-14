import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Link } from 'wouter';
import { Phone, Mail, HeartHandshake, Clock, ShieldCheck } from 'lucide-react';
import { TEAM_MEMBERS, type TeamMember, type TeamMemberProfile } from '@/data/teamMembers';
import TeamMemberModal from '@/components/TeamMemberModal';
import { trackEvent } from '@/lib/analytics';

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
  const hasProfile = ANSWER_KEYS.some((key) => synced[key].trim().length > 0);
  return {
    name: synced.name.trim(),
    role: synced.role || undefined,
    initials: synced.initials,
    profile: hasProfile ? profile : undefined,
    photoUrl: synced.photo ? photoUrlFor(synced.photo) : null,
  };
}

function rosterKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

/**
 * Prefer the synced record for people it knows about, while retaining newly
 * added fallback entries until the next successful roster sync publishes them.
 */
function mergeRoster(synced: TeamMember[]): TeamMember[] {
  const syncedNames = new Set(synced.map((member) => rosterKey(member.name)));
  return [
    ...synced,
    ...TEAM_MEMBERS.filter((member) => !syncedNames.has(rosterKey(member.name))),
  ];
}

/** GIVE — the core values shown alongside the mission in the Our People section. */
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
  const [activeMember, setActiveMember] = useState<(TeamMember & { profile: TeamMemberProfile }) | null>(null);
  // Photos that failed to load fall back to the initials avatar.
  const [failedPhotos, setFailedPhotos] = useState<ReadonlySet<string>>(new Set());
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const markPhotoFailed = (url: string) => {
    setFailedPhotos((prev) => (prev.has(url) ? prev : new Set(prev).add(url)));
  };

  // The live roster is synced daily into Object Storage (scripts/sync-team.js)
  // and served at /api/team/team.json. Synced people replace their fallback
  // records, while newly added fallback entries remain visible until the next
  // successful sync publishes them.
  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}api/team/team.json`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data: { members?: unknown }) => {
        if (cancelled || !Array.isArray(data?.members)) return;
        const synced = data.members.filter(isSyncedMember).map(toTeamMember);
        if (synced.length > 0) setMembers(mergeRoster(synced));
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

  const openProfile = (member: TeamMember & { profile: TeamMemberProfile }, trigger: HTMLElement) => {
    lastTriggerRef.current = trigger;
    setActiveMember(member);
    trackEvent('team_member_viewed', { member: member.name });
  };

  const closeProfile = () => {
    setActiveMember(null);
    lastTriggerRef.current?.focus();
    lastTriggerRef.current = null;
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
              const profile = member.profile;
              const cardClass = `w-full h-full bg-card rounded-lg border border-white/[0.08] p-8 flex flex-col items-center text-center${profile ? ' team-card-interactive' : ''}`;
              const cardBody = (
                <>
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
                </>
              );

              return (
                <div
                  key={member.name}
                  data-reveal
                  style={delay}
                  className="team-card-reveal lg:col-span-2"
                >
                  {profile ? (
                    <button
                      type="button"
                      className={cardClass}
                      onClick={(event: MouseEvent<HTMLButtonElement>) =>
                        openProfile({ ...member, profile }, event.currentTarget)
                      }
                      aria-haspopup="dialog"
                      data-testid={memberTestId(member)}
                    >
                      {cardBody}
                    </button>
                  ) : (
                    <div className={cardClass} data-testid={memberTestId(member)}>
                      {cardBody}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* GIVE core values */}
          <div className="mt-16 bg-card rounded-lg border border-white/[0.08] p-8 md:p-10" data-testid="block-give-values">
            <div className="text-center mb-8">
              <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-3">Our Values</p>
              <p className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground" data-testid="text-team-mission">
                A home when you need it most.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {GIVE_VALUES.map((value) => (
                <div
                  key={value.title}
                  className="bg-surface-1 rounded-lg border border-white/[0.08] p-5 text-center"
                  data-testid={`card-give-${value.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span className="block text-sm font-extrabold tracking-widest text-primary mb-2" aria-hidden="true">{value.letter}</span>
                  <span className="block text-base font-bold text-foreground">{value.title}</span>
                </div>
              ))}
            </div>
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
