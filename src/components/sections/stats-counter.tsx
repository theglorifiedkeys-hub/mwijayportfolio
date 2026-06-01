'use client';

import React from 'react';
import { useDocOnce, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Briefcase, Users, Code2, Calendar } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CountUpNumber } from '@/components/ui/scroll-primitives';

/**
 * StatsCounter - Precision metrics registry.
 * Integrated with CountUpNumber for dynamic scroll interaction.
 */
export default function StatsCounter() {
  const db = useFirestore();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const statsRef = useMemoFirebase(() => {
    if (!db || !isInView) return null;
    return doc(db, 'site_config', 'stats');
  }, [db, isInView]);
  
  const { data: stats, isLoading } = useDocOnce(statsRef);

  const displayStats = stats || {
    projectsCompleted: 12,
    happyClients: 8,
    linesOfCode: 50000,
    yearsExperience: 3
  };

  const ITEMS = [
    { label: "Projects Built", val: Number(displayStats.projectsCompleted) || 0, icon: Briefcase, suffix: "+", color: "text-blue-500" },
    { label: "Happy Clients", val: Number(displayStats.happyClients) || 0, icon: Users, suffix: "+", color: "text-emerald-500" },
    { label: "Lines of Code", val: Number(displayStats.linesOfCode) || 0, icon: Code2, suffix: "+", color: "text-purple-500" },
    { label: "Years Mastery", val: Number(displayStats.yearsExperience) || 0, icon: Calendar, suffix: "+", color: "text-orange-500" },
  ];

  return (
    <section ref={containerRef} className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {ITEMS.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="group p-8 rounded-[2.5rem] border-2 bg-card/40 hover:border-primary/20 hover:-translate-y-1 transition-all duration-500 shadow-sm hover:shadow-2xl relative overflow-hidden border-border/50"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-primary/10 transition-colors" />
            
            <item.icon className={cn("h-6 w-6 mb-6", item.color)} />
            
            <div className="space-y-1">
              {isLoading ? (
                <div className="h-10 w-24 bg-muted animate-pulse rounded-lg" />
              ) : (
                <h3 className="text-3xl md:text-4xl font-black font-headline tracking-tighter text-foreground uppercase">
                  <CountUpNumber end={item.val} suffix={item.suffix} />
                </h3>
              )}
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
                {item.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
