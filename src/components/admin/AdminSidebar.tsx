'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, BarChart2, FolderOpen, FileText, 
  ShoppingBag, Megaphone, Image as ImageIcon,
  Users, MessageSquare, LogOut, ChevronLeft, ChevronRight, User, TrendingUp, MessageSquareQuote, Award, UsersRound, Settings, Globe, ShieldCheck, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminSidebar({ isMobileOpen, setIsMobileOpen }: any) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const auth = useAuth();
  const db = useFirestore();

  // Fetch pending agreement count
  const agreementsRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'agreements');
  }, [db]);
  const pendingQuery = useMemoFirebase(() => {
    if (!agreementsRef) return null;
    return query(agreementsRef, where('status', '==', 'PENDING_REVIEW'));
  }, [agreementsRef]);
  const { data: pendingAgreements } = useCollection(pendingQuery);

  const NAV_GROUPS = [
    {
      label: "OVERVIEW",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
      ]
    },
    {
      label: "QUICK ACCESS",
      items: [
        { label: "View Website", href: "/", icon: Globe, external: true },
        { label: "Client Portal", href: "/client-portal", icon: ShieldCheck },
      ]
    },
    {
      label: "CONTENT",
      items: [
        { label: "Expertise Matrix", href: "/admin/expertise", icon: Zap },
        { label: "Agreements", href: "/admin/agreements", icon: FileText, badge: pendingAgreements?.length || 0 },
        { label: "Projects", href: "/admin/projects", icon: FolderOpen },
        { label: "Blogs", href: "/admin/blogs", icon: FileText },
        { label: "Marketplace", href: "/admin/market", icon: ShoppingBag },
        { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
        { label: "Logos", href: "/admin/logos", icon: ImageIcon },
        { label: "Recognitions", href: "/admin/recognitions", icon: Award },
        { label: "Team & Partners", href: "/admin/team", icon: UsersRound },
      ]
    },
    {
      label: "REVENUE",
      items: [
        { label: "Pricing Matrix", href: "/admin/pricing", icon: TrendingUp },
        { label: "Order Queue", href: "/admin/orders", icon: ShoppingBag },
        { label: "Client Registry", href: "/admin/clients", icon: Users },
      ]
    },
    {
      label: "SOCIAL",
      items: [
        { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
        { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
      ]
    },
    {
      label: "SYSTEM",
      items: [
        { label: "Platform Registry", href: "/admin/site-config", icon: Settings },
        { label: "Account Profile", href: "/admin/profile", icon: User },
      ]
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('admin_sidebar_collapsed', String(next));
  };

  const NavItem = ({ item }: { item: any }) => {
    const active = pathname === item.href;
    return (
      <Link
        href={item.href}
        target={item.external ? "_blank" : undefined}
        onClick={() => setIsMobileOpen(false)}
        className={cn(
          "flex items-center justify-between px-4 py-3 rounded-2xl transition-all group mb-1",
          active 
            ? "bg-primary text-white shadow-lg shadow-primary/20" 
            : "text-muted-foreground hover:bg-white/5 hover:text-white"
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon size={20} className={cn("shrink-0", active ? "text-white" : "group-hover:scale-110 transition-transform")} />
          {!isCollapsed && (
            <span className="text-xs font-black uppercase tracking-widest truncate">
              {item.label}
            </span>
          )}
        </div>
        {!isCollapsed && item.badge > 0 && (
          <span className="h-5 w-5 rounded-full bg-destructive text-white text-[9px] flex items-center justify-center font-black animate-pulse shadow-lg shadow-destructive/40">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-[#07080c] border-r border-border/50 transition-all duration-300">
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-black text-white shadow-lg shadow-primary/20">M</div>
             <span className="font-headline font-black tracking-tighter text-lg uppercase">Registry<span className="text-primary">.</span></span>
          </div>
        )}
        <button 
          onClick={toggleCollapse}
          className="hidden lg:flex h-6 w-6 rounded-full bg-card border border-border/50 items-center justify-center hover:bg-primary hover:text-white transition-colors absolute -right-3 top-7 z-50 shadow-md"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8 mt-4 overscroll-contain">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            {!isCollapsed && <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 px-4">{group.label}</p>}
            <div className="space-y-1">
              {group.items.map((item) => <NavItem key={item.label} item={item} />)}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border/20 mt-auto">
        <button 
          onClick={() => auth?.signOut()} 
          className={cn(
            "w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-destructive hover:bg-destructive/10 transition-all",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-xs font-black uppercase tracking-widest">Sign Out Node</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={cn(
        "hidden lg:block h-screen transition-all duration-300 z-50 shrink-0 relative",
        isCollapsed ? "w-[80px]" : "w-[260px]"
      )}>
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] z-[110] lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
