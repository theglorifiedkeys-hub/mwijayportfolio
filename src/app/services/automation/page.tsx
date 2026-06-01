"use client";

import React from "react";
import { Footer } from "@/components/footer";
import FadeContent from "@/components/ui/fade-content";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bot, Zap, MessageSquare, Terminal, ArrowRight, Cpu, Layers, Workflow, Database, Cloud, CheckCircle2, Loader2, FileText, Smartphone } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import { BlurFade } from "@/components/ui/blur-fade";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import AnimatedContent from "@/components/ui/animated-content";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";

const OWNER_ID = "mwijay-davie-admin";

export default function AutomationPage() {
  const db = useFirestore();
  
  const servicesRef = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'users', OWNER_ID, 'services'));
  }, [db]);

  const { data: services, isLoading } = useCollection(servicesRef);

  const automationServices = React.useMemo(() => {
    if (!services) return [];
    return services.filter((s: any) => s.category === 'automation');
  }, [services]);

  const words = [
    { text: "Scale" },
    { text: "Your" },
    { text: "Output", className: "text-primary italic" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <main className="pt-24 pb-20">
        <section className="relative px-6 mb-20 md:mb-32">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6 md:space-y-8 relative z-10 text-center lg:text-left">
              <BlurFade inView>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-[9px] font-black uppercase tracking-[0.3em] mb-4 border border-yellow-500/20">
                  <Bot className="h-3.5 w-3.5" />
                  Industrial Grade Logic
                </div>
              </BlurFade>
              
              <TypewriterEffect words={words} className="text-3xl md:text-8xl font-headline font-black tracking-tighter leading-[1] text-foreground text-left" />
              
              <BlurFade delay={0.5} inView>
                <p className="text-base md:text-xl text-muted-foreground font-medium max-w-xl leading-relaxed mx-auto lg:mx-0">
                  I architect custom automation pipelines that eliminate repetitive tasks, reducing manual overhead and integrating AI directly into your business DNA.
                </p>
              </BlurFade>
              
              <BlurFade delay={0.7} inView>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4 md:pt-8">
                  <Button size="lg" className="rounded-full h-12 md:h-16 px-8 md:px-10 bg-yellow-600 hover:bg-yellow-700 font-bold text-sm md:text-lg shadow-2xl shadow-yellow-600/20 text-white" asChild>
                    <Link href="/book">Start This Project <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </BlurFade>
            </div>
            <AnimatedContent direction="horizontal" distance={30} reverse className="relative aspect-square lg:aspect-[4/5] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-muted">
              <OptimizedImage 
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200" 
                alt="AI Automation"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 p-4 md:p-8 glass-pro rounded-2xl md:rounded-3xl border border-white/10 backdrop-blur-md scale-75 md:scale-100 origin-bottom-left">
                <p className="text-white text-[9px] md:text-xs font-black uppercase tracking-widest mb-1 md:mb-2 opacity-60">SYSTEM STATUS</p>
                <div className="text-white font-headline font-bold text-lg md:text-2xl flex items-center gap-2 md:gap-3">
                  <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-green-500 animate-pulse" />
                  OPTIMIZED
                </div>
              </div>
            </AnimatedContent>
          </div>
        </section>

        {/* STRATEGIC AUTOMATION IDEAS SECTION */}
        <section className="px-6 py-20 md:py-32 border-y border-border/50 bg-primary/5">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-6xl font-black font-headline tracking-tighter uppercase">Autonomous <span className="text-primary italic">Growth</span></h2>
              <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                We design systems that work while you sleep. Here are high-impact automations ready for integration into your platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  title: "AI eBook Generator", 
                  icon: FileText, 
                  desc: "Connect n8n directly to your store. Auto-generate personalized PDFs with client watermarks and deliver them instantly to their portal.",
                  badge: "PRODUCTION READY"
                },
                { 
                  title: "WhatsApp CRM Signal", 
                  icon: Smartphone, 
                  desc: "Every website inquiry automatically syncs to your Trello or Google Sheet CRM, ensuring no client signal is ever lost during your academic season.",
                  badge: "EFFICIENCY NODE"
                },
                { 
                  title: "Autonomous Invoicing", 
                  icon: FileText, 
                  desc: "Automate the entire finance lifecycle. Payment verification triggers instant PDF receipt generation and unlocking of client digital assets.",
                  badge: "REVENUE FLOW"
                }
              ].map((idea, i) => (
                <div key={i} className="p-10 rounded-[2.5rem] bg-card border-2 border-border/50 hover:border-primary/40 transition-all shadow-lg space-y-6 group">
                   <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                     <idea.icon size={28} />
                   </div>
                   <div className="space-y-2">
                     <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">{idea.badge}</span>
                     <h4 className="text-xl font-black font-headline uppercase tracking-tight">{idea.title}</h4>
                   </div>
                   <p className="text-sm text-muted-foreground font-medium leading-relaxed">{idea.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 md:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="glass-pro rounded-[2rem] md:rounded-[3rem] p-6 md:p-20 border-2 border-dashed relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center relative z-10">
                <div className="space-y-6 md:space-y-8">
                  <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter leading-tight text-foreground text-center lg:text-left">The Modern <br /><span className="text-primary italic">Stack</span></h2>
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-medium text-center lg:text-left">
                    We don't rely on black-box tools. We architect custom logic that connects your legacy databases, cloud apps, and AI models into a single, cohesive engine.
                  </p>
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    {[
                      { i: Cloud, t: "Cloud Native", d: "Scalable VPC setups" },
                      { i: Database, t: "Data Gravity", d: "Real-time sync" },
                      { i: Cpu, t: "AI Compute", d: "OpenRouter & Gemini" },
                      { i: Layers, t: "Modular", d: "Easily extensible" }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-2 md:space-y-3 p-4 rounded-2xl bg-background/40 border border-border/50">
                        <item.i className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                        <h4 className="font-bold text-xs md:text-sm text-foreground">{item.t}</h4>
                        <p className="text-[9px] md:text-xs text-muted-foreground font-medium">{item.d}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <AnimatedContent direction="vertical" className="bg-secondary/40 p-4 md:p-8 rounded-2xl md:rounded-3xl border border-white/10 font-mono leading-relaxed shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 md:mb-6">
                    <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-red-500/50" />
                    <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-yellow-500/50" />
                    <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-green-500/50" />
                    <span className="text-[8px] md:text-[10px] text-white/40 ml-2 uppercase tracking-widest">workflow_definition.yaml</span>
                  </div>
                  <pre className="text-blue-400 text-[9px] md:text-sm overflow-x-auto whitespace-pre-wrap sm:whitespace-pre custom-scrollbar">
{`version: "2026.1"
automation:
  - trigger: "new_inquiry"
    source: "whatsapp_webhook"
    actions:
      - node: "ai_classifier"
        model: "gemini-2.5-flash"
        prompt: "Categorize lead intent"
      - node: "crm_integration"
        db: "firestore"
        action: "create_lead"
      - node: "notify_admin"
        channel: "slack"
        priority: "high"`}
                  </pre>
                </AnimatedContent>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 md:py-12">
          <div className="max-w-7xl mx-auto bg-secondary rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 text-center space-y-6 md:space-y-10 relative overflow-hidden shadow-2xl text-white">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/10 to-transparent" />
            <div className="relative z-10 max-w-3xl mx-auto space-y-4 md:space-y-6">
              <h2 className="text-3xl md:text-6xl font-headline font-black tracking-tighter uppercase">Ready to Automate?</h2>
              <p className="text-white/70 text-base md:text-xl font-medium">
                Book a free strategy call to audit your current manual processes and see how much time we can buy back for your business.
              </p>
              <div className="pt-4 md:pt-8">
                <Button size="lg" variant="secondary" className="rounded-full h-12 md:h-16 px-8 md:px-12 text-sm md:text-lg font-black uppercase tracking-widest bg-white text-primary hover:bg-white/90" asChild>
                  <Link href="/book">Start This Project <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
