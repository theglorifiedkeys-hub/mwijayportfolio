'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useEffect(() => {
    // Only apply strict security on premium/protected routes
    const isProtectedRoute = pathname.includes('/premium') || pathname.includes('/dashboard');
    if (!isProtectedRoute) return;

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+S, Ctrl+U, F12, Ctrl+Shift+I
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'u')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
      }
    };

    const checkDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      setIsDevToolsOpen(widthDiff || heightDiff);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', checkDevTools);
    
    const interval = setInterval(checkDevTools, 1000);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', checkDevTools);
      clearInterval(interval);
    };
  }, [pathname]);

  return (
    <>
      <div className={cn("transition-all duration-500", isDevToolsOpen && "blur-3xl grayscale pointer-events-none scale-95")}>
        {children}
      </div>
      {isDevToolsOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-8 text-center">
           <div className="space-y-4">
              <h2 className="text-2xl font-black font-headline text-primary uppercase tracking-tighter">Inspection Detected</h2>
              <p className="text-white/60 text-sm max-w-xs mx-auto">Please close browser developer tools to view premium MWJ architecture content.</p>
           </div>
        </div>
      )}
    </>
  );
}
