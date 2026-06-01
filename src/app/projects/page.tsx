
"use client";

import React from "react";
import { Projects } from "@/components/projects";
import { Footer } from "@/components/footer";
import { CinematicScrollGallery } from "@/components/cinematic-scroll-gallery";
import FadeContent from "@/components/ui/fade-content";

const PORTFOLIO_OWNER_ID = "mwijay-davie-admin";

export default function ProjectsPage() {
  return (
    <div className="relative w-full bg-background overflow-x-hidden">
      <main className="relative z-10 w-full bg-background pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 space-y-12 pb-12">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter text-foreground">Work <span className="text-primary">Gallery</span></h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              A comprehensive showcase of my technical builds, automation workflows, and AI-powered architectures.
            </p>
          </div>
          
          <div className="mt-12">
            <Projects userId={PORTFOLIO_OWNER_ID} />
          </div>
        </div>

        {/* PREMIUM CINEMATIC SCROLL - NOW IN PORTFOLIO FOR MAXIMUM IMPACT */}
        <CinematicScrollGallery />

        <div className="max-w-7xl mx-auto px-6 py-24">
          <FadeContent threshold={0.1}>
            <div className="p-12 md:p-20 bg-primary/5 rounded-[3rem] border border-primary/10 text-center space-y-6">
              <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter">Ready to architect your build?</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">We handle projects of all scales, from simple landing pages to complex enterprise automation.</p>
              <div className="pt-8">
                <ProjectsCTAButton />
              </div>
            </div>
          </FadeContent>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProjectsCTAButton() {
  return (
    <a 
      href="/contact" 
      className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-primary text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all"
    >
      Initialize Project Build
    </a>
  );
}
