'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function StatusBadge() {
  const [time, setTime] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Africa/Dar_es_Salaam',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      };
      const dsmTime = new Intl.DateTimeFormat('en-GB', options).format(new Date());
      setTime(dsmTime);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] hidden md:block">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 px-4 py-2 rounded-full glass-pro border border-white/10 bg-background/50 backdrop-blur-md shadow-2xl"
      >
        <div className="flex items-center gap-2 pr-4 border-r border-white/10">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
            {isAvailable ? 'Available' : 'Busy'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-mono font-bold text-foreground/60 tracking-tighter">
            DSM • {time}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
