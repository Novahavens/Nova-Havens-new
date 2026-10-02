import { Bird, Cat, Dog, type LucideIcon } from 'lucide-react';

import { AnimatedCounter } from '@/components/shared/animated-counter';

/**
 * Pet-placement counters are illustrative, formula-driven marketing figures,
 * not a live feed. They start from a fixed baseline and grow by a fixed
 * amount on the 1st of every month, computed on the server at build time
 * (the daily data sync rebuilds the site, so they roll over on schedule).
 * Change the baseline or growth here; nothing else needs to move.
 */
const PET_COUNTER_BASELINE = new Date(Date.UTC(2026, 8, 1)); // September 1, 2026
const PET_COUNTER_BASE_VALUES = { dogs: 340, cats: 70, birds: 13 } as const;
const PET_COUNTER_MONTHLY_GROWTH = { dogs: 21, cats: 7, birds: 3 } as const;

export type PetCounts = { dogs: number; cats: number; birds: number };

export function getPetPlacementCounts(now: Date = new Date()): PetCounts {
  const monthsElapsed = Math.max(
    0,
    (now.getUTCFullYear() - PET_COUNTER_BASELINE.getUTCFullYear()) * 12 +
      (now.getUTCMonth() - PET_COUNTER_BASELINE.getUTCMonth()),
  );
  return {
    dogs: PET_COUNTER_BASE_VALUES.dogs + monthsElapsed * PET_COUNTER_MONTHLY_GROWTH.dogs,
    cats: PET_COUNTER_BASE_VALUES.cats + monthsElapsed * PET_COUNTER_MONTHLY_GROWTH.cats,
    birds: PET_COUNTER_BASE_VALUES.birds + monthsElapsed * PET_COUNTER_MONTHLY_GROWTH.birds,
  };
}

const ITEMS: { key: keyof PetCounts; label: string; Icon: LucideIcon }[] = [
  { key: 'dogs', label: 'Dogs placed', Icon: Dog },
  { key: 'cats', label: 'Cats placed', Icon: Cat },
  { key: 'birds', label: 'Birds placed', Icon: Bird },
];

export function PetCounters() {
  const counts = getPetPlacementCounts();
  const total = counts.dogs + counts.cats + counts.birds;

  return (
    <div className="mb-8 w-full max-w-md" data-testid="pet-counters">
      <div className="grid grid-cols-3 gap-3">
        {ITEMS.map(({ key, label, Icon }) => (
          <div
            key={key}
            className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-surface-1 p-4 transition-colors hover:border-primary/40"
            data-testid={`counter-${key}`}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                background: 'radial-gradient(ellipse at 50% 120%, hsl(var(--primary)/0.14) 0%, transparent 70%)',
              }}
              aria-hidden="true"
            />
            <div className="relative flex flex-col items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <AnimatedCounter
                value={counts[key]}
                suffix="+"
                className="block text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
              />
              <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground md:text-xs">
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-tertiary">
        <span className="font-semibold text-muted-foreground">{total.toLocaleString('en-US')}+ pets</span> have moved
        into a Nova Havens home alongside their families. Share your pet details on the first call and we match you to a
        compatible home.
      </p>
    </div>
  );
}
