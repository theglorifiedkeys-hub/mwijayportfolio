'use client';

import React from 'react';
import { PricingEditor } from '@/components/admin/pricing-editor';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function AdminPricingPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black font-headline tracking-tighter">Revenue <span className="text-primary">Matrix</span></h1>
        <p className="text-muted-foreground font-medium">Configure service tiers and TZS pricing models for your business.</p>
      </div>
      <PricingEditor />
    </div>
  );
}
