'use client';

import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  Auth, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  Firestore 
} from 'firebase/firestore';

export const ADMIN_UID = 'rZaL1kVALOMewoZcjIePDAyXKji2';

/**
 * Checks if a UID or email matches the admin identity.
 */
export function isAdminUser(uid: string | undefined, email?: string | null): boolean {
  return uid === ADMIN_UID || 
         email === 'mwijaydavie@gmail.com' || 
         email === 'theglorifiedkeys@gmail.com';
}

/**
 * Ensures a client profile exists in Firestore.
 */
export async function ensureClientProfile(db: Firestore, user: User) {
  const clientRef = doc(db, 'clients', user.uid);
  const snap = await getDoc(clientRef);

  if (!snap.exists()) {
    await setDoc(doc(db, 'clients', user.uid), {
      uid: user.uid,
      name: user.displayName || 'Visitor',
      email: user.email,
      photoURL: user.photoURL,
      lastArrival: serverTimestamp(),
      role: 'visitor'
    }, { merge: true });
  }
}

/**
 * Handles the Google OAuth flow and subsequent routing logic.
 */
export async function signInWithGoogle(auth: Auth, db: Firestore): Promise<{ isAdmin: boolean; user: User }> {
  if (!auth) throw new Error("Auth signal not initialized.");
  
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if admin by UID, email, custom claims, or Firestore role
    let isAdmin = isAdminUser(user.uid, user.email);
    
    if (!isAdmin) {
      // Check custom claims
      try {
        const idTokenResult = await user.getIdTokenResult();
        const claimRole = idTokenResult.claims.role;
        const claimAdmin = idTokenResult.claims.admin;
        if (claimAdmin === true || claimRole === 'admin' || claimRole === 'owner') {
          isAdmin = true;
        }
      } catch (e) {
        console.error("Error getting idTokenResult:", e);
      }
    }
    
    if (!isAdmin && db) {
      // Check Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && (userDoc.data()?.role === 'admin' || userDoc.data()?.role === 'owner')) {
          isAdmin = true;
        } else {
          const clientDoc = await getDoc(doc(db, 'clients', user.uid));
          if (clientDoc.exists() && (clientDoc.data()?.role === 'admin' || clientDoc.data()?.role === 'owner')) {
            isAdmin = true;
          }
        }
      } catch (e) {
        console.error("Error reading role from Firestore:", e);
      }
    }

    return { isAdmin, user };
  } catch (error: any) {
    console.error('📡 [Auth Registry] Signal interrupted:', error.message);
    throw error;
  }
}

/**
 * Clean sign out wrapper.
 */
export async function signOutUser(auth: Auth): Promise<void> {
  if (auth) await signOut(auth);
}
