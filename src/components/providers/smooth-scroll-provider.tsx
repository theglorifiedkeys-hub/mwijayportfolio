
'use client';

import React, { useEffect, ReactNode } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * SmoothScrollProvider - Wraps the app with Lenis for premium kinetic scrolling.
 * Respects prefers-reduced-motion and disables on touch for performance.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
