
"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { ArrowRight, ExternalLink, Globe, Github } from "lucide-react";
import Link from "next/link";

const PROJECTS = [
  {
    title: "Aymiafrica.org",
    type: "Web Systems Architecture",
    desc: "A high-performance portal for pan-African growth, built with Next.js and Firebase.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
    link: "https://aymi.vercel.app/"
  },
  {
    title: "UAUT Connect",
    type: "Student Coordination",
    desc: "A digital architecture for real-time collaboration at the United Africa University of Tanzania.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200",
    link: "https://uaut-connect.vercel.app/"
  },
  {
    title: "AI Music Companion",
    type: "AI Application",
    desc: "Contextual music curation using local LLMs and Web Audio API integration.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200",
    github: "github.com/mwijay"
  },
  {
    title: "SmartGym Automation",
    type: "Business Pipeline",
    desc: "End-to-end member management and automated billing workflows for local SMBs.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200"
  }
];

export function HorizontalGallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const pin = gsap.fromTo(
      sectionRef.current,
      { translateX: 0 },
      {
        translateX: "-300vw",
        ease: "none",
        duration: 1,
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "2000 top",
          scrub: 0.6,
          pin: true,
          invalidateOnRefresh: true,
        },
      }
    );

    return () => {
      pin.kill();
    };
  }, []);

  return (
    <div ref={triggerRef} className="overflow-hidden">
      <div ref={sectionRef} className="horizontal-container">
        {PROJECTS.map((proj, idx) => (
          <div key={idx} className="horizontal-item">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-7xl mx-auto">
              <div className="space-y-8 order-2 lg:order-1">
                <div className="flex items-center gap-3">
                  <span className="h-px w-12 bg-primary" />
                  <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">{proj.type}</span>
                </div>
                <h3 className="text-5xl md:text-8xl font-black font-headline tracking-tighter leading-none text-foreground">{proj.title}</h3>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-md font-medium">{proj.desc}</p>
                <div className="flex gap-4">
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors group text-foreground">
                      Live Project <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </a>
                  )}
                  {proj.github && (
                    <Link href="#" className="flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors text-foreground">
                      <Github className="h-4 w-4" /> Repository
                    </Link>
                  )}
                </div>
              </div>
              <div className="relative aspect-video rounded-[3rem] overflow-hidden glass-pro group order-1 lg:order-2 shadow-2xl">
                <img 
                  src={proj.image} 
                  alt={proj.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-white text-black flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                    <ExternalLink className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
            <span className="absolute bottom-12 right-12 text-[15vw] font-black text-white/5 pointer-events-none select-none">0{idx+1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
