'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';

import { PROFILE_SECTIONS, type TeamMember, type TeamMemberProfile } from '@/content/team';
import { trackEvent } from '@/lib/analytics';
import { TeamMemberModal } from './team-member-modal';

function memberTestId(member: TeamMember): string {
  return `card-team-${member.name.toLowerCase().replace(/\s+/g, '-')}`;
}

/**
 * Team cards with a staggered reveal and a profile dialog. The roster is
 * resolved on the server (src/lib/team.ts) and passed in as props, so the
 * full list is in the HTML for crawlers. Each member's profile is also
 * rendered as visually-hidden text so the content is indexable without a click.
 */
export function TeamGrid({ members }: { members: TeamMember[] }) {
  const [activeMember, setActiveMember] = useState<(TeamMember & { profile: TeamMemberProfile }) | null>(null);
  const [failedPhotos, setFailedPhotos] = useState<ReadonlySet<string>>(new Set());
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
    <>
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        {members.map((member, idx) => {
          const delay = { '--reveal-delay': `${(idx % 3) * 70}ms` } as CSSProperties;
          const profile = member.profile;
          const cardClass = `w-full h-full bg-card rounded-lg border border-white/[0.08] p-8 flex flex-col items-center text-center${profile ? ' team-card-interactive' : ''}`;
          const body = (
            <>
              {member.photoUrl && !failedPhotos.has(member.photoUrl) ? (
                <Image
                  src={member.photoUrl}
                  alt={`Portrait of ${member.name}`}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full border border-primary/60 object-cover object-center mb-5"
                  onError={() => setFailedPhotos((prev) => new Set(prev).add(member.photoUrl as string))}
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
              {member.role ? <span className="text-sm font-semibold text-primary">{member.role}</span> : null}
            </>
          );

          return (
            <div key={member.name} data-reveal style={delay} className="team-card-reveal lg:col-span-2">
              {profile ? (
                <button
                  type="button"
                  className={cardClass}
                  onClick={(event: MouseEvent<HTMLButtonElement>) =>
                    openProfile({ ...member, profile }, event.currentTarget)
                  }
                  aria-haspopup="dialog"
                  aria-label={`Open profile for ${member.name}`}
                  data-testid={memberTestId(member)}
                >
                  {body}
                </button>
              ) : (
                <div className={cardClass} data-testid={memberTestId(member)}>
                  {body}
                </div>
              )}
              {profile ? (
                <dl className="sr-only">
                  {PROFILE_SECTIONS.map((section) => (
                    <div key={section.key}>
                      <dt>{section.label}</dt>
                      <dd>{profile[section.key]}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          );
        })}
      </div>
      {activeMember ? <TeamMemberModal member={activeMember} onClose={closeProfile} /> : null}
    </>
  );
}
