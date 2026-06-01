'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';

export interface UseCollectionOptions<T> {
  enabled?: boolean;
  fallbackData?: T[];
}

/**
 * useCollection
 * SSR-safe hook that handles nullable queries and permission errors gracefully.
 */
export function useCollection<T = any>(
  memoizedQuery: Query<DocumentData> | null | undefined,
  options: UseCollectionOptions<T> = { enabled: true }
) {
  const [data, setData] = useState<T[] | null>(options.fallbackData || null);
  const [isLoading, setIsLoading] = useState(options.enabled !== false);
  const [error, setError] = useState<FirestoreError | null>(null);

  const subscribe = useCallback(() => {
    // Guard against SSR, null queries, or disabled state
    if (typeof window === 'undefined' || !memoizedQuery || options.enabled === false) {
      if (options.enabled === false) setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results = snapshot.docs.map(doc => ({
          ...(doc.data() as T),
          id: doc.id,
        }));
        setData(results);
        setIsLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        if (err.code === 'permission-denied') {
          console.warn(`Firestore signal blocked: ${err.message}`);
        } else {
          console.error(`Firestore registry error [${err.code}]:`, err.message);
        }
        setError(err);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [memoizedQuery, options.enabled]);

  useEffect(() => {
    const unsub = subscribe();
    return () => {
      unsub?.();
    };
  }, [subscribe]);

  return { data, isLoading, error };
}
