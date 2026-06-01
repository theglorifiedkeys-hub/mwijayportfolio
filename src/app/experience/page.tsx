"use client";

import React from "react";
import { Experience } from "@/components/experience";
import { Footer } from "@/components/footer";
import { Recognitions } from "@/components/recognitions";
import FadeContent from "@/components/ui/fade-content";

/**
 * CRITICAL: Opt out of static generation to prevent build-time crashes.
 * Experience items are fetched from Firestore at runtime.
 */
export const dynamic = 'force-dynamic';

const PORTFOLIO_OWNER_ID = "mwijay-davie-admin";

export default function ExperiencePage() {
  return (
    <div className="relative w-full bg-background overflow-x-hidden">
      <main className="relative z-10 w-full bg-background pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 space-y-24 pb-24">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-7xl font-headline font-bold text-foreground">My <span className="text-primary">Timeline</span></h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              A journey of continuous learning, professional growth, and technical mastery in the East African tech landscape.
            </p>
          </div>

          <Experience userId={PORTFOLIO_OWNER_ID} />

          {/* VERIFIED CERTIFICATIONS HUB */}
          <FadeContent threshold={0.1}>
            <div className="pt-12 border-t border-border/50">
               <div className="text-center space-y-4 mb-16">
                 <h2 className="text-3xl md:text-5xl font-headline font-black tracking-tighter">Recognitions <span className="text-primary italic">& Awards</span></h2>
                 <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto">Verified certifications and professional honors from industry leaders.</p>
               </div>
               <Recognitions userId={PORTFOLIO_OWNER_ID} />
            </div>
          </FadeContent>
        </div>
      </main>
      <Footer />
    </div>
  );
}
