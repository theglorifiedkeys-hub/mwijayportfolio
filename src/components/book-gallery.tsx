'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2, BookOpen } from 'lucide-react';

/**
 * BookGallery - Dynamic architectural publication display.
 * USES MEMORY FILTERING: Fetches all products and filters 'pdf' category in JS
 * to bypass Firestore's "failed-precondition" composite index requirement.
 */
export function BookGallery() {
  const db = useFirestore();
  const productsRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);

  const allProductsQuery = useMemoFirebase(() => {
    if (!productsRef) return null;
    // Simple query to avoid composite index error (failed-precondition)
    return query(productsRef, orderBy('createdAt', 'desc'));
  }, [productsRef]);

  const { data: allProducts, isLoading } = useCollection(allProductsQuery);

  // MEMORY FILTER: Bypasses the need for manual indexing in Firebase Console
  const books = React.useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter((p: any) => p.category === 'pdf');
  }, [allProducts]);

  if (isLoading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!books || books.length === 0) return (
    <div className="p-20 text-center border-2 border-dashed rounded-[3rem] opacity-20">
       <BookOpen className="h-12 w-12 mx-auto mb-4" />
       <p className="font-black uppercase tracking-widest text-sm italic">eBook Registry Empty</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12">
      {books.map((book: any, idx: number) => (
        <div key={book.id || idx} className="group perspective-1000 flex flex-col items-center">
          <motion.div 
            whileHover={{ rotateY: -30, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative w-[240px] h-[320px] transform-style-3d shadow-2xl rounded-r-lg"
          >
            {/* Book Spine */}
            <div className="absolute top-0 left-0 w-[40px] h-full bg-zinc-950 origin-left -rotate-y-90 flex items-center justify-center p-2">
              <span className="text-[8px] font-black text-white/40 uppercase rotate-180 whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
                {book.title}
              </span>
            </div>
            
            {/* Book Cover */}
            <div className="absolute inset-0 bg-zinc-900 rounded-r-lg overflow-hidden border-l-4 border-white/10">
              {book.imageUrl && (
                <Image 
                  src={book.imageUrl} 
                  alt={book.title} 
                  fill 
                  className="object-cover opacity-80"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <h4 className="text-white font-bold text-lg leading-tight mb-1 uppercase tracking-tight">{book.title}</h4>
                <p className="text-white/50 text-[8px] uppercase font-black tracking-[0.3em]">MWJ ARCHITECTURE</p>
              </div>
            </div>
          </motion.div>
          <div className="mt-8 text-center space-y-1">
            <h5 className="font-black font-headline text-sm uppercase tracking-tight text-foreground">{book.title}</h5>
            <div className="h-1 w-12 mx-auto rounded-full bg-primary" />
          </div>
        </div>
      ))}
    </div>
  );
}
