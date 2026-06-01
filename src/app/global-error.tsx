'use client';

import React from 'react';
import { inter, spaceGrotesk } from '@/lib/fonts';

/**
 * Root-Level Global Error
 * Catches errors in the layout.tsx itself.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-background text-foreground flex flex-col items-center justify-center min-h-screen text-center p-8">
        <div className="space-y-6">
          <div className="h-16 w-16 bg-destructive rounded-2xl mx-auto flex items-center justify-center text-white">!</div>
          <h1 className="text-4xl font-black font-headline tracking-tighter uppercase">Root Registry Failure</h1>
          <p className="text-muted-foreground max-w-xs mx-auto font-medium">The core platform infrastructure has encountered a critical fault.</p>
          <button 
            onClick={() => reset()}
            className="px-8 py-4 bg-primary text-white font-black uppercase text-xs rounded-xl shadow-xl"
          >
            Re-Initialize Registry
          </button>
        </div>
      </body>
    </html>
  );
}
