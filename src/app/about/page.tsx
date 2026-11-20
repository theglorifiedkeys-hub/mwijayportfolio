'use client';

import React from "react";
import { About } from "@/components/about";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { Recognitions } from "@/components/recognitions";
import { 
  Award, LayoutGrid, ShieldCheck, Zap, Code2, 
  Rocket, TrendingUp, Target, ArrowRight, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FadeContent from "@/components/ui/fade-content";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// SEO FIX: Page-specific Canonical Node
export const dynamic = 'force-dynamic';

const PORTFOLIO_OWNER_ID = "mwijay-davie-admin";

function StatCard({ 
  value, 
  label, 
  icon: Icon 
}: { 
  value: string; 
  label: string; 
  icon: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 300 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div className="relative p-8 rounded-[2rem] bg-card border-2 border-border/50 hover:border-primary/30 transition-all overflow-hidden shadow-lg">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Icon size={20} className="text-primary" />
        </div>

        <p className="text-4xl font-black mb-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          {value}
        </p>

        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

function PillarCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: any; 
  title: string; 
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 200 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group"
    >
      <div className="relative p-8 rounded-[2rem] bg-card border-2 border-border/50 hover:border-primary/30 transition-all overflow-hidden shadow-xl h-full">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

        <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all">
          <Icon size={24} className="text-primary" />
        </div>

        <h3 className="text-xl font-black uppercase tracking-tight mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <p className="text-sm text-muted-foreground font-medium leading-relaxed">
          {description}
        </p>

        <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/5 rounded-tl-[3rem] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}

export default function AboutPage() {
  const posterUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072";

  return (
    <div className="relative w-full bg-background overflow-x-hidden">
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/2 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 w-full bg-background">
        
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-32 pb-20 px-6"
        >
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em]"
            >
              <ShieldCheck size={12} />
              Architect Profile
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none"
            >
              Engineering <span className="text-primary italic">Excellence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed"
            >
              David Erick Mwijage — Systems Architect & AI Automation Engineer, 
              building high-performance digital infrastructure for the modern web.
            </motion.p>
          </div>
        </motion.section>

        <About userId={PORTFOLIO_OWNER_ID} />

        <section className="py-20 px-6 bg-muted/20 border-y border-border/30">
          <div className="max-w-6xl auto">
            <FadeContent threshold={0.1}>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                  <TrendingUp size={12} />
                  Impact Metrics
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                  By the <span className="text-primary italic">Numbers</span>
                </h2>
              </div>
            </FadeContent>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={Code2} value="10+" label="Projects Deployed" />
              <StatCard icon={Rocket} value="8+" label="Active Clients" />
              <StatCard icon={Award} value="5+" label="Certifications" />
              <StatCard icon={Zap} value="99%" label="Client Satisfaction" />
            </div>
          </div>
        </section>

        <section className="py-24 px-6 bg-background">
          <div className="max-w-6xl mx-auto space-y-12">
            <FadeContent threshold={0.1}>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                  <Target size={12} />
                  Core Philosophy
                </div>
                <h2 className="text-3xl md:text-5 font-black uppercase tracking-tighter mb-4">
                  Built on <span className="text-primary italic">Principles</span>
                </h2>
                <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto font-medium">
                  Every system I architect is grounded in these non-negotiable engineering pillars.
                </p>
              </div>
            </FadeContent>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PillarCard
                icon={Zap}
                title="Performance First"
                description="Every line of code is optimized for speed. No bloat. No compromise. Lightning-fast load times and instant user interactions are the baseline."
              />
              <PillarCard
                icon={ShieldCheck}
                title="Security by Design"
                description="Zero-trust architecture from day one. End-to-end encryption, role-based access control, and regular security audits are standard practice."
              />
              <PillarCard
                icon={Rocket}
                title="Scalable Systems"
                description="Built to grow. Cloud-native infrastructure that scales horizontally and vertically without breaking a sweat as your user base explodes."
              />
              <PillarCard
                icon={Code2}
                title="Clean Architecture"
                description="Readable, maintainable, and testable code. Modular design patterns that allow seamless feature additions and bug fixes."
              />
              <PillarCard
                icon={Target}
                title="User-Centric Design"
                description="Every interface is crafted with the end user in mind. Accessibility, intuitive navigation, and delightful micro-interactions are baked in."
              />
              <PillarCard
                icon={Sparkles}
                title="Innovation Driven"
                description="Staying ahead of the curve. Leveraging cutting-edge AI, automation, and modern frameworks to deliver tomorrow's solutions today."
              />
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-primary/5 border-y border-border/30">
          <FadeContent>
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="relative p-10 md:p-14 rounded-[2.5rem] bg-card border-2 border-primary/20 shadow-2xl text-center overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary/5 rounded-tl-[4rem] blur-2xl" />

                <div className="relative z-10 space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em]">
                    <LayoutGrid size={12} />
                    Portfolio
                  </div>

                  <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                    See the <span className="text-primary italic">Execution</span>
                  </h3>

                  <p className="text-muted-foreground text-sm md:text-lg font-medium max-w-lg mx-auto">
                    These philosophies aren't just words. Browse my live projects and 
                    see how precision engineering translates into high-performance builds.
                  </p>

                  <Button 
                    size="lg" 
                    className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                    asChild
                  >
                    <Link href="/projects">
                      Explore Portfolio <ArrowRight size={18} />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </FadeContent>
        </section>

        <section className="py-24 px-6 bg-background border-b border-border/30">
          <div className="max-w-7xl mx-auto space-y-16">
            <FadeContent threshold={0.1}>
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em]">
                  <Award size={12} />
                  Verified Registry
                </div>
                <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter">
                  Academic & <span className="text-primary italic">Professional Honors</span>
                </h2>
                <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto font-medium">
                  Verified certifications from global technology leaders and institutions.
                </p>
              </div>
            </FadeContent>
            
            <Recognitions userId={PORTFOLIO_OWNER_ID} />
          </div>
        </section>

        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-[#07080c] border-y border-border/30">
          <div className="absolute inset-0">
            <img 
              src={posterUrl} 
              className="w-full h-full object-cover opacity-15 grayscale" 
              alt="Precision backdrop" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-black/50 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
          </div>

          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="relative z-10 text-center space-y-6 px-6 max-w-4xl"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/80 drop-shadow-lg">
                MWIJAY_SYSTEMS_ACTIVE
              </span>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </motion.div>

            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white [text-shadow:_0_6px_20px_rgb(0_0_0_/_80%)]">
              Architected for <span className="text-primary italic">Precision</span>
            </h2>

            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary/70 drop-shadow-lg">
              ESTABLISHED // 2026 // DAR ES SALAAM, TANZANIA
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="pt-6"
            >
              <Button 
                variant="outline"
                className="h-12 px-8 rounded-2xl border-2 border-white/20 backdrop-blur-sm bg-white/5 text-white hover:bg-white/10 hover:border-white/40 font-black uppercase tracking-widest text-xs gap-2 shadow-2xl"
                asChild
              >
                <Link href="/contact">
                  Start a Build <Rocket size={16} />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>

      </main>

      <CinematicFooter />
    </div>
  );
}