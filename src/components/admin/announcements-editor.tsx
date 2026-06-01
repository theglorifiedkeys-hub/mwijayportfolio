'use client';

import React, { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Trash2, Bell, Loader2, Sparkles, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AnnouncementsEditor() {
  const firestore = useFirestore();
  const announcementsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'announcements');
  }, [firestore]);
  
  const { data: rawAnnouncements, isLoading } = useCollection(announcementsRef);
  const [newAlert, setNewAlert] = useState({ text: '', link: '', type: 'info', isActive: true });
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!newAlert.text || !announcementsRef) return;
    try {
      await addDoc(announcementsRef, {
        ...newAlert,
        createdAt: serverTimestamp(),
      });
      setNewAlert({ text: '', link: '', type: 'info', isActive: true });
      toast({ title: "Broadcast Set", description: "Signal pushed to global banner." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: err.message });
    }
  };

  const handleToggle = async (id: string, state: boolean) => {
    const docRef = doc(firestore!, 'announcements', id);
    await updateDoc(docRef, { isActive: state });
    toast({ title: "Visibility Updated" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Terminate this broadcast signal?")) return;
    const docRef = doc(firestore!, 'announcements', id);
    await deleteDoc(docRef);
    toast({ title: "Signal Terminated", variant: "destructive" });
  };

  // Sort in memory for the admin view too
  const announcements = React.useMemo(() => {
    if (!rawAnnouncements) return [];
    return [...rawAnnouncements].sort((a, b) => {
      const tA = a.createdAt?.toMillis() || 0;
      const tB = b.createdAt?.toMillis() || 0;
      return tB - tA;
    });
  }, [rawAnnouncements]);

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl overflow-hidden border-border/50">
        <CardHeader className="p-8 border-b bg-muted/20 border-border/50">
          <CardTitle className="text-xl font-black font-headline flex items-center gap-3 uppercase">
            <Megaphone className="h-5 w-5 text-primary" /> Compose Signal
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary">Alert Priority</Label>
              <Select value={newAlert.type} onValueChange={(val) => setNewAlert(a => ({...a, type: val}))}>
                <SelectTrigger className="h-12 rounded-2xl border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2">
                  <SelectItem value="info">General Info (Blue)</SelectItem>
                  <SelectItem value="discount">Offer/Discount (Gold)</SelectItem>
                  <SelectItem value="urgent">Urgent/Breaking (Red)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary">Target URL (Optional)</Label>
              <Input value={newAlert.link} onChange={(e) => setNewAlert(a => ({...a, link: e.target.value}))} placeholder="/pricing or https://..." className="h-12 rounded-2xl border-2" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary">The Narrative</Label>
            <Input value={newAlert.text} onChange={(e) => setNewAlert(a => ({...a, text: e.target.value}))} placeholder="e.g. 30% OFF ALL WEB BUILDS THIS WEEK ONLY! 🔥" className="h-12 rounded-2xl border-2 font-bold" />
          </div>
          <Button onClick={handleAdd} className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs gap-3 shadow-xl shadow-primary/20 bg-primary text-white">
            <Send className="h-4 w-4" /> Broadcast Signal
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {announcements.map((alert) => (
          <div key={alert.id} className="flex items-center justify-between p-6 rounded-[2rem] border-2 bg-card border-border/50 group hover:border-primary/30 transition-all">
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                alert.type === 'discount' ? 'bg-yellow-500/10 text-yellow-600' :
                alert.type === 'urgent' ? 'bg-red-500/10 text-red-600' : 'bg-primary/10 text-primary'
              }`}>
                {alert.type === 'discount' ? <Sparkles className="h-5 w-5" /> : <Megaphone className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight">{alert.text}</p>
                {alert.link && <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">{alert.link}</p>}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Label className="text-[8px] font-black uppercase text-muted-foreground">LIVE_FEED</Label>
                <Switch checked={alert.isActive} onCheckedChange={(val) => handleToggle(alert.id, val)} />
              </div>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(alert.id)} className="h-10 w-10 text-destructive rounded-xl hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
           <div className="p-20 text-center border-2 border-dashed rounded-[3rem] opacity-20">
              <p className="font-black uppercase tracking-[0.4em] text-sm italic">Registry Empty</p>
           </div>
        )}
      </div>
    </div>
  );
}
