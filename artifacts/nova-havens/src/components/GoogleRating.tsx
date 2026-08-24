import { Star } from 'lucide-react';

export default function GoogleRating() {
  return (
    <div
      className="mb-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-lg border border-white/10 bg-card px-6 py-4 text-center"
      data-testid="google-rating"
      aria-label="Google rating: 4.8 out of 5 stars"
    >
      <span className="text-sm font-semibold text-foreground">Google rating</span>
      <span className="flex items-center gap-1 text-primary" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} className="h-4 w-4 fill-current" />
        ))}
      </span>
      <span className="text-sm font-bold text-foreground">4.8 stars</span>
    </div>
  );
}