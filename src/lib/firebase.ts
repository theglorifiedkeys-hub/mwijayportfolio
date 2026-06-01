/**
 * @fileOverview Firebase Client SDK Initialization Registry
 * Optimized for Next.js 15 and Cloud Workstation environments.
 * SINGLETON PATTERN: Ensures services are initialized only once.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Internal Singleton State
let cachedApp: FirebaseApp | null = null;
let cachedFirestore: Firestore | null = null;
let cachedAuth: Auth | null = null;
let cachedStorage: FirebaseStorage | null = null;

/**
 * Initializes and returns the Firebase App instance safely.
 */
export function initializeFirebase() {
  const isBrowser = typeof window !== 'undefined';
  const required = ['apiKey', 'projectId', 'appId'];
  const missing = required.filter(k => !firebaseConfig[k as keyof typeof firebaseConfig]);

  if (missing.length > 0) {
    if (isBrowser) {
      console.warn(`📡 [Firebase Registry] Missing signal keys: ${missing.join(', ')}`);
    }
    return { firebaseApp: null, auth: null, firestore: null, storage: null };
  }

  try {
    if (!cachedApp) {
      if (getApps().length === 0) {
        cachedApp = initializeApp(firebaseConfig);
      } else {
        cachedApp = getApp();
      }
    }

    if (!cachedFirestore) {
      // Cloud Workstation Stability: Force long polling to avoid internal assertion failures (ca9/b815)
      // We wrap in try/catch because initializeFirestore can only be called once.
      try {
        cachedFirestore = initializeFirestore(cachedApp, {
          experimentalForceLongPolling: true,
          ignoreUndefinedProperties: true
        });
      } catch (e) {
        cachedFirestore = getFirestore(cachedApp);
      }
    }
    
    if (!cachedAuth) {
      cachedAuth = getAuth(cachedApp);
    }

    if (!cachedStorage) {
      cachedStorage = getStorage(cachedApp);
    }

    return { 
      firebaseApp: cachedApp, 
      auth: cachedAuth, 
      firestore: cachedFirestore, 
      storage: cachedStorage 
    };
  } catch (error: any) {
    if (isBrowser) {
      console.error("🔥 Firebase Registry Exception:", error.message);
    }
    return { firebaseApp: null, auth: null, firestore: null, storage: null };
  }
}

// Lazy Getters
export const getClientApp = () => initializeFirebase().firebaseApp;
export const getClientDb = () => initializeFirebase().firestore;
export const getClientAuth = () => initializeFirebase().auth;
export const getClientStorage = () => initializeFirebase().storage;
