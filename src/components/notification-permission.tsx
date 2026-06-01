'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

/**
 * NotificationPermission - Smart, non-intrusive alert logic.
 * Asks after 30s of browsing with a custom PWA-friendly UI.
 */
export function NotificationPermission() {
  const [status, setStatus] = useState<NotificationPermission | 'idle'>('idle');
  const [showPrompt, setShowPrompt] = useState(false);
  const [triggerShow, setTriggerShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !("Notification" in window)) return;
    
    const permission = Notification.permission;
    if (permission !== 'default') {
      setStatus(permission);
      return;
    }

    // Check if we already asked recently
    const lastAsked = localStorage.getItem('mwj_notif_last_asked');
    const now = Date.now();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

    if (lastAsked && (now - parseInt(lastAsked)) < SEVEN_DAYS) {
      return;
    }

    const startTimer = () => {
      return setTimeout(() => {
        setTriggerShow(true);
      }, 30000);
    };

    let timer: NodeJS.Timeout | undefined;
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
  }, []);

  // Coordinate with global active popup manager
  useEffect(() => {
    if (!triggerShow) return;

    const checkAndShow = () => {
      const active = (window as any).__activePopup;
      if (!active) {
        setShowPrompt(true);
        (window as any).__activePopup = 'notification';
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
    if (!showPrompt) {
      if (typeof window !== 'undefined' && (window as any).__activePopup === 'notification') {
        (window as any).__activePopup = null;
        window.dispatchEvent(new CustomEvent('popup_closed'));
      }
    }
    return () => {
      if (typeof window !== 'undefined' && (window as any).__activePopup === 'notification') {
        (window as any).__activePopup = null;
        window.dispatchEvent(new CustomEvent('popup_closed'));
      }
    };
  }, [showPrompt]);

  const requestPermission = async () => {
    localStorage.setItem('mwj_notif_last_asked', Date.now().toString());
    const permission = await Notification.requestPermission();
    setStatus(permission);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('mwj_notif_last_asked', Date.now().toString());
    setShowPrompt(false);
  };

  if (status === 'granted' || status === 'denied') return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, x: 20, y: 20 }}
          animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, x: 20, y: 20 }}
          className="fixed bottom-24 right-8 z-[9999] w-80 bg-card border-2 border-primary/20 shadow-2xl rounded-[2.5rem] p-6 space-y-6 overflow-hidden"
        >
          <div className="absolute -top-4 -right-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
              <Bell className="h-6 w-6 animate-bounce" />
            </div>
            <button 
              onClick={handleDismiss} 
              className="text-muted-foreground hover:text-foreground p-1 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 relative z-10">
            <h4 className="font-black font-headline text-lg leading-tight uppercase tracking-tight">Stay Linked</h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Receive high-priority signals about new build drops, technical insights, and exclusive TZS discounts.
            </p>
          </div>

          <div className="flex gap-3 relative z-10">
            <Button 
              onClick={requestPermission} 
              className="flex-1 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-lg shadow-primary/20"
            >
              Enable Signals
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleDismiss} 
              className="rounded-2xl h-12 font-bold text-[10px] uppercase text-muted-foreground"
            >
              Later
            </Button>
          </div>
          
          <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-primary/40 justify-center">
             <ShieldCheck size={10} /> Secure Registry Node
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
