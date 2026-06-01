'use client';

import React from 'react';
import { useCollectionOnce, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';

/**
 * LogosMarquee - Strategic tech partner display.
 * OPTIMIZED: Uses useCollectionOnce to save Firestore read quota.
 */
export function LogosMarquee() {
  const db = useFirestore();
  
  const logosRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'logos');
  }, [db]);

  const logosQuery = useMemoFirebase(() => {
    if (!logosRef) return null;
    return query(
      logosRef, 
      orderBy('order', 'asc')
    );
  }, [logosRef]);

  const { data: rawLogos, isLoading } = useCollectionOnce(logosQuery);

  // MEMORY FILTER: Bypasses the need for a composite index
  const logos = React.useMemo(() => {
    if (!rawLogos) return [];
    return rawLogos.filter((l: any) => l.isVisible !== false);
  }, [rawLogos]);

  if (!db || isLoading || !logos || logos.length === 0) return null;

  const MarqueeRow = () => (
    <div className="flex items-center gap-16 px-8 min-w-full shrink-0">
      {logos.map((logo: any) => (
        <div key={logo.id} className="flex flex-col items-center gap-2 group transition-all duration-500 hover:scale-110">
          <img 
            src={logo.imageUrl} 
            alt={logo.name} 
            className="h-8 md:h-12 w-auto object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
          />
          <span className="text-[7px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 group-hover:text-primary transition-colors">{logo.name}</span>
        </div>
      ))}
    </div>
  );

  return (
    <section className="py-16 bg-[#07080c] border-y border-white/5 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          animation: marquee-scroll 50s linear infinite;
        }
      `}} />
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center md:text-left">
        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40 italic">Verified Tools & Tech Matrix</h4>
      </div>
      <div className="relative flex overflow-hidden group">
        <div className="flex animate-marquee-slow hover:[animation-play-state:paused]">
          <MarqueeRow />
          <MarqueeRow />
        </div>
      </div>
    </section>
  );
}
