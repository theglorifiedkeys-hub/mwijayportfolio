'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { Moon, Sun, ChevronDown, Newspaper, ShieldCheck, LogIn, Sparkles } from 'lucide-react';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useLanguage } from '@/contexts/language-context';
import LanguageToggle from '@/components/ui/language-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

const PORTFOLIO_OWNER_ID = "mwijay-davie-admin";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const { t, language } = useLanguage();

  const { firestore } = useFirebase();
  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'users', PORTFOLIO_OWNER_ID);
  }, [firestore]);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute("data-theme", savedTheme);
    setIsDarkMode(savedTheme === "dark");
  }, []);

  const navLinks = [
    { title: t('nav_home'), href: "/" },
    { title: t('nav_about'), href: "/about" },
    { title: t('nav_pricing'), href: "/pricing" },
    { title: t('nav_projects'), href: "/projects" },
    { title: t('nav_contact'), href: "/contact" },
  ];

  const serviceLinks = [
    { title: t('services_web_title'), href: "/services/web" },
    { title: t('services_design_title'), href: "/services/design" },
    { title: t('services_ai_title'), href: "/services/automation" },
    { title: t('services_content_title'), href: "/services/content" },
    { title: "Insights (Blog)", href: "/blog", icon: Newspaper, badge: "BETA" },
  ];

  useEffect(() => {
    if (!mounted) return;
    const activeIndex = navLinks.findIndex(link => link.href === pathname);
    if (activeIndex !== -1 && linksRef.current[activeIndex]) {
      const el = linksRef.current[activeIndex];
      setIndicatorStyle({
        left: el!.offsetLeft,
        width: el!.offsetWidth,
        opacity: 1
      });
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [pathname, mounted, language]);

  const toggleTheme = () => {
    const nextTheme = isDarkMode ? "light" : "dark";
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    setIsDarkMode(!isDarkMode);
  };

  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) return null;
  if (!mounted) return null;

  return (
    <nav 
      ref={navRef}
      style={{ top: 'calc(1.5rem + var(--banner-height, 0px))' }}
      className="fixed left-1/2 -translate-x-1/2 z-[5000] flex items-center justify-between px-6 py-2.5 bg-background/60 backdrop-blur-2xl border border-border/50 rounded-full shadow-2xl w-[95%] max-w-7xl group transition-all duration-500 hover:shadow-primary/5 hover:border-primary/20"
    >
      <Link href="/" aria-label="Return to Home Base" className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0 relative z-10">
        {profile?.logoUrl ? (
          <div className="h-9 w-9 rounded-full overflow-hidden border border-border/50 bg-white relative">
            <Image 
              src={profile.logoUrl} 
              alt="Mwijay Services Official Logo" 
              width={36} 
              height={36} 
              className="object-contain"
              priority
            />
          </div>
        ) : (
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/20">DM</div>
        )}
        <span className="font-headline font-black text-lg tracking-tighter hidden xs:inline-block text-foreground">
          Mwijay<span className="text-primary">.</span>
        </span>
      </Link>

      <div className="hidden lg:flex items-center gap-1 relative z-10">
        <motion.div 
          className="absolute bg-primary/10 rounded-full h-9 pointer-events-none"
          initial={false}
          animate={indicatorStyle}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />

        {navLinks.map((link, idx) => (
          <Link 
            key={link.title} 
            href={link.href} 
            ref={el => { linksRef.current[idx] = el; }}
            className={cn(
              "text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full transition-colors relative z-10",
              pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.title}
          </Link>
        ))}
        
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none relative z-10">
            {t('nav_services')} <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background/95 backdrop-blur-xl rounded-2xl p-2 border border-border/50 shadow-2xl min-w-[220px] mt-4">
            {serviceLinks.map((s) => (
              <DropdownMenuItem key={s.title} asChild>
                <Link href={s.href} className="rounded-xl px-4 py-2.5 font-bold text-[10px] uppercase tracking-widest cursor-pointer hover:bg-primary/10 flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={12} className="text-primary" />
                    {s.title}
                  </div>
                  {s.badge && <span className="text-[8px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s.badge}</span>}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="hidden lg:flex items-center gap-4 relative z-10">
        <LanguageToggle />
        {/* ACCESSIBILITY FIX: Added aria-label */}
        <button 
          onClick={toggleTheme} 
          aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition-all active:scale-90"
        >
          {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" aria-hidden="true" /> : <Moon className="h-5 w-5 text-primary" aria-hidden="true" />}
        </button>
        <Button 
          size="sm" 
          aria-label="Initialize Project Build"
          className="rounded-full h-10 gap-2 font-black uppercase tracking-widest text-[10px] px-8 bg-primary shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-white" 
          asChild
        >
          <Link href="/agreement"><Sparkles className="h-4 w-4" aria-hidden="true" /> Start Your Project</Link>
        </Button>
      </div>

      <div className="lg:hidden flex items-center gap-2 relative z-10">
        <LanguageToggle />
        <button onClick={toggleTheme} aria-label="Toggle Theme Color" className="h-9 w-9 rounded-full flex items-center justify-center">
          {isDarkMode ? <Sun className="h-4 w-4 text-yellow-500" aria-hidden="true" /> : <Moon className="h-4 w-4 text-primary" aria-hidden="true" />}
        </button>
        <Button size="icon" variant="outline" onClick={() => setOpen(!open)} aria-label="Open Navigation Menu" className="rounded-full h-9 w-9">
          <MenuToggleIcon open={open} className="size-4" />
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-full mt-4 left-0 right-0 p-8 flex flex-col items-center gap-6 lg:hidden shadow-2xl z-50 bg-background/95 backdrop-blur-3xl border border-border/50 rounded-[2.5rem]"
          >
            <div className="flex flex-col items-center gap-6 w-full">
              {navLinks.map((link) => (
                <Link key={link.title} href={link.href} onClick={() => setOpen(false)} className="text-xl font-black uppercase tracking-tighter">
                  {link.title}
                </Link>
              ))}
              <div className="w-full h-px bg-border/50" />
              <Link href="/about" onClick={() => setOpen(false)} className="text-xl font-black uppercase tracking-tighter">
                {t('nav_about')}
              </Link>
              <div className="w-full h-px bg-border/50" />
              <Link href="/agreement" onClick={() => setOpen(false)} className="text-xl font-black uppercase tracking-tighter text-primary">
                Start Your Project
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 w-full pt-4 border-t border-border/50">
              <Button variant="outline" className="rounded-2xl h-14 font-black uppercase text-xs border-2" asChild>
                <Link href="/client-portal" onClick={() => setOpen(false)}>Client Portal</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}