"use client";

import React, { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Award, ExternalLink, Calendar, Loader2, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import FadeContent from '@/components/ui/fade-content';

interface Recognition {
  id: string;
  title: string;
  organization: string;
  issueDate?: string;
  imageUrl?: string;
  credentialUrl?: string;
  displayOrder?: number;
}

/**
 * RecognitionsContent - Internal component that handles data fetching.
 * Isolated to prevent SSR hooks execution.
 */
function RecognitionsContent({ userId }: { userId: string }) {
  const firestore = useFirestore();
  
  const recognitionsRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return collection(firestore, 'users', userId, 'recognitions');
  }, [firestore, userId]);

  const { data: items, isLoading } = useCollection<Recognition>(recognitionsRef as any);

  if (isLoading) return (
    <div className="flex justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  
  if (!items || items.length === 0) return (
    <div className="text-center p-20 border-2 border-dashed rounded-[3rem] opacity-30">
      <Award className="h-16 w-16 mx-auto mb-4 text-primary" />
      <p className="font-bold uppercase tracking-widest text-sm">Registry empty • Ingest awards via Admin Console</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.sort((a,b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((rec, idx) => (
        <FadeContent key={rec.id} delay={idx * 100} threshold={0.1}>
          <Card className="group overflow-hidden rounded-[2.5rem] border-2 bg-card hover:border-primary/30 transition-all duration-500 shadow-lg relative h-full flex flex-col">
            <div className="aspect-video relative overflow-hidden bg-muted">
              {rec.imageUrl ? (
                <img 
                  src={rec.imageUrl} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt={rec.title} 
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-primary/10">
                  <Award className="h-20 w-20" />
                </div>
              )}
              
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-full text-primary shadow-xl">
                  <ShieldCheck size={18} />
                </div>
              </div>
            </div>
            
            <CardContent className="p-8 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-xl font-headline font-black leading-tight text-foreground">{rec.title}</h4>
                <p className="text-xs font-black text-primary uppercase tracking-widest">{rec.organization}</p>
              </div>

              <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                    <Calendar size={12} className="text-primary" /> {rec.issueDate || '2026 Registry'}
                 </div>
                 {rec.credentialUrl && (
                   <a 
                    href={rec.credentialUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[9px] font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-widest"
                   >
                     Verify Signal <ExternalLink size={10} />
                   </a>
                 )}
              </div>
            </CardContent>
          </Card>
        </FadeContent>
      ))}
    </div>
  );
}

export function Recognitions({ userId }: { userId: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <div className="flex justify-center p-12 opacity-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return <RecognitionsContent userId={userId} />;
}
