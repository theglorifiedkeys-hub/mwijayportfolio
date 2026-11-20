'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import { SmoothScrollProvider } from '@/components/providers/smooth-scroll-provider';
import ScrollProgress from '@/components/ui/scroll-progress';
import { CursorGlow } from '@/components/ui/cursor-glow';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Navbar } from '@/components/navbar';
import { AnnouncementBanner } from '@/components/announcement-banner';
import { ChatBot } from '@/components/chat-bot';
import StatusBadge from '@/components/ui/status-badge';
import { BackToTop } from '@/components/ui/back-to-top';
import { NotificationPermission } from '@/components/notification-permission';
import { SwahiliSuggestion } from '@/components/ui/swahili-suggestion';
import CookieConsent from '@/components/ui/cookie-consent';

/**
 * ConditionalPublicLayout
 * Hujizima kiotomatiki ukiwa kwenye dashboard (Admin/Client Portal) ili kuruhusu native scroll na kuondoa UI ya landing page.
 */
export function ConditionalPublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Tambua kama tuko kwenye dashboard ambazo hazihitaji smooth scroll ya nje
  const isDashboardRoute = 
    pathname?.startsWith('/admin') || 
    pathname?.startsWith('/login') || 
    pathname?.startsWith('/client-portal');

  if (isDashboardRoute) {
    return <>{children}</>;
  }

  return (
    <SmoothScrollProvider>
      <ScrollProgress />
      <CursorGlow />
      <LoadingScreen />
      <Navbar />
      <AnnouncementBanner />
      <ChatBot />
      <StatusBadge />
      <BackToTop />
      <NotificationPermission />
      <SwahiliSuggestion />
      <CookieConsent />
      {children}
    </SmoothScrollProvider>
  );
}
