"use client";

import React from "react";
import { Footer } from "@/components/footer";
import FadeContent from "@/components/ui/fade-content";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Video, Music, Camera, Share2, CheckCircle2, ShieldCheck, Database, Layers, ArrowRight } from "lucide-react";
import Image from "next/image";
import { BlurFade } from "@/components/ui/blur-fade";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { StickyCards } from "@/components/ui/sticky-cards";

const contentServices = [
  {
    title: "Cinematic Video Systems",
    price: "TZS 150,000+",
    desc: "Precision-engineered video for YouTube, Reels, and TikTok. Focusing on high-retention editing and 4K color science.",
    icon: Video,
    features: ["Color Grading", "Sound Design", "Motion Graphics", "High-Retention Cuts"]
  },
  {
    title: "Audio Engineering Lab",
    price: "TZS 80,000+",
    desc: "Professional sound design and beat production using FL Studio. Optimized for clarity and emotional resonance.",
    icon: Music,
    features: ["Vocal Mixing", "Mastering", "Original Scores", "Podcast Production"]
  },
  {
    title: "Visual Asset Capture",
    price: "TZS 120,000+",
    desc: "High-fidelity product and lifestyle shoots in Dar es Salaam. Capturing the essence of your business infrastructure.",
    icon: Camera,
    features: ["Studio Lighting", "Product Retouching", "Event Coverage", "Brand Portraits"]
  }
];

export default function ContentPage() {
  const words = [
    { text: "Professional" },
    { text: "Multimedia", className: "text-primary" },
    { text: "Content", className: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 space-y-24 md:space-y-32">
          {/* Enhanced Hero */}
          <section className="text-center space-y-8 max-w-4xl mx-auto">
            <BlurFade>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 text-pink-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4 border border-pink-500/20">
                <Share2 className="h-4 w-4" />
                Strategic Multimedia Matrix
              </div>
            </BlurFade>
            
            <TypewriterEffect words={words} className="text-3xl sm:text-5xl md:text-8xl font-headline font-black tracking-tighter leading-[0.9] text-center text-foreground" />
            
            <BlurFade delay={0.5}>
              <p className="text-base md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto mt-6">
                We don't just "create content." We architect high-fidelity visual and auditory experiences designed to scale your brand authority in the 2026 digital economy.
              </p>
            </BlurFade>
            
            <BlurFade delay={0.7}>
              <div className="flex flex-wrap justify-center gap-4 pt-8">
                <Button size="lg" className="rounded-full h-12 md:h-16 px-10 bg-pink-600 hover:bg-pink-700 font-black uppercase tracking-widest text-xs md:text-sm text-white" asChild>
                  <Link href="/book">Initialize Build <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
            </BlurFade>
          </section>

          <section className="py-20">
            <StickyCards />
          </section>

          {/* Service Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20 border-t border-border/50">
            {contentServices.map((service, idx) => (
              <FadeContent key={idx} delay={idx * 150}>
                <div className="p-8 border-2 rounded-[2.5rem] bg-card hover:border-pink-500/30 hover:shadow-2xl transition-all h-full flex flex-col group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-pink-500/10 transition-colors" />
                  <div className="mb-6 h-14 w-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-600 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500">
                    <service.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black font-headline mb-2 text-foreground">{service.title}</h3>
                  <p className="text-pink-600 font-black text-lg mb-4">{service.price}</p>
                  <p className="text-muted-foreground text-sm mb-8 leading-relaxed font-medium">{service.desc}</p>
                  <div className="space-y-3 mb-10 flex-1">
                    {service.features.map(f => (
                      <div key={f} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-pink-500" /> {f}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] bg-pink-600 hover:bg-pink-700 mt-auto shadow-lg shadow-pink-600/20 text-white" asChild>
                    <Link href="/book">Select Asset Build</Link>
                  </Button>
                </div>
              </FadeContent>
            ))}
          </div>

          {/* Bottom CTA */}
          <section className="bg-secondary/30 rounded-[3rem] p-12 md:p-24 text-center space-y-8 relative overflow-hidden shadow-2xl border-2 border-dashed">
             <div className="relative z-10 space-y-4">
                <h2 className="text-3xl md:text-6xl font-headline font-black tracking-tighter uppercase text-foreground leading-tight">Ready to architect your multimedia system?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-medium">Get a custom proposal and technical roadmap for your vision within 24 hours.</p>
                <div className="pt-8">
                   <Button size="lg" className="rounded-full h-16 px-12 text-sm md:text-lg font-black uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/20" asChild>
                      <Link href="/book">Initialize Build <ArrowRight className="ml-2" /></Link>
                   </Button>
                </div>
             </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
