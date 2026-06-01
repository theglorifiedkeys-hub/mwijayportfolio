
'use client';

import React from 'react';

/**
 * Shared Loading Bar UI for brand consistency.
 */
export function LoadingBar({ className = '' }: { className?: string }) {
  return (
    <div className={`w-64 md:w-80 h-[2px] bg-white/10 rounded-full overflow-hidden ${className}`}>
      <div className="h-full bg-primary animate-[loading-bar_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
    </div>
  );
}
