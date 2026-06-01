
'use client';

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  TrendingUp, Calendar, Clock, ShoppingBag, Loader2, 
  CheckCircle2, Search, Smartphone, Mail, XCircle, Eye,
  MessageSquare
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { formatTZS, OrderStatus } from '@/lib/order-utils';
import { format, isSameMonth, startOfMonth, subMonths } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { emailHelpers } from '@/lib/send-email-client';

export function OrdersManager() {
  const db = useFirestore();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const ordersRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'orders');
  }, [db]);
  const ordersQuery = useMemoFirebase(() => {
    if (!ordersRef) return null;
    return query(ordersRef, orderBy('createdAt', 'desc'));
  }, [ordersRef]);
  const { data: orders, isLoading } = useCollection(ordersQuery);

  const stats = useMemo(() => {
    if (!orders) return null;
    const delivered = orders.filter(o => o.status === 'delivered');
    const pending = orders.filter(o => o.status === 'pending_payment');
    const totalRev = delivered.reduce((acc, curr) => acc + curr.amount, 0);
    
    const thisMonthStart = startOfMonth(new Date());
    const monthRev = delivered
      .filter(o => o.deliveredAt && isSameMonth(o.deliveredAt.toDate(), thisMonthStart))
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Chart Data
    const months = Array.from({ length: 6 }).map((_, i) => subMonths(thisMonthStart, i)).reverse();
    const chartData = months.map(m => ({
      name: format(m, 'MMM'),
      revenue: delivered
        .filter(o => o.deliveredAt && isSameMonth(o.deliveredAt.toDate(), m))
        .reduce((acc, curr) => acc + curr.amount, 0)
    }));

    return { totalRev, monthRev, pendingCount: pending.length, totalCount: orders.length, chartData };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => {
      const matchesFilter = filter === 'All' || o.status === filter.toLowerCase().replace(' ', '_');
      const matchesSearch = o.orderId.toLowerCase().includes(search.toLowerCase()) || 
                           o.customerName.toLowerCase().includes(search.toLowerCase()) ||
                           o.productName.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, search]);

  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    if (!db) return;
    const docRef = doc(db, 'orders', id);
    const order = orders?.find(o => o.id === id);
    const update: any = { status: newStatus, updatedAt: serverTimestamp() };
    
    if (newStatus === 'payment_confirmed') update.verifiedAt = serverTimestamp();
    if (newStatus === 'delivered') update.deliveredAt = serverTimestamp();

    await updateDoc(docRef, update);
    
    if (newStatus === 'delivered' && order) {
      emailHelpers.deliverOrder({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        productName: order.productName,
        orderId: order.orderId
      });
    }

    toast({ title: `Order ${newStatus.replace('_', ' ')}` });
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={formatTZS(stats?.totalRev || 0)} icon={TrendingUp} color="text-green-500" />
        <StatCard title="This Month" value={formatTZS(stats?.monthRev || 0)} icon={Calendar} color="text-blue-500" />
        <StatCard title="Awaiting verify" value={stats?.pendingCount || 0} icon={Clock} color="text-orange-500" />
        <StatCard title="Total Orders" value={stats?.totalCount || 0} icon={ShoppingBag} color="text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 rounded-[2.5rem] border-2 bg-card/50 overflow-hidden shadow-xl">
           <CardHeader className="p-8 border-b">
              <CardTitle className="text-xl font-black font-headline">Monthly Growth (Delivered)</CardTitle>
           </CardHeader>
           <CardContent className="p-8 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} stroke="#6b7280" />
                  <YAxis axisLine={false} tickLine={false} fontSize={11} stroke="#6b7280" tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }} 
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
           </CardContent>
        </Card>

        <div className="lg:col-span-4 flex flex-col gap-6">
           <Card className="rounded-[2.5rem] border-2 bg-card/50 p-8 flex flex-col justify-center gap-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Registry Search</h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  placeholder="Order ID or Customer..." 
                  className="pl-10 h-12 rounded-xl bg-background border-2" 
                />
              </div>
           </Card>
           <div className="flex flex-wrap gap-2">
              {['All', 'Pending', 'Confirmed', 'Delivered', 'Cancelled'].map(t => (
                <button 
                  key={t} 
                  onClick={() => setFilter(t)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                    filter === t ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {t}
                </button>
              ))}
           </div>
        </div>
      </div>

      <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-card/50 shadow-xl">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Order ID</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Customer</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Product</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Amount</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((o) => (
              <TableRow key={o.id} className="hover:bg-primary/5 transition-colors border-border/50">
                <TableCell className="font-mono text-xs font-bold text-primary">{o.orderId}</TableCell>
                <TableCell>
                  <p className="font-bold text-sm">{o.customerName}</p>
                  <p className="text-[10px] text-muted-foreground">{o.customerEmail}</p>
                </TableCell>
                <TableCell className="text-sm font-medium">{o.productName}</TableCell>
                <TableCell className="font-black text-sm">{formatTZS(o.amount)}</TableCell>
                <TableCell>
                  <StatusBadge status={o.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {o.status === 'pending_payment' && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 rounded-lg text-[10px] font-black" onClick={() => updateStatus(o.id!, 'payment_confirmed')}>
                        CONFIRM
                      </Button>
                    )}
                    {o.status === 'payment_confirmed' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8 rounded-lg text-[10px] font-black" onClick={() => updateStatus(o.id!, 'delivered')}>
                        DELIVER
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => window.open(`https://wa.me/${o.customerPhone.replace(/\D/g, '')}`)}>
                      <Smartphone size={14} className="text-primary" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredOrders.length === 0 && (
          <div className="p-20 text-center opacity-30 border-t border-dashed">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest text-sm italic">Registry Empty</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="rounded-[2rem] border-2 bg-card hover:border-primary/30 transition-all p-6 shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("h-10 w-10 rounded-xl bg-muted flex items-center justify-center", color)}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{title}</p>
      <h3 className="text-2xl font-black font-headline tracking-tighter">{value}</h3>
    </Card>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = {
    pending_payment: 'bg-orange-500/10 text-orange-500',
    payment_confirmed: 'bg-blue-500/10 text-blue-500',
    delivered: 'bg-green-500/10 text-green-500',
    cancelled: 'bg-red-500/10 text-red-500',
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", cfg[status])}>
      {status.replace('_', ' ')}
    </span>
  );
}
