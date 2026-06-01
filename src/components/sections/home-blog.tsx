'use client';

import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Newspaper, Clock, Loader2 } from 'lucide-react';
import FadeContent from '@/components/ui/fade-content';
import OptimizedImage from '@/components/ui/optimized-image';
import { Card, CardContent } from '@/components/ui/card';

/**
 * HomeBlog - Resilient component for displaying recent insights.
 * FIXED: Enhanced guards to prevent collection() SSR errors.
 */
export function HomeBlog() {
  const db = useFirestore();

  const blogsQuery = useMemoFirebase(() => {
    // CRITICAL GUARD: Do not run if db is null
    if (!db) return null;
    try {
      const blogsRef = collection(db, 'blogs');
      return query(blogsRef, where('isPublished', '==', true), orderBy('publishedAt', 'desc'), limit(3));
    } catch (e) {
      console.warn("Registry signal interrupted for home-blog", e);
      return null;
    }
  }, [db]);

  const { data: blogs, isLoading } = useCollection(blogsQuery);

  return (
    <section className="py-24 px-6 md:px-12 bg-muted/20 border-t border-border/50">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4 text-left">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[9px] font-black uppercase tracking-widest">
                <Newspaper className="h-3.5 w-3.5" /> Insights Node
             </div>
             <h2 className="text-3xl md:text-6xl font-black font-headline tracking-tighter text-foreground">Strategic <span className="text-primary italic">Thoughts</span></h2>
             <p className="text-muted-foreground text-sm md:text-lg max-w-xl font-medium">Deep-dives into the technical matrix of AI, development, and business logic.</p>
          </div>
          <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] gap-2 text-primary hover:bg-primary/5 transition-all" asChild>
            <Link href="/blog">View Registry Entry <ArrowRight size={14} /></Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>
        ) : !blogs || blogs.length === 0 ? (
          <div className="p-20 rounded-[3rem] border-2 border-dashed border-border/50 text-center space-y-6 bg-card/50">
            <h3 className="text-2xl font-black font-headline uppercase tracking-tight opacity-40 italic">Coming Soon...</h3>
            <p className="text-muted-foreground max-w-sm mx-auto font-medium italic">Signals are being compiled in the architecture vault. Check back within 24 hours.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((post, i) => (
              <FadeContent key={post.id} delay={i * 150} threshold={0.1}>
                <Link href={`/blog/${post.slug || post.id}`} className="group block h-full">
                  <Card className="h-full border-2 rounded-[2.5rem] bg-card hover:border-primary/20 transition-all overflow-hidden flex flex-col shadow-sm group-hover:shadow-2xl border-border/50">
                    <div className="aspect-[16/10] relative bg-muted overflow-hidden">
                      {post.imageUrl ? (
                        <OptimizedImage src={post.imageUrl} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-10"><Newspaper size={48} /></div>
                      )}
                      <div className="absolute top-4 left-4">
                         <span className="bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{post.category || 'Tech'}</span>
                      </div>
                    </div>
                    <CardContent className="p-8 space-y-4 flex-1">
                      <h3 className="text-xl font-headline font-black text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 font-medium leading-relaxed">{post.excerpt}</p>
                      <div className="pt-4 mt-auto border-t border-border/50 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <div className="flex items-center gap-2"><Clock size={12} /> {post.readTime || '5'} MIN READ</div>
                        <span className="text-primary group-hover:translate-x-1 transition-transform">READ ARTICLE →</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </FadeContent>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
