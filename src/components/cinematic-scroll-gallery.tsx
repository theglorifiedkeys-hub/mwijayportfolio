'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import OptimizedImage from '@/components/ui/optimized-image';

const OWNER_ID = "mwijay-davie-admin";

/**
 * CinematicScrollGallery - Simplified and Centered.
 * Keeps only the background MWIJAY text and the 4 pics.
 */
export function CinematicScrollGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);

  const firestore = useFirestore();
  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'users', OWNER_ID);
  }, [firestore]);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Parallax Images Animation
      const images = imagesRef.current?.querySelectorAll('.cinematic-img-wrapper');
      images?.forEach((img, i) => {
        const yStart = i % 2 === 0 ? 100 : -100;
        const yEnd = i % 2 === 0 ? -100 : 100;
        
        gsap.fromTo(img, 
          { y: yStart, opacity: 0, scale: 0.9 },
          {
            y: yEnd,
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const galleryImages = [
    profile?.cinematicImg1 || "https://images.unsplash.com/photo-1530569673472-307dc017a82d?auto=format&fit=crop&q=80&w=400",
    profile?.cinematicImg2 || "https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&q=80&w=400",
    profile?.cinematicImg3 || "https://images.unsplash.com/photo-1551376347-075b0121a65b?auto=format&fit=crop&q=80&w=400",
    profile?.cinematicImg4 || "https://images.unsplash.com/photo-1500817487388-039e623edc21?auto=format&fit=crop&q=80&w=400"
  ];

  return (
    <section ref={containerRef} className="relative min-h-[80vh] bg-background overflow-hidden py-24 border-y border-border/50 z-0 flex flex-col justify-center items-center">
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div ref={imagesRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 relative z-10">
          {galleryImages.map((url, i) => (
            <div 
              key={i} 
              className={`cinematic-img-wrapper relative aspect-[3/4] rounded-xl md:rounded-[2rem] overflow-hidden shadow-2xl border-2 border-white/5 group bg-muted/20`}
            >
              <OptimizedImage 
                src={url} 
                alt={`Cinematic Asset ${i}`} 
                fill 
                className="grayscale group-hover:grayscale-0 transition-all duration-700" 
              />
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
          ))}
        </div>
      </div>
      
      {/* BACKGROUND TEXT ONLY - Perfectly Centered */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-foreground/[0.03] uppercase pointer-events-none select-none -z-10 text-center w-full tracking-tighter font-headline">
        MWIJAY
      </div>
    </section>
  );
}
