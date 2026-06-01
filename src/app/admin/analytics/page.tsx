'use client';

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Eye, Bot, ArrowUpRight, TrendingUp, 
  Globe, Smartphone, Monitor, MapPin, Loader2, ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format, subDays, startOfDay, isAfter } from 'date-fns';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsDashboard() {
  const db = useFirestore();
  const [days, setDays] = useState(30);

  const eventsRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'analytics_events');
  }, [db]);

  const eventsQuery = useMemoFirebase(() => {
    if (!eventsRef) return null;
    return query(eventsRef, orderBy('timestamp', 'desc'), limit(1000));
  }, [eventsRef]);

  const { data: events, isLoading } = useCollection(eventsQuery);

  const stats = useMemo(() => {
    if (!events) return null;

    const today = startOfDay(new Date());
    const recent = events.filter(e => e.timestamp && isAfter(e.timestamp.toDate(), subDays(today, days)));

    const pageViews = recent.filter(e => e.type === 'page_view').length;
    const clicks = recent.filter(e => e.type === 'click' || e.type === 'interaction').length;
    
    // Aggregate by day for chart
    const dailyViewsMap: Record<string, number> = {};
    const deviceMap: Record<string, number> = { Desktop: 0, Mobile: 0, Tablet: 0 };

    recent.forEach(e => {
      if (e.timestamp) {
        const dateStr = format(e.timestamp.toDate(), 'MMM dd');
        dailyViewsMap[dateStr] = (dailyViewsMap[dateStr] || 0) + 1;
      }
      if (e.device) deviceMap[e.device] = (deviceMap[e.device] || 0) + 1;
    });

    const dailyData = Object.entries(dailyViewsMap)
      .map(([name, views]) => ({ name, views }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    const deviceData = Object.entries(deviceMap)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0);

    return { pageViews, clicks, dailyData, deviceData };
  }, [events, days]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Syncing Intelligence...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black font-headline tracking-tighter uppercase">System <span className="text-primary italic">Intelligence</span></h1>
          <p className="text-muted-foreground font-medium">Monitoring visitor signals and architectural engagement.</p>
        </div>
        <div className="flex bg-card p-1 rounded-2xl border-2 border-border/50 shadow-sm">
          {[7, 30, 90].map(d => (
            <button 
              key={d} 
              onClick={() => setDays(d)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${days === d ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Registry Views" value={stats?.pageViews || 0} icon={Eye} color="text-blue-500" trend="+12%" />
        <StatCard title="Interactive Clicks" value={stats?.clicks || 0} icon={TrendingUp} color="text-emerald-500" trend="+18%" />
        <StatCard title="Active Session" value="LIVE" icon={ShieldCheck} color="text-purple-500" />
        <StatCard title="Data Nodes" value={events?.length || 0} icon={Globe} color="text-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 rounded-[2.5rem] border-2 bg-card/50 shadow-xl overflow-hidden border-border/50">
          <CardHeader className="p-8 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-xl font-black font-headline uppercase tracking-tight">Signal Flow Registry</CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#07080c', border: '1px solid #333', borderRadius: '16px', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#2563eb' }}
                />
                <Line type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={4} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 rounded-[2.5rem] border-2 bg-card/50 shadow-xl overflow-hidden border-border/50">
          <CardHeader className="p-8 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-xl font-black font-headline uppercase tracking-tight">Device Matrix</CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {stats?.deviceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2.5rem] border-2 bg-card/50 shadow-xl overflow-hidden border-border/50">
        <CardHeader className="p-8 border-b border-border/50 bg-muted/20">
          <CardTitle className="text-xl font-black font-headline uppercase tracking-tight">Live Signal Feed</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {events?.slice(0, 10).map((e) => (
              <div key={e.id} className="p-6 flex items-center justify-between hover:bg-primary/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                    {e.device === 'Mobile' ? <Smartphone size={18} /> : <Monitor size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {e.type === 'page_view' ? `Viewed ${e.page}` : `Clicked ${e.label || e.action || 'CTA Node'}`}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-2 mt-1">
                      <span className="text-primary/60">{e.device}</span> • {e.language || 'en-TZ'} • {e.path}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {e.timestamp ? format(e.timestamp.toDate(), 'HH:mm • MMM dd') : 'Transmitting...'}
                  </span>
                </div>
              </div>
            ))}
            {events?.length === 0 && (
              <div className="p-20 text-center opacity-20 italic font-black uppercase tracking-[0.4em]">No signals captured</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, trend }: any) {
  return (
    <Card className="rounded-[2rem] border-2 bg-card hover:border-primary/30 transition-all group overflow-hidden border-border/50 shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className={`h-12 w-12 rounded-2xl bg-muted flex items-center justify-center ${color} group-hover:scale-110 transition-all duration-500`}>
            <Icon size={24} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-[9px] font-black text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
              <ArrowUpRight size={10} /> {trend}
            </div>
          )}
        </div>
        <div className="mt-6 space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-black font-headline text-foreground">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
