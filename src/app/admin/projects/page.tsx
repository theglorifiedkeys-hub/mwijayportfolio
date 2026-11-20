'use client';

import React from 'react';
import { ProjectsEditor } from '@/components/admin/projects-editor';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

const OWNER_ID = "mwijay-davie-admin";

export default function AdminProjectsPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black font-headline tracking-tighter">Build <span className="text-primary">Registry</span></h1>
        <p className="text-muted-foreground font-medium">Architect and deploy new work gallery entries for your portfolio.</p>
      </div>
      <ProjectsEditor userId={OWNER_ID} />
    </div>
  );
}
