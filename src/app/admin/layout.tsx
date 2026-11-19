"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./workspace.css";
import { useAdminIdle } from "@/hooks/use-admin-idle";

/**
 * AdminLayout - Optimized for localized scroll and responsive navigation.
 * Includes Session Security: Idle timeout is managed by useAdminIdle.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, isUserLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Initialize Security Guard
  useAdminIdle();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/client-portal");
      }
    }
  }, [user, isAdmin, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d0f14]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-white text-center">
          Checking your workspace access…
        </p>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="studio-shell min-h-screen bg-background flex text-foreground overflow-hidden selection:bg-primary/30">
      {/* MOBILE TRIGGER */}
      <div className="lg:hidden fixed top-4 left-4 z-[70]">
        <Button
          aria-label="Open workspace navigation"
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="bg-card/80 backdrop-blur-md border-border/50 shadow-lg rounded-xl h-11 w-11"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* SIDEBAR */}
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* MAIN CONTENT WORKSTATION */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh overflow-hidden relative">
        <AdminTopBar />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 lg:p-10 custom-scrollbar overscroll-contain bg-background/50">
          <div key={pathname} className="desk-route max-w-7xl mx-auto pb-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
