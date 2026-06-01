'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Settings, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function AdminTopBar() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();

  const getPageTitle = () => {
    const segment = pathname.split('/').pop();
    if (!segment || segment === 'admin') return 'DASHBOARD';
    return segment.toUpperCase().replace(/-/g, ' ');
  };

  return (
    <header className="h-14 border-b border-border/50 bg-background/50 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-40">
      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        <span className="opacity-50">ADMIN</span>
        <ChevronRight size={12} className="opacity-30" />
        <span className="text-foreground tracking-[0.2em]">{getPageTitle()}</span>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none">
              <Avatar className="h-8 w-8 border-2 border-primary/20 shadow-lg shadow-primary/10">
                <AvatarFallback className="bg-primary text-white text-[10px] font-black">
                  {user?.email?.[0].toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-border shadow-2xl bg-card">
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">
              Management Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/profile" className="flex items-center gap-2 p-3 rounded-xl cursor-pointer">
                <User size={16} /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="flex items-center gap-2 p-3 rounded-xl cursor-pointer">
                <Settings size={16} /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => auth?.signOut()}
              className="flex items-center gap-2 p-3 rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut size={16} /> Logout System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
