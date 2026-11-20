'use client';

import React from 'react';
import { RecognitionsEditor } from '@/components/admin/recognitions-editor';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

const OWNER_ID = "mwijay-davie-admin";

export default function AdminRecognitionsPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black font-headline tracking-tighter">Award <span className="text-primary">Registry</span></h1>
        <p className="text-muted-foreground font-medium">Manage your verified certifications, honors, and professional honors.</p>
      </div>
      <RecognitionsEditor userId={OWNER_ID} />
    </div>
  );
}
