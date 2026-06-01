"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * @fileOverview AI Response Renderer Node.
 * Parses lightweight markdown-like formatting and applies Mwijay brand styling.
 */
export function AIResponseRenderer({ text, intent }: { text: string; intent?: string }) {
  const lines = text.split("\n");

  const getIntentStyles = () => {
    switch (intent) {
      case 'pricing': return "from-emerald-500 to-green-500";
      case 'portfolio': return "from-purple-500 to-pink-500";
      case 'start_project': return "from-primary to-cyan-500";
      case 'contact': return "from-primary to-blue-600";
      default: return "from-primary to-blue-500";
    }
  };

  const accentColor = getIntentStyles();

  return (
    <div className="space-y-3 text-sm md:text-base leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        // Heading detection ##
        if (line.startsWith("## ")) {
          return (
            <h3
              key={i}
              className={cn(
                "text-base md:text-lg font-black tracking-tight bg-gradient-to-r bg-clip-text text-transparent mt-6 first:mt-0 uppercase font-headline",
                accentColor
              )}
            >
              {line.replace("## ", "")}
            </h3>
          );
        }

        // Bullet points
        if (line.startsWith("- ")) {
          return (
            <div key={i} className="flex items-start gap-3 pl-1">
              <div className={cn("h-1.5 w-1.5 mt-2 rounded-full shrink-0 animate-pulse bg-gradient-to-r", accentColor)} />
              <p className="text-foreground/90 font-medium">
                {line.replace("- ", "")}
              </p>
            </div>
          );
        }

        // Bold text logic
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = line.split(boldRegex);

        return (
          <p key={i} className="text-foreground/80 font-medium leading-relaxed">
            {parts.map((part, index) => {
              // Every odd index is a bold part
              if (index % 2 === 1) {
                return (
                  <span 
                    key={index} 
                    className={cn("font-black bg-gradient-to-r bg-clip-text text-transparent", accentColor)}
                  >
                    {part}
                  </span>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}
