import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { TeamMember, TeamMemberProfile } from '@/data/teamMembers';

const PROFILE_SECTIONS: { key: keyof TeamMemberProfile; label: string }[] = [
  { key: 'help', label: 'How I help our clients' },
  { key: 'favouritePart', label: 'My favourite part of working here' },
  { key: 'foods', label: 'Favourite foods' },
  { key: 'laugh', label: 'Guaranteed to make me laugh' },
  { key: 'spareTime', label: 'In my spare time' },
];

interface TeamMemberModalProps {
  member: TeamMember;
  onClose: () => void;
}

/**
 * Profile modal for a team member. Closes via the X button, the backdrop, or
 * Escape. Focus is trapped inside while open; the parent returns focus to the
 * card that opened it.
 */
export default function TeamMemberModal({ member, onClose }: TeamMemberModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const handleClose = () => {
    setVisible(false);
    window.setTimeout(onClose, 180);
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])',
    );
    focusables?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
        return;
      }
      if (event.key !== 'Tab' || !focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!member.profile) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 motion-reduce:transition-none ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
      data-testid={`modal-team-${member.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-modal-name"
        className={`relative w-full max-w-lg max-h-[var(--max-h-modal)] overflow-y-auto rounded-2xl border border-primary/25 bg-card p-8 shadow-2xl transition-all duration-200 motion-reduce:transition-none ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label={`Close profile for ${member.name}`}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          data-testid="btn-close-modal"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="w-24 h-24 rounded-full bg-surface-1 border border-primary/60 flex items-center justify-center mb-5"
            aria-hidden="true"
          >
            <span className="text-2xl font-extrabold text-primary">{member.initials}</span>
          </div>
          <h2 id="team-modal-name" className="text-2xl font-bold text-foreground">
            {member.name}
          </h2>
          {member.role && (
            <p className="text-sm font-semibold text-primary mt-1">{member.role}</p>
          )}
        </div>

        <div className="space-y-6">
          {PROFILE_SECTIONS.map((section) => (
            <div key={section.key}>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                {section.label}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {member.profile?.[section.key]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
