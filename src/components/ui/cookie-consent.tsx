'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;
    
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  useEffect(() => {
    if (show) {
      (window as any).__activePopup = 'cookie';
    } else {
      if (typeof window !== 'undefined' && (window as any).__activePopup === 'cookie') {
        (window as any).__activePopup = null;
        window.dispatchEvent(new CustomEvent('popup_closed'));
      }
    }
    return () => {
      if (typeof window !== 'undefined' && (window as any).__activePopup === 'cookie') {
        (window as any).__activePopup = null;
        window.dispatchEvent(new CustomEvent('popup_closed'));
      }
    };
  }, [show]);

  const handleAction = (type: 'accepted' | 'declined') => {
    localStorage.setItem('cookie_consent', type);
    window.dispatchEvent(new CustomEvent('cookie_consent_changed', { detail: type }));
    setShow(false);
  };

  if (pathname?.startsWith('/admin')) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[9999] p-6 bg-background/95 backdrop-blur-xl border-2 border-primary/20 rounded-[2.5rem] shadow-2xl space-y-6"
        >
          <div className="flex items-start justify-between">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Cookie className="h-6 w-6" />
            </div>
            <button onClick={() => setShow(false)} className="text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-2">
            <h4 className="font-headline font-black text-xl text-foreground">Data Governance</h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              This site uses cookies and analytics to improve your experience and measure what content is most helpful for your business growth.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => handleAction('accepted')} className="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest bg-primary text-white shadow-lg shadow-primary/20">
              Accept Signals
            </Button>
            <Button variant="ghost" onClick={() => handleAction('declined')} className="flex-1 rounded-2xl h-12 text-[10px] font-bold uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive">
              Decline
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
