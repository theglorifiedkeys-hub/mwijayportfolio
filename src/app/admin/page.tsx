'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useUser, useFirestore, useDocOnce, useMemoFirebase } from '@/firebase';
import { collection, query, where, onSnapshot, limit, orderBy, doc } from 'firebase/firestore';
import { 
  CheckCircle, TrendingUp, MessageSquare, ShoppingBag, Users,
  ArrowRight, Zap, Clock, Eye, Activity, DollarSign,
  Package, AlertCircle, Rocket, Settings, BarChart3,
  Calendar, Send, FileText, ExternalLink, Sparkles, Box, Cpu
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════
   STATS CARD COMPONENT
═══════════════════════════════════════════ */
function QuickStatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  bgColor,
  href,
  trend,
  trendUp = true
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string;
  bgColor: string;
  href: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300 }}
      whileHover={{ y: -4 }}
    >
      <Link href={href}>
        <Card className="rounded-[2rem] border-2 bg-card/50 hover:border-primary/30 transition-all shadow-lg group relative overflow-hidden h-full">
          {/* Top gradient accent */}
          <div className={cn("absolute top-0 left-0 right-0 h-1", bgColor)} />
          
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", bgColor)}>
                <Icon size={22} className={color} />
              </div>
              <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-2">
              {title}
            </p>
            
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black tracking-tighter">{value}</h3>
              
              {trend && (
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-bold",
                  trendUp ? "text-green-500" : "text-red-500"
                )}>
                  <TrendingUp size={12} className={cn(!trendUp && "rotate-180")} />
                  {trend}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   BRAND MATRIX CARD (Linked Visualization)
═══════════════════════════════════════════ */
function AdminBrandMatrix() {
  const db = useFirestore();
  const statsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'site_config', 'stats');
  }, [db]);
  const { data: stats } = useDocOnce(statsRef);

  const colors = stats?.brandColors || ['#1e3a5f', '#3182ce', '#7c3aed', '#10b981', '#f59e0b', '#e11d48'];

  return (
    <Card className="rounded-[2.5rem] border-2 bg-zinc-950 shadow-2xl overflow-hidden group border-border/50 h-full relative">
       <div className="absolute inset-0 bg-primary/5 opacity-50 blur-3xl pointer-events-none" />
       
       <div className="relative z-10 p-8 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-8">
             <div className="space-y-1">
                <h3 className="text-2xl font-black font-headline tracking-tighter uppercase text-white">Brand <span className="text-primary italic">Matrix</span></h3>
                <p className="text-[8px] font-mono font-black text-primary/60 tracking-[0.4em]">SYNCED_ARCHITECTURE</p>
             </div>
             <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl border border-primary/20">
                <Cpu className="h-6 w-6 animate-pulse" />
             </div>
          </div>

          <div className="grid grid-cols-3 gap-3 flex-1 mb-8">
             {colors.slice(0, 6).map((color: string, idx: number) => (
                <div 
                  key={idx} 
                  className="aspect-square rounded-2xl border-2 border-white/10 shadow-lg relative group/swatch overflow-hidden transition-all hover:scale-105"
                  style={{ backgroundColor: color }}
                >
                   <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/swatch:opacity-100 transition-opacity" />
                   <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover/swatch:opacity-100 transition-all translate-y-2 group-hover/swatch:translate-y-0">
                      <span className="text-[7px] font-black text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full">{color}</span>
                   </div>
                </div>
             ))}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/5">
             <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground">ACTIVE_VISUAL_NODE</span>
             </div>
             <Link href="/admin/site-config" className="text-[8px] font-black uppercase tracking-widest text-primary hover:underline">Edit Palette →</Link>
          </div>
       </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════ */
export default function AdminDashboard() {
  const { user } = useUser();
  const db = useFirestore();

  const [stats, setStats] = useState({
    newInquiries: 0,
    pendingOrders: 0,
    totalViews: 0,
    activeClients: 0,
    recentSignals: [] as any[]
  });

  useEffect(() => {
    if (!db || !user) return;

    const unsubInq = onSnapshot(
      query(collection(db, 'project_inquiries'), where('status', '==', 'new')), 
      (s) => setStats(prev => ({ ...prev, newInquiries: s.size }))
    );

    const unsubOrd = onSnapshot(
      query(collection(db, 'orders'), where('status', '==', 'PENDING_VERIFY')), 
      (s) => setStats(prev => ({ ...prev, pendingOrders: s.size }))
    );

    const unsubViews = onSnapshot(
      query(collection(db, 'analytics_events'), where('type', '==', 'page_view')), 
      (s) => setStats(prev => ({ ...prev, totalViews: s.size }))
    );

    const unsubClients = onSnapshot(
      query(collection(db, 'clients')),
      (s) => setStats(prev => ({ ...prev, activeClients: s.size }))
    );

    const unsubRecent = onSnapshot(
      query(collection(db, 'project_inquiries'), orderBy('createdAt', 'desc'), limit(6)),
      (s) => setStats(prev => ({ 
        ...prev, 
        recentSignals: s.docs.map(d => ({ id: d.id, ...d.data() })) 
      }))
    );

    return () => { 
      unsubInq(); 
      unsubOrd(); 
      unsubViews();
      unsubClients();
      unsubRecent();
    };
  }, [db, user]);

  return (
    <div className="space-y-10 pb-20">
      
      {/* ══ HEADER ══ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/30"
      >
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-[1.5rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
            <Activity size={26} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">
              System <span className="text-primary italic">Overview</span>
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em]">
                Operational Node: Active
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-muted/30 border border-border/30">
            <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Current Build</p>
            <p className="text-sm font-bold">2026 System</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-muted/30 border border-border/30">
            <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Local Time</p>
            <p className="text-sm font-bold">{format(new Date(), 'HH:mm')}</p>
          </div>
        </div>
      </motion.div>

      {/* ══ STATS & BRAND MATRIX ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickStatCard 
              title="New Inquiries" 
              value={stats.newInquiries} 
              icon={MessageSquare} 
              color="text-blue-500"
              bgColor="bg-blue-500/10"
              href="/admin/inquiries"
              trend="+12%"
            />
            <QuickStatCard 
              title="Pending Payment" 
              value={stats.pendingOrders} 
              icon={Clock} 
              color="text-orange-500"
              bgColor="bg-orange-500/10"
              href="/admin/orders"
              trend="+5%"
            />
            <QuickStatCard 
              title="Total Reach" 
              value={stats.totalViews} 
              icon={Eye} 
              color="text-green-500"
              bgColor="bg-green-500/10"
              href="/admin/analytics"
              trend="+23%"
            />
            <QuickStatCard 
              title="Total Clients" 
              value={stats.activeClients} 
              icon={Users} 
              color="text-purple-500"
              bgColor="bg-purple-500/10"
              href="/admin/clients"
            />
         </div>

         <div className="lg:col-span-4">
            <AdminBrandMatrix />
         </div>
      </div>

      {/* ══ SECONDARY GRID ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ══ ACTIVITY FEED ══ */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black uppercase tracking-tight">Recent Signals</h3>
              <Badge variant="outline" className="text-[8px] font-black uppercase tracking-wider">
                Live
              </Badge>
            </div>
            <Link href="/admin/inquiries" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
              Full Logs <ArrowRight size={12} />
            </Link>
          </div>

          <Card className="rounded-[2.5rem] border-2 bg-card/50 overflow-hidden shadow-xl border-border/50 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
            <CardContent className="p-0">
               {stats.recentSignals.length > 0 ? (
                  stats.recentSignals.map((sig) => (
                    <div key={sig.id} className="p-5 flex items-center justify-between border-b border-border/30 last:border-0 hover:bg-primary/5 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><MessageSquare size={18} /></div>
                          <div>
                             <p className="font-bold text-sm">{sig.projectName || 'General'}</p>
                             <p className="text-[9px] text-muted-foreground uppercase font-black">{sig.clientName}</p>
                          </div>
                       </div>
                       <Badge className="bg-blue-500/10 text-blue-500 border-none text-[8px] uppercase">{sig.status}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center opacity-20">No signals detected</div>
                )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ══ QUICK ACTIONS ══ */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-5 space-y-6"
        >
          <div className="flex items-center gap-3 px-2">
            <h3 className="text-xl font-black uppercase tracking-tight">Quick Deploy</h3>
            <Sparkles size={16} className="text-primary" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Link href="/admin/projects" className="p-5 rounded-2xl border-2 border-dashed border-border/50 bg-card hover:border-primary/40 transition-all flex items-center gap-4 group">
               <div className="h-10 w-10 rounded-xl bg-muted group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center"><Rocket size={20} /></div>
               <div>
                  <p className="font-bold text-sm">Update Projects</p>
                  <p className="text-[9px] uppercase font-black text-muted-foreground">Sync gallery builds</p>
               </div>
            </Link>
            <Link href="/admin/blogs" className="p-5 rounded-2xl border-2 border-dashed border-border/50 bg-card hover:border-primary/40 transition-all flex items-center gap-4 group">
               <div className="h-10 w-10 rounded-xl bg-muted group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center"><FileText size={20} /></div>
               <div>
                  <p className="font-bold text-sm">Publish Insight</p>
                  <p className="text-[9px] uppercase font-black text-muted-foreground">Post new blog content</p>
               </div>
            </Link>
            <Link href="/admin/site-config" className="p-5 rounded-2xl border-2 border-dashed border-border/50 bg-card hover:border-primary/40 transition-all flex items-center gap-4 group">
               <div className="h-10 w-10 rounded-xl bg-muted group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center"><Settings size={20} /></div>
               <div>
                  <p className="font-bold text-sm">Site Configuration</p>
                  <p className="text-[9px] uppercase font-black text-muted-foreground">Adjust global nodes</p>
               </div>
            </Link>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
