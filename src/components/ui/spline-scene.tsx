
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * SplineScene - Hardened 3D implementation.
 * WATERMARK HIDDEN: Uses MutationObserver and CSS injection in shadow DOM.
 */

const SCENE_URL = 'https://prod.spline.design/uMQlelnTnhZ9pD8p/scene.splinecode';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': any;
    }
  }
}

function SceneSkeleton() {
  return (
    <div className="w-full h-full rounded-[3rem] animate-pulse bg-zinc-900/50 flex items-center justify-center border-2 border-white/5">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">
          Syncing 3D Signal...
        </p>
      </div>
    </div>
  );
}

export function SplineScene() {
  const [isLoaded, setIsLoaded] = useState(false);
  const splineRef = useRef<any>(null);

  useEffect(() => {
    const viewer = splineRef.current;
    if (!viewer) return;

    const hideWatermark = () => {
      try {
        const shadow = viewer.shadowRoot;
        if (shadow) {
          const style = document.createElement('style');
          style.textContent = `
            #logo, a[href*="spline.design"], .spline-watermark { 
              display: none !important; 
              visibility: hidden !important; 
              opacity: 0 !important; 
              pointer-events: none !important; 
            }
          `;
          shadow.appendChild(style);
        }
      } catch (e) {
        // Silent recovery
      }
    };

    const onLoad = () => {
      hideWatermark();
      setIsLoaded(true);
    };

    viewer.addEventListener('load', onLoad);
    
    // Safety fallback: if shadow root exists, try hiding logo immediately
    const timer = setTimeout(() => {
       if (viewer.shadowRoot) {
         hideWatermark();
         setIsLoaded(true);
       }
    }, 3000);

    return () => {
      viewer.removeEventListener('load', onLoad);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="w-full h-full relative rounded-[3rem] overflow-hidden border-2 border-white/5 shadow-2xl bg-zinc-950">
      {!isLoaded && <SceneSkeleton />}
      
      <div
        className="w-full h-full"
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out',
        }}
      >
        <spline-viewer
          ref={splineRef}
          url={SCENE_URL}
          class="w-full h-full"
          loading-library="lazy"
        />
      </div>
    </div>
  );
}
