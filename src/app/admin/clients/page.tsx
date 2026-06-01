'use client';

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Plus, Users, Settings, ExternalLink, Loader2, 
  Search, CheckCircle, Mail, Smartphone, Trash2, 
  FolderPlus, Save, LayoutGrid, GitMerge, ShieldCheck, Key
} from 'lucide-react';
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription 
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatTZS } from '@/lib/order-utils';
import { MilestoneStatus, ProjectStatus } from '@/lib/client-portal-types';

export default function AdminClients() {
  const db = useFirestore();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const { toast } = useToast();

  const clientsRef = useMemoFirebase(() => collection(db!, 'clients'), [db]);
  const clientsQuery = useMemoFirebase(() => query(clientsRef, orderBy('createdAt', 'desc')), [clientsRef]);
  const { data: clients, isLoading: isClientsLoading } = useCollection(clientsQuery);

  const projectsRef = useMemoFirebase(() => collection(db!, 'client_projects'), [db]);
  const { data: projects, isLoading: isProjectsLoading } = useCollection(projectsRef);

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return clients.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [clients, search]);

  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    
    // Auto-generate high-tech password
    const tempPassword = 'MWJ' + Math.floor(100000 + Math.random() * 900000);
    
    try {
      const res = await fetch('/api/admin/create-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, password: tempPassword })
      });
      const result = await res.json();
      
      if (result.success) {
        toast({ 
          title: "Account Architected!", 
          description: `Kaka, mpe mteja password hii: ${tempPassword}` 
        });
        setIsCreateOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Provisioning Failed", description: err.message });
    }
  };

  const updateProjectField = async (projectId: string, field: string, value: any) => {
    const docRef = doc(db!, 'client_projects', projectId);
    await updateDoc(docRef, { [field]: value, updatedAt: serverTimestamp() });
    toast({ title: "Registry Updated" });
  };

  if (isClientsLoading || isProjectsLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tighter uppercase">Client <span className="text-primary italic">Registry</span></h1>
          <p className="text-muted-foreground font-medium">Provision secure portal accounts and manage project signals.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tafuta mteja..." className="pl-10 h-11 w-[260px] rounded-xl border-2" />
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl h-11 px-6 font-black uppercase text-xs gap-2">
            <Plus size={16} /> Provision New Client
          </Button>
        </div>
      </div>

      <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-card/50 shadow-xl border-border/50">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Client Node</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Project Hub</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Progress</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Fulfillment</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Registry Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((c) => {
              const project = projects?.find(p => p.clientId === c.uid);
              return (
                <TableRow key={c.uid} className="hover:bg-primary/5 transition-colors border-border/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase tracking-tighter">{c.name[0]}</div>
                       <div>
                          <p className="font-bold text-sm leading-none mb-1">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{c.email}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                       <p className="text-xs font-black text-primary uppercase tracking-tight">{project?.projectName || 'No Project'}</p>
                       <p className="text-[9px] text-muted-foreground font-bold">{c.company || 'Personal Node'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                       <div className="h-1.5 w-20 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${project?.progressPercent || 0}%` }} />
                       </div>
                       <span className="text-[10px] font-black tabular-nums">{project?.progressPercent || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-black">
                     {project ? `${formatTZS(project.amountPaid)} / ${formatTZS(project.totalAmount)}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all" onClick={() => setSelectedClient({ ...c, project })}>
                          <Settings size={18} className="text-primary" />
                       </Button>
                       <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl border border-transparent hover:border-white/10" asChild>
                          <a href={`https://wa.me/${c.phone?.replace(/\D/g, '')}`} target="_blank"><Smartphone size={16} /></a>
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredClients.length === 0 && <div className="p-24 text-center opacity-20 italic font-black uppercase tracking-[0.5em]">No Clients Registered</div>}
      </Card>

      {/* PROVISIONING SHEET */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent side="right" className="sm:max-w-xl bg-background border-l-2 border-border/50 p-0 overflow-hidden flex flex-col">
          <SheetHeader className="p-8 border-b bg-muted/20 border-border/50">
             <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">PROVISIONING_NODE</span>
             </div>
             <SheetTitle className="text-3xl font-black font-headline tracking-tighter">Initialize Client Portal</SheetTitle>
             <SheetDescription>Create a new authenticated portal account for a project client.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleCreateClient} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
             <section className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Identity Signals</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Client Full Name</Label>
                    <Input name="name" required className="h-12 rounded-2xl border-2 bg-transparent" placeholder="e.g. John Mwalimu" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Registry Email</Label>
                    <Input name="email" type="email" required className="h-12 rounded-2xl border-2 bg-transparent" placeholder="client@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Phone / WhatsApp</Label>
                    <Input name="phone" required className="h-12 rounded-2xl border-2 bg-transparent" placeholder="+255..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Organization Node</Label>
                    <Input name="company" className="h-12 rounded-2xl border-2 bg-transparent" placeholder="Company Name" />
                  </div>
                </div>
             </section>

             <section className="pt-8 border-t border-border/50 space-y-6">
                <div className="flex items-center gap-3">
                   <FolderPlus className="h-5 w-5 text-primary" />
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Project Initializer</h4>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Project Name</Label>
                      <Input name="projectName" required className="h-12 rounded-2xl border-2 bg-transparent" />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Registry Fee (TZS)</Label>
                        <Input name="totalAmount" type="number" required className="h-12 rounded-2xl border-2 bg-transparent" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Amount Paid (TZS)</Label>
                        <Input name="amountPaid" type="number" defaultValue="0" className="h-12 rounded-2xl border-2 bg-transparent" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Project Domain</Label>
                      <Input name="service" required placeholder="e.g. SaaS Architecture" className="h-12 rounded-2xl border-2 bg-transparent" />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Genesis Date</Label>
                        <Input name="startDate" type="date" required className="h-12 rounded-2xl border-2 bg-transparent" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Est. Completion</Label>
                        <Input name="estimatedCompletion" type="date" className="h-12 rounded-2xl border-2 bg-transparent" />
                        <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">Guide: Basic (1wk), Advanced (2wks), Enterprise (1mo)</p>
                      </div>
                   </div>
                </div>
             </section>

             <Button type="submit" className="w-full h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs gap-3 shadow-2xl shadow-primary/20 bg-primary text-white hover:scale-[1.02] transition-all">
                Authorize & Provision <Key size={16} />
             </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* MANAGEMENT SHEET */}
      <Sheet open={!!selectedClient} onOpenChange={(o) => !o && setSelectedClient(null)}>
        <SheetContent side="right" className="sm:max-w-2xl bg-[#07080c] border-l-2 border-border/50 p-0 overflow-hidden flex flex-col">
          {selectedClient && selectedClient.project && (
            <>
              <SheetHeader className="p-8 border-b bg-white/[0.02] border-border/50">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <SheetTitle className="text-3xl font-black font-headline tracking-tighter uppercase text-white">{selectedClient.name}</SheetTitle>
                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{selectedClient.project.projectName}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">ACTIVE_NODE</Badge>
                 </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
                 <section className="space-y-8">
                    <div className="flex justify-between items-center px-1">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><GitMerge size={14} className="text-primary" /> Architecture Progress</h4>
                       <span className="text-2xl font-black text-white">{selectedClient.project.progressPercent}%</span>
                    </div>
                    <Input 
                      type="range" 
                      min="0" max="100" 
                      defaultValue={selectedClient.project.progressPercent}
                      onMouseUp={(e) => updateProjectField(selectedClient.project.projectId, 'progressPercent', Number((e.target as HTMLInputElement).value))}
                      className="h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                 </section>

                 <section className="space-y-6 pt-8 border-t border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Milestone Signal Control</h4>
                    <div className="space-y-3">
                       {selectedClient.project.milestones.sort((a:any, b:any) => a.order - b.order).map((m: any, i: number) => (
                         <div key={m.id} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-4">
                               <div className={cn("h-2 w-2 rounded-full", m.status === 'completed' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : m.status === 'in_progress' ? "bg-primary animate-pulse" : "bg-white/10")} />
                               <span className="text-sm font-bold text-white/90">{m.name}</span>
                            </div>
                            <select 
                              defaultValue={m.status}
                              onChange={(e) => {
                                const newMilestones = [...selectedClient.project.milestones];
                                const index = newMilestones.findIndex(ml => ml.id === m.id);
                                newMilestones[index] = { ...newMilestones[index], status: e.target.value as MilestoneStatus };
                                updateProjectField(selectedClient.project.projectId, 'milestones', newMilestones);
                              }}
                              className="bg-transparent text-[10px] font-black uppercase tracking-widest text-primary focus:outline-none cursor-pointer hover:underline"
                            >
                               <option value="pending" className="bg-black">Pending</option>
                               <option value="in_progress" className="bg-black">Processing</option>
                               <option value="completed" className="bg-black">Deployed</option>
                            </select>
                         </div>
                       ))}
                    </div>
                 </section>

                 <section className="space-y-6 pt-8 border-t border-white/5">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deliverable Registry</h4>
                       <span className="text-[9px] font-black bg-white/5 px-2 py-1 rounded text-muted-foreground uppercase">{selectedClient.project.deliverables?.length || 0} Assets</span>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border-2 border-dashed border-white/10 space-y-6">
                       <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-black italic">Upload asset signals to client vault</p>
                       <div className="grid grid-cols-1 gap-4">
                          <Input id="newFileName" placeholder="File Identifier (e.g. Source_Code.zip)" className="h-12 rounded-xl bg-black/50 border-white/10 text-white text-xs" />
                          <Input id="newFileUrl" placeholder="Cloudinary Asset URL" className="h-12 rounded-xl bg-black/50 border-white/10 text-white text-xs font-mono" />
                          <Button className="h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px]" onClick={async () => {
                             const name = (document.getElementById('newFileName') as HTMLInputElement).value;
                             const url = (document.getElementById('newFileUrl') as HTMLInputElement).value;
                             if (!name || !url) return;
                             const currentD = selectedClient.project.deliverables || [];
                             const newDeliverables = [...currentD, { id: 'd_'+Date.now(), name, url, fileType: url.split('.').pop() || 'file', uploadedAt: new Date() }];
                             await updateProjectField(selectedClient.project.projectId, 'deliverables', newDeliverables);
                             (document.getElementById('newFileName') as HTMLInputElement).value = '';
                             (document.getElementById('newFileUrl') as HTMLInputElement).value = '';
                             toast({ title: "Asset Deployed" });
                          }}>Publish to Vault</Button>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-4 pt-8 border-t border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registry Intelligence (Admin Notes)</h4>
                    <Textarea 
                      placeholder="Private system logs..." 
                      defaultValue={selectedClient.project.adminNotes}
                      onBlur={(e) => updateProjectField(selectedClient.project.projectId, 'adminNotes', e.target.value)}
                      className="min-h-[140px] rounded-3xl bg-black/50 border-white/10 text-white p-6 leading-relaxed" 
                    />
                 </section>
              </div>

              <div className="p-8 border-t border-white/5 bg-white/[0.02] flex gap-4">
                 <Button className="flex-1 rounded-[2rem] h-16 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-[0.2em] text-[10px] gap-3 shadow-xl" asChild>
                    <a href={`https://wa.me/${selectedClient.phone?.replace(/\D/g, '')}`} target="_blank"><Smartphone size={18} /> WhatsApp Business</a>
                 </Button>
                 <Button variant="ghost" onClick={() => setSelectedClient(null)} className="h-16 px-10 rounded-[2rem] font-black uppercase tracking-widest text-[10px] text-white/40 hover:text-white">Close Registry</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
