'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * AnnouncementBanner - Strategic real-time broadcast.
 * USES MEMORY FILTERING: To ensure zero index dependencies.
 */
export function AnnouncementBanner() {
  const { firestore } = useFirebase();
  const pathname = usePathname();
  
  const alertsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'announcements');
  }, [firestore]);
  
  const allAlertsQuery = useMemoFirebase(() => {
    if (!alertsRef) return null;
    // We don't use orderBy here to bypass index requirement.
    // We fetch everything and sort in memory.
    return query(alertsRef);
  }, [alertsRef]);
  
  const { data: rawAlerts } = useCollection(allAlertsQuery);
  const [closed, setClosed] = React.useState(false);

  // MEMORY FILTER & SORT: Find the most recent active alert.
  const alert = React.useMemo(() => {
    if (!rawAlerts || rawAlerts.length === 0) return null;
    
    return [...rawAlerts]
      .filter((a: any) => a.isActive === true)
      .sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA; // Descending
      })[0];
  }, [rawAlerts]);

  React.useEffect(() => {
    if (alert && !closed) {
      document.documentElement.style.setProperty('--banner-height', '44px');
    } else {
      document.documentElement.style.setProperty('--banner-height', '0px');
    }
    return () => {
      document.documentElement.style.setProperty('--banner-height', '0px');
    };
  }, [alert, closed]);

  // Hide in Admin/Login dashboards for cleaner UI.
  const isProtectedPath = pathname?.startsWith('/admin') || pathname?.startsWith('/login') || pathname?.startsWith('/client-portal');
  if (isProtectedPath) return null;
  
  if (!alert || closed) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`fixed top-0 left-0 w-full z-[5100] text-white py-3 px-10 flex items-center justify-center gap-4 overflow-hidden ${
          alert.type === 'discount' ? 'bg-gradient-to-r from-yellow-600 to-amber-500' :
          alert.type === 'urgent' ? 'bg-gradient-to-r from-red-600 to-rose-500' :
          'bg-gradient-to-r from-[#1e3a5f] to-[#3182ce]'
        }`}
      >
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <Sparkles className="h-4 w-4 animate-pulse shrink-0" />
          <p className="text-[10px] md:text-sm font-black uppercase tracking-widest text-center leading-tight">
            {alert.text}
          </p>
          {alert.link && (
            <Link href={alert.link} className="flex items-center gap-1 text-[9px] font-black underline underline-offset-4 hover:opacity-80 transition-opacity whitespace-nowrap">
              ACTIVATE <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
        <button 
          onClick={() => setClosed(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
