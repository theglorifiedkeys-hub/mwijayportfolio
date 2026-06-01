'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, Database, Globe, Smartphone, Upload, ImageIcon, ShieldCheck, Key, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function SettingsEditor() {
  const db = useFirestore();
  const { toast } = useToast();
  
  // Stats Reference
  const statsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'site_config', 'stats');
  }, [db]);
  const { data: stats, isLoading: isStatsLoading } = useDoc(statsRef);

  // Manifest Reference
  const manifestRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'site_config', 'manifest');
  }, [db]);
  const { data: manifest, isLoading: isManifestLoading } = useDoc(manifestRef);
  
  const [statsData, setStatsData] = useState<any>(null);
  const [manifestData, setManifestData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const icon192Ref = useRef<HTMLInputElement>(null);
  const icon512Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stats) setStatsData(stats);
  }, [stats]);

  useEffect(() => {
    if (manifest) {
      setManifestData(manifest);
    } else if (!isManifestLoading && !manifest) {
      setManifestData({
        name: "David Erick Mwijage Portfolio",
        short_name: "Mwijay",
        theme_color: "#07080c",
        background_color: "#07080c",
        icon192: "",
        icon512: ""
      });
    }
  }, [manifest, isManifestLoading]);

  const handleSave = async () => {
    if (!db || !statsData || !manifestData) return;
    setSaving(true);
    try {
      await updateDoc(statsRef!, {
        ...statsData,
        updatedAt: serverTimestamp()
      });

      const mSnap = await getDoc(manifestRef!);
      if (!mSnap.exists()) {
        await setDoc(manifestRef!, { ...manifestData, createdAt: serverTimestamp() });
      } else {
        await updateDoc(manifestRef!, manifestData);
      }

      toast({ title: "Registry Updated", description: "Global configuration synced successfully." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(field);
      const url = await uploadToCloudinary(file);
      setManifestData((prev: any) => ({ ...prev, [field]: url }));
      toast({ title: "Icon Ready" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setUploading(null);
    }
  };

  if (isStatsLoading || isManifestLoading || !statsData || !manifestData) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-24">
      <div className="flex flex-col gap-2">
        <h3 className="text-3xl font-black font-headline tracking-tighter text-foreground uppercase">System <span className="text-primary italic">Registry</span></h3>
        <p className="text-sm text-muted-foreground font-medium">Manage visibility signals, availability, and global platform configuration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* STATS & STATUS */}
        <div className="space-y-8">
          <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl overflow-hidden border-border/50">
            <CardHeader className="p-8 border-b bg-muted/20">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" /> Operation Signals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between p-6 rounded-3xl border-2 border-dashed bg-muted/10">
                <div className="space-y-1">
                  <Label className="text-sm font-black uppercase tracking-widest">Available for hire</Label>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Broadcast status to visitors</p>
                </div>
                <Switch checked={statsData.availableForWork} onCheckedChange={(val) => setStatsData({...statsData, availableForWork: val})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Projects Built</Label>
                  <Input type="number" value={statsData.projectsCompleted} onChange={(e) => setStatsData({...statsData, projectsCompleted: parseInt(e.target.value)})} className="h-12 rounded-2xl border-2" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Happy Nodes</Label>
                  <Input type="number" value={statsData.happyClients} onChange={(e) => setStatsData({...statsData, happyClients: parseInt(e.target.value)})} className="h-12 rounded-2xl border-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl overflow-hidden border-border/50">
             <CardHeader className="p-8 border-b bg-muted/20">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                <Key className="h-5 w-5 text-primary" /> API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase leading-relaxed">
                 <Zap size={14} className="inline mr-2" /> Note: Ensure GOOGLE_GENAI_API_KEY is set in Vercel/Environment Variables for full AI capability.
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">AI Processor Status</Label>
                  <div className="p-4 rounded-xl bg-background border-2 flex items-center justify-between">
                     <span className="text-xs font-bold uppercase">Genkit Core Engine</span>
                     <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[8px] font-black uppercase">Active</span>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* APP MANIFEST */}
        <div className="space-y-8">
          <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl overflow-hidden h-full border-border/50">
            <CardHeader className="p-8 border-b bg-muted/20">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" /> PWA Manifest Design
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">App Registry Name</Label>
                <Input value={manifestData.name} onChange={(e) => setManifestData({...manifestData, name: e.target.value})} className="h-12 rounded-2xl border-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Theme Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={manifestData.theme_color} onChange={(e) => setManifestData({...manifestData, theme_color: e.target.value})} className="h-12 w-16 p-1 rounded-xl cursor-pointer" />
                    <Input value={manifestData.theme_color} onChange={(e) => setManifestData({...manifestData, theme_color: e.target.value})} className="h-12 rounded-xl border-2 uppercase font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Background Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={manifestData.background_color} onChange={(e) => setManifestData({...manifestData, background_color: e.target.value})} className="h-12 w-16 p-1 rounded-xl cursor-pointer" />
                    <Input value={manifestData.background_color} onChange={(e) => setManifestData({...manifestData, background_color: e.target.value})} className="h-12 rounded-xl border-2 uppercase font-mono" />
                  </div>
                </div>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-center block">Icon 192px</Label>
                  <div className="h-24 w-24 mx-auto rounded-2xl border-2 bg-muted overflow-hidden relative group">
                    {manifestData.icon192 ? <img src={manifestData.icon192} className="w-full h-full object-cover" alt="192" /> : <ImageIcon className="w-full h-full p-6 opacity-20" />}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm" className="rounded-full scale-75" onClick={() => icon192Ref.current?.click()}>
                        {uploading === 'icon192' ? <Loader2 className="animate-spin" /> : 'CHANGE'}
                      </Button>
                    </div>
                  </div>
                  <input type="file" ref={icon192Ref} className="hidden" accept="image/png" onChange={(e) => handleFileUpload(e, 'icon192')} />
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-center block">Icon 512px</Label>
                  <div className="h-24 w-24 mx-auto rounded-2xl border-2 bg-muted overflow-hidden relative group">
                    {manifestData.icon512 ? <img src={manifestData.icon512} className="w-full h-full object-cover" alt="512" /> : <ImageIcon className="w-full h-full p-6 opacity-20" />}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm" className="rounded-full scale-75" onClick={() => icon512Ref.current?.click()}>
                        {uploading === 'icon512' ? <Loader2 className="animate-spin" /> : 'CHANGE'}
                      </Button>
                    </div>
                  </div>
                  <input type="file" ref={icon512Ref} className="hidden" accept="image/png" onChange={(e) => handleFileUpload(e, 'icon512')} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} disabled={saving} className="h-16 px-12 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/20 bg-primary text-white">
          {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
          Deploy Architecture
        </Button>
      </div>
    </div>
  );
}
