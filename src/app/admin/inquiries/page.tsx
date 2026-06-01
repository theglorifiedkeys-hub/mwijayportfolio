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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  ClipboardCheck, Search, Eye, Smartphone, Mail, 
  Clock, Zap, Calendar, Loader2, Filter, LayoutGrid, 
  Target, MessageSquare, ShieldCheck, CheckCircle, X, Info
} from 'lucide-react';
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription 
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { InquiryStatus, ProjectInquiry } from '@/lib/order-utils';

const STATUS_CONFIG: Record<InquiryStatus, { label: string, color: string, icon: any }> = {
  new: { label: 'New Signal', color: 'bg-blue-500/10 text-blue-500', icon: Zap },
  reviewing: { label: 'Reviewing', color: 'bg-yellow-500/10 text-yellow-500', icon: Eye },
  quoted: { label: 'Quoted', color: 'bg-purple-500/10 text-purple-500', icon: MessageSquare },
  accepted: { label: 'Accepted', color: 'bg-cyan-500/10 text-cyan-500', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'bg-orange-500/10 text-orange-500', icon: Target },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-500', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-500', icon: X },
};

export default function AdminInquiries() {
  const db = useFirestore();
  const [search, setSearch] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<ProjectInquiry | null>(null);
  const { toast } = useToast();

  const inquiriesRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'project_inquiries');
  }, [db]);

  const inquiriesQuery = useMemoFirebase(() => {
    if (!inquiriesRef) return null;
    return query(inquiriesRef, orderBy('createdAt', 'desc'));
  }, [inquiriesRef]);

  const { data: inquiries, isLoading } = useCollection(inquiriesQuery);

  const filteredInquiries = useMemo(() => {
    if (!inquiries) return [];
    return inquiries.filter(i => 
      i.inquiryId?.toLowerCase().includes(search.toLowerCase()) ||
      i.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      i.projectName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [inquiries, search]);

  const updateStatus = async (id: string, status: InquiryStatus) => {
    if (!db) return;
    const docRef = doc(db, 'project_inquiries', id);
    await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
    toast({ title: "Signal Status Updated" });
  };

  const saveNotes = async (id: string, notes: string) => {
    if (!db) return;
    const docRef = doc(db, 'project_inquiries', id);
    await updateDoc(docRef, { adminNotes: notes, updatedAt: serverTimestamp() });
    toast({ title: "Architecture Logs Updated" });
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tighter">Build <span className="text-primary">Registry</span></h1>
          <p className="text-muted-foreground font-medium">Manage project briefs, approvals, and architecture pipelines.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search registry..." className="pl-10 h-11 w-[280px] rounded-xl border-2" />
        </div>
      </div>

      <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-card/50 shadow-xl border-border/50">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">ID</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Client Node</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Project</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Timeline</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Budget Cluster</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Signal Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInquiries.map((i) => (
              <TableRow key={i.id} className="hover:bg-primary/5 transition-colors border-border/50">
                <TableCell className="font-mono text-xs font-bold text-primary">{i.inquiryId}</TableCell>
                <TableCell>
                  <p className="font-bold text-sm">{i.clientName}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{i.clientCompany || 'Personal Node'}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium line-clamp-1">{i.projectName}</p>
                  <p className="text-[9px] text-primary font-black uppercase tracking-widest">{i.service?.replaceAll('_', ' ')}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-[9px] font-black uppercase rounded-full px-2", 
                    i.timeline === 'urgent' ? "border-orange-500/30 text-orange-500" :
                    i.timeline === 'standard' ? "border-blue-500/30 text-blue-500" : "border-green-500/30 text-green-500"
                  )}>
                    {i.timeline}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs font-black uppercase">{i.budgetRange}</TableCell>
                <TableCell>
                   <StatusBadge status={i.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all" onClick={() => setSelectedInquiry(i)}>
                    <Eye size={18} className="text-primary" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredInquiries.length === 0 && <div className="p-24 text-center opacity-20 italic font-black uppercase tracking-widest">Registry Empty</div>}
      </Card>

      {/* DETAIL SHEET */}
      <Sheet open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
         <SheetContent className="sm:max-w-2xl bg-background border-l-2 p-0 overflow-hidden flex flex-col border-border/50">
            {selectedInquiry && (
               <>
                  <SheetHeader className="p-8 border-b bg-muted/20 border-border/50">
                     <div className="flex items-center justify-between mb-6">
                        <Badge className="font-mono text-xs px-4 py-1.5 bg-primary/10 text-primary border-primary/20 shadow-sm">
                           {selectedInquiry.inquiryId}
                        </Badge>
                        <Select value={selectedInquiry.status} onValueChange={(val) => updateStatus(selectedInquiry.id!, val as InquiryStatus)}>
                           <SelectTrigger className="w-[180px] h-10 rounded-xl border-2">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="rounded-2xl border-2">
                              {Object.keys(STATUS_CONFIG).map(s => <SelectItem key={s} value={s}>{STATUS_CONFIG[s as InquiryStatus].label}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                     <SheetTitle className="text-3xl font-black font-headline tracking-tighter leading-tight uppercase">
                        {selectedInquiry.projectName}
                     </SheetTitle>
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 pt-2">
                        <ShieldCheck size={14} /> Brief Registry Entry
                     </div>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
                     <section className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><Target size={14} /> System Narrative</h4>
                        <div className="p-6 rounded-3xl bg-muted/20 border-2 border-dashed border-border/50 leading-relaxed font-medium text-foreground/80">
                           {selectedInquiry.description}
                        </div>
                     </section>

                     <div className="grid grid-cols-2 gap-8">
                        <section className="space-y-2">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Architecture Node</h4>
                           <p className="text-sm font-bold uppercase">{selectedInquiry.service?.replaceAll('_', ' ')}</p>
                        </section>
                        <section className="space-y-2">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Registry Budget</h4>
                           <p className="text-sm font-bold uppercase">{selectedInquiry.budgetRange}</p>
                        </section>
                     </div>

                     <section className="space-y-6 pt-8 border-t border-border/50">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Agreement & Evidence</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                              <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Agreement Signal</p>
                              <p className="text-xs font-bold text-green-500">TERMS_ACCEPTED ✓</p>
                           </div>
                           <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                              <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Typed Signature</p>
                              <p className="text-xs font-black font-headline uppercase">{selectedInquiry.typedSignature}</p>
                           </div>
                        </div>
                     </section>

                     <section className="space-y-4 pt-8 border-t border-border/50">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Identity Signal</h4>
                        <div className="grid grid-cols-2 gap-6">
                           <div>
                              <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Node</p>
                              <p className="text-sm font-bold">{selectedInquiry.clientName}</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Protocol</p>
                              <a href={`mailto:${selectedInquiry.clientEmail}`} className="text-sm font-bold text-primary hover:underline">{selectedInquiry.clientEmail}</a>
                           </div>
                           <div>
                              <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Direct Line</p>
                              <p className="text-sm font-bold">{selectedInquiry.clientPhone}</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Organization</p>
                              <p className="text-sm font-bold">{selectedInquiry.clientCompany || 'Independent'}</p>
                           </div>
                        </div>
                     </section>

                     <section className="space-y-4 pt-8 border-t border-border/50">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Architecture Logs (Admin Notes)</h4>
                        <Textarea 
                          placeholder="Private system logs for this build..." 
                          defaultValue={selectedInquiry.adminNotes} 
                          onBlur={(e) => saveNotes(selectedInquiry.id!, e.target.value)}
                          className="min-h-[140px] rounded-2xl border-2 resize-none p-4 leading-relaxed font-medium"
                        />
                     </section>
                  </div>

                  <div className="p-6 bg-muted/20 border-t border-border/50 flex gap-3">
                     <Button className="flex-1 bg-green-600 hover:bg-green-700 h-12 rounded-xl text-[10px] font-black gap-2" asChild>
                        <a href={`https://wa.me/${selectedInquiry.clientPhone?.replace(/\D/g, '')}?text=Hi ${selectedInquiry.clientName?.split(' ')[0]}, Mwijay Davie here. Regarding your brief #${selectedInquiry.inquiryId}...`}>
                           <Smartphone size={16} /> Fast-Track WhatsApp
                        </a>
                     </Button>
                     <Button variant="ghost" onClick={() => setSelectedInquiry(null)} className="font-bold text-xs">Close Brief</Button>
                  </div>
               </>
            )}
         </SheetContent>
      </Sheet>
    </div>
  );
}

function StatusBadge({ status }: { status: InquiryStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit shadow-sm", cfg.color)}>
      <cfg.icon size={10} /> {cfg.label}
    </span>
  );
}
