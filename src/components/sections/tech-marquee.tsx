'use client';

import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function TechMarquee() {
  const db = useFirestore();
  const logosRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'logos');
  }, [db]);
  const logosQuery = useMemoFirebase(() => {
    if (!logosRef) return null;
    return query(
      logosRef, 
      where('isVisible', '==', true),
      orderBy('order', 'asc')
    );
  }, [logosRef]);

  const { data: logos, isLoading } = useCollection(logosQuery);

  if (isLoading || !logos || logos.length === 0) return null;

  const content = (
    <div className="flex items-center gap-16 px-8 min-w-full shrink-0">
      {logos.map((logo) => (
        <a 
          key={logo.id} 
          href={logo.href || '#'} 
          target="_blank" 
          rel="noopener"
          className="flex flex-col items-center gap-3 group grayscale hover:grayscale-0 transition-all duration-500"
        >
          <img 
            src={logo.imageUrl} 
            alt={logo.name} 
            className="h-8 md:h-12 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity" 
          />
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">{logo.name}</span>
        </a>
      ))}
    </div>
  );

  return (
    <section className="py-12 bg-background border-y border-white/5 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}} />
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center md:text-left">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Verified Partners & Tools</h4>
      </div>
      <div className="relative flex overflow-hidden group">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
          {content}
          {content}
        </div>
      </div>
    </section>
  );
}
