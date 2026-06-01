'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, X, Download, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * PWA Install Prompt - Native conversion bridge.
 * Detects install eligibility and offers standalone mode after 60s.
 */
export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [triggerShow, setTriggerShow] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShow(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Manage timer once deferredPrompt is available, waiting for cookie consent
  useEffect(() => {
    if (!deferredPrompt) return;

    const dismissed = localStorage.getItem('mwj_pwa_dismissed');
    const now = Date.now();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    if (dismissed && (now - parseInt(dismissed)) < THIRTY_DAYS) {
      return;
    }

    let timer: NodeJS.Timeout | undefined;

    const startTimer = () => {
      return setTimeout(() => {
        setTriggerShow(true);
      }, 60000); // 60s delay
    };

    const consent = localStorage.getItem('cookie_consent');
    if (consent) {
      timer = startTimer();
    }

    const handleConsentChange = () => {
      if (timer) clearTimeout(timer);
      timer = startTimer();
    };

    window.addEventListener('cookie_consent_changed', handleConsentChange);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('cookie_consent_changed', handleConsentChange);
    };
  }, [deferredPrompt]);

  // Coordinate showing with global active popup manager
  useEffect(() => {
    if (!triggerShow) return;

    const checkAndShow = () => {
      const active = (window as any).__activePopup;
      if (!active) {
        setShow(true);
        (window as any).__activePopup = 'pwa';
        return true;
      }
      return false;
    };

    if (checkAndShow()) return;

    const handlePopupClosed = () => {
      if (checkAndShow()) {
        window.removeEventListener('popup_closed', handlePopupClosed);
      }
    };

    window.addEventListener('popup_closed', handlePopupClosed);
    return () => {
      window.removeEventListener('popup_closed', handlePopupClosed);
    };
  }, [triggerShow]);

  useEffect(() => {
    if (!show) {
      if (typeof window !== 'undefined' && (window as any).__activePopup === 'pwa') {
        (window as any).__activePopup = null;
        window.dispatchEvent(new CustomEvent('popup_closed'));
      }
    }
    return () => {
      if (typeof window !== 'undefined' && (window as any).__activePopup === 'pwa') {
        (window as any).__activePopup = null;
        window.dispatchEvent(new CustomEvent('popup_closed'));
      }
    };
  }, [show]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('mwj_pwa_dismissed', Date.now().toString());
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[9999]"
        >
          <div className="bg-background/95 backdrop-blur-2xl border-2 border-primary/20 rounded-[2.5rem] p-6 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30 shrink-0">
                  <Smartphone size={28} />
                </div>
                <div>
                  <h4 className="font-headline font-black text-xl text-foreground leading-tight tracking-tighter uppercase">Native Access</h4>
                  <p className="text-xs text-muted-foreground font-medium">Install for faster builds and offline registry access.</p>
                </div>
              </div>
              <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1">
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-3 relative z-10">
              <Button 
                onClick={handleInstall} 
                className="flex-1 rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest bg-primary text-white shadow-xl shadow-primary/20 gap-2"
              >
                <Download size={16} /> Install Mwijay
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleDismiss} 
                className="rounded-2xl h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
              >
                Not Now
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.4em] text-primary/40 justify-center">
              <ShieldCheck size={10} /> 2026_SYSTEM_BUILD
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
