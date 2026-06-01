'use client';

import React, { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let mx = 0, my = 0; // Mouse coords
    let rx = 0, ry = 0; // Ring coords (lerped)

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      }
    };

    const lerpRing = () => {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      }
      requestAnimationFrame(lerpRing);
    };

    const handleHoverStart = () => setIsHovering(true);
    const handleHoverEnd = () => setIsHovering(false);

    window.addEventListener('mousemove', onMouseMove);
    requestAnimationFrame(lerpRing);

    const interactiveElements = document.querySelectorAll('a, button, [role="button"], .interactive-node');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleHoverStart);
      el.addEventListener('mouseleave', handleHoverEnd);
    });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleHoverStart);
        el.removeEventListener('mouseleave', handleHoverEnd);
      });
    };
  }, []);

  return (
    <>
      <div 
        ref={dotRef}
        className={`fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[10000] mix-blend-difference transition-all duration-300 ${
          isHovering ? 'scale-[3] bg-purple-400' : 'bg-white'
        }`}
        style={{ transform: 'translate3d(-100%, -100%, 0)' }}
      />
      <div 
        ref={ringRef}
        className={`fixed top-0 left-0 w-10 h-10 rounded-full border border-white/30 pointer-events-none z-[9999] -ml-5 -mt-5 transition-all duration-500 ${
          isHovering ? 'scale-[1.5] border-purple-400/50' : ''
        }`}
        style={{ transform: 'translate3d(-100%, -100%, 0)' }}
      />
    </>
  );
}
