
"use client";

import React from "react";
import { MessageSquareQuote, UserCircle, Loader2 } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import FadeContent from "@/components/ui/fade-content";
import { Card } from "@/components/ui/card";

export function Testimonials({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const testimonialsRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return collection(firestore, 'users', userId, 'testimonials');
  }, [firestore, userId]);
  const { data: testimonials, isLoading } = useCollection(testimonialsRef);

  if (isLoading) return null;
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-24 px-6 md:px-12 bg-primary/[0.02]">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-black uppercase tracking-[0.2em]">
            <MessageSquareQuote className="h-4 w-4" />
            Voice of Partners
          </div>
          <h2 className="text-3xl md:text-5xl font-headline font-bold italic tracking-tighter">Client <span className="text-primary">Praise</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.sort((a,b) => a.displayOrder - b.displayOrder).map((t, idx) => (
            <FadeContent key={t.id} delay={idx * 150} threshold={0.2}>
              <Card className="p-8 border-2 rounded-[2.5rem] bg-card hover:border-primary/20 transition-all shadow-md group relative h-full flex flex-col justify-between overflow-hidden">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/40 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                      <UserCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-tight tracking-tight">{t.authorName}</h4>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">{t.authorTitle}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic relative z-10">
                    "{t.text}"
                  </p>
                </div>
                <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            </FadeContent>
          ))}
        </div>
      </div>
    </section>
  );
}
