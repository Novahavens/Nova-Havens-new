# ElegantCarousel family

- **Source:** `artifacts/nova-havens/src/components/ui/elegant-carousel.tsx:1-190`
- **Public exports:** default `ElegantCarousel` and `ElegantSlide` type.
- **Behavior:** autoplay advances every 6 seconds and pauses on hover; timed
  800ms transitions, previous/next controls, progress indicators, touch
  swiping, and lazy loading for non-initial images.
- **Accessibility:** every slide image requires descriptive alt text; controls
  have labels and current-slide state; the consuming page should honor
  `prefers-reduced-motion` by disabling or simplifying motion.
- **Dependencies:** React state/effects and Lucide controls.
- **Consumers:** `HomePage.tsx:484` with property showcase and testimonial slides.
- **Implementation:** `src/components/ui/elegant-carousel.tsx`; preview story:
  `src/preview/demos/elegant-carousel.tsx`.
- **Chunk:** 2.