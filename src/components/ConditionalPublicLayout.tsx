"use client";

import { usePathname } from "next/navigation";
import { isEditorialRoute } from "@/lib/folio-routes";
import React from "react";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import Link from "next/link";
import LanguageToggle from "@/components/ui/language-toggle";
import { StudioHeader } from "@/components/portfolio/studio-chrome";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { ChatBot } from "@/components/chat-bot";
import StatusBadge from "@/components/ui/status-badge";
import { BackToTop } from "@/components/ui/back-to-top";
import { NotificationPermission } from "@/components/notification-permission";
import { SwahiliSuggestion } from "@/components/ui/swahili-suggestion";
import CookieConsent from "@/components/ui/cookie-consent";

/**
 * ConditionalPublicLayout
 * Hujizima kiotomatiki ukiwa kwenye dashboard (Admin/Client Portal) ili kuruhusu native scroll na kuondoa UI ya landing page.
 */
export function ConditionalPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Tambua kama tuko kwenye dashboard ambazo hazihitaji smooth scroll ya nje
  const isDashboardRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/client-portal");

  if (isDashboardRoute || isEditorialRoute(pathname)) {
    return <>{children}</>;
  }

  const booking = pathname === "/book";
  const masthead = (
    <div className="ed ed-chrome">
      <AnnouncementBanner inline />
      <StudioHeader
        page={
          pathname.startsWith("/blog")
            ? "library"
            : pathname.startsWith("/projects/")
              ? "work"
              : undefined
        }
      />
    </div>
  );
  if (booking)
    return (
      <>
        {masthead}
        {children}
      </>
    );
  return (
    <>
      {masthead}
      <div className="studio-utility">
        <div>
          <Link href="/#studio-services">Studio directory</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/book">Start a project ↗</Link>
          <LanguageToggle />
          <ThemeSwitch />
        </div>
      </div>
      <SmoothScrollProvider>
        <ChatBot />
        <StatusBadge />
        <BackToTop />
        <NotificationPermission />
        <SwahiliSuggestion />
        <CookieConsent />
        <div className="studio-public-content">{children}</div>
      </SmoothScrollProvider>
    </>
  );
}
function ThemeSwitch() {
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    const enabled = localStorage.getItem("theme") === "dark";
    document.documentElement.classList.toggle("dark", enabled);
    document.documentElement.dataset.theme = enabled ? "dark" : "light";
    setDark(enabled);
  }, []);
  return (
    <button
      type="button"
      aria-label="Dark theme"
      aria-pressed={dark}
      onClick={() => {
        const next = !dark;
        document.documentElement.classList.toggle("dark", next);
        document.documentElement.dataset.theme = next ? "dark" : "light";
        localStorage.setItem("theme", next ? "dark" : "light");
        setDark(next);
      }}
    >
      {dark ? "Light" : "Dark"} mode
    </button>
  );
}
