
'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import { formatTZS } from '@/lib/order-utils';

interface Product {
  id: string;
  title: string;
  price: string | number;
  description: string;
  imageUrl: string;
  category: string;
}

interface Props {
  products: Product[];
  onBuy: (product: Product) => void;
}

export function DigitalProductsSwiper({ products, onBuy }: Props) {
  return (
    <div className="w-full max-w-md py-12">
      <Swiper
        effect={'cards'}
        grabCursor={true}
        modules={[EffectCards, Mousewheel]}
        className="digital-swiper w-[280px] h-[450px] md:w-[320px] md:h-[500px]"
        cardsEffect={{
          rotate: true,
          perSlideRotate: 2,
          perSlideOffset: 8,
        }}
      >
        {products.map((product) => (
          <SwiperSlide 
            key={product.id} 
            className="rounded-[2rem] overflow-hidden bg-card border-2 border-border/50 shadow-2xl flex flex-col"
          >
            <div className="relative flex-1 bg-muted">
              <OptimizedImage 
                src={product.imageUrl} 
                alt={product.title} 
                fill 
                className="object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                <span className="text-white text-[10px] font-black uppercase tracking-widest">
                  {product.category}
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <div className="flex items-center gap-1 text-yellow-500 mb-1">
                   <Star size={10} fill="currentColor" />
                   <Star size={10} fill="currentColor" />
                   <Star size={10} fill="currentColor" />
                   <Star size={10} fill="currentColor" />
                   <Star size={10} fill="currentColor" />
                </div>
                <h3 className="text-white font-headline font-black text-xl leading-tight">
                  {product.title}
                </h3>
                <p className="text-white/70 text-xs font-medium line-clamp-2">
                  {product.description}
                </p>
              </div>
            </div>

            <div className="p-6 bg-card border-t flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Price Node</p>
                <p className="text-primary font-black text-lg">
                  {typeof product.price === 'number' ? formatTZS(product.price) : `TZS ${product.price}`}
                </p>
              </div>
              <Button 
                onClick={() => onBuy(product)}
                size="icon" 
                className="h-12 w-12 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20"
              >
                <ShoppingCart size={20} />
              </Button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mt-8 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
           Swipe Cards to Explore Registry
         </p>
      </div>
    </div>
  );
}
