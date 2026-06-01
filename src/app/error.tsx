'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Home, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

/**
 * Route-Level Error Page
 * Next.js 15 automated fallback for failed segments.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, you would log this to a service like Sentry or a Firestore 'errors' collection
    console.error('Registry Segment Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-10 animate-in fade-in zoom-in duration-500">
        <div className="h-20 w-20 rounded-[2rem] bg-destructive/10 border-2 border-destructive/20 flex items-center justify-center text-destructive mx-auto shadow-2xl">
          <ShieldAlert size={36} />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black font-headline tracking-tighter uppercase leading-none">
            System <span className="text-destructive italic">Fault</span>
          </h1>
          <p className="text-muted-foreground font-medium leading-relaxed">
            The architecture node encountered a fatal exception during signal transmission.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            onClick={reset}
            className="h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20"
          >
            <RefreshCcw size={16} /> Try Again
          </Button>
          <Button 
            variant="outline"
            className="h-14 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px]"
            asChild
          >
            <Link href="/"><Home size={16} /> Return Home</Link>
          </Button>
        </div>

        <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-[0.3em]">
          ERR_CODE: {error.digest || 'SEGMENT_FAULT_2026'}
        </p>
      </div>
    </div>
  );
}
