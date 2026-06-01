'use client';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

/**
 * Analytics Engine - Real-time Signal Registry
 * PII PROTECTED: Strips sensitive data before logging.
 */

function getSessionId(): string {
  if (typeof window === 'undefined') return 'unknown_session';
  try {
    let sessionId = sessionStorage.getItem('mwj_session_v3');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('mwj_session_v3', sessionId);
    }
    return sessionId;
  } catch {
    return 'temp_session';
  }
}

function getDeviceInfo(): string {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile";
  return "Desktop";
}

async function saveEvent(data: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // GDPR/Data Protection Check
  const consent = localStorage.getItem('cookie_consent');
  if (consent === 'declined') return;

  try {
    const { firestore } = initializeFirebase();
    if (!firestore) return;

    const eventsRef = collection(firestore, 'analytics_events');

    // Strip any potential PII from the data
    const sanitizedData = { ...data };
    const piiKeys = ['email', 'phone', 'name', 'password', 'ref', 'message', 'signature'];
    
    Object.keys(sanitizedData).forEach(key => {
      if (piiKeys.some(pii => key.toLowerCase().includes(pii))) {
        sanitizedData[key] = '[REDACTED_SIGNAL]';
      }
    });

    addDoc(eventsRef, {
      ...sanitizedData,
      sessionId: getSessionId(),
      timestamp: serverTimestamp(),
      path: window.location.pathname,
      device: getDeviceInfo(),
      referrer: document.referrer || 'direct',
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language
    });
  } catch (err) {
    // Silent fail to ensure UX remains smooth
  }
}

export function trackPageView(path: string): void {
  if (path.startsWith('/admin')) return;
  saveEvent({ type: 'page_view', page: path });
}

export function trackEvent(action: string, category: string, label?: string): void {
  saveEvent({ type: 'click', action, category, label });
}

export function trackProjectView(projectId: string, projectName: string): void {
  saveEvent({ type: 'project_view', projectId, label: projectName });
}
