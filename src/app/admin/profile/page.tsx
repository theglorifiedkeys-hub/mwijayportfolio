'use client';

import React from 'react';
import { ProfileEditor } from '@/components/admin/profile-editor';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

const OWNER_ID = "mwijay-davie-admin";

export default function AdminProfilePage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black font-headline tracking-tighter text-foreground">Account <span className="text-primary">Profile</span></h1>
        <p className="text-muted-foreground font-medium">Manage your verified identity, global stats, and cinematic site assets.</p>
      </div>
      <ProfileEditor userId={OWNER_ID} />
    </div>
  );
}
