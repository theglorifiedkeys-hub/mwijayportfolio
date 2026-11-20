'use client';

import React, { useState, useRef } from 'react';
import { useCollectionOnce, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Newspaper, Clock, Loader2, SignalHigh, 
  ArrowRight, Search, TrendingUp, Zap,
  BookOpen, Filter, X
} from 'lucide-react';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/optimized-image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ScrollReveal, 
  StaggerReveal, 
  TypewriterText,
  CountUpNumber,
  GlowCard 
} from '@/components/ui/scroll-primitives';

/* ═══════════════════════════════════════════
   HERO SECTION WITH PARALLAX
═══════════════════════════════════════════ */
function BlogHero({ totalPosts }: { totalPosts: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ 
    target: ref, 
    offset: ['start start', 'end start'] 
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[70vh] flex flex-col items-center justify-center text-center overflow-hidden">
      
      {/* Parallax background grid */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.04)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"
      />

      {/* Glow orbs */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        style={{ opacity }}
        className="relative z-10 space-y-8 max-w-5xl mx-auto px-6"
      >
        {/* Animated badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.35em] border border-primary/20 backdrop-blur-md"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          >
            <SignalHigh className="h-3.5 w-3.5" />
          </motion.div>
          Insight Matrix — Mwijay Intelligence
        </motion.div>

        {/* Main heading with typewriter - Tone down from 9xl to 8xl max */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-headline tracking-tighter leading-[0.9] uppercase">
            Strategic{' '}
            <span className="block text-primary italic">
              <TypewriterText
                words={['Intelligence', 'Insights', 'Analysis', 'Knowledge']}
                speed={80}
                pauseTime={2500}
              />
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-base md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto"
        >
          Precision analysis of AI automation, high-performance web systems, and digital growth strategies for the modern builder.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 pt-4"
        >
          {[
            { icon: BookOpen, value: totalPosts, suffix: '+', label: 'Articles' },
            { icon: TrendingUp, value: 10, suffix: 'K+', label: 'Readers' },
            { icon: Zap, value: 5, suffix: ' Min', label: 'Avg Read' },
          ].map(({ icon: Icon, value, suffix, label }) => (
            <div key={label} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-card border border-border/40 shadow-sm">
              <Icon size={16} className="text-primary" />
              <div>
                <p className="text-xl font-black text-foreground leading-none">
                  <CountUpNumber end={value} suffix={suffix} />
                </p>
                <p className="text-[8px] font-black uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SEARCH BAR
═══════════════════════════════════════════ */
function SearchBar({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (v: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative max-w-xl mx-auto"
    >
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search articles..."
        className="w-full h-14 pl-12 pr-12 rounded-2xl border-2 border-border/50 bg-card font-medium text-sm focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/60 focus:shadow-lg focus:shadow-primary/10"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   CATEGORY FILTER
═══════════════════════════════════════════ */
function CategoryFilter({ 
  categories, 
  selected, 
  onSelect 
}: { 
  categories: string[];
  selected: string; 
  onSelect: (c: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {['All', ...categories].map((cat) => (
        <motion.button
          key={cat}
          onClick={() => onSelect(cat)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all",
            selected === cat
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
              : "bg-card border-border/40 text-muted-foreground hover:border-primary/40"
          )}
        >
          {cat}
        </motion.button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   FEATURED CARD (First Post)
═══════════════════════════════════════════ */
function FeaturedPostCard({ post }: { post: any }) {
  return (
    <ScrollReveal direction="up">
      <Link href={`/blog/${post.slug || post.id}`}>
        <GlowCard className="group relative rounded-[2.5rem] overflow-hidden border-2 border-border/50 hover:border-primary/40 transition-all shadow-xl hover:shadow-2xl bg-card">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
            
            {/* Image */}
            <div className="relative bg-muted overflow-hidden">
              {post.imageUrl ? (
                <OptimizedImage
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-5">
                  <Newspaper size={80} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80 hidden lg:block" />
              
              {/* Featured badge */}
              <div className="absolute top-6 left-6">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-xl"
                >
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Featured Article
                </motion.div>
              </div>
            </div>

            {/* Content */}
            <div className="p-10 lg:p-14 flex flex-col justify-center space-y-6">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-wider">
                  {post.category || 'Tech'}
                </Badge>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
                  <Clock size={11} /> {post.readTime || '5'} min read
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-[0.95] group-hover:text-primary transition-colors">
                {post.title}
              </h2>

              <p className="text-muted-foreground text-base font-medium leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>

              <div className="flex items-center gap-3 pt-4">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs shadow-lg">
                  DM
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wide">David Erick Mwijage</p>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Lead Architect</p>
                </div>
                <motion.div
                  className="ml-auto flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest"
                  whileHover={{ x: 4 }}
                >
                  Read Article <ArrowRight size={14} />
                </motion.div>
              </div>
            </div>
          </div>
        </GlowCard>
      </Link>
    </ScrollReveal>
  );
}

/* ═══════════════════════════════════════════
   POST CARD
═══════════════════════════════════════════ */
function PostCard({ post, index }: { post: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200 }}
    >
      <Link href={`/blog/${post.slug || post.id}`} className="group block h-full">
        <GlowCard className="h-full border-2 rounded-[2.5rem] bg-card hover:border-primary/40 transition-all overflow-hidden flex flex-col shadow-sm hover:shadow-2xl border-border/50 relative">
          
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Image */}
          <div className="aspect-[16/10] relative bg-muted overflow-hidden">
            {post.imageUrl ? (
              <OptimizedImage
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-10">
                <Newspaper size={48} />
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Category badge */}
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-black/70 backdrop-blur-md text-white border-white/10 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                {post.category || 'Tech'}
              </Badge>
            </div>

            {/* Read time on hover */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-10">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest">
                <Clock size={10} /> {post.readTime || '5'} min
              </div>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-8 space-y-4 flex-1 flex flex-col">
            <h3 className="text-xl font-headline font-black text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tight">
              {post.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-3 font-medium leading-relaxed flex-1">
              {post.excerpt}
            </p>

            <div className="pt-5 mt-auto border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-[8px]">
                  DM
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                  David M.
                </span>
              </div>
              <motion.span
                className="text-primary text-[9px] font-black uppercase tracking-widest flex items-center gap-1"
                whileHover={{ x: 2 }}
              >
                Read <ArrowRight size={10} />
              </motion.span>
            </div>
          </CardContent>
        </GlowCard>
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function BlogListingPage() {
  const db = useFirestore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const blogsQuery = useMemoFirebase(() => {
    if (!db) return null;
    try {
      return query(collection(db, 'blogs'), orderBy('publishedAt', 'desc'));
    } catch (e) {
      console.warn("📡 Blog Registry:", e);
      return null;
    }
  }, [db]);

  const { data: rawPosts, isLoading, error } = useCollectionOnce(blogsQuery);

  const posts = React.useMemo(() => {
    if (!rawPosts) return [];
    return rawPosts.filter((p: any) => p.isPublished === true);
  }, [rawPosts]);

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = posts.map((p: any) => p.category).filter(Boolean);
    return [...new Set(cats)] as string[];
  }, [posts]);

  // Filter posts by search + category
  const filteredPosts = React.useMemo(() => {
    return posts.filter((p: any) => {
      const matchesSearch = !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, search, selectedCategory]);

  const featuredPost = filteredPosts[0];
  const restPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      
      {/* Fixed ambient background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-primary/2 rounded-full blur-3xl" />
      </div>

      <main className="flex-1">
        
        {/* Hero */}
        <BlogHero totalPosts={posts.length} />

        <div className="max-w-7xl mx-auto px-6 pb-32 space-y-16">

          {/* Search + Filter */}
          <div className="space-y-6">
            <SearchBar value={search} onChange={setSearch} />
            {categories.length > 0 && (
              <CategoryFilter
                categories={categories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="aspect-[16/10] bg-muted/20 animate-pulse rounded-[2.5rem] border-2"
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-20 rounded-[3rem] bg-destructive/5 border-2 border-destructive/20 text-center space-y-6">
              <Newspaper className="h-16 w-16 mx-auto opacity-20 text-destructive" />
              <h3 className="text-2xl font-black font-headline uppercase">Signal Interrupted</h3>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="h-12 px-8 rounded-xl font-black uppercase text-xs"
              >
                Retry Sync
              </Button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-24 rounded-[3rem] border-2 border-dashed border-border/50 text-center space-y-6 bg-card/30"
            >
              <Newspaper className="h-16 w-16 mx-auto opacity-20" />
              <p className="font-black uppercase tracking-widest text-sm opacity-40">
                {search ? `No articles found for "${search}"` : 'Registry Empty — New signals coming soon'}
              </p>
              {search && (
                <Button
                  variant="outline"
                  onClick={() => setSearch('')}
                  className="rounded-xl"
                >
                  Clear Search
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-16">
              {/* Featured post */}
              {featuredPost && !search && selectedCategory === 'All' && (
                <FeaturedPostCard post={featuredPost} />
              )}

              {/* Article count */}
              <ScrollReveal direction="up">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {filteredPosts.length} Article{filteredPosts.length !== 1 ? 's' : ''} Found
                  </p>
                  <div className="h-px flex-1 bg-border/30 mx-6" />
                </div>
              </ScrollReveal>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(search || selectedCategory !== 'All' ? filteredPosts : restPosts).map((post, i) => (
                  <PostCard key={post.id} post={post} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}