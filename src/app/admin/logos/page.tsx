'use client';

import React, { useState, useRef } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Upload, Loader2, Save, Link as LinkIcon, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function LogosManager() {
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const logosRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'logos');
  }, [db]);
  const logosQuery = useMemoFirebase(() => {
    if (!logosRef) return null;
    return query(logosRef, orderBy('order', 'asc'));
  }, [logosRef]);
  
  const { data: logos, isLoading } = useCollection(logosQuery);
  
  const [newLogo, setNewLogo] = useState({ name: '', imageUrl: '', href: '', isVisible: true, order: 0 });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { url } = await uploadToCloudinary(file);
      setNewLogo(prev => ({ ...prev, imageUrl: url }));
      toast({ title: "Logo Ready", description: "Image asset uploaded to Cloudinary." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!db || !logosRef || !newLogo.name || !newLogo.imageUrl) return;
    try {
      await addDoc(logosRef, {
        ...newLogo,
        order: (logos?.length || 0) + 1,
        createdAt: serverTimestamp(),
      });
      setNewLogo({ name: '', imageUrl: '', href: '', isVisible: true, order: 0 });
      toast({ title: "Logo Registered", description: "Added to featured marquee." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    if (!db) return;
    await updateDoc(doc(db, 'logos', id), { isVisible: !current });
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Remove this logo?")) return;
    await deleteDoc(doc(db, 'logos', id));
    toast({ title: "Logo Purged", variant: "destructive" });
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-black font-headline tracking-tight">Logo <span className="text-primary">Marquee</span></h3>
        <p className="text-sm text-muted-foreground font-medium">Manage featured technologies, tools, and partner logos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl overflow-hidden sticky top-24">
            <CardHeader className="p-8 border-b bg-muted/20">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                <Plus className="h-5 w-5 text-primary" /> New Signal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Logo Name</Label>
                <Input value={newLogo.name} onChange={(e) => setNewLogo({...newLogo, name: e.target.value})} placeholder="e.g. Google Cloud" className="h-12 rounded-2xl border-2" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Website Link (Optional)</Label>
                <Input value={newLogo.href} onChange={(e) => setNewLogo({...newLogo, href: e.target.value})} placeholder="https://..." className="h-12 rounded-2xl border-2" />
              </div>
              <div className="space-y-4 pt-4">
                <div className="h-24 w-full relative rounded-2xl border-2 border-dashed flex items-center justify-center bg-muted/30 overflow-hidden">
                  {newLogo.imageUrl ? <img src={newLogo.imageUrl} className="h-full w-full object-contain p-4" alt="Preview" /> : <Globe className="h-8 w-8 opacity-20" />}
                </div>
                <Button variant="outline" className="w-full h-12 rounded-2xl gap-2 font-bold" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {newLogo.imageUrl ? 'Change Logo' : 'Upload PNG/SVG'}
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
              <Button onClick={handleAdd} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 mt-4 shadow-lg shadow-primary/20 bg-primary text-white">
                <Save className="h-4 w-4" /> Deploy Logo
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {logos?.map((logo) => (
            <Card key={logo.id} className="border-2 rounded-[2rem] bg-card hover:shadow-xl transition-all group overflow-hidden flex flex-col justify-between">
              <div className="p-8 flex items-center justify-center bg-muted/20 h-32 relative">
                <img src={logo.imageUrl} className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all" alt={logo.name} />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(logo.id)} className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-6 space-y-4 border-t border-border/50">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-sm uppercase tracking-tight">{logo.name}</h4>
                  <div className="flex items-center gap-2">
                    <Label className="text-[8px] font-black uppercase text-muted-foreground">Live</Label>
                    <Switch checked={logo.isVisible} onCheckedChange={() => handleToggleVisibility(logo.id, logo.isVisible)} />
                  </div>
                </div>
                {logo.href && (
                  <p className="text-[10px] text-primary font-mono truncate flex items-center gap-1">
                    <LinkIcon size={10} /> {logo.href}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
