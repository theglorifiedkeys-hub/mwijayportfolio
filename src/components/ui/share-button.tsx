'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * ShareButton - Modern Share Protocol
 * Uses Web Share API with clipboard fallback.
 */
export function ShareButton({
  title,
  text,
  url,
  className,
  variant = 'outline',
  size = 'sm',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ 
          title, 
          text: text || `Check out ${title} on Mwijay Services`, 
          url: shareUrl 
        });
      } catch (err) {
        // Canceled by user
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast({ 
          title: 'Link Authenticated', 
          description: 'URL copied to registry clipboard.' 
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({ 
          variant: 'destructive',
          title: 'Link Failed', 
          description: 'Could not copy link to clipboard.' 
        });
      }
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={cn("rounded-full font-black uppercase tracking-widest text-[9px] gap-2", className)}
    >
      {copied ? <Check className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
      Share Build
    </Button>
  );
}
