
'use client';

import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Mail, User, Clock, MessageSquare, Loader2, Inbox } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function MessagesViewer() {
  const firestore = useFirestore();
  const inquiriesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'inquiries');
  }, [firestore]);
  const inquiriesQuery = useMemoFirebase(() => {
    if (!inquiriesRef) return null;
    return query(inquiriesRef, orderBy('createdAt', 'desc'));
  }, [inquiriesRef]);
  
  const { data: messages, isLoading } = useCollection(inquiriesQuery);
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    if (!confirm("Remove this message from the registry?") || !firestore) return;
    const docRef = doc(firestore, 'inquiries', id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Inquiry Purged", variant: "destructive" });
  };

  if (isLoading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-black font-headline tracking-tight">Signal <span className="text-primary">Inbox</span></h3>
        <p className="text-sm text-muted-foreground font-medium">Manage incoming business inquiries and collaboration requests.</p>
      </div>

      {messages?.length === 0 ? (
        <Card className="rounded-[2.5rem] border-2 border-dashed p-20 flex flex-col items-center justify-center text-center opacity-40">
          <Inbox className="h-16 w-16 mb-4 text-muted-foreground" />
          <p className="font-bold uppercase tracking-widest text-sm italic">Inbox Empty • No signals detected</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {messages?.map((msg) => (
            <Card key={msg.id} className="border-2 rounded-[2rem] bg-card hover:shadow-xl transition-all overflow-hidden group">
              <CardHeader className="p-8 pb-4 flex flex-row items-start justify-between bg-muted/20">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                      <User className="h-3 w-3 text-primary" />
                      <span className="text-xs font-black uppercase tracking-wider">{msg.name}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/5 border border-secondary/10">
                      <Mail className="h-3 w-3 text-secondary" />
                      <span className="text-xs font-medium text-muted-foreground">{msg.email}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted border">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {msg.createdAt ? format(msg.createdAt.toDate(), 'MMM dd, yyyy • HH:mm') : 'Syncing...'}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-black font-headline text-primary">{msg.subject}</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(msg.id)} 
                  className="text-destructive rounded-full hover:bg-destructive/10"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-8 pt-6">
                <div className="flex gap-4">
                  <MessageSquare className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                  <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
