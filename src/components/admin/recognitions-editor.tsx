'use client';

import React, { useState, useRef } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Award, Upload, Trash2, Loader2, Plus, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';

export function RecognitionsEditor({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const recognitionsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users', userId, 'recognitions');
  }, [firestore, userId]);
  const { data: recognitions, isLoading } = useCollection(recognitionsRef);
  const [newRec, setNewRec] = useState({ title: '', organization: '', issueDate: '', credentialUrl: '', imageUrl: '' });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      toast({ title: "Transferring Image", description: "Uploading certification to Cloudinary." });
      const { url } = await uploadToCloudinary(file);
      setNewRec(prev => ({ ...prev, imageUrl: url }));
      toast({ title: "Media Ready", description: "Certificate preview synced." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = () => {
    if (!newRec.title || !newRec.organization || !recognitionsRef) return;
    addDocumentNonBlocking(recognitionsRef, {
      ...newRec,
      displayOrder: (recognitions?.length || 0) + 1,
    });
    setNewRec({ title: '', organization: '', issueDate: '', credentialUrl: '', imageUrl: '' });
    toast({ title: "Award Registered", description: "Recognition added to the public registry." });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this recognition?") || !firestore) return;
    const docRef = doc(firestore, 'users', userId, 'recognitions', id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Award Removed", variant: "destructive" });
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-black font-headline tracking-tight text-foreground">Recognition <span className="text-primary">Registry</span></h3>
        <p className="text-sm text-muted-foreground font-medium">Manage certifications, awards, and industry honors visible on your Experience page.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl overflow-hidden sticky top-24 border-border/50">
            <CardHeader className="p-8 border-b bg-muted/20 border-border/50">
              <CardTitle className="text-xl font-black font-headline flex items-center gap-3 text-foreground">
                <Plus className="h-5 w-5 text-primary" /> New Achievement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-foreground">Award Title</Label>
                <Input value={newRec.title} onChange={(e) => setNewRec(r => ({...r, title: e.target.value}))} placeholder="e.g. Google AI Certification" className="h-12 rounded-2xl border-2 bg-background text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-foreground">Issuing Body</Label>
                <Input value={newRec.organization} onChange={(e) => setNewRec(r => ({...r, organization: e.target.value}))} placeholder="e.g. Google, Coursera, HP" className="h-12 rounded-2xl border-2 bg-background text-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-foreground">Issue Date</Label>
                  <Input type="month" value={newRec.issueDate} onChange={(e) => setNewRec(r => ({...r, issueDate: e.target.value}))} className="h-12 rounded-2xl border-2 bg-background text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-foreground">Verify Link</Label>
                  <Input value={newRec.credentialUrl} onChange={(e) => setNewRec(r => ({...r, credentialUrl: e.target.value}))} placeholder="https://..." className="h-12 rounded-2xl border-2 bg-background text-foreground" />
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-foreground">Preview Image</Label>
                <div className="aspect-video relative rounded-2xl border-2 overflow-hidden bg-muted mb-4 border-border/50">
                  {newRec.imageUrl ? <img src={newRec.imageUrl} className="w-full h-full object-cover" alt="Preview" /> : <div className="flex items-center justify-center h-full"><Award className="h-10 w-10 opacity-20" /></div>}
                </div>
                <Button variant="outline" className="w-full rounded-2xl h-12 gap-2 font-bold text-foreground" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {newRec.imageUrl ? 'Image Ready' : 'Upload Certificate Image'}
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
              <Button onClick={handleAdd} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 mt-4 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Save Recognition
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
          {recognitions?.sort((a,b) => b.displayOrder - a.displayOrder).map((rec) => (
            <Card key={rec.id} className="border-2 rounded-[2rem] bg-card hover:shadow-xl transition-all overflow-hidden group border-border/50">
              <div className="aspect-video relative bg-muted">
                {rec.imageUrl ? <img src={rec.imageUrl} className="w-full h-full object-cover" alt={rec.title} /> : <div className="flex items-center justify-center h-full"><Award className="h-10 w-10 opacity-10" /></div>}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(rec.id)} className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-6 space-y-2">
                <h4 className="font-black font-headline text-lg leading-tight text-foreground">{rec.title}</h4>
                <p className="text-xs font-bold text-primary uppercase">{rec.organization}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-4">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                     <Calendar className="h-3 w-3" /> {rec.issueDate || '2026'}
                   </div>
                   {rec.credentialUrl && (
                     <a href={rec.credentialUrl} target="_blank" className="text-[10px] font-black text-primary flex items-center gap-1 hover:underline">
                       VERIFY <ExternalLink className="h-3 w-3" />
                     </a>
                   )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
