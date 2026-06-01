
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Sparkles, Loader2, Film } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const OWNER_ID = "mwijay-davie-admin";
const DEFAULT_POSTER = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072";

/**
 * VisionaryVideo - High Performance Media Handshake.
 * Dynamically pulls background image/video from Admin Registry.
 */
export function VisionaryVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const db = useFirestore();
  
  const profileRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'users', OWNER_ID);
  }, [db]);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const assetUrl = profile?.visionaryAssetUrl || "";
  const isVideo = assetUrl.includes('.mp4') || assetUrl.includes('video/upload');

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-background border-y border-border/50">
      <div className="absolute inset-0 z-0 bg-zinc-950">
        {isVisible ? (
          isVideo ? (
            <video 
              ref={videoRef}
              autoPlay muted loop playsInline 
              preload="none"
              poster={DEFAULT_POSTER}
              className="w-full h-full object-cover grayscale opacity-40 transition-opacity duration-1000"
            >
              <source src={assetUrl} type="video/mp4" />
            </video>
          ) : (
            <img 
              src={assetUrl || DEFAULT_POSTER} 
              alt="Visionary Background" 
              className="w-full h-full object-cover grayscale opacity-40 transition-opacity duration-1000"
            />
          )
        ) : (
          <img 
            src={DEFAULT_POSTER} 
            alt="Fallback" 
            className="w-full h-full object-cover grayscale opacity-20"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background z-10" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto w-full text-center space-y-12">
        <BlurFade inView>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-xl mx-auto shadow-xl">
            <Sparkles className="h-4 w-4" />
            System Intelligence
          </div>
        </BlurFade>

        <div className="space-y-6">
          <h2 className="text-4xl sm:text-7xl md:text-8xl font-black font-headline tracking-tighter text-white leading-[0.9] uppercase">
            Visionary <span className="text-primary italic">Systems</span>
          </h2>
          <p className="text-lg md:text-3xl text-white/80 font-medium max-w-3xl mx-auto leading-relaxed">
            Transform Your Business with <span className="text-white underline decoration-primary decoration-4 underline-offset-8">Precision Tech</span>
          </p>
        </div>

        <div className="flex justify-center gap-6">
          <Button size="lg" className="rounded-full h-16 md:h-20 px-10 md:px-14 text-sm font-black uppercase tracking-widest bg-primary text-white shadow-2xl border-none hover:scale-105 transition-all" asChild>
            <Link href="/pricing">See Project Plans</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
