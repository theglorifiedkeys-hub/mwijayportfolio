'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Clock, Share2, Loader2, Newspaper, 
  Quote, Terminal, Copy, Check, BookOpen,
  Hash, ArrowUp, Eye
} from 'lucide-react';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/optimized-image';
import { format } from 'date-fns';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollReveal, WordReveal } from '@/components/ui/scroll-primitives';

/* ═══════════════════════════════════════════
   READING PROGRESS BAR
═══════════════════════════════════════════ */
function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-purple-500 to-primary origin-left z-[9999]"
    />
  );
}

/* ═══════════════════════════════════════════
   BACK TO TOP BUTTON
═══════════════════════════════════════════ */
function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30 hover:scale-110 transition-transform"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════
   COPY CODE BUTTON
═══════════════════════════════════════════ */
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
}

/* ═══════════════════════════════════════════
   SHARE BUTTON
═══════════════════════════════════════════ */
function ShareButton({ title }: { title: string }) {
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      navigator.clipboard.writeText(url);
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border/50 hover:border-primary/40 bg-card text-sm font-bold transition-all"
    >
      {shared ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
      {shared ? 'Copied!' : 'Share'}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════
   CONTENT RENDERER
═══════════════════════════════════════════ */
function ContentRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {

        // Heading 1: # Title
        if (line.startsWith('# ')) {
          return (
            <ScrollReveal key={i} direction="left">
              <h2 className="text-3xl md:text-4xl font-black font-headline tracking-tighter uppercase mt-12 mb-6 text-foreground">
                {line.replace('# ', '')}
              </h2>
            </ScrollReveal>
          );
        }

        // Heading 2: ## Title
        if (line.startsWith('## ')) {
          return (
            <ScrollReveal key={i} direction="left" delay={0.05}>
              <h3 className="text-2xl md:text-3xl font-black font-headline tracking-tight uppercase mt-10 mb-4 text-foreground">
                {line.replace('## ', '')}
              </h3>
            </ScrollReveal>
          );
        }

        // Blockquote: > text
        if (line.startsWith('>')) {
          return (
            <ScrollReveal key={i} direction="right">
              <blockquote className="my-10 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
                <div className="pl-8 pr-6 py-6 bg-primary/5 rounded-r-3xl border border-primary/10">
                  <Quote className="h-8 w-8 text-primary/30 mb-3" />
                  <p className="text-xl md:text-2xl italic font-medium text-foreground leading-relaxed">
                    {line.substring(1).trim()}
                  </p>
                </div>
              </blockquote>
            </ScrollReveal>
          );
        }

        // Code block
        if (line.startsWith('```') || (line.startsWith('`') && line.endsWith('`'))) {
          const code = line.replace(/`/g, '');
          return (
            <ScrollReveal key={i} direction="up">
              <div className="my-8 relative rounded-2xl overflow-hidden border border-white/5 shadow-xl">
                <div className="flex items-center gap-2 px-5 py-3 bg-zinc-900 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <Terminal size={12} className="text-white/30 ml-2" />
                  <span className="text-white/30 text-[10px] font-mono uppercase tracking-wider ml-1">
                    code
                  </span>
                </div>
                <div className="p-6 bg-zinc-950 overflow-x-auto relative">
                  <code className="font-mono text-sm text-blue-400 leading-relaxed">
                    {code}
                  </code>
                  <CopyButton code={code} />
                </div>
              </div>
            </ScrollReveal>
          );
        }

        // Bullet point
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex items-start gap-3 my-2"
            >
              <div className="w-2 h-2 rounded-full bg-primary mt-3 shrink-0 animate-pulse" />
              <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                {line.replace(/^[-•]\s/, '')}
              </p>
            </motion.div>
          );
        }

        // Image URL
        if (
          line.includes('res.cloudinary.com') &&
          (line.endsWith('.jpg') || line.includes('.png') || line.includes('.webp'))
        ) {
          return (
            <ScrollReveal key={i} direction="up">
              <div className="my-12 relative aspect-video rounded-3xl overflow-hidden border-2 border-border/30 shadow-2xl">
                <img
                  src={line.trim()}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  alt="Article Visual"
                />
              </div>
            </ScrollReveal>
          );
        }

        // Empty line
        if (line.trim() === '') return <div key={i} className="h-2" />;

        // Bold text **text**
        if (line.includes('**')) {
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-muted-foreground text-lg md:text-xl leading-[1.85] font-medium mb-4"
            >
              {parts.map((part, pi) =>
                pi % 2 === 1 ? (
                  <strong key={pi} className="font-black text-foreground bg-primary/5 px-1 rounded">
                    {part}
                  </strong>
                ) : part
              )}
            </motion.p>
          );
        }

        // Regular paragraph
        return (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-muted-foreground text-lg md:text-xl leading-[1.85] font-medium mb-4"
          >
            {line}
          </motion.p>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function BlogPostDetailPage() {
  const { slug } = useParams();
  const db = useFirestore();

  const blogQuerySlug = useMemoFirebase(() => {
    if (!db || !slug) return null;
    return query(collection(db, 'blogs'), where('slug', '==', slug), limit(1));
  }, [db, slug]);

  const { data: postsBySlug, isLoading: isLoadingSlug } = useCollection(blogQuerySlug);

  const blogQueryId = useMemoFirebase(() => {
    if (!db || !slug || (postsBySlug && postsBySlug.length > 0)) return null;
    return collection(db, 'blogs');
  }, [db, slug, postsBySlug]);

  const { data: allPosts, isLoading: isLoadingAll } = useCollection(blogQueryId);

  const post = React.useMemo(() => {
    if (postsBySlug && postsBySlug.length > 0) return postsBySlug[0];
    if (allPosts) return allPosts.find((p: any) => p.id === slug);
    return null;
  }, [postsBySlug, allPosts, slug]);

  const isLoading = isLoadingSlug || (isLoadingAll && !postsBySlug?.length);

  /* ── LOADING ── */
  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
      >
        <Loader2 className="h-10 w-10 text-primary" />
      </motion.div>
      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">
        Decrypting Article...
      </p>
    </div>
  );

  /* ── NOT FOUND ── */
  if (!post) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="h-24 w-24 rounded-[2rem] bg-destructive/10 flex items-center justify-center text-destructive border-2 border-destructive/20 shadow-2xl"
      >
        <Newspaper size={40} />
      </motion.div>
      <div className="space-y-3">
        <h1 className="text-5xl font-black font-headline tracking-tighter">Signal Lost</h1>
        <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
          This article node has been deprecated or moved from the registry.
        </p>
      </div>
      <Button asChild className="rounded-full h-12 px-8 font-black uppercase text-[10px] tracking-widest">
        <Link href="/blog">Return to Insights Registry</Link>
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">

      {/* Reading progress */}
      <ReadingProgressBar />

      {/* Back to top */}
      <BackToTop />

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <main className="pt-24 pb-32 px-6">
        <article className="max-w-4xl mx-auto">

          {/* ── BACK BUTTON ── */}
          <ScrollReveal direction="left">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group mb-12"
            >
              <motion.span whileHover={{ x: -3 }}>
                <ArrowLeft size={14} />
              </motion.span>
              Back to Insights Registry
            </Link>
          </ScrollReveal>

          {/* ── ARTICLE HEADER ── */}
          <div className="space-y-10 mb-16">

            {/* Meta */}
            <ScrollReveal direction="up">
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                <span className="bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
                  {post.category || 'Tech Insight'}
                </span>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock size={11} />
                  {post.readTime || '5'} min read
                </div>
                {post.publishedAt && (
                  <span className="text-muted-foreground">
                    {format(post.publishedAt.toDate?.() || new Date(), 'MMM dd, yyyy')}
                  </span>
                )}
              </div>
            </ScrollReveal>

            {/* Title - Tone down from 7xl to 6xl max */}
            <ScrollReveal direction="up" delay={0.1}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-headline tracking-tighter text-foreground leading-[0.9] uppercase">
                <WordReveal text={post.title} />
              </h1>
            </ScrollReveal>

            {/* Excerpt */}
            <ScrollReveal direction="up" delay={0.2}>
              <div className="relative pl-8 border-l-4 border-primary py-2">
                <p className="text-xl md:text-2xl text-foreground font-bold leading-relaxed italic">
                  {post.excerpt}
                </p>
              </div>
            </ScrollReveal>

            {/* Author + Share bar */}
            <ScrollReveal direction="up" delay={0.3}>
              <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-border/40">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className="h-14 w-14 rounded-[1.5rem] bg-primary flex items-center justify-center text-white font-black text-sm shadow-xl shadow-primary/30"
                  >
                    DM
                  </motion.div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">David Erick Mwijage</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      Lead Architect • Mwijay Services
                    </p>
                  </div>
                </div>
                <ShareButton title={post.title} />
              </div>
            </ScrollReveal>
          </div>

          {/* ── HERO IMAGE ── */}
          {post.imageUrl && (
            <ScrollReveal direction="up">
              <div className="mb-16 relative aspect-[21/9] rounded-[3rem] overflow-hidden border-2 border-border/30 shadow-2xl group">
                <OptimizedImage
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </ScrollReveal>
          )}

          {/* ── CONTENT ── */}
          <div className="max-w-3xl mx-auto">
            <ContentRenderer content={post.content} />
          </div>

          {/* ── FOOTER CTA ── */}
          <ScrollReveal direction="up">
            <div className="mt-24 p-10 md:p-14 rounded-[3rem] bg-primary text-white text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-36 -mt-36 blur-3xl" />
              <div className="relative z-10 space-y-6">
                <BookOpen size={40} className="mx-auto text-white/60" />
                <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                  Ready to Build Something Precision-Engineered?
                </h3>
                <p className="text-white/70 text-base font-medium max-w-md mx-auto">
                  Let's architect your next digital system together.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    className="h-12 px-8 rounded-2xl bg-white text-primary hover:bg-white/90 font-black uppercase tracking-widest text-xs"
                    asChild
                  >
                    <Link href="/book">Start a Project</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 px-8 rounded-2xl border-2 border-white/30 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs"
                    asChild
                  >
                    <Link href="/blog">More Articles</Link>
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>

        </article>
      </main>

      <Footer />
    </div>
  );
}