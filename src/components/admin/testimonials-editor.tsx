'use client';

import React, { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2, MessageSquareQuote, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TestimonialsEditor({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const testimonialsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users', userId, 'testimonials');
  }, [firestore, userId]);
  const { data: testimonials, isLoading } = useCollection(testimonialsRef);
  const [newTest, setNewTest] = useState({ authorName: '', authorTitle: '', text: '' });
  const { toast } = useToast();

  const handleAdd = () => {
    if (!newTest.authorName.trim() || !newTest.text.trim() || !testimonialsRef) return;
    addDocumentNonBlocking(testimonialsRef, {
      ...newTest,
      userId,
      displayOrder: (testimonials?.length || 0) + 1,
    });
    setNewTest({ authorName: '', authorTitle: '', text: '' });
    toast({ title: "Feedback Recorded", description: "Praise added to the registry." });
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'users', userId, 'testimonials', id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Feedback Removed", variant: "destructive" });
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-4">
        <Card className="rounded-[2.5rem] border-2 shadow-xl sticky top-24 overflow-hidden">
          <CardHeader className="p-8 pb-4 bg-secondary text-white">
            <CardTitle className="text-xl font-black font-headline flex items-center gap-3">
              <Plus className="h-5 w-5" /> Add Praise
            </CardTitle>
            <CardDescription className="text-white/70">Record professional feedback from clients.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Author Name</Label>
              <Input value={newTest.authorName} onChange={(e) => setNewTest(t => ({...t, authorName: e.target.value}))} placeholder="e.g. Baraka Simon" className="h-12 rounded-2xl border-2" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Title/Company</Label>
              <Input value={newTest.authorTitle} onChange={(e) => setNewTest(t => ({...t, authorTitle: e.target.value}))} placeholder="e.g. CEO at Aymi Africa" className="h-12 rounded-2xl border-2" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Testimonial Text</Label>
              <Textarea value={newTest.text} onChange={(e) => setNewTest(t => ({...t, text: e.target.value}))} placeholder="What did they say about your work?" className="min-h-[120px] rounded-2xl border-2 resize-none" />
            </div>
            <Button onClick={handleAdd} className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-secondary/20 gap-2 bg-secondary hover:bg-secondary/90">
              <Plus className="h-4 w-4" /> Save Feedback
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-8 space-y-6">
        {testimonials?.length === 0 ? (
          <div className="p-20 border-2 border-dashed rounded-[3rem] text-center opacity-40">
            <MessageSquareQuote className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-bold uppercase tracking-widest text-sm">No praise records found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials?.map((t) => (
              <Card key={t.id} className="p-8 border-2 rounded-[2.5rem] bg-card hover:border-primary/20 transition-all group relative overflow-hidden">
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                    <UserCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="font-black font-headline text-lg leading-tight">{t.authorName}</h4>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">{t.authorTitle}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
                <div className="absolute top-4 right-4">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive rounded-full hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}