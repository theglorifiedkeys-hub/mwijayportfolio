
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SignInPage } from '@/components/ui/sign-in';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function ClientLoginPage() {
  const auth = useAuth();
  const { user, isAdmin, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user && !isLoggingIn) {
      checkClientStatus(user.uid);
    }
    
    if (searchParams.get('error') === 'unauthorized') {
       toast({
         variant: "destructive",
         title: "Access Blocked",
         description: "Your account is not recognized as an active client."
       });
    }
  }, [user, searchParams, toast]);

  const designRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'site_config', 'auth_design');
  }, [db]);
  
  const { data: designData, isLoading: isDesignLoading } = useDoc(designRef as any);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password || !auth) return;

    setIsLoggingIn(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await checkClientStatus(userCredential.user.uid);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: "Invalid email or password." });
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const res = await signInWithPopup(auth, provider);
      await checkClientStatus(res.user.uid, true);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast({ variant: "destructive", title: "Auth Failed" });
      }
      setIsLoggingIn(false);
    }
  };

  const checkClientStatus = async (uid: string, isGoogle: boolean = false) => {
    if (!db || !auth) return;
    
    // ADMIN BYPASS
    if (isAdmin) {
       router.replace('/admin');
       return;
    }

    const clientDoc = await getDoc(doc(db, 'clients', uid));
    
    if (!clientDoc.exists()) {
      if (isGoogle) {
        await setDoc(doc(db, 'leads', uid), {
          uid,
          name: auth.currentUser?.displayName || 'Anonymous',
          email: auth.currentUser?.email,
          createdAt: serverTimestamp(),
          status: 'portal_attempt'
        }, { merge: true });
      }
      
      await signOut(auth);
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "This account is not registered in our client portal."
      });
      setIsLoggingIn(false);
      return;
    }
    
    router.replace('/client-portal/dashboard');
  };

  if (isUserLoading || isDesignLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Synchronizing...</p>
      </div>
    );
  }

  const heroImage = designData?.clientHeroImageUrl || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070";
  const testimonials = (designData?.clientTestimonials && designData.clientTestimonials.length > 0)
    ? designData.clientTestimonials
    : [
        {
          avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
          name: "Lilian K. Joe",
          handle: "@lili_designs",
          text: "Professionalism in every pixel. Tracking builds in real-time builds so much trust."
        }
      ];

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-6 left-6 z-[60] hidden lg:block">
        <Button variant="ghost" className="rounded-full gap-2 font-black uppercase text-[10px] tracking-widest text-foreground" asChild>
          <Link href="/"><ArrowLeft size={16} /> Home Base</Link>
        </Button>
      </div>

      <SignInPage
        title={
          <span className="font-headline font-black uppercase tracking-tighter text-foreground">
            Partner <span className="text-primary italic">Terminal</span>
          </span>
        }
        description="Sign in to track your project progress and access your files."
        heroImageSrc={heroImage}
        testimonials={testimonials}
        isLoading={isLoggingIn}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={() => toast({ title: "Reset Password", description: "Please contact David directly for access support." })}
        onCreateAccount={() => window.location.href = '/book'}
      />
    </div>
  );
}
