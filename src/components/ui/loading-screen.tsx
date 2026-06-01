'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { usePathname } from 'next/navigation';

/**
 * PERFORMANCE FIX: Optimizing Loading Screen exit for LCP
 * Reduced duration from 3s to 800ms to allow faster render of hero content.
 */
export function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || pathname?.startsWith('/admin')) return;

    const ctx = gsap.context(() => {
      const exitLoading = () => {
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            yPercent: -100,
            duration: 0.6,
            ease: 'power4.inOut',
            onComplete: () => {
              if (containerRef.current) containerRef.current.style.display = 'none';
              document.body.classList.remove('loading-lock');
            }
          });
        }
      };

      // LIGHTHOUSE FIX: Auto-exit much faster (800ms max)
      const autoExit = setTimeout(exitLoading, 800);
      
      if (document.readyState === 'complete') {
        exitLoading();
      } else {
        window.addEventListener('load', exitLoading);
      }

      return () => {
        clearTimeout(autoExit);
        window.removeEventListener('load', exitLoading);
      };
    }, containerRef);

    return () => ctx.revert();
  }, [mounted, pathname]);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login') || pathname?.startsWith('/client-portal/login')) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#07080c] overflow-hidden select-none touch-none"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .loading-lock { overflow: hidden !important; }
        
        .glitch-text-huge {
          position: relative;
          color: white;
          font-size: clamp(6rem, 15vw, 18rem);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.05em;
          text-shadow: 0.05em 0 0 #2563eb, -0.025em -0.05em 0 #7c3aed, 0.025em 0.05em 0 #3b82f6;
          animation: main-glitch 1s infinite linear alternate-reverse;
          line-height: 0.8;
          text-align: center;
          width: 100%;
        }

        .glitch-text-huge::before,
        .glitch-text-huge::after {
          content: 'MWIJAY.';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch-text-huge::before {
          animation: glitch-anim 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
          color: #7c3aed;
          z-index: -1;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
          transform: translate(-3px, -2px);
        }

        .glitch-text-huge::after {
          animation: glitch-anim-2 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both infinite;
          color: #2563eb;
          z-index: -2;
          clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
          transform: translate(3px, 2px);
        }

        @keyframes main-glitch {
          0% { transform: skew(0deg); }
          20% { transform: skew(-3deg); }
          40% { transform: skew(2deg); }
          100% { transform: skew(0deg); }
        }

        @keyframes glitch-anim {
          0% { transform: translate(0); }
          20% { transform: translate(-4px, 4px); }
          40% { transform: translate(-4px, -4px); }
          60% { transform: translate(4px, 4px); }
          100% { transform: translate(0); }
        }

        @keyframes glitch-anim-2 {
          0% { transform: translate(0); }
          20% { transform: translate(4px, -4px); }
          40% { transform: translate(4px, -4px); }
          60% { transform: translate(-4px, -4px); }
          100% { transform: translate(0); }
        }

        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}} />
      
      <h1 className="glitch-text-huge">
        MWIJAY<span className="text-primary">.</span>
      </h1>

      <div className="mt-12 flex flex-col items-center gap-8 animate-in fade-in duration-1000 delay-500">
         <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="text-xs md:text-xl font-black uppercase tracking-[0.8em] text-white/90">PROTOCOL_ENGAGED</span>
         </div>
         <div className="w-64 md:w-80 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[loading-bar_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
         </div>
      </div>
    </div>
  );
}