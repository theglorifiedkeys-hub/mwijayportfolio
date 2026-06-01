'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { translations } from '@/lib/translations';
import type { TranslationKey, Language } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  isSwahili: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * LanguageProvider
 * ALWAYS wraps children in LanguageContext.Provider to prevent Navbar/Footer crashes.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mwijay_language');
    if (saved === 'en' || saved === 'sw') {
      setLanguageState(saved as Language);
    } else if (navigator.language.toLowerCase().includes('sw')) {
      setLanguageState('sw');
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mwijay_language', lang);
  };

  const t = (key: TranslationKey, vars?: Record<string, string | number>): string => {
    const dict = translations[language] || translations['en'];
    let text = (dict as any)[key] || (translations['en'] as any)[key] || key;

    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      });
    }

    return text;
  };

  const value = useMemo(() => ({ 
    language, 
    setLanguage, 
    t, 
    isSwahili: language === 'sw' 
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
