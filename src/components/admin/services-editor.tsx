'use client';

import React, { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Plus, Trash2, Cpu, Loader2, Film, Tag, DollarSign, Sparkles, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';

export function ServicesEditor({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const servicesRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return collection(firestore, 'users', userId, 'services');
  }, [firestore, userId]);
  
  const { data: services, isLoading } = useCollection(servicesRef);
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddService = () => {
    const id = String(services?.length ? services.length + 1 : 1).padStart(2, '0');
    addDocumentNonBlocking(servicesRef!, {
      id,
      userId,
      title: "New Service Template",
      description: "Define the architecture specs...",
      imageUrl: "",
      price: "TZS 120,000+",
      category: "web",
      complexity: "Standard"
    });
    toast({ title: "Signal Initialized", description: "A new expertise node has been added to the registry." });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, serviceId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(serviceId);
      toast({ title: "Transferring Assets", description: "Uploading expertise visual to Cloudinary." });
      const { url } = await uploadToCloudinary(file);
      const docRef = doc(firestore!, 'users', userId, 'services', serviceId);
      updateDocumentNonBlocking(docRef, { imageUrl: url });
      toast({ title: "Registry Synced", description: "Expertise visual updated successfully." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: err.message });
    } finally {
      setUploading(null);
    }
  };

  const handleUpdate = (serviceId: string, field: string, value: string) => {
    const docRef = doc(firestore!, 'users', userId, 'services', serviceId);
    updateDocumentNonBlocking(docRef, { [field]: value });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Terminate this node?")) return;
    const docRef = doc(firestore!, 'users', userId, 'services', id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Node Purged", variant: "destructive" });
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h3 className="text-3xl font-black font-headline tracking-tight text-foreground uppercase">Expertise <span className="text-primary italic">Architecture</span></h3>
          <p className="text-sm text-muted-foreground font-medium">Manage bento grid nodes and template cards across the entire platform.</p>
        </div>
        <Button onClick={handleAddService} className="gap-3 rounded-full h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 bg-primary text-white">
          <Plus className="h-5 w-5" /> Initialize Node
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services?.sort((a,b) => a.id.localeCompare(b.id)).map((service) => (
          <Card key={service.id} className="border-2 rounded-[2.5rem] overflow-hidden flex flex-col bg-card hover:shadow-2xl transition-all group border-border/50">
            <div className="aspect-[16/10] relative bg-muted overflow-hidden">
              {service.imageUrl ? (
                <img src={service.imageUrl} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-1000" alt={service.title} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-primary/5 text-primary/20 space-y-2">
                  <Sparkles className="h-12 w-12" />
                  <span className="text-[10px] font-black uppercase tracking-widest">No Visual Signal</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-sm gap-2">
                <input type="file" id={`file-${service.id}`} className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, service.id)} />
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="gap-2 rounded-full font-black text-[10px] uppercase tracking-widest h-10 px-6 shadow-xl" 
                  onClick={() => document.getElementById(`file-${service.id}`)?.click()}
                  disabled={!!uploading}
                >
                  {uploading === service.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Change Visual
                </Button>
              </div>
            </div>
            <CardContent className="p-8 space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-primary/60">Domain</Label>
                  <Select value={service.category || 'web'} onValueChange={(val) => handleUpdate(service.id, 'category', val)}>
                    <SelectTrigger className="h-10 rounded-xl border-2"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="web">Web Systems</SelectItem>
                      <SelectItem value="design">Visual Identity</SelectItem>
                      <SelectItem value="automation">AI & Automation</SelectItem>
                      <SelectItem value="content">Content & Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-primary/60">Complexity</Label>
                  <Input value={service.complexity || ''} onChange={(e) => handleUpdate(service.id, 'complexity', e.target.value)} className="h-10 rounded-xl border-2" placeholder="Standard" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-primary/60">Headline</Label>
                <Input value={service.title} onChange={(e) => handleUpdate(service.id, 'title', e.target.value)} className="h-12 rounded-xl border-2 font-bold" />
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-primary/60">Price Signal</Label>
                <div className="relative">
                   <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                   <Input value={service.price || ''} onChange={(e) => handleUpdate(service.id, 'price', e.target.value)} className="h-12 pl-10 rounded-xl border-2 font-black text-primary" placeholder="TZS 120,000+" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-primary/60">Description</Label>
                <Textarea value={service.description} className="min-h-[100px] rounded-xl border-2 resize-none p-4 text-sm font-medium" onChange={(e) => handleUpdate(service.id, 'description', e.target.value)} />
              </div>

              <div className="pt-4 border-t border-border/50 flex justify-end">
                <Button variant="ghost" size="sm" className="text-destructive h-10 rounded-xl hover:bg-destructive/10 gap-2 font-black text-[10px] uppercase" onClick={() => handleDelete(service.id)}>
                  <Trash2 className="h-4 w-4" /> Purge
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
