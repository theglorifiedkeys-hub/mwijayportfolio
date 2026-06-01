'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, ArrowLeft, Printer, 
  ChevronRight, Scale, CreditCard, 
  Code, AlertCircle, HelpCircle, UserCheck,
  Target, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const SECTIONS = [
  { id: "intro", title: "1. Introduction & Acceptance", icon: ShieldCheck },
  { id: "services", title: "2. Services Offered", icon: Code },
  { id: "payment", title: "3. Payment Terms", icon: CreditCard },
  { id: "scope", title: "4. Project Scope & Delivery", icon: Target },
  { id: "client", title: "5. Client Responsibilities", icon: UserCheck },
  { id: "ip", title: "6. Intellectual Property", icon: Scale },
  { id: "liability", title: "7. Limitation of Liability", icon: AlertCircle },
  { id: "dispute", title: "8. Dispute Resolution", icon: HelpCircle },
  { id: "digital", title: "9. Digital Products", icon: Sparkles },
];

export default function TermsPage() {
  const lastUpdated = "October 15, 2025";

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <main className="max-w-5xl mx-auto px-6 py-32 space-y-16">
        
        {/* Navigation & Header */}
        <div className="space-y-12">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors no-print">
            <ArrowLeft size={14} /> Portfolio Genesis
          </Link>

          <div className="space-y-6">
            <div className="flex items-center justify-between items-end gap-6 flex-wrap">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                  <Scale className="h-3.5 w-3.5" /> Legal Governance 2026
                </div>
                <h1 className="text-4xl md:text-7xl font-black font-headline tracking-tighter uppercase leading-none">
                  Terms of <span className="text-primary italic">Service</span>
                </h1>
                <p className="text-muted-foreground font-medium">Last signal update: {lastUpdated}</p>
              </div>
              <Button onClick={() => window.print()} variant="outline" className="rounded-full h-12 px-6 gap-2 font-black uppercase text-[10px] no-print">
                <Printer size={16} /> Print Document
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Table of Contents */}
          <aside className="lg:col-span-4 space-y-8 no-print sticky top-32 h-fit">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Table of Contents</h4>
            <nav className="flex flex-col gap-2">
              {SECTIONS.map(s => (
                <a 
                  key={s.id} 
                  href={`#${s.id}`}
                  className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all group"
                >
                  <span className="text-xs font-bold text-foreground/80 group-hover:text-primary">{s.title}</span>
                  <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-20 text-foreground/80 leading-relaxed font-medium printable-content">
            
            <section id="intro" className="space-y-6 scroll-mt-32">
              <h2 className="text-2xl font-black font-headline text-foreground uppercase tracking-tight flex items-center gap-3">
                <ShieldCheck className="text-primary" /> 1. Introduction
              </h2>
              <div className="space-y-4">
                <p>Welcome to Mwijay Services. These Terms of Service ("Terms") govern your use of our website (mwijayportfolio.vercel.app) and the acquisition of our digital services and products.</p>
                <p>By engaging with Mwijay Services or purchasing our digital products, you acknowledge that you have read, understood, and agreed to be bound by these legal protocols. If you do not agree, you must terminate your signal to our systems immediately.</p>
              </div>
            </section>

            <section id="services" className="space-y-6 scroll-mt-32">
              <h2 className="text-2xl font-black font-headline text-foreground uppercase tracking-tight flex items-center gap-3">
                <Code className="text-primary" /> 2. Services Offered
              </h2>
              <p>Mwijay Services provides precision-engineered digital solutions including but not limited to:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["Web Development", "AI Automation", "Digital Products", "Hosting & Maintenance", "Brand Design"].map(s => (
                  <li key={s} className="p-4 rounded-xl bg-muted/20 border flex items-center gap-3 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" /> {s}
                  </li>
                ))}
              </ul>
            </section>

            <section id="payment" className="space-y-6 scroll-mt-32">
              <h2 className="text-2xl font-black font-headline text-foreground uppercase tracking-tight flex items-center gap-3">
                <CreditCard className="text-primary" /> 3. Payment Terms
              </h2>
              <div className="space-y-6">
                <div className="p-8 rounded-3xl bg-primary/5 border-2 border-dashed border-primary/20 space-y-4">
                   <p className="font-bold text-foreground">Standard Architecture Protocol:</p>
                   <ul className="space-y-3 text-sm">
                     <li>• <strong>50% Advance:</strong> Non-refundable deposit required to initiate any architecture build.</li>
                     <li>• <strong>50% Completion:</strong> Final settlement required before project migration to 'Live' status.</li>
                     <li>• <strong>Currency:</strong> All pricing is calculated in Tanzanian Shillings (TZS).</li>
                   </ul>
                </div>
                <p>Accepted nodes: <strong>Vodacom M-Pesa</strong> and <strong>Halotel HaloPesa</strong>. We do not accept cash or cheque signals unless explicitly agreed in writing.</p>
                <p className="text-sm italic">Note: Digital products (PDFs, templates, bundles) require 100% upfront payment for instant fulfillment.</p>
              </div>
            </section>

            <section id="scope" className="space-y-6 scroll-mt-32">
              <h2 className="text-2xl font-black font-headline text-foreground uppercase tracking-tight flex items-center gap-3">
                <Target className="text-primary" /> 4. Project Scope
              </h2>
              <p>Project scope is strictly defined in the signed Service Agreement. Requests for modifications or additions outside the initial brief will be treated as 'Scope Creep' and will require a separate Quotation Signal.</p>
              <p>Delivery timelines are estimates. Mwijay Services is not responsible for delays caused by the client's failure to provide content, feedback, or approvals within the requested 7-day windows.</p>
            </section>

            <section id="ip" className="space-y-6 scroll-mt-32">
              <h2 className="text-2xl font-black font-headline text-foreground uppercase tracking-tight flex items-center gap-3">
                <Scale className="text-primary" /> 5. Intellectual Property
              </h2>
              <p>Ownership of code, designs, and digital assets transfers to the Client <strong>ONLY AFTER 100% PAYMENT FULFILLMENT</strong>. Mwijay Services retains the right to showcase all developed work in our professional portfolio unless a Non-Disclosure Agreement (NDA) is signed and paid for.</p>
            </section>

            <section id="dispute" className="space-y-6 scroll-mt-32">
              <h2 className="text-2xl font-black font-headline text-foreground uppercase tracking-tight flex items-center gap-3">
                <HelpCircle className="text-primary" /> 6. Dispute Resolution
              </h2>
              <p>Any technical or business disputes shall first be addressed through direct coordination within 14 days. If unresolved, legal proceedings shall be governed by the laws of the <strong>United Republic of Tanzania</strong>.</p>
            </section>

            <div className="pt-20 border-t border-border/50 text-center space-y-8 no-print">
               <h3 className="text-3xl font-black font-headline tracking-tighter uppercase">Ready to initialize?</h3>
               <div className="flex flex-wrap justify-center gap-4">
                  <Button className="rounded-full h-14 px-10 bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl" asChild>
                    <Link href="/agreement">Generate Service Agreement</Link>
                  </Button>
                  <Button variant="outline" className="rounded-full h-14 px-10 border-2 font-black uppercase text-[10px] tracking-widest" asChild>
                    <Link href="/contact">Inquire on WhatsApp</Link>
                  </Button>
               </div>
            </div>

          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          .printable-content { width: 100% !important; margin: 0 !important; color: black !important; }
          header, footer { display: none !important; }
          .lg\\:col-span-8 { width: 100% !important; grid-column: span 12 / span 12 !important; }
          .lg\\:col-span-4 { display: none !important; }
          h2 { border-bottom: 2px solid #000 !important; padding-bottom: 0.5rem; }
        }
      `}} />
    </div>
  );
}
