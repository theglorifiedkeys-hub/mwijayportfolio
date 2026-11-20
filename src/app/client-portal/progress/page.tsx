'use client';

import React from 'react';
import { useClientPortal } from '@/contexts/client-portal-context';
import { 
  GitBranch, 
  CheckCircle2, 
  Clock, 
  Circle, 
  Loader2, 
  Target,
  Rocket,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default function ProjectProgressPage() {
  const { project, isLoading } = useClientPortal();

  if (isLoading || !project) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
           <Loader2 className="h-12 w-12 animate-spin text-primary" />
           <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Synchronizing Roadmap...</p>
      </div>
    );
  }

  const completedMilestones = project.milestones.filter(m => m.status === 'completed');
  const totalMilestones = project.milestones.length;
  const healthPercent = Math.round((completedMilestones.length / totalMilestones) * 100);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
             <Target className="h-3 w-3" /> System Roadmap
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter uppercase text-white">Build <span className="text-primary italic">Status</span></h1>
          <p className="text-muted-foreground font-medium max-w-lg">Track the real-time architectural evolution of {project.projectName}.</p>
        </div>
        <div className="bg-zinc-900 border border-white/5 p-6 rounded-3xl flex items-center gap-6 shadow-xl">
           <div className="text-right">
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Overall Health</p>
              <p className="text-2xl font-black text-white">{healthPercent}%</p>
           </div>
           <div className="h-10 w-px bg-white/10" />
           <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Rocket className="h-6 w-6" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* PROGRESS TIMELINE */}
        <Card className="lg:col-span-8 rounded-[3rem] border-2 bg-zinc-950/40 border-white/5 overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="text-xl font-black font-headline flex items-center gap-3 text-white">
               <GitBranch className="text-primary" /> Milestone Signal Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 md:p-12 space-y-0">
             <div className="relative border-l-2 border-white/10 ml-4 pl-10 space-y-16">
                {project.milestones.sort((a,b) => a.order - b.order).map((m, idx) => {
                  const isDone = m.status === 'completed';
                  const isCurrent = m.status === 'in_progress';
                  const isUpcoming = m.status === 'pending';

                  return (
                    <motion.div 
                      key={m.id} 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative"
                    >
                      <div className={cn(
                        "absolute -left-[51px] top-1 h-7 w-7 rounded-full border-4 border-zinc-950 z-20 flex items-center justify-center transition-all shadow-xl",
                        isDone ? "bg-green-500" : isCurrent ? "bg-primary animate-pulse" : "bg-zinc-800"
                      )}>
                        {isDone && <CheckCircle2 size={12} className="text-white" />}
                      </div>

                      <div className={cn(
                        "p-8 rounded-[2rem] border-2 transition-all duration-500 group",
                        isDone ? "bg-green-500/5 border-green-500/20" : isCurrent ? "bg-primary/5 border-primary/40 shadow-[0_0_30px_rgba(37,99,235,0.1)]" : "bg-transparent border-white/5 opacity-40"
                      )}>
                        <div className="flex justify-between items-start mb-4">
                           <div className="space-y-1">
                              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground">MILESTONE_0{idx+1}</span>
                              <h4 className="text-xl font-black text-white uppercase">{m.name}</h4>
                           </div>
                           <Badge className={cn("rounded-full px-3 py-1 font-black text-[8px] uppercase tracking-widest border-none", 
                             isDone ? "bg-green-500/10 text-green-500" : isCurrent ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground")}>
                             {m.status.replace('_', ' ')}
                           </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                          {m.notes || 'Awaiting architecture phase completion...'}
                        </p>
                        {m.completedAt && (
                          <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                             <CheckCircle2 size={12} className="text-green-500" /> DEPLOYED ON: {format(m.completedAt.toDate ? m.completedAt.toDate() : m.completedAt, 'MMMM dd, yyyy')}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
             </div>
          </CardContent>
        </Card>

        {/* SIDEBAR INTEL */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="rounded-[2.5rem] border-2 bg-zinc-950/40 border-white/5 p-8 space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Metadata</h4>
              
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground"><Calendar size={20} /></div>
                    <div>
                       <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Target Delivery</p>
                       <p className="text-sm font-bold text-white">{project.estimatedCompletion ? format(project.estimatedCompletion.toDate ? project.estimatedCompletion.toDate() : project.estimatedCompletion, 'MMM dd, yyyy') : 'To Be Determined'}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground"><ShieldCheck size={20} /></div>
                    <div>
                       <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Quality Assurance</p>
                       <p className="text-sm font-bold text-green-500">SYSTEM_HEALTH: OPTIMAL</p>
                    </div>
                 </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 space-y-4">
                 <div className="flex items-center gap-2 text-primary">
                    <AlertCircle size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Architect's Note</span>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed font-medium italic">
                    "Kaka, tunajenga misingi imara. Kila milestone inakaguliwa kuhakikisha mfumo haufeli unapozinduliwa."
                 </p>
              </div>
           </Card>

           <div className="bg-gradient-to-br from-primary to-blue-600 p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-700" />
              <h4 className="text-xl font-black font-headline uppercase leading-tight relative z-10">Need a <br />Technical Brief?</h4>
              <p className="text-white/70 text-xs font-medium leading-relaxed relative z-10">Connect with the architect directly to discuss logic changes or new feature signals.</p>
              <Button className="w-full h-12 rounded-xl bg-white text-primary font-black uppercase text-[10px] tracking-widest relative z-10" asChild>
                 <a href="/client-portal/messages">Open Message Terminal</a>
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
