'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, ShieldAlert, Lock, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ProtectedMediaProps {
  assetId: string;
  thumbnailUrl: string;
  title: string;
  className?: string;
}

/**
 * ProtectedMedia - Industrial grade asset security with Blur-Logic.
 */
export function ProtectedMedia({ assetId, thumbnailUrl, title, className }: ProtectedMediaProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const db = useFirestore();

  useEffect(() => {
    if (!db) return;
    
    // If no user, they definitely aren't authorized
    if (!user) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    // Subscribe to the specific access token for this user and asset
    // Using orderId or assetId depending on your logic
    const accessRef = doc(db, 'access_tokens', user.uid + '_' + assetId);
    
    const unsub = onSnapshot(accessRef, (snap) => {
      if (snap.exists() && snap.data().expiresAt.toDate() > new Date()) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
      setLoading(false);
    }, (err) => {
      console.error("Signal block:", err);
      setIsAuthorized(false);
      setLoading(false);
    });

    return () => unsub();
  }, [db, user, assetId]);

  if (loading) return (
    <div className={cn("aspect-video w-full rounded-[2rem] bg-muted animate-pulse flex items-center justify-center", className)}>
       <Loader2 className="animate-spin text-primary opacity-20" />
    </div>
  );

  return (
    <div className={cn("relative w-full overflow-hidden rounded-[2rem] border-2 border-white/5 bg-zinc-950 group", className)}>
      {/* Visual Content (Blurred if not authorized) */}
      <div className={cn(
        "w-full h-full transition-all duration-1000",
        !isAuthorized ? "blur-md grayscale opacity-40 scale-105" : "blur-0 grayscale-0 opacity-100 scale-100"
      )}>
        <img 
          src={thumbnailUrl} 
          alt={title} 
          className="w-full h-full object-cover" 
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      {/* Security Overlay for unauthorized nodes */}
      {!isAuthorized && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-black/40 backdrop-blur-sm">
           <div className="h-16 w-16 rounded-[2rem] bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary mb-6 shadow-2xl">
              <Lock size={32} />
           </div>
           <h4 className="text-xl font-black font-headline text-white uppercase tracking-tighter mb-2">Build Locked</h4>
           <p className="text-white/60 text-xs font-medium max-w-[200px] mb-8 leading-relaxed">
             This digital architecture requires a verified access signal.
           </p>
           <Button size="sm" className="rounded-full px-8 h-12 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl" asChild>
             <Link href="/pricing"><ShoppingBag size={14} /> Buy Access</Link>
           </Button>
        </div>
      )}

      {/* Status Indicators */}
      <div className="absolute top-4 right-4 z-30 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
         {isAuthorized ? (
           <>
             <ShieldCheck size={10} className="text-green-500" />
             <span className="text-[8px] font-black uppercase tracking-widest text-white/80">Signal_Authenticated</span>
           </>
         ) : (
           <>
             <Lock size={10} className="text-primary" />
             <span className="text-[8px] font-black uppercase tracking-widest text-white/80">Secured_by_MWJ</span>
           </>
         )}
      </div>
    </div>
  );
}
