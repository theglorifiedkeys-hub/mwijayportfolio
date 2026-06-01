
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

/**
 * Invisible component that monitors route changes and tracks page views.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view on every path change
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    // Handle consent changes
    const handleConsentChange = (e: CustomEvent) => {
      if (e.detail === 'accepted') {
        // Clear session tracking so current page gets logged now that we have consent
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('viewed_')) {
            sessionStorage.removeItem(key);
          }
        });
        trackPageView(pathname);
      }
    };

    window.addEventListener('cookie_consent_changed', handleConsentChange as EventListener);
    return () => window.removeEventListener('cookie_consent_changed', handleConsentChange as EventListener);
  }, [pathname]);

  return null;
}
