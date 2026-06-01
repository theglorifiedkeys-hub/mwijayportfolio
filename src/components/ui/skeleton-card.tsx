'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  variant?: 'project' | 'product' | 'blog' | 'pricing' | 'default';
  className?: string;
}

/**
 * SkeletonCard - Reusable animated loader for Firestore data states.
 */
export default function SkeletonCard({ variant = 'default', className }: SkeletonCardProps) {
  const baseClasses = "bg-muted animate-pulse rounded-2xl";

  const renderSkeleton = () => {
    switch (variant) {
      case 'project':
        return (
          <div className="space-y-4">
            <div className={cn("aspect-video w-full", baseClasses)} />
            <div className="space-y-2">
              <div className={cn("h-6 w-3/4", baseClasses)} />
              <div className={cn("h-4 w-1/2", baseClasses)} />
            </div>
            <div className={cn("h-6 w-20 rounded-full", baseClasses)} />
          </div>
        );
      case 'product':
        return (
          <div className="space-y-4 p-4 border-2 border-border/50 rounded-[2.5rem]">
            <div className={cn("aspect-square w-full", baseClasses)} />
            <div className="space-y-2">
              <div className={cn("h-5 w-full", baseClasses)} />
              <div className={cn("h-4 w-2/3", baseClasses)} />
              <div className={cn("h-6 w-1/3 text-primary", baseClasses)} />
            </div>
            <div className={cn("h-10 w-full", baseClasses)} />
          </div>
        );
      case 'blog':
        return (
          <div className="flex flex-col md:flex-row gap-6 p-6 border-2 border-border/50 rounded-[2.5rem]">
            <div className={cn("w-full md:w-48 aspect-video md:aspect-square", baseClasses)} />
            <div className="flex-1 space-y-4">
              <div className={cn("h-5 w-24 rounded-full", baseClasses)} />
              <div className="space-y-2">
                <div className={cn("h-8 w-full", baseClasses)} />
                <div className={cn("h-4 w-3/4", baseClasses)} />
              </div>
              <div className="flex gap-4">
                <div className={cn("h-4 w-16", baseClasses)} />
                <div className={cn("h-4 w-16", baseClasses)} />
              </div>
            </div>
          </div>
        );
      case 'pricing':
        return (
          <div className="p-8 border-2 border-border/50 rounded-[3rem] space-y-6">
            <div className={cn("h-6 w-24 rounded-full", baseClasses)} />
            <div className={cn("h-12 w-32", baseClasses)} />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-2">
                  <div className={cn("h-5 w-5 rounded-full", baseClasses)} />
                  <div className={cn("h-4 flex-1", baseClasses)} />
                </div>
              ))}
            </div>
            <div className={cn("h-14 w-full", baseClasses)} />
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <div className={cn("h-4 w-full", baseClasses)} />
            <div className={cn("h-4 w-5/6", baseClasses)} />
            <div className={cn("h-4 w-4/6", baseClasses)} />
          </div>
        );
    }
  };

  return <div className={cn("w-full", className)}>{renderSkeleton()}</div>;
}
