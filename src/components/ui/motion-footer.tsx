
"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { cn } from "@/lib/utils";
import { Github, Linkedin, Instagram, ArrowUp, Sparkles, Mail, MapPin, Phone, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STYLES = `
.cinematic-footer-wrapper {
  -webkit-font-smoothing: antialiased;
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
  100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px hsla(var(--primary), 0.5)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 15px hsla(var(--primary), 0.8)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 10s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 30s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2.5s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

.footer-bg-grid {
  background-size: 80px 80px;
  background-image: 
    linear-gradient(to right, hsla(var(--foreground), 0.02) 1px, transparent 1px),
    linear-gradient(to bottom, hsla(var(--foreground), 0.02) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
}

.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%, 
    hsla(var(--primary), 0.12) 0%, 
    hsla(var(--accent), 0.08) 40%, 
    transparent 70%
  );
}

.footer-giant-bg-text {
  font-size: 32vw;
  line-height: 0.6;
  font-weight: 900;
  letter-spacing: -0.08em;
  color: transparent;
  -webkit-text-stroke: 2px hsla(var(--foreground), 0.05);
  background: linear-gradient(180deg, hsla(var(--foreground), 0.1) 0%, transparent 80%);
  -webkit-background-clip: text;
  background-clip: text;
  filter: blur(1px);
  pointer-events: none;
}
`;

const MagneticButton = React.forwardRef<HTMLElement, any>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);
    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;
      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(element, { x: x * 0.35, y: y * 0.35, scale: 1.05, duration: 0.4 });
        };
        const handleMouseLeave = () => {
          gsap.to(element, { x: 0, y: 0, scale: 1, duration: 1.2, ease: "elastic.out(1, 0.3)" });
        };
        element.addEventListener("mousemove", handleMouseMove);
        element.addEventListener("mouseleave", handleMouseLeave);
        return () => {
          element.removeEventListener("mousemove", handleMouseMove);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);
      return () => ctx.revert();
    }, []);
    return (
      <Component
        ref={(node: any) => {
          (localRef as any).current = node;
          if (forwardedRef) {
            if (typeof forwardedRef === "function") {
              forwardedRef(node);
            } else {
              (forwardedRef as any).current = node;
            }
          }
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >{children}</Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(giantTextRef.current, { y: "20vh", opacity: 0 }, {
        y: "0vh", opacity: 1, scrollTrigger: { trigger: wrapperRef.current, start: "top 95%", end: "bottom bottom", scrub: 1.2 }
      });
      gsap.fromTo(contentRef.current, { y: 80, opacity: 0 }, {
        y: 0, opacity: 1, scrollTrigger: { trigger: wrapperRef.current, start: "top 60%", end: "bottom bottom", scrub: 1 }
      });
    }, wrapperRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div ref={wrapperRef} className="relative min-h-screen w-full" style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}>
        <footer className="fixed bottom-0 left-0 flex min-h-screen w-full flex-col justify-between overflow-hidden bg-background text-foreground py-24">
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[70vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[100px] pointer-events-none z-0" />
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none opacity-50" />

          <div ref={giantTextRef} className="footer-giant-bg-text absolute -bottom-[2vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 select-none uppercase font-headline">
            MWIJAY
          </div>

          <div ref={contentRef} className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 space-y-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              <div className="space-y-6">
                <h3 className="text-3xl font-black font-headline tracking-tighter">David Erick <span className="text-primary italic">Mwijage</span></h3>
                <p className="text-sm font-medium leading-relaxed text-muted-foreground max-w-xs">Providing professional tech solutions for Tanzanian SMEs with precision architecture.</p>
                <div className="flex gap-4">
                  {[Github, Linkedin, Instagram].map((Icon, i) => (
                    <MagneticButton key={i} className="h-12 w-12 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-all shadow-xl">
                      <Icon className="h-5 w-5" />
                    </MagneticButton>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Expertise Nodes</h4>
                <ul className="space-y-4">
                  {["Web", "Design", "Automation", "Content"].map((item) => (
                    <li key={item}><Link href={`/services/${item.toLowerCase()}`} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">{item} Development</Link></li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Support Registry</h4>
                <ul className="space-y-4">
                  <li><Link href="/track-order" className="text-sm font-bold text-primary flex items-center gap-2 hover:underline"><Search size={14} /> Track Order Status</Link></li>
                  <li><Link href="/pricing" className="text-sm font-bold text-muted-foreground hover:text-primary">Marketplace</Link></li>
                  <li><Link href="/contact" className="text-sm font-bold text-muted-foreground hover:text-primary">Request Build</Link></li>
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Signal Me</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground"><Phone className="h-4 w-4 text-primary" /> +255 620 641 695</div>
                  <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground"><Mail className="h-4 w-4 text-primary" /> mwijaydavie@gmail.com</div>
                  <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-xl shadow-primary/20" asChild><Link href="/contact">Initialize Build</Link></Button>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">© 2026 Mwijay Services. Architected for 2026.</div>
              <div className="flex items-center gap-4">
                <div className="bg-card border px-6 py-3 rounded-full flex items-center gap-2">
                  <span className="text-[9px] font-black text-muted-foreground uppercase">Registry:</span>
                  <span className="text-[9px] font-black text-primary animate-pulse uppercase">Linked_2026</span>
                </div>
                <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="w-12 h-12 rounded-xl bg-card border flex items-center justify-center text-primary hover:scale-110 transition-all shadow-xl">
                  <ArrowUp size={20} />
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
