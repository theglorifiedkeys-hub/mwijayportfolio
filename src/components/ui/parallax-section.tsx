"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

interface ParallaxSectionProps {
  image: string;
  overlayOpacity?: number;
}

export function ParallaxSection({ image, overlayOpacity = 0.7 }: ParallaxSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      imageRef.current,
      { yPercent: -20 },
      {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden -z-10">
      <div 
        ref={imageRef}
        className="absolute inset-0 w-full h-[140%] bg-center bg-cover"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div 
        className="absolute inset-0 bg-black" 
        style={{ opacity: overlayOpacity }}
      />
    </div>
  );
}
