'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Home, LayoutGrid, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Premium 404 Page - Themed & Immersive
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 relative overflow-hidden">
      {/* Background ID Watermark */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-black font-headline uppercase select-none">
          404
        </div>
      </div>
      
      <div className="max-w-2xl w-full text-center space-y-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="h-20 w-20 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary mx-auto mb-8 border-2 border-primary/20 shadow-xl">
             <Search size={32} />
          </div>
          <h1 className="text-4xl md:text-7xl font-black font-headline tracking-tighter uppercase leading-tight">
            Signal <span className="text-primary italic">Lost</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed">
            The architecture node you are looking for has been moved or deprecated from our registry.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-4 justify-center pt-4"
        >
          <Button className="rounded-full h-16 px-10 font-black uppercase tracking-widest text-xs gap-3 shadow-xl bg-primary text-white" asChild>
            <Link href="/"><Home size={18} /> Return to Base</Link>
          </Button>
          <Button variant="outline" className="rounded-full h-16 px-10 font-black uppercase tracking-widest text-xs gap-3 border-2" asChild>
            <Link href="/projects"><LayoutGrid size={18} /> View Projects</Link>
          </Button>
        </motion.div>

        <div className="pt-12 text-[8px] font-black uppercase tracking-[0.5em] text-muted-foreground/30 animate-pulse">
          MWIJAY SERVICES // PRECISION ARCHITECTURE // ERROR_404
        </div>
      </div>
    </div>
  );
}
