'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectProps {
  options: { label: string; value: string }[];
  placeholder?: string;
  onChange?: (values: string[]) => void;
  className?: string;
}

export function MultiSelect({ options, placeholder = "Select...", onChange, className }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  const removeSelected = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    const newSelected = selected.filter((v) => v !== value);
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[48px] px-4 py-2 rounded-xl flex flex-wrap gap-2 items-center cursor-pointer neu-inset bg-transparent transition-all border border-border/50 hover:border-primary/30"
      >
        {selected.length === 0 && (
          <span className="text-sm text-muted-foreground">{placeholder}</span>
        )}
        {selected.map((val) => {
          const opt = options.find((o) => o.value === val);
          return (
            <span
              key={val}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold text-white bg-gradient-to-br from-primary to-accent shadow-sm animate-in zoom-in-95 duration-200"
            >
              {opt?.label}
              <button
                type="button"
                onClick={(e) => removeSelected(e, val)}
                className="hover:text-white/70 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}
        <ChevronDown className={cn("ml-auto h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <ul className="absolute z-50 w-full mt-2 rounded-2xl overflow-hidden neu-raised bg-card border border-border shadow-2xl max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => toggleOption(option.value)}
              className="px-4 py-3 text-sm text-foreground cursor-pointer hover:bg-primary/10 transition-colors flex items-center justify-between group"
            >
              <span className={cn("font-medium", selected.includes(option.value) && "text-primary")}>
                {option.label}
              </span>
              {selected.includes(option.value) && <Check className="h-4 w-4 text-primary" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}