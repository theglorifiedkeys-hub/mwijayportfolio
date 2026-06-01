'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, Image as ImageIcon, Upload, MessageSquareQuote, Trash2, Plus, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';

/**
 * AuthDesignEditor - Managed Registry for Login Visuals
 * Updated to correctly handle Cloudinary secure URLs and prevent broken signals.
 */
export function AuthDesignEditor() {
  const db = useFirestore();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  
  const designRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'site_config', 'auth_design');
  }, [db]);
  const { data: design, isLoading } = useDoc(designRef);

  const [formData, setFormData] = useState<any>({
    adminHeroImageUrl: '',
    clientHeroImageUrl: '',
    adminTestimonials: [],
    clientTestimonials: []
  });

  const adminInputRef = useRef<HTMLInputElement>(null);
  const clientInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const activeAvatarTarget = useRef<{ target: 'admin' | 'client', index: number } | null>(null);

  useEffect(() => {
    if (design) setFormData(design);
  }, [design]);

  const handleSave = async () => {
    if (!db || !designRef) return;
    setSaving(true);
    try {
      const snap = await getDoc(designRef);
      if (!snap.exists()) {
        await setDoc(designRef, { ...formData, createdAt: serverTimestamp() });
      } else {
        await updateDoc(designRef, { ...formData, updatedAt: serverTimestamp() });
      }
      toast({ title: "Registry Updated", description: "Auth design signals synced successfully." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(field);
      const { url } = await uploadToCloudinary(file);
      setFormData((prev: any) => ({ ...prev, [field]: url }));
      toast({ title: "Visual Signal Ready" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setUploading(null);
    }
  };

  const triggerAvatarUpload = (target: 'admin' | 'client', index: number) => {
    activeAvatarTarget.current = { target, index };
    avatarInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeAvatarTarget.current) return;

    const { target, index } = activeAvatarTarget.current;
    const field = `${target}Testimonials`;

    try {
      setUploading(`avatar-${target}-${index}`);
      const { url } = await uploadToCloudinary(file);
      const newList = [...formData[field]];
      newList[index] = { ...newList[index], avatarSrc: url };
      setFormData((prev: any) => ({ ...prev, [field]: newList }));
      toast({ title: "Avatar Signal Authenticated" });
    } catch (err) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setUploading(null);
      activeAvatarTarget.current = null;
    }
  };

  const addTestimonial = (target: 'admin' | 'client') => {
    const field = `${target}Testimonials`;
    const newList = [...(formData[field] || []), { name: 'New Node', handle: '@handle', text: 'Service Feedback', avatarSrc: '' }];
    setFormData({ ...formData, [field]: newList });
  };

  const removeTestimonial = (target: 'admin' | 'client', index: number) => {
    const field = `${target}Testimonials`;
    const newList = [...(formData[field] || [])];
    newList.splice(index, 1);
    setFormData({ ...formData, [field]: newList });
  };

  const updateTestimonial = (target: 'admin' | 'client', index: number, subfield: string, value: string) => {
    const field = `${target}Testimonials`;
    const newList = [...(formData[field] || [])];
    newList[index] = { ...newList[index], [subfield]: value };
    setFormData({ ...formData, [field]: newList });
  };

  if (isLoading || !db) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-12 pb-32">
      <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LOGIN DESIGN NODES */}
        {['admin', 'client'].map((target) => (
          <Card key={target} className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl overflow-hidden border-border/50">
            <CardHeader className="p-8 border-b bg-muted/20 border-border/50">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                {target === 'admin' ? <ImageIcon className="h-5 w-5 text-primary" /> : <UserCircle className="h-5 w-5 text-primary" />}
                {target === 'admin' ? 'System Login Design' : 'Client Terminal Design'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hero Asset (Side Visual)</Label>
                <div className="aspect-video relative rounded-3xl overflow-hidden border-2 bg-muted group">
                   {formData[`${target}HeroImageUrl`] ? <img src={formData[`${target}HeroImageUrl`]} className="w-full h-full object-cover" alt="Hero" /> : <div className="h-full w-full flex items-center justify-center opacity-20"><ImageIcon size={48} /></div>}
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm" onClick={() => (target === 'admin' ? adminInputRef : clientInputRef).current?.click()}>
                        {uploading === `${target}HeroImageUrl` ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4 mr-2" />}
                        Update Visual
                      </Button>
                   </div>
                </div>
                <input type="file" ref={target === 'admin' ? adminInputRef : clientInputRef} className="hidden" accept="image/*" onChange={(e) => handleHeroUpload(e, `${target}HeroImageUrl`)} />
              </div>

              <div className="space-y-6 pt-8 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <MessageSquareQuote className="h-4 w-4 text-primary" /> User Feedback Nodes
                  </Label>
                  <Button variant="outline" size="sm" onClick={() => addTestimonial(target as any)} className="h-8 rounded-xl text-[9px] font-black uppercase">Add Feedback</Button>
                </div>
                <div className="space-y-6">
                  {formData[`${target}Testimonials`]?.map((t: any, idx: number) => (
                    <div key={idx} className="p-6 rounded-2xl border-2 bg-background space-y-4 relative group/item">
                      <Button size="icon" variant="ghost" className="h-8 w-8 absolute top-2 right-2 text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity" onClick={() => removeTestimonial(target as any, idx)}>
                        <Trash2 size={14} />
                      </Button>
                      <div className="flex items-center gap-4">
                         <div className="h-14 w-14 rounded-2xl bg-muted border-2 overflow-hidden relative group/avatar">
                            {t.avatarSrc ? <img src={t.avatarSrc} className="w-full h-full object-cover" alt="avatar" /> : <UserCircle className="w-full h-full p-2 opacity-20" />}
                            <button 
                              onClick={() => triggerAvatarUpload(target as any, idx)}
                              className="absolute inset-0 bg-primary/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                              {uploading === `avatar-${target}-${idx}` ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload size={14} />}
                            </button>
                         </div>
                         <div className="flex-1 grid grid-cols-2 gap-3">
                            <Input value={t.name} placeholder="User Name" className="h-10 text-xs font-bold rounded-xl" onChange={(e) => updateTestimonial(target as any, idx, 'name', e.target.value)} />
                            <Input value={t.handle} placeholder="@handle" className="h-10 text-xs font-mono rounded-xl" onChange={(e) => updateTestimonial(target as any, idx, 'handle', e.target.value)} />
                         </div>
                      </div>
                      <Textarea value={t.text} placeholder="The Feedback Signal..." className="text-xs min-h-[70px] rounded-xl p-3 leading-relaxed" onChange={(e) => updateTestimonial(target as any, idx, 'text', e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-10 right-10 z-[60]">
        <Button onClick={handleSave} disabled={saving} className="h-16 px-12 rounded-[2rem] font-black uppercase tracking-widest text-sm gap-3 shadow-2xl bg-primary text-white hover:scale-105 transition-all">
          {saving ? <Loader2 className="animate-spin h-6 w-6" /> : <Save className="h-6 w-6" />}
          Deploy Auth Architecture
        </Button>
      </div>
    </div>
  );
}
