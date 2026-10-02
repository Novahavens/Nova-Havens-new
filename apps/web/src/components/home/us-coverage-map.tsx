import Image from 'next/image';

import { SERVICE_AREA } from '@/config/site';
import { getCoverageSummary, MAP_HEIGHT, MAP_WIDTH, type CoverageMapVariant } from '@/lib/us-map';

interface UsCoverageMapProps {
  /** `compact` = trust-strip tile; `detailed` = full "Where We Operate" map with labels, legend and top states. */
  variant?: CoverageMapVariant;
  className?: string;
  /** Load eagerly when the map is above the fold. */
  priority?: boolean;
}

/**
 * Real map of the United States (US Census shapes, Albers USA projection),
 * served as a cached SVG image from /maps/coverage-*.svg and generated at
 * build time from the latest property snapshot. Facts beside the map are
 * rendered as text so they are indexable and readable without the image.
 */
export function UsCoverageMap({ variant = 'detailed', className = '', priority = false }: UsCoverageMapProps) {
  const detailed = variant === 'detailed';
  const summary = getCoverageSummary();
  const alt = `Map of the United States. Nova Havens serves all ${SERVICE_AREA.usName}; ${summary.statesWithRecords} states currently have verified property records, with the largest concentrations in ${summary.topCities
    .slice(0, 3)
    .map((c) => c.city)
    .join(', ')}.`;

  return (
    <figure
      className={`relative w-full min-w-0 overflow-hidden rounded-xl border border-primary/20 bg-surface-2 ${className}`}
      data-testid={`coverage-map-${variant}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 45%, hsl(var(--primary)/0.10), transparent 70%)' }}
        aria-hidden="true"
      />
      {detailed ? null : (
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
          Network coverage
        </div>
      )}

      <Image
        src={`/maps/coverage-${variant}.svg`}
        alt={alt}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        unoptimized
        priority={priority}
        className={`relative block h-auto w-full ${detailed ? 'p-4 md:p-8' : 'p-4 pt-10 md:p-6 md:pt-12'}`}
      />

      <figcaption className="relative border-t border-white/5 px-4 py-3 text-xs text-muted-foreground md:px-6">
        <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${detailed ? '' : 'justify-end'}`}>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border border-primary/50 bg-primary/30" aria-hidden="true" />
            States served ({SERVICE_AREA.stateCount} contiguous)
          </span>
          {detailed ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm border border-primary/70 bg-primary/60" aria-hidden="true" />
              Darker = more verified records
            </span>
          ) : null}
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
            {detailed ? 'Largest metros in the network' : 'Largest metros'}
          </span>
        </div>
        {detailed ? (
          <dl
            className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-white/5 pt-4 sm:grid-cols-3 md:grid-cols-6"
            data-testid="coverage-top-states"
          >
            {summary.topStates.map((s) => (
              <div key={s.code}>
                <dt className="font-semibold text-foreground">{s.name}</dt>
                <dd className="text-tertiary">{s.count.toLocaleString('en-US')} records</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </figcaption>
    </figure>
  );
}
