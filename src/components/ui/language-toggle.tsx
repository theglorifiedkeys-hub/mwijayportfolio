'use client';

import React from 'react';
import { useLanguage } from '@/contexts/language-context';
import { motion, AnimatePresence } from 'framer-motion';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'sw' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 transition-all text-[10px] font-black uppercase tracking-tight border border-border/50 bg-background/50 backdrop-blur-sm shrink-0 shadow-lg"
      aria-label={language === 'en' ? "Toggle Language (Current: EN)" : "Toggle Language (Current: SW)"}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={language}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="text-primary font-bold"
        >
          {language === 'en' ? 'EN' : 'SW'}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}