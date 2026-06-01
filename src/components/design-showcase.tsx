'use client';

import React, { useEffect, useState } from 'react';
import chroma from 'chroma-js';
import { Palette, Sparkles, Box, Cpu, Shuffle, Copy, Check, Info } from 'lucide-react';
import FadeContent from '@/components/ui/fade-content';
import { cn } from '@/lib/utils';
import { useDocOnce, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const OWNER_ID = "mwijay-davie-admin";

/* ═══════════════════════════════════════════
   CURATED PRESETS DATABASE
═══════════════════════════════════════════ */
const CURATED_PALETTES = [
  {
    name: "Enterprise",
    description: "Authority meets precision",
    colors: ["#1e3a5f", "#3182ce", "#7c3aed", "#10b981", "#f59e0b", "#e11d48"],
  },
  {
    name: "Cyber Neon",
    description: "High-contrast digital rebellion",
    colors: ["#0a0e27", "#0ea5e9", "#ec4899", "#22c55e", "#a855f7", "#ffffff"],
  },
  {
    name: "Safari Earth",
    description: "African natural elegance",
    colors: ["#b45309", "#92400e", "#c2410c", "#fef3c7", "#6b7280", "#1f2937"],
  },
  {
    name: "Millennial",
    description: "Soft luxury & tech innovation",
    colors: ["#0f172a", "#d4af37", "#f5f5f0", "#64748b", "#fecaca", "#166534"],
  }
];

export function DesignShowcase() {
  const db = useFirestore();
  const [selectedPalette, setSelectedPalette] = useState(0);
  const [activeColor, setActiveColor] = useState(CURATED_PALETTES[0].colors[1]);
  const [swatches, setSwatches] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const statsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'site_config', 'stats');
  }, [db]);
  const { data: stats } = useDocOnce(statsRef);

  // Fallback to presets or user registry
  const registryColors = stats?.brandColors || null;
  
  const currentColors = selectedPalette === -1 && registryColors 
    ? registryColors 
    : CURATED_PALETTES[selectedPalette]?.colors || CURATED_PALETTES[0].colors;

  useEffect(() => {
    const base = activeColor;
    const s1 = chroma(base).brighten(1).hex();
    const s2 = chroma(base).saturate(1.5).hex();
    const s3 = chroma(base).set('hsl.h', '+45').hex();
    const s4 = chroma(base).set('hsl.h', '-45').hex();
    setSwatches([s1, s2, s3, s4]);
  }, [activeColor]);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="relative w-full py-16 md:py-24 px-6 overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div 
          className="absolute inset-0 transition-colors duration-1000"
          style={{ 
            background: `radial-gradient(circle at 70% 30%, ${activeColor}, transparent 60%)`,
          }} 
        />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center relative z-10">
        <div className="space-y-10">
          <div className="space-y-4 md:space-y-6 text-center lg:text-left">
            <FadeContent threshold={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.2em]">
                <Palette className="h-3 w-3" />
                Color Intelligence Matrix
              </div>
            </FadeContent>
            <h2 className="text-4xl md:text-7xl font-headline font-black tracking-tighter uppercase leading-tight">
              Curated <span className="text-primary italic">Palettes</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-xl max-w-xl leading-relaxed font-medium mx-auto lg:mx-0">
              Select a technical system preset below to update the visual architecture node. Click any swatch to copy the signal.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
             {registryColors && (
               <button 
                onClick={() => {setSelectedPalette(-1); setActiveColor(registryColors[0]);}}
                className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all",
                  selectedPalette === -1 ? "bg-primary text-white border-primary shadow-lg" : "bg-card border-border/50 text-muted-foreground"
                )}
               >
                 Live Registry
               </button>
             )}
             {CURATED_PALETTES.map((p, idx) => (
               <button 
                key={p.name}
                onClick={() => {setSelectedPalette(idx); setActiveColor(p.colors[1]);}}
                className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all",
                  selectedPalette === idx ? "bg-primary text-white border-primary shadow-lg" : "bg-card border-border/50 text-muted-foreground"
                )}
               >
                 {p.name}
               </button>
             ))}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {currentColors.map((hex: string, i: number) => (
              <motion.button
                key={`${hex}-${i}`}
                whileHover={{ y: -4 }}
                onClick={() => {setActiveColor(hex); handleCopy(hex);}}
                className={cn(
                  "relative aspect-square rounded-2xl border-2 transition-all group overflow-hidden",
                  activeColor === hex ? "border-primary scale-110 shadow-xl" : "border-white/10"
                )}
                style={{ backgroundColor: hex }}
              >
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <AnimatePresence mode="wait">
                     {copied === hex ? (
                       <motion.div key="check" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}><Check className="text-white h-5 w-5" /></motion.div>
                     ) : (
                       <motion.div key="copy" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}><Copy className="text-white h-4 w-4" /></motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── INTERACTIVE MATRIX CARD ── */}
        <div className="relative group perspective-1000">
          <div className="relative w-full aspect-square max-w-[500px] mx-auto">
            <div className="absolute inset-0 bg-primary/5 rounded-[3rem] blur-3xl opacity-50 animate-pulse" />
            
            <div className="relative w-full h-full glass-pro rounded-[3rem] border-2 border-primary/20 p-8 flex flex-col justify-between transition-transform duration-700 group-hover:rotate-x-6 group-hover:rotate-y-6 bg-zinc-950/80 shadow-2xl">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black font-headline tracking-tighter uppercase text-white">Brand <span className="text-primary italic">Matrix</span></h3>
                  <p className="text-[10px] font-mono font-black text-primary/60 tracking-[0.4em]">SYNCED_DYNAMICS</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl border border-primary/20">
                  <Box className="h-6 w-6 animate-pulse" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 flex-1 my-10">
                {swatches.map((color, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={false}
                    animate={{ backgroundColor: color }}
                    className="relative group/swatch overflow-hidden rounded-3xl border-4 border-white/10 shadow-2xl transition-all duration-500 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/swatch:opacity-100 transition-opacity" />
                    <div className="absolute bottom-4 left-4 right-4 p-3 glass-pro rounded-xl border border-white/10 backdrop-blur-md opacity-0 group-hover/swatch:opacity-100 translate-y-4 group-hover/swatch:translate-y-0 transition-all">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">{color}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-end justify-between pt-6 border-t border-primary/10">
                <div className="flex gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
                   <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">ACTIVE_NODE_PROCESSOR</span>
                </div>
                <div className="flex items-center gap-3">
                  <Cpu className="h-4 w-4 text-primary animate-spin-slow" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Linked_2026</span>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 h-20 w-20 glass-pro rounded-[2rem] border-2 border-primary/20 flex items-center justify-center shadow-2xl animate-bounce [animation-duration:4000ms]">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
