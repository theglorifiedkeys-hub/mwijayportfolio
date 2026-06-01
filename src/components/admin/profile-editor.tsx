
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Image as ImageIcon, Upload, BadgeCheck, Sparkles, Film } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';

export function ProfileEditor({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const profileRef = useMemoFirebase(() => doc(firestore!, 'users', userId), [firestore, userId]);
  
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);
  
  const [formData, setFormData] = useState<any>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const heroBgInputRef = useRef<HTMLInputElement>(null);
  const visionaryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(field);
      toast({ title: "Uploading Media", description: `Updating ${field}...` });
      
      const { url } = await uploadToCloudinary(file);
      
      const updatedData = { ...formData, [field]: url };
      setFormData(updatedData);

      setDocumentNonBlocking(profileRef!, {
        ...updatedData,
        id: userId,
      }, { merge: true });

      toast({ title: "Registry Updated", description: "Asset is now live." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: err.message });
    } finally {
      setUploading(null);
    }
  };

  const handleSaveProfile = () => {
    if (!profileRef) return;
    setDocumentNonBlocking(profileRef, {
      ...formData,
      id: userId,
    }, { merge: true });
    toast({ title: "Profile Saved", description: "Your profile information has been updated." });
  };

  if (isProfileLoading) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500 pb-20">
      <div className="lg:col-span-8 space-y-8">
        <Card className="rounded-[2.5rem] border-2 bg-card/50 shadow-xl border-border/50">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <BadgeCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">IDENTITY SETTINGS</span>
            </div>
            <CardTitle className="text-2xl font-black font-headline text-foreground uppercase tracking-tight">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider ml-1">Display Name</Label>
                <Input id="name" value={formData.name || ''} onChange={handleChange} className="h-12 rounded-2xl border-2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program" className="text-xs font-bold uppercase tracking-wider ml-1">Title / Role</Label>
                <Input id="program" value={formData.program || ''} onChange={handleChange} className="h-12 rounded-2xl border-2" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroTagline" className="text-xs font-bold uppercase tracking-wider ml-1">Taglines (Separate with '*')</Label>
              <Textarea id="heroTagline" value={formData.heroTagline || ''} onChange={handleChange} placeholder="e.g. Web Dev*AI Automation" className="min-h-[80px] rounded-2xl border-2" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aboutBio" className="text-xs font-bold uppercase tracking-wider ml-1">About Bio</Label>
              <Textarea id="aboutBio" value={formData.aboutBio || ''} onChange={handleChange} className="min-h-[120px] rounded-2xl border-2" />
            </div>
          </CardContent>
          <CardFooter className="p-8 bg-muted/20 border-t flex justify-end rounded-b-[2.5rem]">
            <Button onClick={handleSaveProfile} className="gap-2 h-12 px-8 rounded-full font-bold bg-primary text-white shadow-xl shadow-primary/20">
              <Save className="h-4 w-4" /> Save Account Profile
            </Button>
          </CardFooter>
        </Card>

        <Card className="rounded-[2.5rem] border-2 bg-card/50 shadow-xl border-border/50">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">CINEMATIC REGISTRY</span>
            </div>
            <CardTitle className="text-2xl font-black font-headline text-foreground uppercase tracking-tight">Background Media</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-12">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Hero Background</Label>
                  <div className="aspect-video relative rounded-2xl overflow-hidden border-2 bg-muted group">
                     {formData.heroBackgroundUrl ? (
                       formData.heroBackgroundUrl.includes('.mp4') ? <video src={formData.heroBackgroundUrl} className="w-full h-full object-cover" muted /> : <img src={formData.heroBackgroundUrl} className="w-full h-full object-cover" alt="Hero Background" />
                     ) : <div className="h-full w-full flex items-center justify-center opacity-20"><Film size={32} /></div>}
                     <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" size="sm" onClick={() => heroBgInputRef.current?.click()}>
                           <Upload className="h-4 w-4 mr-2" /> {uploading === 'heroBackgroundUrl' ? 'Uploading...' : 'Update Media'}
                        </Button>
                     </div>
                  </div>
                  <input type="file" ref={heroBgInputRef} className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'heroBackgroundUrl')} />
               </div>

               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Visionary Systems Background</Label>
                  <div className="aspect-video relative rounded-2xl overflow-hidden border-2 bg-muted group">
                     {formData.visionaryAssetUrl ? (
                       formData.visionaryAssetUrl.includes('.mp4') ? <video src={formData.visionaryAssetUrl} className="w-full h-full object-cover" muted /> : <img src={formData.visionaryAssetUrl} className="w-full h-full object-cover" alt="Visionary Background" />
                     ) : <div className="h-full w-full flex items-center justify-center opacity-20"><ImageIcon size={32} /></div>}
                     <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" size="sm" onClick={() => visionaryInputRef.current?.click()}>
                           <Upload className="h-4 w-4 mr-2" /> {uploading === 'visionaryAssetUrl' ? 'Uploading...' : 'Update Media'}
                        </Button>
                     </div>
                  </div>
                  <input type="file" ref={visionaryInputRef} className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'visionaryAssetUrl')} />
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-4 space-y-8">
        <Card className="rounded-[2.5rem] border-2 bg-card shadow-xl overflow-hidden border-border/50">
          <CardHeader className="p-8 pb-4 bg-muted/30 border-b">
            <CardTitle className="text-xl font-black font-headline uppercase tracking-tight text-foreground">Branding Registry</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Main Platform Logo</Label>
              <div className="h-20 w-20 relative rounded-xl overflow-hidden border-2 bg-muted p-2 mx-auto">
                {formData.logoUrl && <img src={formData.logoUrl} className="object-contain w-full h-full" alt="Site Logo" />}
              </div>
              <Button variant="outline" className="w-full h-11 rounded-xl font-bold text-xs" onClick={() => logoInputRef.current?.click()} disabled={!!uploading}>
                {uploading === 'logoUrl' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Logo'}
              </Button>
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
            </div>

            <div className="pt-6 border-t border-border/50">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Professional CV (PDF)</Label>
              <Button variant="outline" className="w-full h-11 rounded-xl font-bold border-dashed mt-4" onClick={() => cvInputRef.current?.click()} disabled={!!uploading}>
                {uploading === 'cvUrl' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload Latest CV'}
              </Button>
              <input type="file" ref={cvInputRef} className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, 'cvUrl')} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
