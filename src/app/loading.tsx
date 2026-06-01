
import React from 'react';

/**
 * Root Loading UI (Splash Screen)
 * Enormous Glitch Typography - Responsive version.
 * Standard React styles used to prevent styled-jsx Server Component errors.
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#07080c] text-foreground overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .glitch-huge-splash {
          position: relative;
          color: white;
          font-size: clamp(6rem, 15vw, 18rem);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.05em;
          font-family: sans-serif;
          text-shadow: 0.05em 0 0 #2563eb, -0.025em -0.05em 0 #7c3aed, 0.025em 0.05em 0 #3b82f6;
          animation: main-glitch-splash 1s infinite linear alternate-reverse;
          line-height: 0.8;
          text-align: center;
          width: 100%;
        }

        .glitch-huge-splash::before,
        .glitch-huge-splash::after {
          content: 'MWIJAY.';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch-huge-splash::before {
          animation: glitch-anim-splash 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
          color: #7c3aed;
          z-index: -1;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
          transform: translate(-3px, -2px);
        }

        .glitch-huge-splash::after {
          animation: glitch-anim-2-splash 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both infinite;
          color: #2563eb;
          z-index: -2;
          clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
          transform: translate(3px, 2px);
        }

        @keyframes main-glitch-splash {
          0% { transform: skew(0deg); }
          20% { transform: skew(-3deg); }
          40% { transform: skew(2deg); }
          100% { transform: skew(0deg); }
        }

        @keyframes glitch-anim-splash {
          0% { transform: translate(0); }
          20% { transform: translate(-4px, 4px); }
          40% { transform: translate(-4px, -4px); }
          60% { transform: translate(4px, 4px); }
          100% { transform: translate(0); }
        }

        @keyframes glitch-anim-2-splash {
          0% { transform: translate(0); }
          20% { transform: translate(4px, -4px); }
          40% { transform: translate(4px, -4px); }
          60% { transform: translate(-4px, -4px); }
          100% { transform: translate(0); }
        }

        @keyframes loading-bar-splash {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}} />
      
      <div className="flex flex-col items-center gap-12 w-full">
        <h1 className="glitch-huge-splash">
          MWIJAY<span className="text-primary">.</span>
        </h1>
        
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-1000 delay-500">
           <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
              <span className="text-xs md:text-xl font-black uppercase tracking-[0.8em] text-white/90">PROTOCOL_ENGAGED</span>
           </div>
           <div className="w-64 md:w-80 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-[loading-bar-splash_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
           </div>
        </div>
      </div>
    </div>
  );
}
