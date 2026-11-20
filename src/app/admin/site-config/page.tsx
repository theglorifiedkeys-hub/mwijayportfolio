'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Save, Loader2, Database, Globe, Smartphone, Upload, ImageIcon, Mail, MapPin, ShieldCheck, Lock, Palette, RefreshCw, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { AuthDesignEditor } from '@/components/admin/auth-design-editor';
import { cn } from '@/lib/utils';

/**
 * SiteConfig Page - Manage global site signals, stats, manifest data, and brand identity.
 * UPDATED: Enhanced Favicon/Icon management nodes.
 */
export default function SiteConfigPage() {
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
    if (stats) {
      setStatsData({
        ...stats,
        brandColors: stats.brandColors || ['#1e3a5f', '#3182ce', '#7c3aed', '#10b981', '#f59e0b', '#e11d48']
      });
    }
  }, [stats]);

  useEffect(() => {
    if (manifest) {
      setManifestData(manifest);
    } else if (!isManifestLoading && !manifest) {
      setManifestData({
        name: "David Erick Mwijage Portfolio",
        short_name: "Mwijay",
        theme_color: "#2563eb",
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

  const updateColor = (idx: number, val: string) => {
    const newColors = [...statsData.brandColors];
    newColors[idx] = val;
    setStatsData({ ...statsData, brandColors: newColors });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(field);
      const { url } = await uploadToCloudinary(file);
      setManifestData((prev: any) => ({ ...prev, [field]: url }));
      toast({ title: "Icon Synchronized", description: "Visual token updated in manifest." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setUploading(null);
    }
  };

  if (isStatsLoading || isManifestLoading || !statsData || !manifestData) return (
    <div className="flex justify-center p-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="flex flex-col gap-2">
        <h3 className="text-3xl font-black font-headline tracking-tight text-foreground uppercase">Platform <span className="text-primary italic">Registry</span></h3>
        <p className="text-sm text-muted-foreground font-medium">Manage global visibility signals, PWA manifest, and Brand Identity colors.</p>
      </div>

      <Tabs defaultValue="status" className="w-full">
         <TabsList className="bg-muted/50 p-1 rounded-2xl border-2 mb-10 w-fit mx-auto lg:mx-0">
            <TabsTrigger value="status" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest gap-2">
               <Database size={14} /> System Status
            </TabsTrigger>
            <TabsTrigger value="brand" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest gap-2">
               <Palette size={14} /> Brand Identity
            </TabsTrigger>
            <TabsTrigger value="auth" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest gap-2">
               <Lock size={14} /> Auth Design
            </TabsTrigger>
            <TabsTrigger value="manifest" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest gap-2">
               <Globe size={14} /> Browser Icons
            </TabsTrigger>
         </TabsList>

         <TabsContent value="status" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl overflow-hidden border-border/50">
                <CardHeader className="p-8 border-b bg-muted/20 border-border/50">
                  <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-foreground">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Operation Signals
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between p-6 rounded-3xl border-2 border-dashed bg-muted/10 border-border/50">
                    <div className="space-y-1">
                      <Label className="text-sm font-black uppercase tracking-widest text-foreground">Available for hire</Label>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">Display availability badge to visitors</p>
                    </div>
                    <Switch checked={statsData.availableForWork} onCheckedChange={(val) => setStatsData({...statsData, availableForWork: val})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-foreground">Projects Completed</Label>
                      <Input type="number" value={statsData.projectsCompleted} onChange={(e) => setStatsData({...statsData, projectsCompleted: parseInt(e.target.value)})} className="h-12 rounded-2xl border-2 bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-foreground">Happy Clients</Label>
                      <Input type="number" value={statsData.happyClients} onChange={(e) => setStatsData({...statsData, happyClients: parseInt(e.target.value)})} className="h-12 rounded-2xl border-2 bg-background" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl overflow-hidden border-border/50">
                 <CardHeader className="p-8 border-b bg-muted/20 border-border/50">
                    <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-foreground">
                       <Smartphone className="h-5 w-5 text-primary" /> Business Nodes
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-foreground">Business WhatsApp</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={statsData.whatsapp || ''} onChange={(e) => setStatsData({...statsData, whatsapp: e.target.value})} className="h-12 pl-10 rounded-2xl border-2 bg-background" placeholder="+255..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-foreground">Support Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={statsData.email || ''} onChange={(e) => setStatsData({...statsData, email: e.target.value})} className="h-12 pl-10 rounded-2xl border-2 bg-background" placeholder="hello@..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-foreground">HQ Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={statsData.location || ''} onChange={(e) => setStatsData({...statsData, location: e.target.value})} className="h-12 pl-10 rounded-2xl border-2 bg-background" />
                      </div>
                    </div>
                 </CardContent>
              </Card>
            </div>
            <div className="flex justify-end">
               <Button onClick={handleSave} disabled={saving} className="h-16 px-12 rounded-[2rem] font-black uppercase tracking-widest text-xs gap-3 shadow-2xl bg-primary text-white">
                  {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />} Save Global Registry
               </Button>
            </div>
         </TabsContent>

         <TabsContent value="brand" className="animate-in fade-in zoom-in-95 duration-500 space-y-8">
            <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl overflow-hidden border-border/50 max-w-4xl mx-auto">
               <CardHeader className="p-8 border-b bg-muted/20 border-border/50">
                  <CardTitle className="text-xl font-black font-headline uppercase flex items-center gap-3">
                     <Palette className="h-6 w-6 text-primary" /> Brand Color Palette
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-10">
                  <div className="p-6 rounded-3xl bg-primary/5 border-2 border-dashed border-primary/20">
                     <p className="text-xs font-bold text-muted-foreground uppercase leading-relaxed">
                        These colors populate the **Expertise Matrix** and **Design Showcase**. Use high-contrast hex codes for the best industrial aesthetic.
                     </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                     {statsData.brandColors.map((color: string, i: number) => (
                        <div key={i} className="space-y-3">
                           <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Color Node {i + 1}</Label>
                           <div className="flex gap-2">
                              <div className="h-12 w-12 rounded-xl border-2 border-border/50 shadow-inner shrink-0" style={{ backgroundColor: color }} />
                              <Input 
                                 value={color} 
                                 onChange={(e) => updateColor(i, e.target.value)} 
                                 className="h-12 rounded-xl font-mono uppercase text-xs" 
                                 placeholder="#000000"
                              />
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="pt-8 border-t border-border/50 flex justify-end">
                     <Button onClick={handleSave} disabled={saving} className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2">
                        {saving ? <Loader2 className="animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Sync Brand Palette
                     </Button>
                  </div>
               </CardContent>
            </Card>
         </TabsContent>

         <TabsContent value="auth" className="animate-in fade-in zoom-in-95 duration-500">
            <AuthDesignEditor />
         </TabsContent>

         <TabsContent value="manifest" className="animate-in fade-in zoom-in-95 duration-500">
            <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl overflow-hidden border-border/50 max-w-4xl mx-auto">
              <CardHeader className="p-8 border-b bg-muted/20 border-border/50">
                <div className="flex items-center gap-3">
                   <Globe className="h-6 w-6 text-primary" />
                   <div>
                      <CardTitle className="text-lg font-black uppercase tracking-widest text-foreground">Branding Icons & Favicons</CardTitle>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage browser signals and PWA metadata</p>
                   </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex gap-4">
                   <Zap className="text-amber-500 h-5 w-5 shrink-0" />
                   <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase leading-relaxed">
                      Pro Tip: The icons below update your Browser Favicon and PWA installation prompts. Use square PNGs (background transparent if needed).
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-foreground">Platform Display Name</Label>
                     <Input value={manifestData.name} onChange={(e) => setManifestData({...manifestData, name: e.target.value})} className="h-12 rounded-2xl border-2 bg-background" />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-foreground">Short Name (App Drawer)</Label>
                     <Input value={manifestData.short_name} onChange={(e) => setManifestData({...manifestData, short_name: e.target.value})} className="h-12 rounded-2xl border-2 bg-background" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border/50">
                  <div className="space-y-4 text-center">
                    <Label className="text-[9px] font-black uppercase tracking-widest block text-foreground">Primary Favicon (192x192)</Label>
                    <div className="h-32 w-32 rounded-3xl border-2 bg-muted overflow-hidden mx-auto shadow-inner relative group border-border/50">
                      {manifestData.icon192 ? <img src={manifestData.icon192} className="w-full h-full object-contain p-4" alt="192" /> : <div className="h-full w-full flex items-center justify-center opacity-20"><ImageIcon size={48} /></div>}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm" className="rounded-full" onClick={() => icon192Ref.current?.click()}>
                          {uploading === 'icon192' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                          Change
                        </Button>
                      </div>
                    </div>
                    <input type="file" ref={icon192Ref} className="hidden" accept="image/png" onChange={(e) => handleFileUpload(e, 'icon192')} />
                  </div>

                  <div className="space-y-4 text-center">
                    <Label className="text-[9px] font-black uppercase tracking-widest block text-foreground">PWA Splash Icon (512x512)</Label>
                    <div className="h-32 w-32 rounded-3xl border-2 bg-muted overflow-hidden mx-auto shadow-inner relative group border-border/50">
                      {manifestData.icon512 ? <img src={manifestData.icon512} className="w-full h-full object-contain p-4" alt="512" /> : <div className="h-full w-full flex items-center justify-center opacity-20"><ImageIcon size={48} /></div>}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm" className="rounded-full" onClick={() => icon512Ref.current?.click()}>
                          {uploading === 'icon512' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                          Change
                        </Button>
                      </div>
                    </div>
                    <input type="file" ref={icon512Ref} className="hidden" accept="image/png" onChange={(e) => handleFileUpload(e, 'icon512')} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-8 bg-muted/20 border-t flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-primary text-white shadow-xl shadow-primary/20">
                   Deploy Visual Registry
                </Button>
              </CardFooter>
            </Card>
         </TabsContent>
      </Tabs>
    </div>
  );
}