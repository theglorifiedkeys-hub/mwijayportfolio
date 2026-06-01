'use client';

import Image, { ImageProps } from 'next/image';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ProtectedImageProps extends Omit<ImageProps, 'draggable'> {
  containerClassName?: string;
}

/**
 * ProtectedImage - High-security image component.
 * Prevents casual saving, dragging, and long-pressing of personal assets.
 */
export function ProtectedImage({
  containerClassName = '',
  className = '',
  alt,
  ...props
}: ProtectedImageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    // Prevent context menu (right-click)
    const blockContext = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent drag
    const blockDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent touch hold (iOS/Android save image menu)
    const blockTouchHold = (e: TouchEvent) => {
      // Only block on the wrapper
      if ((e.target as HTMLElement).closest('.img-protect-wrap')) {
        // e.preventDefault(); // Note: blocking this might affect scroll if not careful
      }
    };

    el.addEventListener('contextmenu', blockContext);
    el.addEventListener('dragstart', blockDrag);
    el.addEventListener('touchstart', blockTouchHold, { passive: true });

    return () => {
      el.removeEventListener('contextmenu', blockContext);
      el.removeEventListener('dragstart', blockDrag);
      el.removeEventListener('touchstart', blockTouchHold);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={cn('img-protect-wrap', containerClassName)}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      } as React.CSSProperties}
    >
      <Image
        {...props}
        alt={alt}
        draggable={false}
        className={cn('protected', className)}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        } as React.CSSProperties}
      />
    </div>
  );
}
