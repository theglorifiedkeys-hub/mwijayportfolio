'use client';

import React, { useRef, useEffect } from 'react';

export function SpotlightCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lx = -999, ly = -999;

    const resize = () => {
      const r = container.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
    };

    const onMouseMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      lx = e.clientX - r.left;
      ly = e.clientY - r.top;
    };

    const onMouseLeave = () => {
      lx = -999; ly = -999;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (lx !== -999) {
        const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 350);
        g.addColorStop(0, "rgba(124, 92, 255, 0.15)");
        g.addColorStop(0.5, "rgba(41, 247, 215, 0.05)");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0">
      <canvas ref={canvasRef} className="w-full h-full opacity-60" />
    </div>
  );
}
