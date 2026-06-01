
'use client';

import React, { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Loader2, DollarSign, ListChecks, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PricingEditor() {
  const firestore = useFirestore();
  const packagesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'packages');
  }, [firestore]);
  const { data: packages, isLoading } = useCollection(packagesRef);
  const [newPkg, setNewPkg] = useState({ title: '', price: '', category: 'web', bestFor: '', features: '' });
  const { toast } = useToast();

  const handleAdd = () => {
    if (!newPkg.title || !newPkg.price || !packagesRef) return;
    addDocumentNonBlocking(packagesRef, {
      ...newPkg,
      features: newPkg.features.split(',').map(f => f.trim()).filter(f => f !== ''),
      displayOrder: (packages?.length || 0) + 1,
    });
    setNewPkg({ title: '', price: '', category: 'web', bestFor: '', features: '' });
    toast({ title: "Package Deployed", description: "Pricing data updated in registry." });
  };

  const handleUpdate = (id: string, updatedFields: any) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'packages', id);
    updateDocumentNonBlocking(docRef, updatedFields);
    toast({ title: "Package Updated", description: "Pricing data committed to registry." });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this pricing package?") || !firestore) return;
    const docRef = doc(firestore, 'packages', id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Package Purged", variant: "destructive" });
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black font-headline tracking-tight">Revenue <span className="text-primary">Matrix</span></h3>
          <p className="text-sm text-muted-foreground font-medium">Configure service tiers and TZS pricing models.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creator Card */}
        <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl lg:sticky lg:top-24 h-fit">
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-black font-headline flex items-center gap-3">
              <Plus className="h-5 w-5 text-primary" /> New Tier
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Service Type</Label>
              <Select value={newPkg.category} onValueChange={(val) => setNewPkg(p => ({...p, category: val}))}>
                <SelectTrigger className="h-12 rounded-2xl border-2">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2">
                  <SelectItem value="web">Web Development</SelectItem>
                  <SelectItem value="design">Graphic Design</SelectItem>
                  <SelectItem value="automation">Automation & AI</SelectItem>
                  <SelectItem value="content">Content Creation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Package Title</Label>
              <Input value={newPkg.title} onChange={(e) => setNewPkg(p => ({...p, title: e.target.value}))} placeholder="e.g. Starter Business" className="h-12 rounded-2xl border-2" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Price (TZS)</Label>
              <Input value={newPkg.price} onChange={(e) => setNewPkg(p => ({...p, price: e.target.value}))} placeholder="TZS 250,000+" className="h-12 rounded-2xl border-2" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Target Audience</Label>
              <Input value={newPkg.bestFor} onChange={(e) => setNewPkg(p => ({...p, bestFor: e.target.value}))} placeholder="e.g. SMEs, Startups" className="h-12 rounded-2xl border-2" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Feature Nodes (Comma Separated)</Label>
              <Textarea value={newPkg.features} onChange={(e) => setNewPkg(p => ({...p, features: e.target.value}))} placeholder="Responsive, SEO, 3 Pages..." className="min-h-[80px] rounded-2xl border-2" />
            </div>
            <Button onClick={handleAdd} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 mt-4">
              <Plus className="h-4 w-4" /> Deploy Package
            </Button>
          </CardContent>
        </Card>

        {/* Display Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages?.sort((a,b) => a.displayOrder - b.displayOrder).map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PackageCard({ pkg, onUpdate, onDelete }: { pkg: any, onUpdate: (id: string, updatedFields: any) => void, onDelete: (id: string) => void }) {
  const [title, setTitle] = useState(pkg.title || '');
  const [price, setPrice] = useState(pkg.price || '');
  const [bestFor, setBestFor] = useState(pkg.bestFor || '');
  const [features, setFeatures] = useState(pkg.features?.join(', ') || '');
  const [saving, setSaving] = useState(false);

  // Sync with prop updates
  useEffect(() => {
    setTitle(pkg.title || '');
    setPrice(pkg.price || '');
    setBestFor(pkg.bestFor || '');
    setFeatures(pkg.features?.join(', ') || '');
  }, [pkg]);

  const hasChanges = title !== (pkg.title || '') || 
                     price !== (pkg.price || '') || 
                     bestFor !== (pkg.bestFor || '') || 
                     features !== (pkg.features?.join(', ') || '');

  const handleSave = async () => {
    setSaving(true);
    try {
      const parsedFeatures = features.split(',').map((f: string) => f.trim()).filter((f: string) => f !== '');
      await onUpdate(pkg.id, {
        title,
        price,
        bestFor,
        features: parsedFeatures
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-2 rounded-[2rem] bg-card hover:shadow-xl transition-all flex flex-col group border-border/50">
      <CardHeader className="p-6 pb-2">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-primary/5 rounded-full text-primary border border-primary/10">
            {pkg.category}
          </span>
          <Button variant="ghost" size="icon" onClick={() => onDelete(pkg.id)} className="h-8 w-8 text-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="font-black font-headline text-lg border rounded-xl px-3 py-1.5 h-10 bg-background text-slate-900 dark:text-foreground focus-visible:ring-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4 flex-1">
        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Price (TZS)</Label>
          <div className="flex items-center gap-2 text-primary font-black relative">
            <DollarSign className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
            <Input value={price} onChange={(e) => setPrice(e.target.value)} className="pl-9 border rounded-xl h-10 bg-background text-slate-900 dark:text-foreground text-sm font-headline focus-visible:ring-primary" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Best For</Label>
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold relative">
            <Target className="h-3 w-3 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={bestFor} onChange={(e) => setBestFor(e.target.value)} className="pl-9 border rounded-xl h-10 bg-background text-slate-900 dark:text-foreground text-xs font-bold focus-visible:ring-primary" />
          </div>
        </div>
        <div className="space-y-2 border-t pt-4">
          <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Expertise Nodes (Comma Separated)</Label>
          <Textarea 
            value={features} 
            onChange={(e) => setFeatures(e.target.value)}
            className="text-xs min-h-[100px] rounded-xl border resize-none p-3 bg-background text-slate-900 dark:text-foreground focus-visible:ring-primary"
          />
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-end min-h-[56px]">
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving} size="sm" className="rounded-xl h-10 px-4 text-xs font-black gap-2 uppercase tracking-wider bg-primary text-white shadow-md shadow-primary/10">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Tier
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
