'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';

export interface ShowcaseSlide {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

const SLIDE_DURATION = 6000;
const TRANSITION_DURATION = 800;

/**
 * Property photo showcase with autoplay, swipe, progress bars, and full
 * reduced-motion support. Images go through next/image (AVIF/WebP, sized).
 */
export function ShowcaseCarousel({ slides }: { slides: ShowcaseSlide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTouchActive, setIsTouchActive] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(clearTimeout);
      timeouts.length = 0;
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex || slides.length < 2) return;
      if (prefersReducedMotion) {
        setCurrentIndex(index);
        setProgress(0);
        return;
      }
      setIsTransitioning(true);
      setProgress(0);
      timeoutsRef.current.push(
        setTimeout(() => {
          setCurrentIndex(index);
          timeoutsRef.current.push(setTimeout(() => setIsTransitioning(false), 50));
        }, TRANSITION_DURATION / 2),
      );
    },
    [currentIndex, isTransitioning, prefersReducedMotion, slides.length],
  );

  const goNext = useCallback(
    () => goToSlide((currentIndex + 1) % slides.length),
    [currentIndex, goToSlide, slides.length],
  );
  const goPrev = useCallback(
    () => goToSlide((currentIndex - 1 + slides.length) % slides.length),
    [currentIndex, goToSlide, slides.length],
  );

  useEffect(() => {
    if (isPaused || isTouchActive || prefersReducedMotion || slides.length < 2) return;
    const progressTimer = setInterval(() => {
      setProgress((previous) => (previous >= 100 ? 100 : previous + 100 / (SLIDE_DURATION / 50)));
    }, 50);
    const slideTimer = setInterval(goNext, SLIDE_DURATION);
    return () => {
      clearInterval(slideTimer);
      clearInterval(progressTimer);
    };
  }, [currentIndex, goNext, isPaused, isTouchActive, prefersReducedMotion, slides.length]);

  // Touch devices never fire hover events, so pause autoplay for the whole gesture.
  const handleTouchStart = (event: TouchEvent) => {
    setIsTouchActive(true);
    const x = event.targetTouches[0]?.clientX ?? 0;
    touchStartX.current = x;
    touchEndX.current = x;
  };
  const handleTouchMove = (event: TouchEvent) => {
    touchEndX.current = event.targetTouches[0]?.clientX ?? touchEndX.current;
  };
  const handleTouchEnd = () => {
    const difference = touchStartX.current - touchEndX.current;
    if (Math.abs(difference) > 60) {
      if (difference > 0) goNext();
      else goPrev();
    }
    setIsTouchActive(false);
  };

  if (!slides.length) return null;
  const currentSlide = slides[currentIndex] ?? slides[0]!;
  const fadeClass = prefersReducedMotion
    ? 'opacity-100 translate-y-0'
    : isTransitioning
      ? 'opacity-0 translate-y-3'
      : 'opacity-100 translate-y-0';
  const contentTransitionClass = prefersReducedMotion ? '' : 'transition-all duration-500';

  return (
    <div
      className="relative w-full overflow-hidden rounded-[16px] border border-white/10 bg-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => setIsTouchActive(false)}
      data-testid="carousel-showcase"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 70% 50%, hsl(var(--primary) / 0.09) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col md:flex-row">
        <div className="flex w-full items-center p-8 md:w-1/2 md:p-12 lg:p-16">
          <div className="w-full">
            <div className={`mb-6 flex items-center gap-3 ${contentTransitionClass} ${fadeClass}`}>
              <span className="h-px w-10 bg-primary/60" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
            </div>
            <h3
              className={`mb-3 text-2xl font-extrabold text-foreground md:text-3xl lg:text-4xl ${contentTransitionClass} ${fadeClass}`}
            >
              {currentSlide.title}
            </h3>
            <p
              className={`mb-4 text-sm font-bold uppercase tracking-widest text-primary ${contentTransitionClass} ${fadeClass}`}
            >
              {currentSlide.subtitle}
            </p>
            <p className={`mb-8 max-w-md leading-relaxed text-muted-foreground ${contentTransitionClass} ${fadeClass}`}>
              {currentSlide.description}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Previous slide"
                data-testid="btn-carousel-prev"
              >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Next slide"
                data-testid="btn-carousel-next"
              >
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative w-full p-6 md:w-1/2 md:p-10">
          <div
            className={`relative aspect-[4/3] overflow-hidden rounded-[12px] ${contentTransitionClass} ${isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}
          >
            {slides.map((slide, index) => (
              <Image
                key={slide.imageUrl}
                src={slide.imageUrl}
                alt={slide.imageAlt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className={`object-cover transition-opacity duration-300 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ))}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.13) 0%, transparent 50%)' }}
              aria-hidden="true"
            />
          </div>
          <div
            className="pointer-events-none absolute left-3 top-7 hidden h-10 w-10 border-l-2 border-t-2 border-primary md:block"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-7 right-3 hidden h-10 w-10 border-b-2 border-r-2 border-primary md:block"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="relative grid grid-cols-3 gap-3 px-6 pb-6 md:grid-cols-9 md:px-10 md:pb-8">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => goToSlide(index)}
            className={`group flex flex-col gap-2 text-left transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${index === currentIndex ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
            aria-label={`Go to slide ${index + 1}: ${slide.title}`}
            aria-current={index === currentIndex ? 'true' : undefined}
          >
            <span className="block h-[3px] w-full overflow-hidden rounded-full bg-white/10">
              <span
                className={`block h-full rounded-full bg-primary ${prefersReducedMotion ? '' : 'transition-[width] duration-100 ease-linear'}`}
                style={{ width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%' }}
              />
            </span>
            <span className="hidden truncate text-[11px] font-medium text-muted-foreground md:block">
              {slide.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
