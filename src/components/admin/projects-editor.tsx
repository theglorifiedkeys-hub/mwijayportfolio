'use client';

import React, { useState, useRef } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, Save, Upload, Loader2, Rocket, Globe, Github, X, Star, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';

export function ProjectsEditor({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const projectsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users', userId, 'projects');
  }, [firestore, userId]);
  const { data: projects, isLoading } = useCollection(projectsRef);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (proj: any) => {
    setEditingId(proj.id);
    setFormData({ ...proj, screenshots: proj.screenshots || [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'thumb' | 'multi') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(field);
      if (field === 'thumb') {
        const { url } = await uploadToCloudinary(files[0]);
        setFormData((prev: any) => ({ ...prev, thumbnailImageUrl: url }));
      } else {
        const uploads = Array.from(files).map(file => uploadToCloudinary(file));
        const results = await Promise.all(uploads);
        const urls = results.map(r => r.url);
        setFormData((prev: any) => ({ ...prev, screenshots: [...(prev.screenshots || []), ...urls] }));
      }
      toast({ title: "Media Synced", description: "Project assets updated." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveScreenshot = (idx: number) => {
    setFormData((prev: any) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_: any, i: number) => i !== idx)
    }));
  };

  const handleSave = () => {
    if (!formData.name) return toast({ title: "Incomplete Data", variant: "destructive" });

    if (editingId === 'new') {
      if (!projectsRef) return;
      addDocumentNonBlocking(projectsRef, {
        ...formData,
        userId,
        displayOrder: (projects?.length || 0) + 1,
        featured: formData.featured || false,
      });
    } else if (editingId) {
      if (!firestore) return;
      const docRef = doc(firestore, 'users', userId, 'projects', editingId);
      updateDocumentNonBlocking(docRef, formData);
    }
    setEditingId(null);
    toast({ title: "Build Saved", description: "Project manifest updated." });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Terminate this build?") || !firestore) return;
    const docRef = doc(firestore, 'users', userId, 'projects', id);
    deleteDocumentNonBlocking(docRef);
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black font-headline">Build <span className="text-primary">Registry</span></h3>
        {!editingId && (
          <Button onClick={() => setEditingId('new')} className="rounded-full h-12 px-6 gap-2">
            <Plus className="h-4 w-4" /> New Build
          </Button>
        )}
      </div>

      {editingId && (
        <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl overflow-hidden">
          <CardHeader className="p-8 pb-4 bg-muted/20 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-black">{editingId === 'new' ? 'New Manifest' : 'Update Build'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={handleCancel} className="rounded-full"><X className="h-5 w-5" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Project Name</Label>
                  <Input id="name" value={formData.name || ''} onChange={handleChange} className="h-12 rounded-2xl border-2" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Tech Stack / Domain</Label>
                  <Input id="type" value={formData.type || ''} onChange={handleChange} placeholder="e.g. Next.js 15, AI Automation" className="h-12 rounded-2xl border-2" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Live URL</Label>
                    <Input id="liveUrl" value={formData.liveUrl || ''} onChange={handleChange} className="h-12 rounded-2xl border-2" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">GitHub URL</Label>
                    <Input id="githubUrl" value={formData.githubUrl || ''} onChange={handleChange} className="h-12 rounded-2xl border-2" />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-2xl border-2 border-dashed">
                  <input type="checkbox" id="featured" checked={formData.featured} onChange={(e) => setFormData((p: any) => ({...p, featured: e.target.checked}))} className="h-5 w-5 rounded border-2 text-primary" />
                  <Label htmlFor="featured" className="text-xs font-black uppercase tracking-widest">Mark as Featured Build</Label>
                </div>
              </div>

              <div className="space-y-6">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Main Build Preview (Thumbnail)</Label>
                <div className="aspect-video relative rounded-[2rem] overflow-hidden border-2 bg-muted group/thumb shadow-lg">
                  {formData.thumbnailImageUrl && <img src={formData.thumbnailImageUrl} className="object-cover w-full h-full" alt="Preview" />}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm" className="rounded-full px-6" onClick={() => fileInputRef.current?.click()}>
                      {uploading === 'thumb' ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4 mr-2" />}
                      Change Image
                    </Button>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumb')} />

                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 pt-4 block">Detailed Build Screenshots (Gallery)</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {formData.screenshots?.map((url: string, i: number) => (
                    <div key={i} className="aspect-square relative rounded-2xl overflow-hidden border-2 bg-muted shadow-sm group/screen">
                      <img src={url} className="object-cover w-full h-full" alt="Screenshot" />
                      <button onClick={() => handleRemoveScreenshot(i)} className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover/screen:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  <button onClick={() => multiInputRef.current?.click()} className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-2xl opacity-40 hover:opacity-100 transition-opacity hover:border-primary/50 hover:bg-primary/5 group">
                    {uploading === 'multi' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />}
                    <span className="text-[8px] font-black uppercase mt-1">Add Screens</span>
                  </button>
                </div>
                <input type="file" ref={multiInputRef} className="hidden" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'multi')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Deep Build Description</Label>
              <Textarea id="description" value={formData.description || ''} onChange={handleChange} placeholder="Describe the problem, the solution, and the tech stack depth..." className="min-h-[200px] rounded-3xl border-2 p-6 resize-none leading-relaxed" />
            </div>

            <div className="flex gap-4 pt-4">
               <Button onClick={handleSave} className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 shadow-xl shadow-primary/20">
                <Save className="h-4 w-4" /> Save Build Manifest
              </Button>
              <Button variant="outline" onClick={handleCancel} className="h-14 rounded-2xl px-10 border-2">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects?.map((proj) => (
          <Card key={proj.id} className="border-2 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all hover:shadow-2xl flex flex-col">
            <div className="aspect-video relative bg-muted overflow-hidden">
              {proj.thumbnailImageUrl && <img src={proj.thumbnailImageUrl} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" alt={proj.name} />}
              <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                <Button size="icon" variant="secondary" onClick={() => handleEdit(proj)} className="rounded-full h-12 w-12 shadow-xl"><Edit2 className="h-5 w-5" /></Button>
                <Button size="icon" variant="destructive" onClick={() => handleDelete(proj.id)} className="rounded-full h-12 w-12 shadow-xl"><Trash2 className="h-5 w-5" /></Button>
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest rounded-full border-primary/20 text-primary">
                  {proj.type || 'Build'}
                </Badge>
                {proj.featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
              </div>
              <h4 className="font-black font-headline text-xl line-clamp-1 text-foreground">{proj.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-3 font-medium leading-relaxed">{proj.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
