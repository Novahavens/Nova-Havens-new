'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { MoveRight } from 'lucide-react';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';

export interface Review {
  quote: string;
  name: string;
  role: string;
}

export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const controls = (className: string) => (
    <div className={className}>
      <Button
        aria-label="Previous review"
        variant="outline"
        size="icon"
        onClick={scrollPrev}
        className="rounded-full border-white/20 hover:bg-white/5 text-foreground hover:text-primary border bg-transparent"
        data-testid="btn-carousel-prev"
      >
        <MoveRight className="w-4 h-4 rotate-180" aria-hidden="true" />
      </Button>
      <Button
        aria-label="Next review"
        variant="outline"
        size="icon"
        onClick={scrollNext}
        className="rounded-full border-white/20 hover:bg-white/5 text-foreground hover:text-primary border bg-transparent"
        data-testid="btn-carousel-next"
      >
        <MoveRight className="w-4 h-4" aria-hidden="true" />
      </Button>
    </div>
  );

  return (
    <div className="max-w-site mx-auto px-4 md:px-8">
      <div className="flex justify-between items-end mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold" data-testid="heading-reviews">
          What displaced families say
        </h2>
        {controls('hidden md:flex gap-3')}
      </div>

      <div className="overflow-hidden" ref={emblaRef} data-testid="carousel-reviews">
        <div className="flex">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-6 first:pl-0"
            >
              <figure className="bg-card rounded-lg p-8 md:p-10 border border-white/5 h-full flex flex-col hover:border-white/10 transition-colors">
                <span className="text-5xl font-serif text-primary leading-none mb-4 inline-block" aria-hidden="true">
                  &ldquo;
                </span>
                <blockquote className="text-lg text-foreground mb-8 flex-1 leading-relaxed">{review.quote}</blockquote>
                <div className="w-12 h-px bg-white/10 mb-6" />
                <figcaption>
                  <p className="font-bold text-foreground">{review.name}</p>
                  <p className="text-sm text-muted-foreground">{review.role}</p>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>
      {controls('flex md:hidden justify-center gap-3 mt-8')}
    </div>
  );
}
