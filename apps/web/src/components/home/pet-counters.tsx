/**
 * Pet-placement counters are illustrative, formula-driven marketing figures,
 * not a live feed. They start from a fixed baseline and increase by a fixed
 * amount on the 1st of every month. Computed on the server at build time, so
 * the page re-renders them on each deploy (daily data sync rebuilds the site).
 */
const PET_COUNTER_BASELINE = new Date(Date.UTC(2026, 8, 1)); // September 1, 2026
const PET_COUNTER_BASE_VALUES = { dogs: 340, cats: 70, birds: 13 } as const;
const PET_COUNTER_MONTHLY_GROWTH = { dogs: 21, cats: 7, birds: 3 } as const;

export function getPetPlacementCounts(now: Date = new Date()): { dogs: number; cats: number; birds: number } {
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

export function PetCounters() {
  const counts = getPetPlacementCounts();
  const items = [
    { key: 'dogs', value: counts.dogs, label: 'dogs placed' },
    { key: 'cats', value: counts.cats, label: 'cats placed' },
    { key: 'birds', value: counts.birds, label: 'birds placed' },
  ];
  return (
    <div className="grid grid-cols-3 gap-6 mb-8 w-full max-w-md" data-testid="pet-counters">
      {items.map((item) => (
        <div key={item.key} className="flex flex-col items-start" data-testid={`counter-${item.key}`}>
          <span className="block text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            {item.value}+
          </span>
          <span className="mt-1 block text-xs md:text-sm text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
