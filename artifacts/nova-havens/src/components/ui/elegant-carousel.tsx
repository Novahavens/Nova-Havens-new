import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface ElegantSlide {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

interface ElegantCarouselProps {
  slides: ElegantSlide[];
}

const SLIDE_DURATION = 6000;
const TRANSITION_DURATION = 800;

export default function ElegantCarousel({ slides }: ElegantCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;
      setIsTransitioning(true);
      setProgress(0);

      timeoutsRef.current.push(
        setTimeout(() => {
          setCurrentIndex(index);
          timeoutsRef.current.push(setTimeout(() => setIsTransitioning(false), 50));
        }, TRANSITION_DURATION / 2),
      );
    },
    [isTransitioning, currentIndex],
  );

  const goNext = useCallback(() => {
    goToSlide((currentIndex + 1) % slides.length);
  }, [currentIndex, goToSlide, slides.length]);

  const goPrev = useCallback(() => {
    goToSlide((currentIndex - 1 + slides.length) % slides.length);
  }, [currentIndex, goToSlide, slides.length]);

  useEffect(() => {
    if (isPaused) return;

    progressRef.current = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 100 / (SLIDE_DURATION / 50)));
    }, 50);

    intervalRef.current = setInterval(goNext, SLIDE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [currentIndex, isPaused, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  if (!slides.length) return null;
  const currentSlide = slides[currentIndex];
  const fadeClass = isTransitioning
    ? 'opacity-0 translate-y-3'
    : 'opacity-100 translate-y-0';

  return (
    <div
      className="relative w-full overflow-hidden rounded-[16px] border border-white/10 bg-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-testid="carousel-showcase"
    >
      {/* Background accent wash */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-700"
        style={{
          background: 'radial-gradient(ellipse at 70% 50%, hsl(var(--primary) / 0.09) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col md:flex-row">
        {/* Left: Text Content */}
        <div className="flex w-full items-center p-8 md:w-1/2 md:p-12 lg:p-16">
          <div className="w-full">
            <div className={`mb-6 flex items-center gap-3 transition-all duration-500 ${fadeClass}`}>
              <span className="h-px w-10 bg-primary/60" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
            </div>

            <h3 className={`mb-3 text-2xl font-extrabold text-foreground md:text-3xl lg:text-4xl transition-all duration-500 delay-75 ${fadeClass}`}>
              {currentSlide.title}
            </h3>

            <p
              className={`mb-4 text-sm font-bold uppercase tracking-widest text-primary transition-all duration-500 delay-100 ${fadeClass}`}
            >
              {currentSlide.subtitle}
            </p>

            <p className={`mb-8 max-w-md leading-relaxed text-muted-foreground transition-all duration-500 delay-150 ${fadeClass}`}>
              {currentSlide.description}
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-foreground transition-colors hover:border-primary hover:text-primary"
                aria-label="Previous slide"
                data-testid="btn-carousel-prev"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-foreground transition-colors hover:border-primary hover:text-primary"
                aria-label="Next slide"
                data-testid="btn-carousel-next"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div className="relative w-full p-6 md:w-1/2 md:p-10">
          <div className={`relative aspect-[4/3] overflow-hidden rounded-[12px] transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.imageAlt}
              className="h-full w-full object-cover"
              loading={currentIndex === 0 ? 'eager' : 'lazy'}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.13) 0%, transparent 50%)' }}
              aria-hidden="true"
            />
          </div>

          {/* Decorative frame corners */}
          <div
            className="pointer-events-none absolute left-3 top-7 hidden h-10 w-10 border-l-2 border-t-2 border-primary transition-colors duration-500 md:block"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-7 right-3 hidden h-10 w-10 border-b-2 border-r-2 border-primary transition-colors duration-500 md:block"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="relative grid grid-cols-3 gap-3 px-6 pb-6 md:grid-cols-9 md:px-10 md:pb-8">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => goToSlide(index)}
            className={`group flex flex-col gap-2 text-left transition-opacity ${index === currentIndex ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
            aria-label={`Go to slide ${index + 1}: ${slide.title}`}
            data-testid={`btn-carousel-slide-${index + 1}`}
          >
            <span className="block h-[3px] w-full overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full rounded-full bg-primary transition-[width] duration-100 ease-linear"
                style={{
                  width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%',
                }}
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
