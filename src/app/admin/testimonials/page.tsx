'use client';
import Link from 'next/link';

import React from 'react';
import { TestimonialsManager } from '@/components/admin/testimonials-manager';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function AdminTestimonialsPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-10">
      <Link href="/about#client-testimonials" className="inline-flex text-sm font-semibold underline">Testimonials on About ↗</Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black font-headline tracking-tighter">Voice <span className="text-primary">Registry</span></h1>
        <p className="text-muted-foreground font-medium">Manage client endorsements and professional praise signals.</p>
      </div>
      <TestimonialsManager />
    </div>
  );
}
