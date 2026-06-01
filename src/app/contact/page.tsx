"use client";

import React from "react";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { VerticalTabs } from "@/components/ui/vertical-tabs";
import FadeContent from "@/components/ui/fade-content";
import { Button } from "@/components/ui/button";
import { ArrowRight, ClipboardList } from "lucide-react";
import Link from "next/link";

const PORTFOLIO_OWNER_ID = "mwijay-davie-admin";

export default function ContactPage() {
  return (
    <div className="relative w-full bg-background overflow-x-hidden">
      <main className="relative z-10 w-full bg-background pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 space-y-12 pb-24">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-headline font-bold">Get In <span className="text-primary">Touch</span></h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              I'm always open to discussing new projects, AI-driven solutions, or opportunities to be part of your vision.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
             <div className="p-8 md:p-12 rounded-[3rem] border-2 border-dashed bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div className="space-y-2">
                   <h3 className="text-2xl font-black font-headline">Have a specific project?</h3>
                   <p className="text-muted-foreground font-medium">Fill out our detailed inquiry form for a precision proposal.</p>
                </div>
                <Button size="lg" className="rounded-full h-14 px-8 font-black uppercase tracking-widest text-xs gap-3 shadow-xl bg-primary text-white" asChild>
                   <Link href="/book">Start Your Project <ArrowRight size={18} /></Link>
                </Button>
             </div>
          </div>

          <FadeContent threshold={0.1}>
            <VerticalTabs userId={PORTFOLIO_OWNER_ID} />
          </FadeContent>

          <Contact />
        </div>
      </main>
      <Footer />
    </div>
  );
}
