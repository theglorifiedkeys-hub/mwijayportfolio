
'use client';

import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

/**
 * Utility to generate or retrieve a session ID for rate limiting.
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('mwijay_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('mwijay_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Checks if an action is allowed within a time window.
 */
export async function checkRateLimit(
  identifier: string, 
  action: string, 
  maxRequests: number, 
  windowMinutes: number
): Promise<{ allowed: boolean; remaining: number; resetInMinutes: number }> {
  const { firestore } = initializeFirebase();
  if (!firestore) {
    return { allowed: true, remaining: 1, resetInMinutes: 0 }; // Fail open for UX
  }
  const docId = `${identifier}_${action}`;
  const rateLimitRef = doc(firestore, 'rate_limits', docId);

  try {
    const snap = await getDoc(rateLimitRef);
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    if (!snap.exists()) {
      // First time action
      await setDoc(rateLimitRef, {
        count: 1,
        windowStart: serverTimestamp(),
        identifier,
        action
      });
      return { allowed: true, remaining: maxRequests - 1, resetInMinutes: windowMinutes };
    }

    const data = snap.data();
    const windowStart = (data.windowStart as Timestamp).toMillis();
    const elapsedTime = now - windowStart;

    if (elapsedTime > windowMs) {
      // Window expired, reset
      await setDoc(rateLimitRef, {
        count: 1,
        windowStart: serverTimestamp(),
        identifier,
        action
      });
      return { allowed: true, remaining: maxRequests - 1, resetInMinutes: windowMinutes };
    }

    if (data.count >= maxRequests) {
      // Limit exceeded
      const resetInMinutes = Math.ceil((windowMs - elapsedTime) / (60 * 1000));
      return { allowed: false, remaining: 0, resetInMinutes };
    }

    // Increment count
    await setDoc(rateLimitRef, {
      ...data,
      count: data.count + 1
    }, { merge: true });

    return { allowed: true, remaining: maxRequests - (data.count + 1), resetInMinutes: Math.ceil((windowMs - elapsedTime) / (60 * 1000)) };

  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true, remaining: 1, resetInMinutes: 0 }; // Fail open for UX
  }
}
