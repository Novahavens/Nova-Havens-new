import { Star } from 'lucide-react';

import { PUBLIC_STATS } from '@/config/site';

export function GoogleRating() {
  const { value, outOf } = PUBLIC_STATS.googleRating;
  return (
    <div
      className="mb-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-lg border border-white/10 bg-card px-6 py-4 text-center"
      data-testid="google-rating"
      aria-label={`Google rating: ${value} out of ${outOf} stars`}
    >
      <span className="text-sm font-semibold text-foreground">Google rating</span>
      <span className="flex items-center gap-1 text-primary" aria-hidden="true">
        {Array.from({ length: outOf }, (_, index) => (
          <Star key={index} className="h-4 w-4 fill-current" />
        ))}
      </span>
      <span className="text-sm font-bold text-foreground">{value} stars</span>
    </div>
  );
}
