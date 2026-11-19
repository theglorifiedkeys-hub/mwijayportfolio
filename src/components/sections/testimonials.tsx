'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import OptimizedImage from '@/components/ui/optimized-image';
import { useCollection,useMemoFirebase } from '@/firebase';
import SkeletonCard from '@/components/ui/skeleton-card';

export default function Testimonials({editorial=false}:{editorial?:boolean}={}){
  const [index,setActiveIndex]=useState(0);
  const db=useFirestore();
  const ref=useMemoFirebase(()=>db?query(collection(db,'testimonials'),where('isVisible','==',true),orderBy('order','asc')):null,[db]);
  const {data,isLoading}=useCollection(ref,{enabled:!!ref});
  const testimonials=data || [];
  useEffect(() => {
    if (editorial || testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials,editorial]);

  if (isLoading && editorial) return null;
  if (isLoading) return (
    <div className="py-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
      {[1, 2, 3].map(i => <SkeletonCard key={i} variant="default" />)}
    </div>
  );

  if (testimonials.length === 0) return null;

  const current = testimonials[index % testimonials.length];

  if(editorial) return <section id="client-testimonials" className="ed-wrap ed-client-note">
    <div className="ed-kicker"><i/>Notes from clients</div>
    <figure aria-live="polite"><blockquote>“{current.quote}”</blockquote><figcaption><b>{current.clientName}</b><span>{[current.clientRole,current.clientCompany].filter(Boolean).join(' · ')}</span></figcaption></figure>
    {testimonials.length>1 && <div className="ed-note-controls"><button aria-label="Previous testimonial" onClick={()=>setActiveIndex(i=>(i-1+testimonials.length)%testimonials.length)}><ChevronLeft size={16}/></button><span>{index%testimonials.length+1} / {testimonials.length}</span><button aria-label="Next testimonial" onClick={()=>setActiveIndex(i=>(i+1)%testimonials.length)}><ChevronRight size={16}/></button></div>}
  </section>;

  const getInitialsColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-orange-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <section id="client-testimonials" className="py-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-6xl font-black font-headline tracking-tighter">Voice of <span className="text-primary italic">Clients</span></h2>
          <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs">Notes from clients</p>
        </div>

        <div className="relative min-h-[400px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id || index}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="max-w-3xl w-full"
            >
              <div className="bg-card/50 border-2 rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl border-border/50">
                <Quote className="absolute top-10 right-10 h-20 w-20 text-primary/5 -z-0" />
                
                <div className="space-y-8 relative z-10">
                  <div className="flex gap-1 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-5 w-5", i < (current.rating || 5) ? "fill-current" : "opacity-20")} />
                    ))}
                  </div>

                  <p className="text-xl md:text-3xl font-medium leading-relaxed italic text-foreground/90">
                    "{current.quote}"
                  </p>

                  <div className="flex items-center gap-5 pt-8 border-t border-border/50">
                    {current.clientAvatar ? (
                      <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-primary/20">
                        <OptimizedImage src={current.clientAvatar} alt={current.clientName} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg", getInitialsColor(current.clientName || 'User'))}>
                        {(current.clientName || 'U').split(' ').map((n: any) => n[0]).join('')}
                      </div>
                    )}
                    <div>
                      <h4 className="font-black font-headline text-lg text-foreground">{current.clientName}</h4>
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{current.clientRole} at {current.clientCompany}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-4">
            <button aria-label="Previous testimonial"
              onClick={() => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="h-12 w-12 rounded-full bg-card border-2 flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all pointer-events-auto shadow-xl"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button aria-label="Next testimonial"
              onClick={() => setActiveIndex((prev) => (prev + 1) % testimonials.length)}
              className="h-12 w-12 rounded-full bg-card border-2 flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all pointer-events-auto shadow-xl"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-12">
          {testimonials.map((_, i) => (
            <button
              key={i} aria-label={`Show testimonial ${i+1}`}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                index === i ? "w-12 bg-primary" : "w-2 bg-muted hover:bg-primary/40"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}