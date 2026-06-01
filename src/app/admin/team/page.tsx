'use client';

import React, { useState, useRef } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Upload, Loader2, Save, UsersRound, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function TeamManager() {
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const teamRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'team_members');
  }, [db]);
  const teamQuery = useMemoFirebase(() => {
    if (!teamRef) return null;
    return query(teamRef, orderBy('order', 'asc'));
  }, [teamRef]);
  
  const { data: team, isLoading } = useCollection(teamQuery);
  
  const [newMember, setNewMember] = useState({ name: '', role: '', imageUrl: '', order: 1 });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadToCloudinary(file);
      setNewMember(prev => ({ ...prev, imageUrl: res.url }));
      toast({ title: "Signal Ready", description: "Portrait asset uploaded." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!db || !teamRef || !newMember.name || !newMember.imageUrl) return;
    try {
      await addDoc(teamRef, {
        ...newMember,
        createdAt: serverTimestamp(),
      });
      setNewMember({ name: '', role: '', imageUrl: '', order: (team?.length || 0) + 1 });
      toast({ title: "Node Integrated", description: "Supporter added to registry." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Remove this supporter?")) return;
    await deleteDoc(doc(db, 'team_members', id));
    toast({ title: "Node Purged", variant: "destructive" });
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-black font-headline tracking-tight">Supporter <span className="text-primary">Registry</span></h3>
        <p className="text-sm text-muted-foreground font-medium">Manage visionary members, partners, and friends who support MWJ Services.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl overflow-hidden sticky top-24">
            <CardHeader className="p-8 border-b bg-muted/20">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                <Plus className="h-5 w-5 text-primary" /> New Supporter
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Full Name</Label>
                <Input value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} placeholder="e.g. Patrick Stewart" className="h-12 rounded-2xl border-2" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Role / Signal</Label>
                <Input value={newMember.role} onChange={(e) => setNewMember({...newMember, role: e.target.value})} placeholder="e.g. Strategic Partner" className="h-12 rounded-2xl border-2" />
              </div>
              <div className="space-y-4 pt-4">
                <div className="aspect-square w-32 mx-auto relative rounded-3xl border-2 border-dashed flex items-center justify-center bg-muted/30 overflow-hidden">
                  {newMember.imageUrl ? <img src={newMember.imageUrl} className="h-full w-full object-cover" alt="Preview" /> : <UsersRound className="h-8 w-8 opacity-20" />}
                </div>
                <Button variant="outline" className="w-full h-12 rounded-2xl gap-2 font-bold" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {newMember.imageUrl ? 'Change Portrait' : 'Upload Portrait'}
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
              <Button onClick={handleAdd} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 mt-4 shadow-lg shadow-primary/20 bg-primary text-white">
                <Save className="h-4 w-4" /> Integrate Node
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {team?.map((member) => (
            <Card key={member.id} className="border-2 rounded-[2rem] bg-card hover:shadow-xl transition-all group overflow-hidden">
              <div className="p-8 flex flex-col items-center text-center space-y-4 relative">
                <div className="h-24 w-24 rounded-[2rem] overflow-hidden border-2 border-primary/20 bg-muted shadow-lg">
                  <img src={member.imageUrl} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={member.name} />
                </div>
                <div>
                  <h4 className="font-black font-headline text-lg uppercase tracking-tight text-foreground">{member.name}</h4>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{member.role}</p>
                </div>
                <Button size="icon" variant="destructive" onClick={() => handleDelete(member.id)} className="absolute top-4 right-4 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                   <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          {team?.length === 0 && (
             <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] opacity-20">
                <p className="font-black uppercase tracking-widest text-sm italic">Supporter Registry Empty</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}