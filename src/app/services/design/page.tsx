"use client";

import React from "react";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Palette, PenTool, Image as ImageIcon, Sparkles, CheckCircle2, 
  Layers, Eye, ArrowRight
} from "lucide-react";
import { DesignShowcase } from "@/components/design-showcase";
import { BookGallery } from "@/components/book-gallery";
import { TeamSection } from "@/components/ui/team";
import { BlurFade } from "@/components/ui/blur-fade";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { cn } from "@/lib/utils";
import { 
  ScrollReveal, 
  StaggerReveal, 
  GlowCard,
  MagneticButton,
} from "@/components/ui/scroll-primitives";

/* ═══════════════════════════════════════════
   DESIGN TIERS
═══════════════════════════════════════════ */
const designTiers = [
  {
    title: "High-Impact Assets",
    price: "TZS 30,000+",
    icon: ImageIcon,
    items: ["Viral IG Templates", "Facebook Ad Sets", "Pitch Deck Visuals", "UI Components"],
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Architectural Identity",
    price: "TZS 350,000+",
    icon: PenTool,
    items: ["Master Logo System", "Color Theory Matrix", "Typography Specs", "Brand DNA Guide"],
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Corporate Collateral",
    price: "TZS 100,000+",
    icon: Layers,
    items: ["Professional Profiles", "Technical Reports", "Letterhead Suites", "Business Cards"],
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

/* ═══════════════════════════════════════════
   DESIGN TIER CARD
═══════════════════════════════════════════ */
function DesignTierCard({ tier, index }: { tier: typeof designTiers[0]; index: number }) {
  const Icon = tier.icon;

  return (
    <ScrollReveal direction="up" delay={index * 0.1}>
      <GlowCard
        glowColor={tier.color === "text-blue-500" ? "#3b82f6" : tier.color === "text-purple-500" ? "#a855f7" : "#f59e0b"}
        className="h-full"
      >
        <div className={cn(
          "p-8 rounded-[2.5rem] border-2 hover:border-primary/40 transition-all h-full flex flex-col group relative overflow-hidden shadow-sm hover:shadow-2xl",
          "bg-card border-border/50"
        )}>
          {/* Corner accent */}
          <div className={cn(
            "absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform",
            tier.bgColor
          )} />

          {/* Icon */}
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg",
            tier.bgColor
          )}>
            <Icon className={cn("h-7 w-7", tier.color)} />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-black font-headline mb-2 group-hover:text-primary transition-colors uppercase">
            {tier.title}
          </h3>

          {/* Price */}
          <p className="text-lg font-black mb-6 text-primary">
            {tier.price}
          </p>

          {/* Items */}
          <div className="space-y-3 mb-8 flex-1">
            {tier.items.map(item => (
              <div
                key={item}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
              >
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                {item}
              </div>
            ))}
          </div>

          <MagneticButton className="w-full">
            <Button className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] bg-primary text-white hover:bg-primary/90 transition-all gap-2">
              <Link href="/book" className="w-full flex items-center justify-center gap-2">
                Select Tier <ArrowRight size={14} />
              </Link>
            </Button>
          </MagneticButton>
        </div>
      </GlowCard>
    </ScrollReveal>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function DesignPage() {
  const words = [
    { text: "Architectural" },
    { text: "Visual",   className: "text-primary italic" },
    { text: "Identity", className: "text-primary italic" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">

      {/* Ambient orbs */}
      <div className="fixed top-1/3 right-1/4 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-1/3 left-1/4 w-[400px] h-[400px] bg-primary/2 rounded-full blur-3xl pointer-events-none -z-10" />

      <main className="pt-24 pb-20">
        {/* PREMIUM SHOWCASE - The central source of color truth */}
        <DesignShowcase />

        <div className="max-w-7xl mx-auto px-6 space-y-32 md:space-y-40">

          {/* ══ HERO TEXT ══ */}
          <section className="text-center space-y-8 max-w-4xl mx-auto">
            <BlurFade>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.3em] border border-primary/20 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                Creative System Intelligence
              </div>
            </BlurFade>

            <TypewriterEffect
              words={words}
              className="text-5xl sm:text-7xl md:text-9xl font-headline font-black tracking-tighter leading-[0.85] text-center"
            />

            <BlurFade delay={0.4}>
              <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
                I don't just "design graphics." I architect visual systems that establish structural authority and emotional trust for the next generation of Tanzanian enterprises.
              </p>
            </BlurFade>

            <BlurFade delay={0.6}>
              <div className="flex justify-center gap-4 pt-6">
                <MagneticButton>
                  <Button
                    size="lg"
                    className="rounded-full h-16 px-12 bg-primary text-white hover:bg-primary/90 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:scale-105 transition-all gap-2"
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
                  className="rounded-full h-16 px-12 border-2 font-black uppercase tracking-widest text-xs hover:bg-primary/5 gap-2"
                  asChild
                >
                  <Link href="/projects">
                    View Portfolio <Eye size={18} />
                  </Link>
                </Button>
              </div>
            </BlurFade>
          </section>

          {/* ══ EBOOK CASE STUDY ══ */}
          <ScrollReveal direction="up">
            <section className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-muted pb-8">
                <div className="space-y-2">
                  <span className="text-primary font-black uppercase tracking-[0.3em] text-[9px]">
                    Case Study: Digital Publications
                  </span>
                  <h3 className="text-3xl md:text-5xl font-black font-headline tracking-tighter">
                    eBook <span className="text-primary italic">Architecture</span>
                  </h3>
                </div>
                <p className="text-foreground max-w-xs text-[10px] md:text-xs font-bold leading-relaxed italic uppercase tracking-wider">
                  Tactile 3D flipping experiences for digital corporate profiles.
                </p>
              </div>
              <BookGallery />
            </section>
          </ScrollReveal>

          {/* ══ DESIGN TIERS ══ */}
          <section className="space-y-10">
            <ScrollReveal direction="up">
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-6xl font-black font-headline tracking-tighter">
                  Design <span className="text-primary italic">Offerings</span>
                </h2>
                <p className="text-muted-foreground text-sm md:text-base font-medium max-w-2xl mx-auto">
                  Three tiers of visual excellence, each architected for impact.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {designTiers.map((tier, idx) => (
                <DesignTierCard key={tier.title} tier={tier} index={idx} />
              ))}
            </div>
          </section>

          {/* ══ TEAM SECTION ══ */}
          <ScrollReveal direction="up">
            <TeamSection />
          </ScrollReveal>

          {/* ══ FINAL CTA ══ */}
          <ScrollReveal direction="up">
            <section className="relative rounded-[3rem] overflow-hidden bg-primary text-white p-12 md:p-24 text-center shadow-2xl">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-36 -mb-36 blur-3xl" />

              <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-6xl font-headline font-black tracking-tighter uppercase">
                  Initialize Identity Build
                </h2>
                <p className="text-white/70 text-base md:text-lg font-medium">
                  Let's create a visual system that establishes authority and trust for your brand.
                </p>

                <div className="flex justify-center gap-4 pt-6">
                  <MagneticButton>
                    <Button
                      size="lg"
                      className="rounded-full h-16 px-12 bg-white text-primary hover:bg-white/90 font-black uppercase tracking-widest text-xs gap-2 shadow-2xl hover:scale-105 transition-all"
                      asChild
                    >
                      <Link href="/book">
                        Start Now <ArrowRight size={18} />
                      </Link>
                    </Button>
                  </MagneticButton>
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
