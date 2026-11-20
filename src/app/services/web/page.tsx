"use client";

import React, { useState } from "react";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Globe, ArrowRight, Star, Loader2, Sparkles, 
  Layers, Eye, MessageSquareQuote, Zap, Shield,
  Code2, Rocket, Check, ChevronRight, TrendingUp,
  Database, Smartphone, BarChart3, Lock
} from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { useDoc, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import OptimizedImage from "@/components/ui/optimized-image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ScrollReveal, 
  StaggerReveal, 
  CountUpNumber,
  GlowCard,
  MagneticButton,
} from "@/components/ui/scroll-primitives";

const OWNER_ID = "mwijay-davie-admin";

/* ═══════════════════════════════════════════
   TECH STACK NODES
═══════════════════════════════════════════ */
const TECH_STACK = [
  { label: "Next.js 15",   color: "bg-black text-white" },
  { label: "TypeScript",   color: "bg-blue-600 text-white" },
  { label: "Tailwind CSS", color: "bg-cyan-500 text-white" },
  { label: "Firebase",     color: "bg-orange-500 text-white" },
  { label: "Vercel Edge",  color: "bg-slate-800 text-white" },
  { label: "Framer Motion",color: "bg-purple-600 text-white" },
  { label: "shadcn/ui",    color: "bg-zinc-700 text-white" },
  { label: "Genkit AI",    color: "bg-green-600 text-white" },
];

/* ═══════════════════════════════════════════
   PROCESS STEPS
═══════════════════════════════════════════ */
const PROCESS_STEPS = [
  {
    step: "01",
    title: "Signal Intake",
    desc: "You submit your vision brief. We analyze scope, technical stack, and business objectives within 24 hours.",
    icon: MessageSquareQuote,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    step: "02",
    title: "Architecture Design",
    desc: "We map the technical blueprint — database schema, API routes, component architecture, and deployment pipeline.",
    icon: Layers,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    step: "03",
    title: "Precision Build",
    desc: "High-performance code written with Next.js 15, TypeScript, and optimized for sub-2s load times globally.",
    icon: Code2,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    step: "04",
    title: "Deploy & Hand Over",
    desc: "Live on Vercel Edge Network with 99.9% uptime SLA. Full source code and admin access transferred to you.",
    icon: Rocket,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
];

/* ═══════════════════════════════════════════
   CAPABILITIES
═══════════════════════════════════════════ */
const CAPABILITIES = [
  { icon: Zap,          label: "Sub-2s Load Times",        desc: "Edge-optimized delivery worldwide" },
  { icon: Smartphone,   label: "Mobile-First",              desc: "Pixel-perfect across all devices" },
  { icon: Shield,       label: "Enterprise Security",       desc: "Auth, rate limiting, data encryption" },
  { icon: Database,     label: "Real-Time Data",            desc: "Live Firestore sync & WebSockets" },
  { icon: BarChart3,    label: "SEO Optimized",             desc: "Structured data & Core Web Vitals" },
  { icon: Lock,         label: "Admin Dashboard",           desc: "Full CMS control panel included" },
  { icon: TrendingUp,   label: "Scales with You",           desc: "Serverless — zero capacity limits" },
  { icon: Globe,        label: "Global CDN",                desc: "Vercel Edge Network deployment" },
];

/* ═══════════════════════════════════════════
   STAT PILL
═══════════════════════════════════════════ */
function StatPill({ 
  value, 
  suffix = "", 
  label 
}: { 
  value: number; 
  suffix?: string; 
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-8 py-6 rounded-[2rem] bg-card border-2 border-border/50 hover:border-primary/30 transition-all shadow-sm">
      <p className="text-4xl md:text-5xl font-black tracking-tighter text-primary">
        <CountUpNumber end={value} suffix={suffix} />
      </p>
      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground text-center">
        {label}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TECH MARQUEE
═══════════════════════════════════════════ */
function TechMarquee() {
  const MarqueeRow = () => (
    <div className="flex items-center gap-4 px-2 min-w-full shrink-0">
      {TECH_STACK.map((tech, i) => (
        <span
          key={`${tech.label}-${i}`}
          className={cn(
            "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl whitespace-nowrap border-2 border-white/5",
            tech.color
          )}
        >
          {tech.label}
        </span>
      ))}
    </div>
  );

  return (
    <div className="w-full overflow-hidden py-12 relative">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes tech-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-tech-scroll {
          animation: tech-scroll 30s linear infinite;
        }
      `}} />
      <div className="flex animate-tech-scroll group-hover:[animation-play-state:paused]">
        <MarqueeRow />
        <MarqueeRow />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TEMPLATE CARD
═══════════════════════════════════════════ */
function TemplateCard({ tpl, index }: { tpl: any; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
    >
      <GlowCard className="group bg-card border-2 rounded-[2.5rem] overflow-hidden flex flex-col hover:border-primary/40 transition-all hover:shadow-2xl h-full">
        
        {/* Image */}
        <div
          className="aspect-video relative overflow-hidden bg-muted"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {tpl.imageUrl && (
            <OptimizedImage
              src={tpl.imageUrl}
              fill
              className={cn(
                "object-cover transition-transform duration-700",
                hovered ? "scale-110" : "scale-100"
              )}
              alt={tpl.title}
            />
          )}

          {/* Overlay on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-primary/80 flex items-center justify-center backdrop-blur-sm"
              >
                <div className="text-center text-white space-y-2">
                  <Eye size={32} className="mx-auto" />
                  <p className="text-xs font-black uppercase tracking-widest">Preview Build</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-black/70 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10">
              {tpl.complexity || 'Standard'} Build
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 flex flex-col">
          {/* Top accent */}
          <div className="h-0.5 w-12 bg-primary rounded-full mb-6" />

          <h4 className="text-xl font-black tracking-tight uppercase mb-2 group-hover:text-primary transition-colors">
            {tpl.title}
          </h4>

          <p className="text-2xl font-black text-primary mb-4">
            {tpl.price || 'Quote on Request'}
          </p>

          <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-medium line-clamp-3 flex-1">
            {tpl.description}
          </p>

          <Button
            className="mt-auto w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10 gap-2"
            asChild
          >
            <Link href="/book">
              Select Foundation <ChevronRight size={14} />
            </Link>
          </Button>
        </div>
      </GlowCard>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function WebDevPage() {
  const db = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'users', OWNER_ID);
  }, [db]);
  const { data: profile } = useDoc(profileRef);

  const templatesRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'users', OWNER_ID, 'services');
  }, [db]);
  const { data: services, isLoading: isTemplatesLoading } = useCollection(templatesRef);

  const templates = React.useMemo(() => {
    if (!services) return [];
    return services.filter((s: any) => s.category === 'web');
  }, [services]);

  const words = [
    { text: "High-Performance" },
    { text: "Web",     className: "text-primary italic" },
    { text: "Systems", className: "text-primary italic" },
  ];

  const backgroundUrl = profile?.visionaryAssetUrl ||
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072";
  const isVideo = backgroundUrl.includes('.mp4') || backgroundUrl.includes('video/upload');

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">

      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none">
        {isVideo ? (
          <video src={backgroundUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
        ) : (
          <OptimizedImage src={backgroundUrl} fill className="object-cover" alt="Background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <main className="relative z-10 pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto space-y-32">

          {/* ══ HERO ══ */}
          <section className="text-center space-y-10 max-w-5xl mx-auto">
            <BlurFade>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.3em] border border-primary/20 backdrop-blur-md">
                <Globe className="h-3.5 w-3.5" />
                World-Class Digital Architecture
              </div>
            </BlurFade>

            <TypewriterEffect
              words={words}
              className="text-5xl sm:text-7xl md:text-9xl font-headline font-black tracking-tighter leading-[0.85] text-center"
            />

            <BlurFade delay={0.4}>
              <p className="text-base md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
                Enterprise-grade web systems engineered for the East African digital landscape — 
                fast, scalable, and built to convert.
              </p>
            </BlurFade>

            {/* Tech Marquee */}
            <BlurFade delay={0.5}>
              <TechMarquee />
            </BlurFade>

            <BlurFade delay={0.7}>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <MagneticButton>
                  <Button
                    size="lg"
                    className="rounded-full h-16 px-12 text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all gap-2"
                    asChild
                  >
                    <Link href="/book">
                      Initialize Build <ArrowRight size={18} />
                    </Link>
                  </Button>
                </MagneticButton>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-16 px-12 text-xs font-black uppercase tracking-widest border-2 hover:bg-primary/5 transition-all gap-2"
                  asChild
                >
                  <Link href="/projects">
                    View Builds <Eye size={18} />
                  </Link>
                </Button>
              </div>
            </BlurFade>
          </section>

          {/* ══ STATS ══ */}
          <ScrollReveal direction="up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatPill value={50}  suffix="+"  label="Systems Built" />
              <StatPill value={99}  suffix="%"  label="Client Satisfaction" />
              <StatPill value={2}   suffix="s"  label="Avg Load Time" />
              <StatPill value={24}  suffix="h"  label="Proposal Delivery" />
            </div>
          </ScrollReveal>

          {/* ══ CAPABILITIES ══ */}
          <section>
            <ScrollReveal direction="up">
              <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em]">
                  <Sparkles size={12} />
                  Capabilities
                </div>
                <h2 className="text-3xl md:text-6xl font-black font-headline tracking-tighter">
                  What's <span className="text-primary italic">Included</span>
                </h2>
                <p className="text-muted-foreground text-sm md:text-base font-medium max-w-xl mx-auto">
                  Every build ships with enterprise-grade features as standard.
                </p>
              </div>
            </ScrollReveal>

            <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CAPABILITIES.map((cap) => (
                <GlowCard
                  key={cap.label}
                  className="p-6 rounded-[2rem] bg-card border-2 border-border/50 hover:border-primary/30 transition-all shadow-sm group"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform",
                    "bg-primary/10"
                  )}>
                    <cap.icon size={22} className="text-primary" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">
                    {cap.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                    {cap.desc}
                  </p>
                </GlowCard>
              ))}
            </StaggerReveal>
          </section>

          {/* ══ PROCESS ══ */}
          <section>
            <ScrollReveal direction="up">
              <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em]">
                  <Zap size={12} />
                  Build Protocol
                </div>
                <h2 className="text-3xl md:text-6xl font-black font-headline tracking-tighter">
                  How It <span className="text-primary italic">Works</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Connector line */}
              <div className="absolute top-10 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-primary/20 via-primary to-primary/20 hidden md:block" />

              {PROCESS_STEPS.map((step, i) => (
                <ScrollReveal key={step.step} direction="up" delay={i * 0.1}>
                  <div className="relative flex flex-col items-center text-center p-8 rounded-[2rem] bg-card border-2 border-border/50 hover:border-primary/30 transition-all shadow-sm group">
                    {/* Step circle */}
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border-2 group-hover:scale-110 transition-transform shadow-lg",
                      step.bg,
                      "border-primary/20"
                    )}>
                      <step.icon size={28} className={step.color} />
                    </div>

                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                      Step {step.step}
                    </span>
                    <h4 className="text-base font-black uppercase tracking-tight mb-3 group-hover:text-primary transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* ══ TEMPLATES ══ */}
          <section className="border-y border-border/30 py-20">
            <ScrollReveal direction="up">
              <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[9px] font-black uppercase tracking-widest border border-accent/20">
                    <Layers size={12} />
                    Sample Architectures
                  </div>
                  <h2 className="text-3xl md:text-6xl font-black font-headline tracking-tighter">
                    Pre-Built <span className="text-primary italic">Templates</span>
                  </h2>
                  <p className="text-muted-foreground text-sm font-medium max-w-md">
                    Choose a starting foundation for your vision. Every template is a fully engineered architecture, not a theme.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="h-12 px-8 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] gap-2 shrink-0"
                  asChild
                >
                  <Link href="/projects">
                    View All Builds <ArrowRight size={14} />
                  </Link>
                </Button>
              </div>
            </ScrollReveal>

            {isTemplatesLoading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                  Loading Templates...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {templates.map((tpl: any, idx: number) => (
                  <TemplateCard key={tpl.id} tpl={tpl} index={idx} />
                ))}
                {templates.length === 0 && (
                  <div className="col-span-full py-24 text-center border-2 border-dashed rounded-[3rem] border-border/30 bg-muted/10">
                    <Globe size={48} className="mx-auto mb-4 text-muted-foreground/30" />
                    <p className="font-black uppercase tracking-widest text-sm text-muted-foreground/50">
                      Template Registry Empty
                    </p>
                    <p className="text-[10px] text-muted-foreground/30 mt-2 font-medium uppercase tracking-wider">
                      Sync nodes in Admin Panel
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ══ CTA ══ */}
          <ScrollReveal direction="up">
            <section className="relative rounded-[3rem] overflow-hidden bg-primary text-white p-12 md:p-24 text-center shadow-2xl">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-36 -mb-36 blur-3xl" />

              <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[9px] font-black uppercase tracking-[0.3em]">
                  <Rocket size={12} />
                  Ready to Build?
                </div>

                <h2 className="text-3xl md:text-6xl font-headline font-black tracking-tighter uppercase leading-tight">
                  Let's architect your web system
                </h2>

                <p className="text-white/70 max-w-xl mx-auto text-base md:text-lg font-medium leading-relaxed">
                  Get a custom proposal and technical roadmap delivered within 24 hours. No templates, no compromises.
                </p>

                <div className="flex flex-wrap justify-center gap-4 pt-6">
                  <MagneticButton>
                    <Button
                      size="lg"
                      className="rounded-full h-16 px-12 bg-white text-primary hover:bg-white/90 font-black uppercase tracking-widest text-xs gap-3 shadow-2xl border-none hover:scale-105 transition-all"
                      asChild
                    >
                      <Link href="/book">
                        Initialize Build <Zap size={18} />
                      </Link>
                    </Button>
                  </MagneticButton>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full h-16 px-12 border-2 border-white/30 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs gap-2 backdrop-blur-sm"
                    asChild
                  >
                    <Link href="/pricing">
                      View Pricing <ArrowRight size={18} />
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
          </ScrollReveal>

        </div>
      </main>
      <Footer />
    </div>
  );
}
