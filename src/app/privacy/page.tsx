'use client';

import React from 'react';
import { Footer } from '@/components/footer';
import { ShieldCheck, Lock, Database, Eye, Globe, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={14} /> Back to Terminal
        </Link>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] border border-primary/20">
            <Lock size={14} /> Security Protocol
          </div>
          <h1 className="text-4xl md:text-7xl font-black font-headline tracking-tighter">Privacy <span className="text-primary italic">Registry</span></h1>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed">
            How we protect your digital signals and professional data in the 2026 technical ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 py-12 border-t border-border/50">
          <section className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Database size={20} /></div>
                <h3 className="text-xl font-black font-headline uppercase tracking-tight">Signal Collection</h3>
             </div>
             <p className="text-muted-foreground leading-relaxed font-medium">
                We collect signals (data) that you voluntarily transmit through our contact nodes, order forms, and client portal. This includes identifiers like name, email, and technical project requirements necessary to architect your build.
             </p>
          </section>

          <section className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary"><ShieldCheck size={20} /></div>
                <h3 className="text-xl font-black font-headline uppercase tracking-tight">Data Governance</h3>
             </div>
             <p className="text-muted-foreground leading-relaxed font-medium">
                Your registry entries are stored securely using Firebase Firestore with strict industrial-grade security rules. We do not sell your signals to third-party nodes. Your data is used exclusively to deliver the technical services you requested.
             </p>
          </section>

          <section className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent"><Eye size={20} /></div>
                <h3 className="text-xl font-black font-headline uppercase tracking-tight">Visibility & Cookies</h3>
             </div>
             <p className="text-muted-foreground leading-relaxed font-medium">
                We use cookies and analytics signals to measure system performance and improve visitor experience. You can choose to decline these signals at any time via the global consent banner.
             </p>
          </section>

          <section className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500"><Globe size={20} /></div>
                <h3 className="text-xl font-black font-headline uppercase tracking-tight">Global Rights</h3>
             </div>
             <p className="text-muted-foreground leading-relaxed font-medium">
                You have the right to request deletion of your signal from our registry. For any data governance inquiries, please contact our terminal directly via email or WhatsApp.
             </p>
          </section>
        </div>

        <div className="p-10 rounded-[3rem] bg-muted/20 border-2 border-dashed border-border/50 text-center space-y-6">
           <h4 className="font-black font-headline uppercase tracking-tight">Need more clarity?</h4>
           <p className="text-muted-foreground text-sm font-medium">Our architects are available to discuss our security protocols in detail.</p>
           <Button className="rounded-full h-12 px-8 font-black uppercase tracking-widest text-[10px]" asChild>
             <Link href="/contact">Inquire via Contact Node</Link>
           </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
