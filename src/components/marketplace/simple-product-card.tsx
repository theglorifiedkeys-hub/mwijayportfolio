
'use client';

import React, { useState } from 'react';
import { ShoppingCart, Star, FileText, CheckCircle2, ChevronRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import OptimizedImage from '@/components/ui/optimized-image';
import { formatTZS } from '@/lib/order-utils';
import { cn } from '@/lib/utils';

interface SimpleProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    description: string;
    imageUrl: string;
    category: string;
    features?: string[];
    additionalImages?: string[];
  };
  onBuy: () => void;
}

export function SimpleProductCard({ product, onBuy }: SimpleProductCardProps) {
  const [activeImg, setActiveImg] = useState(product.imageUrl);

  return (
    <Card className="group h-full flex flex-col border-2 rounded-[2rem] bg-card hover:border-primary/40 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl border-border/50">
      {/* Visual Header */}
      <div className="relative aspect-[4/5] bg-muted overflow-hidden">
        <OptimizedImage 
          src={activeImg} 
          alt={product.title} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-[0.2em] text-white">
            {product.category || 'ASSET'}
          </span>
        </div>

        {/* Mini Thumbnails for multiple views */}
        {product.additionalImages && product.additionalImages.length > 0 && (
          <div className="absolute bottom-4 left-4 flex gap-2 z-20">
            {[product.imageUrl, ...product.additionalImages].map((img, idx) => (
              <button 
                key={idx} 
                onClick={(e) => { e.stopPropagation(); setActiveImg(img); }}
                className={cn(
                  "h-10 w-10 rounded-lg border-2 overflow-hidden transition-all",
                  activeImg === img ? "border-primary scale-110" : "border-white/20 opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} className="h-full w-full object-cover" alt="view" />
              </button>
            ))}
          </div>
        )}
      </div>

      <CardContent className="p-6 flex-1 flex flex-col space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-yellow-500 mb-1">
             {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="currentColor" />)}
          </div>
          <h3 className="font-black font-headline text-xl leading-tight text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </div>

        <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-3">
          {product.description}
        </p>

        {/* Feature Signals */}
        <div className="space-y-2 pt-2 flex-1">
           {product.features?.slice(0, 3).map((f, i) => (
             <div key={i} className="flex items-center gap-2 text-[9px] font-black uppercase text-foreground/70 tracking-widest">
               <CheckCircle2 size={12} className="text-primary" /> {f}
             </div>
           ))}
        </div>

        {/* Price & Action Node */}
        <div className="pt-6 border-t border-border/50 flex items-center justify-between mt-auto">
          <div className="space-y-0.5">
             <p className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.2em]">Registry Fee</p>
             <p className="text-lg font-black text-primary tracking-tighter">{formatTZS(product.price)}</p>
          </div>
          <Button 
            onClick={onBuy}
            className="rounded-xl h-11 px-6 bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            Buy Now <ShoppingCart size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
