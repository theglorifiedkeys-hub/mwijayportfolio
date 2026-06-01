'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
}

/**
 * OptimizedImage - Resilient image wrapper with protection features.
 * Hardened for 2026: Blocks right-click, dragging, and long-press saving.
 */
export default function OptimizedImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  if (!src) return null;

  const isCloudinary = src.includes('res.cloudinary.com');
  const finalSrc = isCloudinary ? getCloudinaryImageUrl(src) : src;

  return (
    <div className="relative overflow-hidden contents select-none">
      <Image
        src={finalSrc}
        alt={alt || ''}
        className={cn("transition-opacity duration-300 pointer-events-none", className)}
        unoptimized={isCloudinary}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
        {...props}
      />
      {/* Invisible overlay for extra protection against mobile long-press */}
      <div 
        className="absolute inset-0 z-[1] select-none pointer-events-auto bg-transparent" 
        onContextMenu={(e) => e.preventDefault()} 
      />
    </div>
  );
}
