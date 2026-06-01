'use client';

import dynamic from 'next/dynamic';
import React from 'react';

/**
 * HeroSplineWrapper - Client Component Bridge
 * Handles the dynamic import with ssr: false to satisfy Next.js 15 
 * App Router requirements while preserving Server Component benefits for the text.
 */
const SplineScene = dynamic(() => import('@/components/ui/spline-scene').then(m => m.SplineScene), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-900/10 rounded-[3rem] animate-pulse flex items-center justify-center">
       <p className="text-[10px] font-black uppercase tracking-widest opacity-20">Syncing 3D Signal...</p>
    </div>
  )
});

export function HeroSplineWrapper() {
  return <SplineScene />;
}
