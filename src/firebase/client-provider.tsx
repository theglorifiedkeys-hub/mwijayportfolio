'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PwaInstallPrompt } from '@/components/pwa-install-prompt';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * PERFORMANCE FIX: DEFERRING FIREBASE INITIALIZATION
 * Deferring heavy Firebase SDK loading until after first contentful paint (FCP).
 *
 * SSR FIX: LoadingScreen and PwaInstallPrompt used to be loaded through
 * `next/dynamic` with `ssr: false`, which bailed the *entire page tree* out to
 * client-side rendering (blank HTML for crawlers and a flash of empty page).
 * Both components already guard their browser-only behaviour inside
 * `useEffect`, so they are imported statically and render harmlessly on the
 * server.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<{
    firebaseApp: any;
    auth: any;
    firestore: any;
  } | null>(null);

  useEffect(() => {
    const init = async () => {
      // Dynamic import to prevent main-thread blocking during initial load
      const { initializeFirebase } = await import('@/lib/firebase');
      const initialized = initializeFirebase();

      setServices({
        firebaseApp: initialized.firebaseApp,
        auth: initialized.auth,
        firestore: initialized.firestore,
      });
    };

    // Use requestIdleCallback for low-priority initialization if available
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => init());
      } else {
        setTimeout(init, 200);
      }
    }
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={services?.firebaseApp}
      auth={services?.auth}
      firestore={services?.firestore}
    >
      <LoadingScreen />
      <PwaInstallPrompt />
      {children}
    </FirebaseProvider>
  );
}
