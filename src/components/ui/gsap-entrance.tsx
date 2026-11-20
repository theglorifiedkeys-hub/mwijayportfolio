'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * GsapEntrance — staggered GSAP entrance for hero content.
 *
 * - Animates every descendant marked with [data-hero-item] on mount.
 * - Waits for the LoadingScreen curtain (`body.loading-lock`) to lift on
 *   first paint, so the reveal isn't wasted behind the curtain.
 * - Clears inline transforms afterwards so no stray `transform` breaks
 *   `position: fixed` descendants.
 */
export function GsapEntrance({
  children,
  className,
  selector = '[data-hero-item]',
  delay = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  selector?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const items = root.querySelectorAll(selector);
    if (items.length === 0) return;

    let cancelled = false;
    let started = false;
    let observer: MutationObserver | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const run = () => {
      if (cancelled || started || !ref.current) return;
      started = true;
      if (timeout) clearTimeout(timeout);
      const els = ref.current.querySelectorAll(selector);
      if (els.length === 0) return;

      gsap.fromTo(
        els,
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          ease: 'power3.out',
          stagger: 0.12,
          delay,
          /* Leave no inline transform behind (keeps `fixed` children fixed) */
          clearProps: 'transform,opacity',
        }
      );
    };

    const curtainUp =
      typeof document !== 'undefined' &&
      document.body.classList.contains('loading-lock');

    if (curtainUp) {
      /* Observe the body class until the loading curtain lifts (max 3s) */
      observer = new MutationObserver(() => {
        if (!document.body.classList.contains('loading-lock')) {
          observer?.disconnect();
          observer = null;
          run();
        }
      });
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
      });

      timeout = setTimeout(() => {
        observer?.disconnect();
        observer = null;
        run();
      }, 3000);
    } else {
      run();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (timeout) clearTimeout(timeout);
      gsap.killTweensOf(root.querySelectorAll(selector));
    };
  }, [selector, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
