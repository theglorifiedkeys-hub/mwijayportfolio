"use client";

import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

export function TypingHeadline({ text, className }: { text: string; className?: string }) {
  const textRef = useRef<HTMLHeadingElement>(null);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: textRef.current,
      start: "top 85%",
      onEnter: () => {
        let i = 0;
        const interval = setInterval(() => {
          setDisplayText(text.slice(0, i));
          i++;
          if (i > text.length) clearInterval(interval);
        }, 30);
      },
      once: true
    });
  }, [text]);

  return (
    <h2 ref={textRef} className={className}>
      {displayText}<span className="inline-block w-1.5 h-[1em] bg-primary ml-1 animate-pulse" />
    </h2>
  );
}
