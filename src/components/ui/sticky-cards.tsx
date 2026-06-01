
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Layers, Zap, Cpu, Sparkles } from 'lucide-react';

const CARDS = [
  {
    number: "01",
    title: "Sticky Architecture",
    description: "Systems that stack themselves like a perfectly managed database. No manual overhead. Just strategic logic being unreasonably efficient.",
    bg: "bg-blue-600",
    icon: Layers
  },
  {
    number: "02",
    title: "Scroll = Impact",
    description: "Every interaction is a timeline of growth. Your business progress is our focus. We architect the vision, you scale the results.",
    bg: "bg-purple-600",
    icon: Zap
  },
  {
    number: "03",
    title: "Advanced AI Vibes",
    description: "Perspective and precision make flat ideas look deep. Our AI workflows tilt the odds in your favor, judging the market with high-speed accuracy.",
    bg: "bg-pink-600",
    icon: Cpu
  },
  {
    number: "04",
    title: "High-Performance 2026",
    description: "Zero jank, all smooth transitions. We utilize compositor-only transforms for the best user experience. Your competitors? They'll be playing catch-up.",
    bg: "bg-emerald-600",
    icon: Sparkles
  }
];

export function StickyCards() {
  return (
    <div className="w-full py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-6xl font-black font-headline tracking-tighter text-foreground uppercase">
            Modern <span className="text-primary italic">Architecture</span>
          </h2>
          <p className="text-muted-foreground font-medium max-w-xl mx-auto">
            Experience the precision of our build protocols. Each layer adds a new dimension to your digital authority.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-8 md:gap-16 list-none p-0">
          {CARDS.map((card, i) => (
            <li 
              key={i} 
              className="sticky top-24 md:top-32"
              style={{ paddingTop: `${i * 20}px` }}
            >
              <div className={cn(
                "relative h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-2xl flex flex-col justify-center p-8 md:p-16 transition-all duration-700",
                card.bg
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/60 z-0" />
                
                <div className="relative z-10 flex flex-col gap-6 max-w-2xl">
                  <span className="font-mono text-6xl md:text-9xl font-black opacity-20 absolute -top-10 -right-4 md:-top-16 md:right-8">
                    {card.number}
                  </span>
                  
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                    <card.icon className="h-6 w-6 md:h-8 md:w-8" />
                  </div>

                  <h3 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tight">
                    {card.title}
                  </h3>
                  
                  <p className="text-white/80 text-base md:text-xl leading-relaxed font-medium">
                    {card.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
