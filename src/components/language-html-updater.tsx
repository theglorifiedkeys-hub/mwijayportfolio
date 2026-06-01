'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';

/**
 * Syncs the <html> element's lang attribute with the current app language.
 */
export function LanguageHtmlUpdater() {
  const { language } = useLanguage();
  
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  
  return null;
}
