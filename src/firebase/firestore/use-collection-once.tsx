'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Query,
  getDocs,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';

export interface UseCollectionOnceOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
}

/**
 * useCollectionOnce
 * Fetches a Firestore collection once on mount instead of using a real-time listener.
 * Helps save on read quota for static or slowly changing data.
 */
export function useCollectionOnce<T = any>(
  memoizedQuery: Query<DocumentData> | null | undefined,
  options: UseCollectionOnceOptions = { enabled: true, refetchOnMount: true }
) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(options.enabled !== false);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [tick, setTick] = useState(0);

  const fetch = useCallback(async () => {
    if (typeof window === 'undefined' || !memoizedQuery || options.enabled === false) {
      if (options.enabled === false) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const snapshot: QuerySnapshot<DocumentData> = await getDocs(memoizedQuery);
      const results = snapshot.docs.map(doc => ({
        ...(doc.data() as T),
        id: doc.id,
      }));
      setData(results);
      setError(null);
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        console.warn(`Firestore signal blocked: ${err.message}`);
      } else {
        console.error(`Firestore registry error:`, err.message);
      }
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [memoizedQuery, options.enabled]);

  useEffect(() => {
    fetch();
  }, [fetch, tick]);

  const refetch = () => setTick(prev => prev + 1);

  return { data, isLoading, error, refetch };
}
