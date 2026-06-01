import React from "react";
import Link from "next/link";
import { ArrowRight, LayoutGrid, Zap, Bot } from "lucide-react";
import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";
import { Projects } from "@/components/projects";
import { LogosMarquee } from "@/components/sections/logos-marquee";
import { VisionaryVideo } from "@/components/sections/visionary-video";
import { InsightsSection } from "@/components/sections/InsightsSection";
import { CyberneticBentoGrid } from "@/components/ui/cybernetic-bento-grid";
import StatsCounter from "@/components/sections/stats-counter";
import { Marquee } from "@/components/ui/marquee";
import { Button } from "@/components/ui/button";
import { 
  ScrollReveal, 
  StaggerReveal, 
  WordReveal,
  GlowCard,
  MagneticButton,
  ScrollProgressBar,
} from "@/components/ui/scroll-primitives";

export const dynamic   = 'force-dynamic';
export const revalidate = 0;

const PORTFOLIO_OWNER_ID = "mwijay-davie-admin";

export default function Home() {
  return (
    <div className="relative w-full bg-background overflow-x-hidden">
      
      {/* Global scroll progress bar */}
      <ScrollProgressBar />

      <main className="relative z-10 w-full bg-background pt-20">

        {/* Hero — static server component but tagline is dynamic */}
        <Hero userId={PORTFOLIO_OWNER_ID} />

        {/* Marquee */}
        <ScrollReveal direction="none">
          <Marquee />
        </ScrollReveal>

        {/* Stats Counter */}
        <ScrollReveal delay={0.1}>
          <StatsCounter />
        </ScrollReveal>

        {/* Visionary Video */}
        <ScrollReveal direction="up" delay={0.1}>
          <VisionaryVideo />
        </ScrollReveal>

        {/* Bento Grid */}
        <ScrollReveal direction="up">
          <CyberneticBentoGrid />
        </ScrollReveal>

        {/* Logos */}
        <ScrollReveal direction="none">
          <LogosMarquee />
        </ScrollReveal>

        {/* ══ PROJECTS SECTION ══ */}
        <section className="py-24 md:py-32 bg-muted/30 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-6 mb-16">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="text-left space-y-4">
                <ScrollReveal direction="left">
                  <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                    Work Gallery
                  </span>
                </ScrollReveal>
                <ScrollReveal direction="up" delay={0.1}>
                  <h2 className="text-3xl md:text-7xl font-black font-headline tracking-tighter text-foreground uppercase">
                    Selected{" "}
                    <span className="text-primary italic">Builds</span>
                  </h2>
                </ScrollReveal>
              </div>
              <ScrollReveal direction="right" delay={0.2}>
                <p className="text-muted-foreground max-w-xs text-sm font-medium leading-relaxed italic text-left md:text-right">
                  A precision-engineered showcase of high-performance technical architectures.
                </p>
              </ScrollReveal>
            </div>
          </div>

          <ScrollReveal direction="up" delay={0.1}>
            <div className="max-w-7xl mx-auto px-6">
              <Projects userId={PORTFOLIO_OWNER_ID} />
              <div className="mt-16 text-center">
                <MagneticButton>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full h-14 px-8 font-black uppercase text-xs gap-3 border-2 border-border/50 bg-background hover:bg-muted transition-all text-foreground"
                    asChild
                  >
                    <Link href="/projects">
                      View All Projects <ArrowRight size={16} />
                    </Link>
                  </Button>
                </MagneticButton>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Insights */}
        <ScrollReveal direction="up" delay={0.05}>
          <InsightsSection />
        </ScrollReveal>

        {/* ══ CTA SECTION ══ */}
        <section className="py-24 bg-primary text-white overflow-hidden relative">
          {/* Parallax blob */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div className="space-y-8 relative z-10">
              <div className="space-y-4">
                <ScrollReveal direction="left">
                  <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase leading-tight text-white">
                    <WordReveal text="Ready to start your project?" />
                  </h2>
                </ScrollReveal>
                <ScrollReveal direction="left" delay={0.2}>
                  <p className="text-white/80 text-lg md:text-xl font-medium max-w-lg">
                    Whether it is a simple landing page or a complex AI workflow, let us start today.
                  </p>
                </ScrollReveal>
              </div>

              <ScrollReveal direction="up" delay={0.3}>
                <div className="flex flex-wrap gap-4">
                  <MagneticButton>
                    <Button
                      size="lg"
                      className="rounded-full h-16 px-10 bg-white text-primary hover:bg-white/90 font-black uppercase tracking-widest text-xs gap-3 shadow-2xl border-none transition-all group"
                      asChild
                    >
                      <Link href="/book">
                        Start Project <Zap size={18} className="inline ml-1" />
                      </Link>
                    </Button>
                  </MagneticButton>

                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center h-16 px-10 rounded-full border-2 border-white/40 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs gap-3 transition-all backdrop-blur-sm"
                  >
                    Contact Me <ArrowRight size={18} />
                  </Link>
                </div>
              </ScrollReveal>
            </div>

            {/* Right — Service Cards */}
            <StaggerReveal className="grid grid-cols-2 gap-4 relative z-10">
              {[
                { title: "Websites",   href: "/services/web",        icon: LayoutGrid },
                { title: "AI Systems", href: "/services/automation",  icon: Bot        },
              ].map((link) => (
                <GlowCard
                  key={link.title}
                  glowColor="#ffffff"
                  className="rounded-[2.5rem]"
                >
                  <Link
                    href={link.href}
                    className="group p-8 rounded-[2.5rem] bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/20 transition-all flex flex-col justify-between aspect-square"
                  >
                    <link.icon className="h-10 w-10 text-white group-hover:scale-110 transition-transform" />
                    <span className="font-black uppercase tracking-widest text-sm text-white">
                      {link.title}
                    </span>
                  </Link>
                </GlowCard>
              ))}
            </StaggerReveal>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
