'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import dynamic from 'next/dynamic';

const PwaInstallPrompt = dynamic(() => import('@/components/pwa-install-prompt').then(m => m.PwaInstallPrompt), { ssr: false });
const LoadingScreen = dynamic(() => import('@/components/ui/loading-screen').then(m => m.LoadingScreen), { ssr: false });

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * PERFORMANCE FIX: DEFERRING FIREBASE INITIALIZATION
 * Deferring heavy Firebase SDK loading until after first contentful paint (FCP).
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