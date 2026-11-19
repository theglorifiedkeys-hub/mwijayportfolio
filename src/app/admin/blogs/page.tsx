'use client';

import Link from 'next/link';
import React from 'react';
import { BlogEditor } from '@/components/admin/blog-editor';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

/**
 * AdminBlogsPage - Cleaner layout for the insight publisher.
 */
export default function AdminBlogsPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-10">
      <Link href="/blog" className="inline-flex text-sm font-semibold underline">Open public blog ↗</Link>
      <BlogEditor />
    </div>
  );
}
