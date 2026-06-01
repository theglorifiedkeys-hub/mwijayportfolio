'use client';

import React from 'react';

const ITEMS = [
  "Next.js 15", "Google AI", "n8n Automation", "Figma Design", 
  "Python Scripts", "React Engineering", "Systems Thinking", 
  "Tanzania Tech", "Global Delivery", "Firebase Registry",
  "Cloud Architecture", "Bespoke Logic", "Precision UI"
];

/**
 * Marquee - High-performance text slider.
 * Restored with rich content and premium styling.
 */
export function Marquee() {
  const content = (
    <div className="flex items-center gap-12 shrink-0">
      {ITEMS.map((item, i) => (
        <React.Fragment key={i}>
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-foreground/60 hover:text-primary transition-colors cursor-default whitespace-nowrap">
            {item}
          </span>
          <span className="text-primary/40 font-bold text-lg">✦</span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="w-full overflow-hidden border-y border-border/50 py-5 bg-card/20 backdrop-blur-sm group select-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-scroll-text {
          from { transform: translateX(0); }
          to { transform: translateX(-33.33%); }
        }
        .animate-marquee-text {
          animation: marquee-scroll-text 40s linear infinite;
        }
      `}} />
      <div className="flex animate-marquee-text hover:[animation-play-state:paused]">
        {content}
        {content}
        {content}
      </div>
    </div>
  );
}
