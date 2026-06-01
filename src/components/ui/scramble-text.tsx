'use client';

import React, { useState, useEffect, useCallback } from 'react';

const CHARS = "!<>-_\\/[]{}—=+*^?#░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌";

interface ScrambleTextProps {
  text: string;
  className?: string;
  trigger?: 'hover' | 'mount';
}

export function ScrambleText({ text, className, trigger = 'hover' }: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);

  const scramble = useCallback((targetText: string) => {
    if (isScrambling) return;
    setIsScrambling(true);
    
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(prev => 
        targetText.split("").map((char, index) => {
          if (index < iteration) return targetText[index];
          if (char === " ") return " ";
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join("")
      );

      if (iteration >= targetText.length) {
        clearInterval(interval);
        setIsScrambling(false);
      }
      iteration += 1/3;
    }, 30);
  }, [isScrambling]);

  useEffect(() => {
    if (trigger === 'mount') scramble(text);
  }, [text, scramble, trigger]);

  return (
    <span 
      className={className}
      onMouseEnter={() => trigger === 'hover' && scramble(text)}
    >
      {display}
    </span>
  );
}
