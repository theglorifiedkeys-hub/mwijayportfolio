'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { ClientPortalProvider, useClientPortal } from '@/contexts/client-portal-context';
import { 
  LayoutDashboard, 
  GitBranch, 
  MessageSquare, 
  FolderOpen, 
  CreditCard, 
  LogOut, 
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { doc, getDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export default function ClientPortalRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientPortalProvider>
      <ClientPortalAuthGuard>
        {children}
      </ClientPortalAuthGuard>
    </ClientPortalProvider>
  );
}

function ClientPortalAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const db = useFirestore();
  const [isClientVerified, setIsClientVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user && pathname !== '/client-portal/login') {
      router.push('/client-portal/login');
      return;
    }

    if (user && db) {
      // ADMIN BYPASS: Allow Admin to see the client hub
      if (isAdmin) {
         setIsClientVerified(true);
         return;
      }

      const verifyClient = async () => {
        try {
          const clientDoc = await getDoc(doc(db, 'clients', user.uid));
          setIsClientVerified(clientDoc.exists());
          if (!clientDoc.exists() && pathname !== '/client-portal/login' && pathname !== '/client-portal') {
             router.push('/client-portal/login?error=unauthorized');
          }
        } catch (e) {
          console.error("Registry verify failed:", e);
        }
      };
      verifyClient();
    }
  }, [user, isUserLoading, router, pathname, db]);

  if (isUserLoading || (user && isClientVerified === null)) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Syncing Registry Node...</p>
      </div>
    );
  }

  // Allow login page and entry gate for all authenticated users (gate handles admin)
  if (pathname === '/client-portal/login' || pathname === '/client-portal') {
    return <>{children}</>;
  }

  // Block unauthorized users from internal hub pages
  if (user && isClientVerified === false) {
     return (
       <div className="min-h-screen bg-[#07080c] flex flex-col items-center justify-center p-8 text-center">
         <div className="h-20 w-20 rounded-[2rem] bg-destructive/10 border-2 border-destructive/20 flex items-center justify-center text-destructive mb-8 shadow-2xl">
            <ShieldAlert size={40} />
         </div>
         <h1 className="text-2xl font-black font-headline tracking-tighter uppercase text-white">Unauthorized Access</h1>
         <p className="text-muted-foreground mt-4 max-w-sm font-medium">This identity node is not registered as an active client in our hub.</p>
         <Button className="mt-10 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" asChild>
            <Link href="/client-portal">Return to Gate</Link>
         </Button>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-foreground flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-[260px] min-h-screen">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-32">
          {children}
        </div>
      </main>
    </div>
  );
}

function Sidebar() {
  const { unreadCount } = useClientPortal();
  const auth = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { name: 'System Hub', href: '/client-portal/dashboard', icon: LayoutDashboard },
    { name: 'Build Roadmap', href: '/client-portal/progress', icon: GitBranch },
    { name: 'Terminal Signals', href: '/client-portal/messages', icon: MessageSquare, badge: unreadCount },
    { name: 'Deliverable Vault', href: '/client-portal/files', icon: FolderOpen },
    { name: 'Finance Registry', href: '/client-portal/payments', icon: CreditCard },
  ];

  return (
    <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-[260px] z-50 flex-col p-6 bg-zinc-950 border-r border-white/5">
      <div className="mb-12">
        <span className="font-headline font-black text-xl tracking-tighter text-white uppercase">MWIJAY<span className="text-primary">.</span></span>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/40 mt-1">CLIENT_HUB</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navLinks.map((link) => (
          <Link 
            key={link.href} 
            href={link.href}
            className={cn(
              "flex items-center justify-between px-4 py-4 rounded-2xl transition-all group",
              pathname === link.href ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <link.icon size={18} />
              <span className="text-xs font-black uppercase tracking-widest">{link.name}</span>
            </div>
            {(link.badge || 0) > 0 && <span className="h-4 w-4 rounded-full bg-destructive text-white text-[8px] flex items-center justify-center font-black animate-pulse">{link.badge}</span>}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-white/5 flex flex-col gap-3">
        <Button variant="ghost" className="justify-start gap-3 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5" asChild>
           <Link href="/admin"><LayoutDashboard size={16} /> Admin Panel</Link>
        </Button>
        <button 
          onClick={() => auth?.signOut()}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut size={16} /> Terminate Session
        </button>
      </div>
    </aside>
  );
}
