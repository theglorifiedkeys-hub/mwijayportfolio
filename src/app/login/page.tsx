
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { SignInPage } from '@/components/ui/sign-in';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';

/**
 * System Login Node
 * Hardened for high-priority redirection to prevent infinite loading signals.
 */
export default function LoginPage() {
  const { user, isAdmin, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // INSTANT REDIRECT SIGNAL: Once user is detected, move them immediately.
  useEffect(() => {
    if (!isUserLoading && user) {
      const destination = isAdmin ? '/admin' : '/client-portal';
      router.replace(destination);
    }
  }, [user, isAdmin, isUserLoading, router]);

  const designRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'site_config', 'auth_design');
  }, [db]);
  
  const { data: designData, isLoading: isDesignLoading } = useDoc(designRef as any);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth || isLoggingIn) return;

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please fill all fields to continue." });
      return;
    }

    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The useEffect above will handle the instant redirect
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Login Failed", 
        description: "Invalid credentials or system interruption." 
      });
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      // The useEffect above will handle the instant redirect
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast({ variant: "destructive", title: "Auth Failed", description: err.message });
      }
      setIsLoggingIn(false);
    }
  };

  if (isUserLoading || isDesignLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Authenticating...</p>
      </div>
    );
  }

  const heroImage = designData?.adminHeroImageUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072";
  const testimonials = (designData?.adminTestimonials && designData.adminTestimonials.length > 0) 
    ? designData.adminTestimonials 
    : [
        {
          avatarSrc: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=200",
          name: "Dr. Elena Mwangi",
          handle: "@udsm_tech",
          text: "Mwijay's automation work on the SmartGym system is ahead of its time. True 2026 innovation."
        }
      ];

  return (
    <SignInPage
      title={
        <span className="font-headline font-black uppercase tracking-tighter text-foreground">
          System <span className="text-primary italic">Access</span>
        </span>
      }
      description="Authorize your identity to enter the admin dashboard."
      heroImageSrc={heroImage}
      testimonials={testimonials}
      isLoading={isLoggingIn}
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={() => toast({ title: "Reset Signal", description: "Contact support for a manual password reset." })}
      onCreateAccount={() => window.location.href = '/book'}
    />
  );
}
