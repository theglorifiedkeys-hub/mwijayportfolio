'use client';

import React, { 
  DependencyList, createContext, useContext, 
  ReactNode, useMemo, useState, useEffect 
} from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp?: FirebaseApp | null;
  firestore?: Firestore | null;
  auth?: Auth | null;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isAdmin: boolean;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider
 * Manages the global authentication state signal and provides Firebase context.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children, firebaseApp, firestore, auth,
}) => {
  const [userState, setUserState] = useState<{
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
    error: Error | null;
  }>({ 
    user: null, 
    isAdmin: false,
    loading: !!auth, // Only start loading if auth service exists
    error: null 
  });

  useEffect(() => {
    if (!auth) {
      // If auth is null (pre-mount or missing keys), ensure loading is false
      setUserState(prev => ({ ...prev, loading: false }));
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (u) => {
        if (!u) {
          if (typeof window !== 'undefined') {
            document.cookie = "firebase_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          }
          setUserState({ user: null, isAdmin: false, loading: false, error: null });
          return;
        }

        // Set user immediately but keep loading: true while we resolve admin status
        setUserState(prev => ({ ...prev, user: u, loading: true }));

        let adminStatus = u.uid === 'rZaL1kVALOMewoZcjIePDAyXKji2' || 
                          u.email === 'mwijaydavie@gmail.com' || 
                          u.email === 'theglorifiedkeys@gmail.com';

        // Check custom claims
        if (!adminStatus) {
          try {
            const tokenResult = await u.getIdTokenResult();
            const claimRole = tokenResult.claims.role;
            const claimAdmin = tokenResult.claims.admin;
            if (claimAdmin === true || claimRole === 'admin' || claimRole === 'owner') {
              adminStatus = true;
            }
          } catch (err) {
            console.error("Error reading custom claims:", err);
          }
        }

        // Check Firestore database
        if (!adminStatus && firestore) {
          try {
            const userDocRef = doc(firestore, 'users', u.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists() && (userDocSnap.data()?.role === 'admin' || userDocSnap.data()?.role === 'owner')) {
              adminStatus = true;
            } else {
              const clientDocRef = doc(firestore, 'clients', u.uid);
              const clientDocSnap = await getDoc(clientDocRef);
              if (clientDocSnap.exists() && (clientDocSnap.data()?.role === 'admin' || clientDocSnap.data()?.role === 'owner')) {
                adminStatus = true;
              }
            }
          } catch (err) {
            console.error("Error reading Firestore role:", err);
          }
        }

        // Set or clear cookies based on admin status
        if (typeof window !== 'undefined') {
          if (adminStatus) {
            document.cookie = "firebase_auth_token=true; path=/; max-age=86400; SameSite=Lax";
            document.cookie = "admin_session=true; path=/; max-age=86400; SameSite=Lax";
          } else {
            document.cookie = "firebase_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          }
        }

        setUserState({ user: u, isAdmin: adminStatus, loading: false, error: null });
      },
      (e) => {
        console.error("Auth state signal error:", e);
        setUserState({ user: null, isAdmin: false, loading: false, error: e });
      }
    );

    return () => unsubscribe();
  }, [auth, firestore]);

  const contextValue = useMemo(() => {
    const areServicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable,
      firebaseApp: firebaseApp || null,
      firestore: firestore || null,
      auth: auth || null,
      user: userState.user,
      isAdmin: userState.isAdmin,
      isUserLoading: userState.loading,
      userError: userState.error,
    };
  }, [
    firebaseApp, firestore, auth,
    userState.user, userState.isAdmin, userState.loading, userState.error
  ]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {contextValue.areServicesAvailable && <FirebaseErrorListener />}
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase used outside provider');
  return context;
};

export const useFirestore = () => useFirebase().firestore;
export const useAuth = () => useFirebase().auth;

export const useUser = () => {
  const { user, isAdmin, isUserLoading, userError } = useFirebase();
  return { user, isAdmin, isUserLoading, userError };
};

export function useMemoFirebase<T>(
  factory: () => T, deps: DependencyList
): T & { __memo?: boolean } {
  const memoized = useMemo(factory, deps);
  if (typeof memoized === 'object' && memoized !== null) {
    (memoized as any).__memo = true;
  }
  return memoized as any;
}
