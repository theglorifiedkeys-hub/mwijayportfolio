'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DocumentReference,
  getDoc,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';

export interface UseDocOnceOptions {
  enabled?: boolean;
}

/**
 * useDocOnce
 * Fetches a single Firestore document once on mount.
 * Handles transient "offline" or "unavailable" errors gracefully during initial handshake.
 */
export function useDocOnce<T = DocumentData>(
  ref: DocumentReference<DocumentData> | null | undefined,
  options: UseDocOnceOptions = { enabled: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(options.enabled !== false);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [tick, setTick] = useState(0);

  const fetch = useCallback(async () => {
    if (typeof window === 'undefined' || !ref || options.enabled === false) {
      if (options.enabled === false) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const snapshot: DocumentSnapshot<DocumentData> = await getDoc(ref);
      if (snapshot.exists()) {
        setData({ ...snapshot.data(), id: snapshot.id } as T);
      } else {
        setData(null);
      }
      setError(null);
    } catch (err: any) {
      // SILENT RECOVERY: If code is 'unavailable', the client is simply not finished with the handshake.
      // We don't log this as a fatal console error to prevent triggering Segment Fault screens.
      if (err.code === 'unavailable') {
        console.warn(`📡 [Registry Sync Pending] Waiting for connection signal...`);
      } else {
        console.error(`📡 [Registry Sync Error] Code: ${err.code} | ${err.message}`);
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [ref, options.enabled]);

  useEffect(() => {
    fetch();
  }, [fetch, tick]);

  const refetch = () => setTick(prev => prev + 1);

  return { data, isLoading, error, refetch };
}
