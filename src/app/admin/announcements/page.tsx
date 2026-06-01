'use client';

import React from 'react';
import { AnnouncementsEditor } from '@/components/admin/announcements-editor';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black font-headline tracking-tighter">Global <span className="text-primary">Broadcast</span></h1>
        <p className="text-muted-foreground font-medium">Manage top-bar announcements and system push notifications.</p>
      </div>
      <AnnouncementsEditor />
    </div>
  );
}
