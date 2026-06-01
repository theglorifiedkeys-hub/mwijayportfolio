
'use client';

import { useEffect, useState } from 'react';

/**
 * CursorGlow - Desktop-only premium radial glow effect.
 * Follows the mouse with a subtle lag for a high-end feel.
 */
export function CursorGlow() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Check if the device has a fine pointer (desktop mouse)
    const checkDesktop = () => {
      setIsDesktop(window.matchMedia('(pointer: fine)').matches);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    if (!isDesktop) return;

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', move);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('resize', checkDesktop);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <div
      className="fixed pointer-events-none z-[9999] mix-blend-screen transition-opacity duration-300"
      style={{
        left: pos.x - 150,
        top: pos.y - 150,
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, hsl(var(--primary)/0.1) 0%, transparent 70%)',
        transition: 'transform 0.15s ease-out, opacity 0.5s ease',
      }}
    />
  );
}
