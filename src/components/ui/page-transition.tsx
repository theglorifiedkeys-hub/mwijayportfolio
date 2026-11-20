'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from 'gsap';

/**
 * PageTransition — GSAP-powered page transitions (motion-lab style).
 *
 * Flow:
 *  1. Internal link clicked  → curtain panels sweep UP to cover the screen
 *  2. Router navigates underneath the curtain (no flash of new page)
 *  3. Pathname changes       → curtain sweeps away + new page content rises in
 *
 * Dashboard routes (admin / login / client-portal) are excluded so the
 * native layout switch there stays instant. Hash-only links (e.g. `/#about`)
 * and reduced-motion users skip the curtain entirely.
 */

const PANEL_COUNT = 4;
const DASHBOARD_PREFIXES = ['/admin', '/login', '/client-portal'];

function isDashboardRoute(href: string) {
  return DASHBOARD_PREFIXES.some((p) => href === p || href.startsWith(`${p}/`));
}

/** Path portion of an in-app href, without query/hash. */
function pathOnly(href: string) {
  return href.split('#')[0].split('?')[0] || '/';
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const labelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const pendingPath = useRef<string | null>(null);
  const firstRender = useRef(true);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getPanels = () =>
    panelsRef.current.filter(Boolean) as HTMLDivElement[];

  const resetCurtain = () => {
    timelineRef.current?.kill();
    timelineRef.current = null;
    const panels = getPanels();
    gsap.set(panels, { scaleY: 0, transformOrigin: 'bottom' });
    gsap.set(labelRef.current, { opacity: 0 });
    isAnimating.current = false;
    pendingPath.current = null;
  };

  useEffect(() => () => {
    timelineRef.current?.kill();
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
  }, []);

  /* ── Route changed → sweep curtain away + animate new content in ── */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!pendingPath.current) return;
    pendingPath.current = null;
    if (safetyTimer.current) {
      clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }

    if (prefersReducedMotion()) {
      resetCurtain();
      return;
    }

    timelineRef.current?.kill();
    const panels = getPanels();
    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false;
        /* Leave no inline transform behind so `position: fixed` descendants
           inside page content keep working. */
        gsap.set(contentRef.current, { clearProps: 'transform,opacity' });
      },
    });

    timelineRef.current = tl;
    tl.set(panels, { transformOrigin: 'top' })
      .to(labelRef.current, { opacity: 0, duration: 0.2, ease: 'power2.out' }, 0)
      .to(panels, {
        scaleY: 0,
        duration: 0.65,
        ease: 'power4.inOut',
        stagger: 0.06,
      })
      .fromTo(
        contentRef.current,
        { opacity: 0, y: 56 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
        '-=0.4'
      );
  }, [pathname]);

  /* ── Intercept internal link clicks → curtain in → navigate ── */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/') || href.startsWith('//')) return;
      if (isDashboardRoute(pathOnly(href))) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
        return;

      /* Same route (includes hash links like `/#about`) → let the browser
         handle it, otherwise the curtain would open with nothing to reveal. */
      if (pathOnly(href) === pathname) return;
      if (prefersReducedMotion()) return;

      e.preventDefault();
      if (isAnimating.current) return;
      isAnimating.current = true;
      pendingPath.current = href;

      const panels = getPanels();
      const tl = gsap.timeline({
        onComplete: () => router.push(href),
      });

      timelineRef.current = tl;
      tl.set(panels, { transformOrigin: 'bottom' })
        .to(panels, {
          scaleY: 1,
          duration: 0.55,
          ease: 'power4.inOut',
          stagger: 0.06,
        })
        .fromTo(
          labelRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
          '-=0.15'
        );

      /* Safety: if the transition stalls, navigate directly + lift curtain */
      safetyTimer.current = setTimeout(() => {
        if (pendingPath.current) {
          const fallback = pendingPath.current;
          resetCurtain();
          router.push(fallback);
        }
      }, 5000);
    };

    // Capture before Next Link's click handler so it respects preventDefault.
    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, [pathname, router]);

  return (
    <>
      {/* Curtain overlay */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-none flex"
        aria-hidden="true"
      >
        {Array.from({ length: PANEL_COUNT }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              panelsRef.current[i] = el;
            }}
            className="flex-1 bg-primary origin-bottom"
            style={{ transform: 'scaleY(0)' }}
          />
        ))}
        <div
          ref={labelRef}
          className="absolute inset-0 flex items-center justify-center opacity-0"
        >
          <span className="text-white font-black uppercase tracking-[0.5em] text-sm md:text-base">
            Mwijay<span className="text-white/50">.</span>
          </span>
        </div>
      </div>

      {/* Page content */}
      <div ref={contentRef}>{children}</div>
    </>
  );
}
