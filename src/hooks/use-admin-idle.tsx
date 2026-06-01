'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

const IDLE_TIMEOUT = 80 * 1000;    // 80 seconds
const WARNING_TIME = 10 * 1000;    // warn at 10 seconds remaining

/**
 * useAdminIdle - Session Guard
 * Automatically terminates admin session after inactivity.
 */
export function useAdminIdle() {
  const auth = useAuth();
  const { user, isAdmin } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const warningRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const logout = useCallback(async () => {
    if (auth && user && isAdmin) {
      await signOut(auth);
      router.push('/');
      toast({ 
        title: 'Registry Locked',
        description: 'Terminated due to inactivity for your security.',
        variant: 'destructive'
      });
    }
  }, [auth, user, router, toast]);
  
  const resetTimer = useCallback(() => {
    if (!user || !isAdmin) return;

    clearTimeout(timerRef.current);
    clearTimeout(warningRef.current);
    
    // Warning at 70 seconds
    warningRef.current = setTimeout(() => {
      toast({
        title: '⚠️ Session Expiring',
        description: 'Auto-lock in 10 seconds...',
        variant: 'destructive',
        duration: 10000,
      });
    }, IDLE_TIMEOUT - WARNING_TIME);
    
    // Logout at 80 seconds
    timerRef.current = setTimeout(logout, IDLE_TIMEOUT);
  }, [logout, user, toast]);
  
  useEffect(() => {
    if (!user || !isAdmin) return;
    
    const events = [
      'mousedown', 'mousemove', 'keypress',
      'scroll', 'touchstart', 'click', 'keydown'
    ];
    
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer(); // Initialize
    
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(timerRef.current);
      clearTimeout(warningRef.current);
    };
  }, [user, resetTimer]);
}
