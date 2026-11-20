'use client';

import React, { ReactNode } from 'react';
import { Sparkles, Zap, Loader2, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { useCollectionOnce, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import OptimizedImage from '@/components/ui/optimized-image';
import Link from 'next/link';

const OWNER_ID = "mwijay-davie-admin";

interface BentoItemProps {
  className?: string;
  children: ReactNode;
  bgImage?: string;
}

const BentoItem = ({ className, children, bgImage }: BentoItemProps) => {
  return (
    <div className={cn(
      "glass-pro group rounded-[2.5rem] p-6 md:p-8 transition-all duration-500 hover:border-primary/40 hover:-translate-y-2 h-full relative overflow-hidden border border-border/50 bg-card/30 shadow-sm",
      className
    )}>
      {bgImage && (
        <div className="absolute inset-0 z-0">
          <OptimizedImage 
            src={bgImage} 
            alt="Expertise Node" 
            fill 
            className="opacity-10 group-hover:opacity-30 group-hover:scale-105 transition-all duration-1000 object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      )}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

export const CyberneticBentoGrid = () => {
  const db = useFirestore();
  const { user, isAdmin } = useUser();
  
  const servicesRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'users', OWNER_ID, 'services');
  }, [db]);
  
  const { data: services, isLoading } = useCollectionOnce(servicesRef as any);

  const items = services || [];

  const architectWords = [
    { text: "Architecting" },
    { text: "Future" },
    { text: "Systems", className: "text-primary italic" }
  ];

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 min-h-[400px] space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Syncing Matrix...</p>
    </div>
  );

  // LOGIC: Hide completely if empty and not admin to avoid bad UX
  if (items.length === 0 && !isAdmin) return null;

  return (
    <section className="py-16 md:py-32 px-6 md:px-12 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="space-y-4 mb-16 md:mb-24 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mx-auto lg:mx-0 shadow-sm">
            <Sparkles size={14} />
            Verified Capabilities Registry
          </div>
          <div className="flex justify-center lg:justify-start">
            <TypewriterEffect words={architectWords} className="text-4xl sm:text-5xl lg:text-7xl font-headline font-black tracking-tighter text-left" />
          </div>
          <p className="text-muted-foreground text-sm md:text-xl max-w-2xl leading-relaxed font-medium mx-auto lg:mx-0">
            Bespoke technical architectures synchronized with your business goals. 2026 Ready.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="p-20 rounded-[3rem] border-2 border-dashed border-border/50 text-center space-y-6 bg-card/10">
            <Database className="h-12 w-12 mx-auto text-primary/20" />
            <div className="space-y-2">
              <h3 className="text-xl font-black font-headline uppercase opacity-40">Matrix Registry Empty</h3>
              <p className="text-xs text-muted-foreground font-medium italic">Map your expertise nodes in the Admin Panel to populate this grid.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {items.map((item: any, idx: number) => {
              const isLarge = idx === 0 && items.length > 2;
              return (
                <BentoItem 
                  key={item.id || idx}
                  bgImage={item.imageUrl}
                  className={cn(
                    "min-h-[350px]",
                    isLarge ? "lg:col-span-2 lg:row-span-2" : "h-full"
                  )}
                >
                  <div className="space-y-4 md:space-y-6">
                     <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg">
                       <Zap size={24} />
                     </div>
                     <div className="space-y-2">
                        <h3 className={cn("font-headline font-black tracking-tight text-foreground uppercase", isLarge ? "text-3xl md:text-5xl" : "text-xl")}>
                          {item.title}
                        </h3>
                     </div>
                     <p className={cn("text-muted-foreground font-medium leading-relaxed", isLarge ? "text-lg md:text-xl max-w-md" : "text-sm")}>
                       {item.description}
                     </p>
                  </div>
                  
                  <div className="mt-auto pt-8 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-[9px] font-mono font-black tracking-widest text-primary/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        SYSTEM_ACTIVE
                     </div>
                     <Link href={`/services/${item.category || 'web'}`} className="text-[10px] font-black uppercase tracking-widest text-foreground hover:text-primary transition-colors flex items-center gap-1 group/link">
                        DECRYPT NODE <Zap size={10} className="group-hover/link:translate-x-1 transition-transform" />
                     </Link>
                  </div>
                </BentoItem>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
