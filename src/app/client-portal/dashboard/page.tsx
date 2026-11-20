'use client';

import React, { useState } from 'react';
import { useClientPortal } from '@/contexts/client-portal-context';
import { 
  GitBranch, 
  Calendar, 
  CreditCard, 
  FolderOpen, 
  CheckCircle2, 
  Clock, 
  Circle,
  MessageSquare,
  ArrowRight,
  Download,
  FileText,
  Image as ImageIcon,
  Archive,
  File,
  ShieldCheck,
  Award,
  Zap,
  Target
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { formatTZS } from '@/lib/order-utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DigitalDocument } from '@/components/digital-document';

export const dynamic = 'force-dynamic';

export default function ClientDashboardPage() {
  const { client, project, isLoading } = useClientPortal();
  const [activeDoc, setActiveDoc] = useState<'RECEIPT' | 'AGREEMENT' | 'BLUEPRINT' | null>(null);

  if (isLoading || !project) {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="h-10 w-64 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-64 w-full bg-white/5 rounded-[3rem] animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (project.progressPercent / 100) * circumference;

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'planning': return { label: 'Planning', color: 'bg-zinc-500/10 text-zinc-400', icon: FileText };
      case 'design': return { label: 'Design Phase', color: 'bg-purple-500/10 text-purple-400', icon: ImageIcon };
      case 'development': return { label: 'Development', color: 'bg-blue-500/10 text-blue-400', icon: GitBranch };
      case 'testing': return { label: 'Testing', color: 'bg-yellow-500/10 text-yellow-400', icon: Clock };
      case 'deployment': return { label: 'Deployment', color: 'bg-cyan-500/10 text-cyan-400', icon: Zap };
      case 'completed': return { label: 'Completed', color: 'bg-green-500/10 text-green-400', icon: CheckCircle2 };
      default: return { label: 'Active', color: 'bg-primary/10 text-primary', icon: Circle };
    }
  };

  const status = getStatusConfig(project.status);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black font-headline tracking-tighter uppercase text-white">Karibu back, <span className="text-primary">{client?.name.split(' ')[0]}</span> 👋</h1>
          <p className="text-muted-foreground font-medium">Hapa ndipo unapoweza kuona maendeleo ya mfumo wako kwa uhalisia.</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <Button variant="outline" size="sm" onClick={() => setActiveDoc('AGREEMENT')} className="h-10 rounded-xl font-black uppercase text-[9px] tracking-widest gap-2 bg-primary/5 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all">
              <ShieldCheck size={14} /> Service Agreement
           </Button>
           <Button variant="outline" size="sm" onClick={() => setActiveDoc('RECEIPT')} className="h-10 rounded-xl font-black uppercase text-[9px] tracking-widest gap-2 bg-green-500/5 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all">
              <Award size={14} /> Proof of Payment
           </Button>
        </div>
      </div>

      {/* Main Status Card */}
      <Card className="border-2 rounded-[3rem] bg-zinc-950/50 border-white/5 overflow-hidden shadow-2xl relative group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-150" />
        <CardContent className="p-10 lg:p-16 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-8 flex-1 text-center lg:text-left">
            <div className="space-y-4">
              <Badge className={cn("rounded-full px-5 py-1.5 font-black uppercase tracking-widest text-[9px] border-none shadow-lg", status.color)}>
                <status.icon size={12} className="mr-2 inline" /> {status.label}
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter leading-tight text-white uppercase">{project.projectName}</h2>
              <p className="text-muted-foreground text-sm md:text-xl font-medium max-w-xl line-clamp-3 leading-relaxed">{project.description}</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-10 pt-6">
               <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Genesis Date</p>
                  <p className="font-black text-base text-white flex items-center gap-2">
                    <Calendar size={14} className="text-primary" />
                    {project.startDate ? format(project.startDate.toDate ? project.startDate.toDate() : project.startDate, 'MMM dd, yyyy') : 'TBD'}
                  </p>
               </div>
               <div className="h-10 w-px bg-white/10 hidden sm:block" />
               <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Est. Fulfillment</p>
                  <p className="font-black text-base text-white flex items-center gap-2">
                    <Clock size={14} className="text-primary" />
                    {project.estimatedCompletion ? format(project.estimatedCompletion.toDate ? project.estimatedCompletion.toDate() : project.estimatedCompletion, 'MMM dd, yyyy') : 'Calculated Stage'}
                  </p>
               </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 bg-white/[0.03] p-10 rounded-[4rem] border-2 border-white/5 shadow-inner scale-110 lg:scale-125">
            <div className="relative">
              <svg width="160" height="160" className="transform -rotate-90">
                <circle cx="80" cy="80" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-white/5" />
                <motion.circle 
                  cx="80" cy="80" r={radius} fill="none" stroke="currentColor" strokeWidth="10" 
                  strokeDasharray={circumference} 
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                  className="text-primary"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-0">
                <span className="text-4xl font-black font-headline text-white">{project.progressPercent}%</span>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">DEPLOYED</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveDoc('BLUEPRINT')} className="font-black uppercase tracking-widest text-[9px] text-white/40 hover:text-primary transition-colors">
               <FileText size={14} className="mr-2" /> View Blueprint
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Current Logic", val: project.currentMilestone, icon: GitBranch, color: "text-blue-500", href: "/client-portal/progress" },
          { label: "Registry Phase", val: `${project.milestones.filter(m => m.status === 'completed').length}/${project.milestones.length}`, icon: Target, color: "text-green-500", href: "/client-portal/progress" },
          { label: "Fulfillment Log", val: formatTZS(project.amountPaid), icon: CreditCard, color: "text-amber-500", href: "/client-portal/payments" },
          { label: "Asset Vault", val: `${project.deliverables.length} Items`, icon: FolderOpen, color: "text-purple-500", href: "/client-portal/files" },
        ].map((stat, i) => (
          <Link key={i} href={stat.href}>
            <Card className="rounded-3xl border-2 bg-zinc-950/40 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 p-8 group relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.02] rounded-full -mr-8 -mt-8" />
              <stat.icon className={cn("h-6 w-6 mb-6", stat.color)} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-xl font-black truncate text-white uppercase">{stat.val}</p>
            </Card>
          </Link>
        ))}
      </div>

      <AnimatePresence>
        {activeDoc && (
          <DigitalDocument 
            type={activeDoc} 
            data={{
              id: project.projectId.split('_')[0],
              clientName: client?.name || 'Valued Partner',
              projectName: project.projectName,
              amount: project.amountPaid,
              date: new Date(),
              details: project.description
            }}
            onClose={() => setActiveDoc(null)}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-10">
        <section className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-xl font-black font-headline tracking-tight uppercase text-white">Registry Milestones</h3>
             <Link href="/client-portal/progress" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">Full Roadmap <ArrowRight size={12} /></Link>
          </div>
          <Card className="rounded-[3rem] border-2 bg-zinc-950/40 p-10 space-y-12">
            <div className="relative border-l-2 border-white/5 pl-10 ml-4 space-y-14">
              {project.milestones.sort((a,b) => a.order - b.order).slice(0, 4).map((m, idx) => {
                const isCompleted = m.status === 'completed';
                const isActive = m.status === 'in_progress';
                return (
                  <motion.div 
                    key={m.name} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative group"
                  >
                    <div className={cn(
                      "absolute -left-[51px] top-1 h-7 w-7 rounded-full border-4 border-zinc-950 z-10 transition-all shadow-xl flex items-center justify-center",
                      isCompleted ? "bg-green-500" : isActive ? "bg-primary animate-pulse" : "bg-zinc-800"
                    )}>
                      {isCompleted && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className={cn("font-black text-lg uppercase tracking-tight", isCompleted || isActive ? "text-white" : "text-muted-foreground")}>{m.name}</h4>
                        {isCompleted && <span className="text-[8px] font-black uppercase text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">LOGGED ✓</span>}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">{m.notes || 'Awaiting architecture sync...'}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </section>

        <div className="lg:col-span-4 space-y-8">
          <section className="space-y-6">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Recent Signal Uploads</h3>
                <Link href="/client-portal/files" className="text-[10px] font-black text-primary uppercase hover:underline">Vault Registry →</Link>
             </div>
             <div className="space-y-4">
                {project.deliverables.slice(0, 4).map((file, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-5 rounded-[1.8rem] bg-zinc-900 border-2 border-white/5 flex items-center justify-between group hover:border-primary/40 transition-all shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <File size={20} />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-black text-xs truncate max-w-[140px] text-white uppercase tracking-tight">{file.name}</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">{file.fileType}</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full hover:bg-primary/10" asChild>
                      <a href={file.url} target="_blank" aria-label={`Download ${file.name}`}><Download size={18} className="text-primary" /></a>
                    </Button>
                  </motion.div>
                ))}
                {project.deliverables.length === 0 && (
                   <div className="p-12 border-2 border-dashed rounded-[2rem] text-center opacity-20">
                      <Archive size={32} className="mx-auto mb-2" />
                      <p className="text-[9px] font-black uppercase tracking-widest">No Signals Synced</p>
                   </div>
                )}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
