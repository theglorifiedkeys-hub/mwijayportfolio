'use client';
/**
 * @fileOverview Strategic Intelligence Section.
 * USES MEMORY FILTERING: Fetches all blogs and filters isPublished in JS
 * to bypass Firestore's "failed-precondition" composite index requirement.
 */

import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Newspaper, Clock, Loader2, SignalHigh, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import FadeContent from '@/components/ui/fade-content';
import OptimizedImage from '@/components/ui/optimized-image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function InsightsSection() {
  const db = useFirestore();

  const blogsQuery = useMemoFirebase(() => {
    if (!db) return null;
    try {
      const blogsRef = collection(db, 'blogs');
      // SIMPLE QUERY: No 'where' clause here to avoid index requirement
      return query(
        blogsRef, 
        orderBy('publishedAt', 'desc'), 
        limit(12) // Fetch a pool to filter in memory
      );
    } catch (e) {
      console.error("📡 Insights Registry Logic Failed:", e);
      return null;
    }
  }, [db]);

  const { data: rawPosts, isLoading, error } = useCollection(blogsQuery);

  // MEMORY FILTER: Bypasses Firestore Index requirement
  const posts = React.useMemo(() => {
    if (!rawPosts) return [];
    return rawPosts
      .filter((p: any) => p.isPublished === true)
      .slice(0, 3); // Take the most recent 3
  }, [rawPosts]);

  return (
    <section className="py-24 px-6 md:px-12 bg-background border-t border-border/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4 text-left">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] border border-primary/20">
                <SignalHigh className="h-3.5 w-3.5" /> System Insights
             </div>
             <h2 className="text-3xl md:text-6xl font-black font-headline tracking-tighter text-foreground uppercase">Strategic <span className="text-primary italic">Intelligence</span></h2>
             <p className="text-muted-foreground text-sm md:text-lg max-w-xl font-medium leading-relaxed">
               Expert analysis of AI automation, high-performance web systems, and the digital economy.
             </p>
          </div>
          <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] gap-2 text-primary hover:bg-primary/5 transition-all h-12 px-6 border-2 border-primary/10 rounded-xl" asChild>
            <Link href="/blog">Open Insight Registry <ArrowRight size={14} /></Link>
          </Button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[16/10] bg-muted/20 animate-pulse rounded-[2.5rem] border-2" />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="p-12 rounded-[3rem] bg-destructive/5 border-2 border-destructive/20 text-center space-y-4 animate-in fade-in duration-500">
             <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
             <h4 className="text-lg font-black uppercase tracking-tight text-foreground">Registry Signal Interrupted</h4>
             <p className="text-muted-foreground text-sm font-medium">Failed to decrypt insights. Use Admin to publish nodes.</p>
             <Button variant="outline" onClick={() => window.location.reload()} className="h-10 px-6 rounded-xl font-bold uppercase text-[10px]">Retry Signal</Button>
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div className="p-20 rounded-[3rem] border-2 border-dashed border-border/50 text-center space-y-6 bg-card/30">
            <Sparkles className="h-12 w-12 text-primary/20 mx-auto" />
            <h3 className="text-2xl font-black font-headline uppercase tracking-tight opacity-40 italic">Syncing New Signals...</h3>
            <p className="text-muted-foreground max-w-sm mx-auto font-medium italic text-sm">No live insights detected in registry.</p>
          </div>
        )}

        {!isLoading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {posts.map((post: any, i: number) => (
              <FadeContent key={post.id} delay={i * 150} threshold={0.1}>
                <Link href={`/blog/${post.slug || post.id}`} className="group block h-full">
                  <Card className="h-full border-2 rounded-[2.5rem] bg-card hover:border-primary/30 transition-all overflow-hidden flex flex-col shadow-sm group-hover:shadow-2xl border-border/50">
                    <div className="aspect-[16/10] relative bg-muted overflow-hidden">
                      {post.imageUrl ? (
                        <OptimizedImage src={post.imageUrl} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-10 bg-primary/5">
                           <Newspaper size={48} className="text-primary" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                         <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                           {post.category || 'Expert Node'}
                         </Badge>
                      </div>
                    </div>
                    <CardContent className="p-8 space-y-4 flex-1 flex flex-col">
                      <h3 className="text-xl font-headline font-black text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tight">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-3 font-medium leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="pt-6 mt-auto border-t border-border/50 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <div className="flex items-center gap-2"><Clock size={12} /> {post.readTime || '5'} MIN READ</div>
                        <span className="text-primary group-hover:translate-x-1 transition-transform">DECRYPT SIGNAL →</span>
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
