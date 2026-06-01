
'use client';

import React, { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Plus, Trash2, Edit2, Loader2, MessageSquareQuote, Star, Save, X, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function TestimonialsManager() {
  const db = useFirestore();
  const tRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'testimonials');
  }, [db]);
  const tQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'testimonials');
  }, [db]);
  const { data: list, isLoading } = useCollection(tQuery);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({ clientName: '', clientRole: '', clientCompany: '', quote: '', rating: 5, isVisible: true, order: 1 });
  const [isFormOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!db || !formData.clientName || !formData.quote) return;
    try {
      if (editingId) {
        await updateDoc(doc(db, 'testimonials', editingId), formData);
        toast({ title: "Signal Updated" });
      } else {
        await addDoc(tRef, { ...formData, createdAt: serverTimestamp() });
        toast({ title: "Maoni Yameongezwa" });
      }
      setIsOpen(false);
      setEditingId(null);
      setFormData({ clientName: '', clientRole: '', clientCompany: '', quote: '', rating: 5, isVisible: true, order: 1 });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setFormData(t);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Remove this praise from registry?")) return;
    await deleteDoc(doc(db, 'testimonials', id));
    toast({ title: "Maoni Yamefutwa", variant: "destructive" });
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    if (!db) return;
    await updateDoc(doc(db, 'testimonials', id), { isVisible: !current });
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black font-headline tracking-tight">Voice <span className="text-primary">Registry</span></h3>
          <p className="text-sm text-muted-foreground font-medium">Manage client testimonials and endorsements.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="rounded-full h-12 px-6 gap-2">
          <Plus size={18} /> Record Praise
        </Button>
      </div>

      {isFormOpen && (
        <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-2xl overflow-hidden">
          <CardHeader className="p-8 border-b bg-muted/20 flex flex-row justify-between items-center">
            <CardTitle className="text-xl font-black font-headline">
              {editingId ? 'Edit Endorsement' : 'New Client Signal'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => {setIsOpen(false); setEditingId(null);}} className="rounded-full">
              <X size={20} />
            </Button>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Client Name</Label>
                <Input value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} className="h-12 rounded-2xl border-2" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Client Role</Label>
                <Input value={formData.clientRole} onChange={(e) => setFormData({...formData, clientRole: e.target.value})} className="h-12 rounded-2xl border-2" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Company</Label>
                <Input value={formData.clientCompany} onChange={(e) => setFormData({...formData, clientCompany: e.target.value})} className="h-12 rounded-2xl border-2" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">The Endorsement (Quote)</Label>
              <Textarea value={formData.quote} onChange={(e) => setFormData({...formData, quote: e.target.value})} className="min-h-[120px] rounded-2xl border-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Rating (1-5)</Label>
                <div className="flex gap-2 p-2 bg-muted/20 rounded-2xl border-2">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} onClick={() => setFormData({...formData, rating: v})} className={cn("p-1 transition-all", formData.rating >= v ? "text-yellow-500" : "text-muted-foreground/30")}>
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Display Order</Label>
                <Input type="number" value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})} className="h-12 rounded-2xl border-2" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border-2 border-dashed">
                 <Label className="text-[10px] font-black uppercase tracking-widest">Publicly Visible</Label>
                 <Switch checked={formData.isVisible} onCheckedChange={(v) => setFormData({...formData, isVisible: v})} />
              </div>
            </div>
            
            <Button onClick={handleSave} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 bg-primary text-white shadow-xl shadow-primary/20">
              <Save size={18} /> {editingId ? 'Update Registry' : 'Publish Signal'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-card/50">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Client</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Company</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Rating</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Live</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list?.map((t) => (
              <TableRow key={t.id} className="hover:bg-primary/5 transition-colors">
                <TableCell>
                  <p className="font-bold text-sm">{t.clientName}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">{t.clientRole}</p>
                </TableCell>
                <TableCell className="text-sm font-medium">{t.clientCompany}</TableCell>
                <TableCell>
                  <div className="flex text-yellow-500">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <button onClick={() => toggleVisibility(t.id, t.isVisible)} className={cn("p-2 rounded-xl transition-all", t.isVisible ? "text-green-500 bg-green-500/10" : "text-muted-foreground bg-muted")}>
                    {t.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary">
                      <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
