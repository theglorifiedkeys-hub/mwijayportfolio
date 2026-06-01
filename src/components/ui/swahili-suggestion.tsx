'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe } from 'lucide-react';
import { Button } from './button';

export function SwahiliSuggestion() {
  const { language, setLanguage } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('swahili_suggestion_dismissed');
    const isBrowserSwahili = navigator.language.toLowerCase().includes('sw');
    
    if (isBrowserSwahili && language === 'en' && dismissed !== 'true') {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [language]);

  const handleDismiss = () => {
    localStorage.setItem('swahili_suggestion_dismissed', 'true');
    setShow(false);
  };

  const handleSwitch = () => {
    setLanguage('sw');
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[4000] w-[90%] max-w-md"
        >
          <div className="bg-primary/95 backdrop-blur-xl border border-white/20 text-white rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                   <Globe className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-black uppercase tracking-tight">Lugha ya Kiswahili? 🇹🇿</p>
                  <p className="text-[10px] opacity-70 font-medium">Inaonekana unatumia Kiswahili.</p>
                </div>
              </div>
              <button onClick={handleDismiss} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-2 relative z-10">
               <Button onClick={handleSwitch} className="flex-1 rounded-xl h-10 bg-white text-primary font-black uppercase text-[10px] tracking-widest hover:bg-white/90">
                 Ndio, Badilisha
               </Button>
               <Button variant="ghost" onClick={handleDismiss} className="flex-1 rounded-xl h-10 border border-white/20 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/10">
                 Hapana
               </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
