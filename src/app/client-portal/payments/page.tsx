'use client';

import React, { useState } from 'react';
import { useClientPortal } from '@/contexts/client-portal-context';
import { 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  Clock, 
  Copy, 
  Check, 
  ArrowRight,
  TrendingUp,
  Loader2,
  MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatTZS } from '@/lib/order-utils';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export const dynamic = 'force-dynamic';

export default function ClientPaymentsPage() {
  const { project, isLoading } = useClientPortal();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading || !project) {
    return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  const balance = project.totalAmount - project.amountPaid;
  const payPercent = Math.min((project.amountPaid / project.totalAmount) * 100, 100);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black font-headline tracking-tighter">Finance <span className="text-primary">Registry</span></h1>
        <p className="text-muted-foreground font-medium mt-1">Hali ya malipo na maelekezo ya miamala kwa ajili ya mradi wako.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <Card className="rounded-[2.5rem] border-2 bg-zinc-950/40 p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px]" />
            <div className="space-y-8 relative z-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Budget Fulfillment</span>
                  <span className="text-xl font-black text-emerald-500">{Math.round(payPercent)}% Paid</span>
                </div>
                <Progress value={payPercent} className="h-3 bg-white/5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Total Budget</p>
                  <p className="text-xl font-black">{formatTZS(project.totalAmount)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Amount Paid</p>
                  <p className="text-xl font-black text-emerald-500">{formatTZS(project.amountPaid)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Outstanding</p>
                  <p className={cn("text-xl font-black", balance > 0 ? "text-amber-500" : "text-emerald-500")}>
                    {formatTZS(balance)}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                {balance === 0 ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <CheckCircle size={20} />
                    <p className="text-xs font-bold uppercase tracking-widest">Malipo Yamekamilika! Asante sana.</p>
                  </div>
                ) : project.amountPaid === 0 ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Clock size={20} className="animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-widest">Inasubiri Malipo ya Awali Kuanza Kazi.</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <TrendingUp size={20} />
                    <p className="text-xs font-bold uppercase tracking-widest">Malipo ya Awali Yamepokelewa. Kazi Inaendelea.</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border-2 bg-zinc-950/40 overflow-hidden">
            <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-xl font-black font-headline flex items-center gap-3">
                <CreditCard className="text-primary" /> Verified Payment Nodes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {[
                { name: 'M-Pesa (Vodacom)', number: '0790942616', id: 'voda' },
                { name: 'Halotel (HaloPesa)', number: '0620641695', id: 'halo' }
              ].map((opt) => (
                <div key={opt.id} className="flex items-center justify-between p-5 rounded-2xl border-2 border-white/5 bg-zinc-900 group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{opt.name}</p>
                      <p className="font-bold text-base">{opt.number}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(opt.number, opt.id)} className="h-10 rounded-xl gap-2 font-bold text-xs uppercase tracking-widest">
                    {copied === opt.id ? <><Check size={14} className="text-green-500" /> Copied!</> : <><Copy size={14} /> Copy</>}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
           <Card className="rounded-[2.5rem] border-2 bg-primary text-white p-10 space-y-8 shadow-2xl relative overflow-hidden border-border/50">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
              <div className="relative z-10 space-y-6">
                <div className="h-16 w-16 bg-white/20 rounded-[2rem] flex items-center justify-center">
                  <MessageCircle size={32} />
                </div>
                <h3 className="text-3xl font-black font-headline tracking-tighter leading-tight uppercase">Confirm Signal</h3>
                <p className="text-white/70 font-medium leading-relaxed">
                  Baada ya kufanya malipo kupitia namba zozote hapo pembeni, tafadhali tuma picha (screenshot) ya muamala kule WhatsApp kwa ajili ya uhakiki wa haraka (Quick Verification).
                </p>
                <Button className="w-full h-16 rounded-2xl bg-white text-primary hover:bg-white/90 font-black uppercase tracking-widest text-xs gap-3 shadow-2xl" asChild>
                  <a href={`https://wa.me/255790942616?text=Hi Mwijay, nimeshatuma malipo kwa ajili ya mradi wangu [${project.projectName}]. Hii hapa ni screenshot ya muamala.`}>
                    Tuma Picha WhatsApp <ArrowRight size={16} />
                  </a>
                </Button>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 justify-center">
                  <CheckCircle size={14} /> Secured Signal Transmission
                </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
