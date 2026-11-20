'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * GsapEntrance — staggered GSAP entrance for hero content.
 * Animates every descendant marked with [data-hero-item] on mount.
 * Delay is tuned to rise as the LoadingScreen curtain lifts.
 */
export function GsapEntrance({
  children,
  className,
  selector = '[data-hero-item]',
  delay = 1.0,
}: {
  children: React.ReactNode;
  className?: string;
  selector?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll(selector);
    if (items.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          ease: 'power3.out',
          stagger: 0.12,
          delay,
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [selector, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
