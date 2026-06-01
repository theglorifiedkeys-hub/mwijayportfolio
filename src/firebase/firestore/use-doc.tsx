'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';

export interface UseDocOptions {
  enabled?: boolean;
}

/**
 * useDoc - Robust real-time document listener for Next.js 15.
 * SSR-safe: Does not attempt to subscribe to Firestore during prerendering.
 */
export function useDoc<T = DocumentData>(
  ref: DocumentReference<DocumentData> | null | undefined,
  options: UseDocOptions = { enabled: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(options.enabled !== false);
  const [error, setError] = useState<FirestoreError | null>(null);

  const subscribe = useCallback(() => {
    // Guard: Only run in browser, if ref exists, and if enabled
    if (typeof window === 'undefined' || !ref || options.enabled === false) {
      if (options.enabled === false) setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ ...snapshot.data(), id: snapshot.id } as T);
        } else {
          setData(null);
        }
        setIsLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        if (err.code === 'permission-denied') {
          console.warn(`📡 [Registry Access Denied] Path: ${ref.path}`);
        } else {
          console.error(`📡 [Registry Sync Error] Code: ${err.code} | ${err.message}`);
        }
        setError(err);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [ref, options.enabled]);

  useEffect(() => {
    const unsub = subscribe();
    return () => {
      unsub?.();
    };
  }, [subscribe]);

  return { data, isLoading, error };
}
