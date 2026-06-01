
'use client';

import React, { useState } from 'react';
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

  const handleUpdate = (id: string, field: string, value: any) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'packages', id);
    if (field === 'features' && typeof value === 'string') {
      value = value.split(',').map(f => f.trim()).filter(f => f !== '');
    }
    updateDocumentNonBlocking(docRef, { [field]: value });
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
            <Button onClick={handleAdd} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-2">
              <Plus className="h-4 w-4" /> Deploy Package
            </Button>
          </CardContent>
        </Card>

        {/* Display Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages?.sort((a,b) => a.displayOrder - b.displayOrder).map((pkg) => (
            <Card key={pkg.id} className="border-2 rounded-[2rem] bg-card hover:shadow-xl transition-all flex flex-col group">
              <CardHeader className="p-6 pb-2">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-primary/5 rounded-full text-primary border border-primary/10">
                    {pkg.category}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(pkg.id)} className="h-8 w-8 text-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input value={pkg.title} onChange={(e) => handleUpdate(pkg.id, 'title', e.target.value)} className="font-black font-headline text-lg border-none p-0 focus-visible:ring-0 bg-transparent" />
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4 flex-1">
                <div className="flex items-center gap-2 text-primary font-black">
                  <DollarSign className="h-4 w-4" />
                  <Input value={pkg.price} onChange={(e) => handleUpdate(pkg.id, 'price', e.target.value)} className="border-none p-0 focus-visible:ring-0 bg-transparent text-xl font-headline" />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold">
                  <Target className="h-3 w-3" />
                  <Input value={pkg.bestFor} onChange={(e) => handleUpdate(pkg.id, 'bestFor', e.target.value)} className="border-none p-0 focus-visible:ring-0 bg-transparent text-[10px]" />
                </div>
                <div className="space-y-2 border-t pt-4">
                  <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Expertise Nodes</Label>
                  <Textarea 
                    defaultValue={pkg.features?.join(', ')} 
                    onBlur={(e) => handleUpdate(pkg.id, 'features', e.target.value)}
                    className="text-xs min-h-[100px] rounded-xl border-dashed resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
