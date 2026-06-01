'use client';

import React, { useState } from 'react';
import { ServicesEditor } from '@/components/admin/services-editor';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, Grid3x3, Eye, EyeOff, Sparkles, Code2, Zap, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const OWNER_ID = "mwijay-davie-admin";

/* ═══════════════════════════════════════════
   STAT CARD COMPONENT
═══════════════════════════════════════════ */
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color = "text-primary",
  bgColor = "bg-primary/10" 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  color?: string;
  bgColor?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="rounded-[2rem] border-2 border-border/50 overflow-hidden shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bgColor)}>
              <Icon size={18} className={color} />
            </div>
          </div>
          <p className="text-2xl font-black mb-1">{value}</p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   INFO BANNER COMPONENT
═══════════════════════════════════════════ */
function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="rounded-[2rem] border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden shadow-lg relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Sparkles size={22} className="text-primary" />
            </div>
            <div className="flex-1">
              {children}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function AdminExpertisePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch profile to get services count
  const profileRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'users', OWNER_ID);
  }, [db]);
  
  const { data: profile } = useDoc(profileRef);

  const servicesCount = profile?.services?.length || 0;
  const activeServices = profile?.services?.filter((s: any) => !s.disabled)?.length || 0;

  /* ══════════════════════════════════════
     LOADING STATE
  ══════════════════════════════════════ */
  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        >
          <Loader2 className="h-10 w-10 text-primary" />
        </motion.div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
          Loading Matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      
      {/* ══ HEADER ══ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border/30"
      >
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-[1.5rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
            <Grid3x3 size={26} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">
              Expertise <span className="text-primary italic">Matrix</span>
            </h1>
            <p className="text-muted-foreground font-medium text-sm mt-1.5">
              Manage the Cybernetic Bento Grid services displayed on the home page
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className={cn(
              "h-11 px-6 rounded-xl border-2 font-black uppercase tracking-wider text-[10px] gap-2 transition-all",
              previewMode && "border-primary bg-primary/5 text-primary"
            )}
          >
            {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button
            className="h-11 px-6 rounded-xl font-black uppercase tracking-wider text-[10px] gap-2 shadow-lg shadow-primary/20"
            asChild
          >
            <Link href="/" target="_blank">
              <Code2 size={16} /> View Live Site
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* ══ STATS ROW ══ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Total Services"
          value={servicesCount}
          color="text-blue-500"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          icon={Zap}
          label="Active Cards"
          value={activeServices}
          color="text-green-500"
          bgColor="bg-green-500/10"
        />
        <StatCard
          icon={Grid3x3}
          label="Grid Layout"
          value="Bento"
          color="text-purple-500"
          bgColor="bg-purple-500/10"
        />
        <StatCard
          icon={TrendingUp}
          label="Visibility"
          value="Public"
          color="text-orange-500"
          bgColor="bg-orange-500/10"
        />
      </div>

      {/* ══ INFO BANNER ══ */}
      <InfoBanner>
        <h4 className="text-sm font-black uppercase tracking-tight mb-2">
          🎯 Matrix Configuration Guidelines
        </h4>
        <div className="space-y-2 text-[11px] text-muted-foreground font-medium leading-relaxed">
          <p>
            <strong className="text-foreground">• Grid System:</strong> Services are displayed in a responsive Bento Grid layout (2-column on desktop, 1-column on mobile).
          </p>
          <p>
            <strong className="text-foreground">• Icon Library:</strong> Use Lucide React icons for consistency. Popular choices: <code className="px-1.5 py-0.5 rounded bg-muted text-primary text-[10px] font-bold">Code2</code>, <code className="px-1.5 py-0.5 rounded bg-muted text-primary text-[10px] font-bold">Zap</code>, <code className="px-1.5 py-0.5 rounded bg-muted text-primary text-[10px] font-bold">Rocket</code>.
          </p>
          <p>
            <strong className="text-foreground">• Performance:</strong> Each card auto-optimizes with lazy loading and hover animations for 60fps interactions.
          </p>
          <p>
            <strong className="text-foreground">• Live Updates:</strong> Changes propagate instantly to the public site (no rebuild required).
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-wider">
            Real-time Sync
          </Badge>
          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-wider">
            No Deploy Needed
          </Badge>
        </div>
      </InfoBanner>

      {/* ══ PREVIEW MODE TOGGLE ══ */}
      <AnimatePresence mode="wait">
        {previewMode ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="rounded-[2.5rem] border-2 border-border/50 overflow-hidden shadow-xl bg-muted/20">
              <CardContent className="p-10">
                <div className="text-center space-y-4 py-16">
                  <Eye size={64} className="mx-auto text-muted-foreground/30" />
                  <h3 className="text-2xl font-black uppercase tracking-tight">Preview Mode</h3>
                  <p className="text-muted-foreground text-sm font-medium max-w-md mx-auto">
                    Visit the <strong>live home page</strong> to see how your Expertise Matrix appears to visitors. 
                    Click "Edit Mode" to return to the editor.
                  </p>
                  <Button
                    className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 shadow-lg shadow-primary/20"
                    asChild
                  >
                    <Link href="/" target="_blank">
                      <Code2 size={16} /> Open Home Page
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <ServicesEditor userId={OWNER_ID} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ BOTTOM TIPS CARD ══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="rounded-[2rem] border-2 border-dashed border-border/30 bg-card/30 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black uppercase tracking-tight mb-2">
                  💡 Pro Tips
                </h4>
                <ul className="space-y-1.5 text-[11px] text-muted-foreground font-medium">
                  <li>• Use <strong className="text-foreground">action verbs</strong> in titles (e.g., "Build", "Deploy", "Architect")</li>
                  <li>• Keep descriptions <strong className="text-foreground">under 100 characters</strong> for optimal readability</li>
                  <li>• Arrange cards in <strong className="text-foreground">priority order</strong> — top cards get more visibility</li>
                  <li>• Toggle "disabled" to temporarily hide services without deleting them</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
}