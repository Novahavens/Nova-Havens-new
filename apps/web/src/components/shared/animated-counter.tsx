'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  /** Final value. Rendered immediately on the server so crawlers and no-JS visitors see the real number. */
  value: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

/**
 * Counts up from 0 to `value` the first time it scrolls into view. Respects
 * prefers-reduced-motion (shows the final value at once) and renders the
 * final value in the HTML so there is nothing to wait for without JS.
 */
export function AnimatedCounter({ value, suffix = '', durationMs = 1400, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || hasAnimated.current) return;
        hasAnimated.current = true;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(value * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        setDisplay(0);
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className} aria-label={`${value.toLocaleString('en-US')}${suffix}`}>
      <span aria-hidden="true">
        {display.toLocaleString('en-US')}
        {suffix}
      </span>
    </span>
  );
}
