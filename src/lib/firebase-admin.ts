import * as admin from 'firebase-admin';

/**
 * @fileOverview Firebase Admin SDK Singleton Registry
 * Lazily initializes with robust checks for environment variables.
 */

export function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    // SILENT FALLBACK: Instead of crashing the build/server, we log and return null
    // This allows the app to render with fallback data if keys aren't set yet.
    console.warn('📡 [Firebase Admin Registry] Missing environment signals. Using local mock state.');
    return null;
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('🔥 [Firebase Admin Registry] Initialization Exception:', error);
    return null;
  }
}

/**
 * Helper to get Firestore instance with safety check
 */
export function getAdminDb() {
  const app = getAdminApp();
  if (!app) return null;
  return admin.firestore();
}

/**
 * Helper to get Auth instance with safety check
 */
export function getAdminAuth() {
  const app = getAdminApp();
  if (!app) return null;
  return admin.auth();
}

export default admin;
