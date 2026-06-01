'use client';

import React, { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, XCircle, Clock, ShoppingBag, 
  Loader2, ExternalLink, Smartphone, ShieldCheck,
  Search, Eye, ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { formatTZS } from '@/lib/order-utils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminOrders() {
  const db = useFirestore();
  const [filter, setFilter] = useState('PENDING_VERIFY');
  const { toast } = useToast();

  const ordersRef = useMemoFirebase(() => collection(db!, 'orders'), [db]);
  const ordersQuery = useMemoFirebase(() => query(ordersRef, orderBy('submittedAt', 'desc')), [ordersRef]);
  const { data: orders, isLoading } = useCollection(ordersQuery);

  const verifyOrder = async (order: any) => {
    try {
      const orderRef = doc(db!, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'VERIFIED',
        accessGranted: true,
        verifiedAt: serverTimestamp()
      });

      // Create access token
      const tokenRef = doc(db!, 'access_tokens', order.orderId);
      await setDoc(tokenRef, {
        uid: order.uid,
        phone: order.customerPhone,
        planName: order.planName,
        orderId: order.orderId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        createdAt: serverTimestamp()
      });

      toast({ title: "Signal Verified", description: "Access has been granted to the node." });
    } catch (err) {
      toast({ variant: 'destructive', title: "Verification Error" });
    }
  };

  const rejectOrder = async (id: string) => {
    const orderRef = doc(db!, 'orders', id);
    await updateDoc(orderRef, { status: 'REJECTED' });
    toast({ title: "Signal Rejected", variant: 'destructive' });
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tighter uppercase">Fulfillment <span className="text-primary">Registry</span></h1>
          <p className="text-muted-foreground font-medium">Verify payment proof signals and grant architectural access.</p>
        </div>
        <div className="flex gap-2 bg-muted/20 p-1 rounded-2xl border-2">
          {['PENDING_VERIFY', 'VERIFIED', 'REJECTED'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filter === f ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground")}>{f.split('_')[0]}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {orders?.filter(o => o.status === filter).map((order) => (
          <Card key={order.id} className="border-2 rounded-[2.5rem] bg-card overflow-hidden group hover:border-primary/30 transition-all flex flex-col border-border/50">
            <div className="aspect-video relative bg-muted group/img">
               {order.screenshotUrl ? (
                 <img src={order.screenshotUrl} className="w-full h-full object-cover" alt="Proof" />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center space-y-2 opacity-20">
                   <ImageIcon size={40} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Visual Signal</span>
                 </div>
               )}
               {order.screenshotUrl && (
                 <a href={order.screenshotUrl} target="_blank" className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs gap-2 backdrop-blur-sm">
                    <Eye size={18} /> FULL SIGNAL VIEW
                 </a>
               )}
            </div>
            <CardContent className="p-8 space-y-6 flex-1 flex flex-col">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                     <h4 className="font-black font-headline text-lg uppercase tracking-tight line-clamp-1">{order.planName}</h4>
                     <p className="text-[10px] font-mono text-primary font-bold">{order.orderId}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black">{order.status}</Badge>
               </div>
               
               <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50 border-dashed">
                  <div className="space-y-1">
                     <p className="text-[8px] font-black uppercase text-muted-foreground">Registry Fee</p>
                     <p className="font-bold text-sm">{formatTZS(order.amount)}</p>
                  </div>
                  <div className="space-y-1 text-right">
                     <p className="text-[8px] font-black uppercase text-muted-foreground">Timestamp</p>
                     <p className="text-[10px] font-bold">{order.submittedAt ? format(order.submittedAt.toDate(), 'MMM dd, HH:mm') : 'Syncing...'}</p>
                  </div>
               </div>

               <div className="space-y-4 bg-muted/10 p-4 rounded-2xl border border-border/50">
                  <div className="flex justify-between text-xs">
                     <span className="text-muted-foreground font-medium">Reference:</span>
                     <span className="font-black font-mono text-primary uppercase">{order.referenceNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                     <span className="text-muted-foreground font-medium">From Node:</span>
                     <span className="font-bold">{order.customerPhone}</span>
                  </div>
               </div>

               <div className="pt-4 mt-auto flex gap-3">
                  {order.status === 'PENDING_VERIFY' && (
                    <>
                      <Button onClick={() => verifyOrder(order)} className="flex-1 h-12 rounded-xl bg-primary text-white font-black uppercase text-[10px] gap-2 shadow-lg shadow-primary/20">
                        <CheckCircle size={14} /> Verify & Grant
                      </Button>
                      <Button variant="ghost" onClick={() => rejectOrder(order.id)} className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10">
                        <XCircle size={20} />
                      </Button>
                    </>
                  )}
                  {order.status === 'VERIFIED' && (
                    <div className="w-full flex items-center justify-center p-3 rounded-xl bg-green-500/10 text-green-500 text-[10px] font-black uppercase gap-2 border border-green-500/20">
                       <ShieldCheck size={16} /> SIGNAL_AUTHENTICATED
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>
        ))}
        {orders?.filter(o => o.status === filter).length === 0 && (
           <div className="col-span-full py-32 text-center border-2 border-dashed rounded-[3rem] opacity-20 bg-card/50">
              <ShoppingBag size={48} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-[0.4em] text-sm">Registry node empty</p>
           </div>
        )}
      </div>
    </div>
  );
}