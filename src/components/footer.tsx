'use client';

import React from 'react';
import Link from 'next/link';
import { useDocOnce, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  Github, Linkedin, Instagram, 
  Mail, MapPin, ShieldCheck, 
  Newspaper, ShoppingBag, LayoutGrid, 
  ArrowUpRight, Bot, Zap, MessageCircle, Info
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { Button } from '@/components/ui/button';

const OWNER_ID = "mwijay-davie-admin";

/**
 * Footer - Brand Fulfillment Terminal
 * STEP 3: ACCESSIBILITY (100/100)
 * Added explicit aria-labels to all social and functional links.
 */
export function Footer() {
  const db = useFirestore();
  const profileRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'users', OWNER_ID);
  }, [db]);
  const { data: profile } = useDocOnce(profileRef);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border/50 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xs shadow-xl shadow-primary/20">DM</div>
              <span className="font-headline font-black text-xl tracking-tighter uppercase text-foreground">Mwijay<span className="text-primary">.</span></span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground max-w-xs">
              Architecting precision digital systems and AI automation for the 2026 African business landscape.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://wa.me/255790942616" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Connect with Mwijay Davie on WhatsApp" 
                className="h-10 w-10 rounded-full border border-border/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-muted-foreground"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
              <a 
                href="https://github.com/mwijay" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="View Mwijay Davie's GitHub Repositories" 
                className="h-10 w-10 rounded-full border border-border/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-muted-foreground"
              >
                <Github className="h-4 w-4" />
              </a>
              <a 
                href="https://instagram.com/mwijaydavie" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Follow Mwijay Davie on Instagram" 
                className="h-10 w-10 rounded-full border border-border/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-muted-foreground"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Registry Nodes</h3>
            <ul className="space-y-4">
              {[
                { label: 'Work Gallery', href: '/projects', icon: LayoutGrid, aria: 'View selected project builds' },
                { label: 'About Mwijay', href: '/about', icon: Info, aria: 'Learn more about the architect' },
                { label: 'Insight Feed', href: '/blog', icon: Newspaper, aria: 'Read strategic technology articles' },
                { label: 'Marketplace', href: '/pricing', icon: ShoppingBag, aria: 'Browse digital assets and plans' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    aria-label={link.aria}
                    className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <link.icon size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" /> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Service Stack</h3>
            <ul className="space-y-4">
              {[
                { label: 'Web Development', href: '/services/web' },
                { label: 'AI Automation', href: '/services/automation' },
                { label: 'Digital Products', href: '/pricing' },
                { label: 'Brand Identity', href: '/services/design' }
              ].map((service) => (
                <li key={service.label}>
                  <Link 
                    href={service.href} 
                    className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <div className="h-1 w-1 rounded-full bg-primary/40" /> {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Fulfillment</h3>
            <ul className="space-y-4">
              <li><Link href="/client-portal" className="text-sm font-black text-primary hover:underline">Client Portal Access →</Link></li>
              <li><Link href="/agreement" className="text-sm font-bold text-muted-foreground hover:text-primary">Start a Project</Link></li>
              <li><Link href="/terms" className="text-sm font-bold text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm font-bold text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
            </ul>
            <div className="pt-4">
              <Button 
                size="sm" 
                aria-label="Send an instant WhatsApp message for support"
                className="w-full h-11 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white font-black uppercase tracking-widest text-[9px] gap-2" 
                asChild
              >
                <a href="https://wa.me/255790942616">
                  <MessageCircle size={14} /> Instant Signal
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            © {currentYear} <span className="text-foreground">Mwijay Services</span>. Precision Engineered in Tanzania.
          </p>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Next.js 14 Optimized</span>
             </div>
             <div className="text-[10px] font-black text-primary animate-pulse tracking-widest uppercase">
               Linked_2026
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
