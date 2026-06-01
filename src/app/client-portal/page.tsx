'use client';

import React, { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { GoogleSignInButton } from '@/components/client-portal/google-sign-in-button';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, ShoppingBag, Download, Clock, CheckCircle2, XCircle, 
  ShieldCheck, LayoutDashboard, ArrowRight, Package, Loader2, 
  FileText, User, DollarSign, TrendingUp, Zap, Code2, Rocket,
  Calendar, Mail, Phone, MapPin, ExternalLink, AlertCircle
} from 'lucide-react';
import { signOutUser, isAdminUser } from '@/lib/auth-helpers';
import { useAuth } from '@/firebase';
import Link from 'next/link';
import { formatTZS } from '@/lib/order-utils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const dynamic = 'force-dynamic';

/* ═══════════════════════════════════════════
   STATUS CONFIG
═══════════════════════════════════════════ */
const statusConfig: Record<string, { 
  label: string; 
  icon: any; 
  color: string; 
  bgColor: string;
}> = {
  pending_payment: { 
    label: 'Awaiting Payment', 
    icon: Clock, 
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  payment_confirmed: { 
    label: 'Build Initiated', 
    icon: Zap, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  architecture_phase: { 
    label: 'In Progress', 
    icon: Code2, 
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  testing_phase: { 
    label: 'QA Testing', 
    icon: ShieldCheck, 
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
  delivered: { 
    label: 'Delivered', 
    icon: CheckCircle2, 
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  cancelled: { 
    label: 'Cancelled', 
    icon: XCircle, 
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  }
};

/* ═══════════════════════════════════════════
   STAT CARD COMPONENT
═══════════════════════════════════════════ */
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subtext, 
  color = "text-primary",
  bgColor = "bg-primary/10" 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  subtext?: string;
  color?: string;
  bgColor?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="border-2 rounded-[2rem] overflow-hidden shadow-lg border-border/50 hover:border-primary/30 transition-all bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", bgColor)}>
              <Icon size={20} className={color} />
            </div>
            {subtext && (
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">{subtext}</span>
            )}
          </div>
          <p className="text-3xl font-black mb-1">{value}</p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   ORDER CARD COMPONENT
═══════════════════════════════════════════ */
function OrderCard({ order }: { order: any }) {
  const status = order.status || 'pending_payment';
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const progress = order.progress || 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="border-2 rounded-[2rem] overflow-hidden border-border/50 hover:border-primary/30 transition-all bg-card/50 backdrop-blur-sm shadow-lg group">
        {/* Top accent line */}
        <div className="h-1 bg-gradient-to-r from-primary to-green-500" />
        
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <p className="text-[8px] font-black text-primary font-mono tracking-widest">{order.orderId}</p>
              <h4 className="text-lg font-black uppercase tracking-tight leading-tight">{order.productName || order.planName}</h4>
              <p className="text-[9px] text-muted-foreground font-medium">
                Submitted {order.submittedAt ? format(order.submittedAt.toDate(), 'MMM dd, yyyy') : 'Recently'}
              </p>
            </div>
            
            {/* Status Badge */}
            <div className={cn(
              "px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider border",
              config.color,
              config.bgColor
            )}>
              <StatusIcon size={12} />
              {config.label}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[9px] font-bold">
              <span className="text-muted-foreground uppercase tracking-wider">Build Progress</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary to-green-500"
              />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/30">
            <div>
              <p className="text-[8px] font-black uppercase tracking-wider text-muted-foreground mb-1">Amount</p>
              <p className="text-lg font-black text-primary">{formatTZS(order.amount)}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black uppercase tracking-wider text-muted-foreground mb-1">Type</p>
              <p className="text-sm font-bold">{order.planType || 'Custom Build'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-wider border-2"
              asChild
            >
              <Link href={`/track-order?id=${order.orderId}&email=${order.customerEmail}`}>
                View Details <ArrowRight size={12} className="ml-1" />
              </Link>
            </Button>
            {status === 'delivered' && (
              <Button 
                size="sm"
                className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-wider"
              >
                <Download size={12} className="mr-1" /> Download
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function ClientPortalPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const isAdmin = isAdminUser(user?.uid);

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user || isAdmin) return null;
    return query(
      collection(db, 'orders'),
      where('uid', '==', user.uid),
      orderBy('submittedAt', 'desc')
    );
  }, [db, user, isAdmin]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection(ordersQuery);

  // Calculate stats
  const stats = useMemo(() => {
    if (!orders) return { total: 0, active: 0, delivered: 0, spent: 0 };
    
    const total = orders.length;
    const active = orders.filter((o: any) => 
      ['payment_confirmed', 'architecture_phase', 'testing_phase'].includes(o.status)
    ).length;
    const delivered = orders.filter((o: any) => o.status === 'delivered').length;
    const spent = orders.reduce((sum: number, o: any) => 
      o.status !== 'cancelled' ? sum + (o.amount || 0) : sum, 
    0);

    return { total, active, delivered, spent };
  }, [orders]);

  /* ══════════════════════════════════════
     LOADING STATE
  ══════════════════════════════════════ */
  if (isUserLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        >
          <Loader2 className="h-12 w-12 text-primary" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-4 text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground"
        >
          Syncing Identity Node...
        </motion.p>
      </div>
    );
  }

  /* ══════════════════════════════════════
     UNAUTHENTICATED STATE
  ══════════════════════════════════════ */
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="max-w-md w-full space-y-10 relative z-10"
        >
          <div className="text-center space-y-5">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto border-2 border-primary/20 shadow-2xl"
            >
              <ShieldCheck size={40} />
            </motion.div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em]">
                <User size={10} /> Secure Access
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                Client <span className="text-primary italic">Portal</span>
              </h1>
              <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-sm mx-auto">
                Sign in to access your purchased digital assets, track builds, and manage your account.
              </p>
            </div>
          </div>

          <Card className="border-2 rounded-[2.5rem] bg-card/50 backdrop-blur-xl shadow-2xl p-10 border-border/50 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
            <GoogleSignInButton />
            
            {/* Trust indicators */}
            <div className="mt-8 pt-6 border-t border-border/30 grid grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, label: 'Encrypted' },
                { icon: Zap, label: 'Instant' },
                { icon: CheckCircle2, label: 'Verified' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <Icon size={14} className="text-primary" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ══════════════════════════════════════
     ADMIN REDIRECT
  ══════════════════════════════════════ */
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md w-full border-2 rounded-[2.5rem] p-12 text-center space-y-8 shadow-2xl border-border/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-green-500" />
            
            <div className="h-20 w-20 bg-primary rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl">
              <ShieldCheck size={40} />
            </div>
            
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em]">
                <Zap size={10} /> Admin Identity
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Architect Node</h2>
              <p className="text-muted-foreground font-medium leading-relaxed text-sm">
                Lead Architect detected. Choose your operational destination:
              </p>
            </div>
            
            <div className="grid gap-4">
              <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20" asChild>
                <Link href="/admin">
                  <LayoutDashboard size={18} /> Enter Control Panel
                </Link>
              </Button>
              <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 border-2" asChild>
                <Link href="/client-portal/dashboard">
                  <User size={18} /> Access Client Hub
                </Link>
              </Button>
            </div>

            <button 
              onClick={() => signOutUser(auth!)} 
              className="text-[10px] font-black uppercase tracking-widest text-destructive hover:underline transition-all"
            >
              Terminate Session
            </button>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ══════════════════════════════════════
     MAIN DASHBOARD
  ══════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/2 rounded-full blur-3xl -ml-48 -mb-48" />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-24 md:py-32 space-y-12">

        {/* ══ HEADER ══ */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-border/30"
        >
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="relative h-20 w-20 rounded-[2rem] overflow-hidden border-2 border-primary shadow-2xl shadow-primary/20 shrink-0"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-black text-3xl">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
            </motion.div>

            {/* User Info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-green-600">
                  Terminal Active
                </p>
              </div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">
                Welcome, <span className="text-primary italic">{user.displayName?.split(' ')[0]}</span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">{user.email}</p>
            </div>
          </div>

          {/* Sign Out Button */}
          <Button 
            variant="outline" 
            onClick={() => signOutUser(auth!)} 
            className="rounded-2xl border-2 h-12 px-6 font-black uppercase tracking-widest text-[10px] gap-2 hover:border-destructive hover:text-destructive transition-all"
          >
            <LogOut size={16} /> Sign Out
          </Button>
        </motion.header>

        {/* ══ STATS GRID ══ */}
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 flex items-center gap-2">
            <TrendingUp size={12} /> Registry Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              icon={Package} 
              label="Total Builds" 
              value={stats.total}
              subtext="ALL TIME"
            />
            <StatCard 
              icon={Zap} 
              label="Active Projects" 
              value={stats.active}
              color="text-blue-500"
              bgColor="bg-blue-500/10"
              subtext="IN PROGRESS"
            />
            <StatCard 
              icon={CheckCircle2} 
              label="Delivered" 
              value={stats.delivered}
              color="text-green-500"
              bgColor="bg-green-500/10"
              subtext="COMPLETED"
            />
            <StatCard 
              icon={DollarSign} 
              label="Total Invested" 
              value={formatTZS(stats.spent)}
              color="text-purple-500"
              bgColor="bg-purple-500/10"
              subtext="TZS"
            />
          </div>
        </section>

        {/* ══ ORDERS LIST ══ */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <ShoppingBag className="text-primary" size={24} /> 
              Your Builds
            </h3>
            <Link href="/services">
              <Button variant="outline" className="h-10 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider gap-2">
                <Rocket size={14} /> Order New Build
              </Button>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {isOrdersLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Loader2 className="animate-spin h-10 w-10 text-primary mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Loading Registry...
                </p>
              </motion.div>
            ) : orders && orders.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {orders.map((order: any, i: number) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <OrderCard order={order} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="p-16 text-center border-2 border-dashed rounded-[3rem] border-border/50 bg-muted/10">
                  <Package size={64} className="mx-auto mb-6 text-muted-foreground/30" />
                  <h4 className="text-xl font-black uppercase tracking-tight mb-2">No Builds Found</h4>
                  <p className="text-muted-foreground text-sm font-medium mb-8">
                    Your registry is empty. Start your first digital architecture project today.
                  </p>
                  <Button className="h-12 rounded-2xl font-black uppercase tracking-widest text-xs gap-2" asChild>
                    <Link href="/services">
                      <Rocket size={16} /> Browse Services
                    </Link>
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ══ SUPPORT CTA ══ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-primary/5 to-transparent border-primary/20 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-green-500" />
            <CardContent className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
                    <AlertCircle size={24} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight mb-1">Need Assistance?</h4>
                    <p className="text-sm text-muted-foreground font-medium">
                      Our support team is ready to help with your builds and account.
                    </p>
                  </div>
                </div>
                <Button className="h-12 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 shadow-xl shadow-primary/20" asChild>
                  <a href="https://wa.me/255620641695?text=Hi%20Mwijay%2C%20I%20need%20support%20with%20my%20client%20portal" target="_blank" rel="noopener">
                    <Phone size={16} /> Contact Support
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

      </main>
    </div>
  );
}