
'use client';

import React, { useState, useRef } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Upload, Trash2, Loader2, Plus, Save, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';

export function ProductsEditor() {
  const firestore = useFirestore();
  const productsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);
  const { data: products, isLoading } = useCollection(productsRef);
  const [newProduct, setNewProduct] = useState({ title: '', price: '', description: '', category: 'bundle', imageUrl: '', isAvailable: true });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadToCloudinary(file);
      setNewProduct(prev => ({ ...prev, imageUrl: res.url }));
      toast({ title: "Asset Ready", description: "Product visual synced." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = () => {
    if (!newProduct.title || !newProduct.price || !productsRef) return;
    addDocumentNonBlocking(productsRef, {
      ...newProduct,
      createdAt: serverTimestamp(),
    });
    setNewProduct({ title: '', price: '', description: '', category: 'bundle', imageUrl: '', isAvailable: true });
    toast({ title: "Product Deployed", description: "Listing is now live in the marketplace." });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this product from store?") || !firestore) return;
    const docRef = doc(firestore, 'products', id);
    deleteDocumentNonBlocking(docRef);
  };

  const handleToggleAvailability = (id: string, current: boolean) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'products', id);
    updateDocumentNonBlocking(docRef, { isAvailable: !current });
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-black font-headline tracking-tight">Marketplace <span className="text-primary">Registry</span></h3>
        <p className="text-sm text-muted-foreground font-medium">Manage digital products, success PDFs, and creative bundles for sale.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl overflow-hidden sticky top-24">
            <CardHeader className="p-8 border-b bg-muted/20">
              <CardTitle className="text-xl font-black font-headline flex items-center gap-3">
                <Plus className="h-5 w-5 text-primary" /> New Product
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Product Title</Label>
                <Input value={newProduct.title} onChange={(e) => setNewProduct(p => ({...p, title: e.target.value}))} placeholder="e.g. 2026 AI Sticker Bundle" className="h-12 rounded-2xl border-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Price (TZS)</Label>
                  <Input value={newProduct.price} onChange={(e) => setNewProduct(p => ({...p, price: e.target.value}))} placeholder="e.g. 15,000" className="h-12 rounded-2xl border-2" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Type</Label>
                  <Select value={newProduct.category} onValueChange={(v) => setNewProduct(p => ({...p, category: v}))}>
                    <SelectTrigger className="h-12 rounded-2xl border-2"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="bundle">Creative Bundle</SelectItem>
                      <SelectItem value="pdf">PDF Guide</SelectItem>
                      <SelectItem value="art">Digital Art</SelectItem>
                      <SelectItem value="stickers">Stickers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Marketing Narrative</Label>
                <Textarea value={newProduct.description} onChange={(e) => setNewProduct(p => ({...p, description: e.target.value}))} placeholder="What value does this product unlock?" className="min-h-[100px] rounded-2xl border-2" />
              </div>
              <div className="space-y-4 pt-4">
                <div className="aspect-square relative rounded-2xl border-2 overflow-hidden bg-muted">
                  {newProduct.imageUrl ? <img src={newProduct.imageUrl} className="w-full h-full object-cover" alt="Preview" /> : <div className="h-full w-full flex items-center justify-center opacity-20"><ImageIcon className="h-12 w-12" /></div>}
                </div>
                <Button variant="outline" className="w-full h-12 rounded-2xl gap-2 font-bold" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {newProduct.imageUrl ? 'Update Preview' : 'Upload Display Image'}
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
              <Button onClick={handleAdd} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 mt-4 shadow-lg shadow-primary/20">
                <Save className="h-4 w-4" /> Deploy Listing
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
          {products?.map((prod) => (
            <Card key={prod.id} className="border-2 rounded-[2rem] bg-card hover:shadow-xl transition-all overflow-hidden flex flex-col group">
              <div className="aspect-[4/3] relative bg-muted">
                {prod.imageUrl ? <img src={prod.imageUrl} className="w-full h-full object-cover" alt={prod.title} /> : <div className="h-full w-full flex items-center justify-center opacity-10"><ShoppingCart className="h-12 w-12" /></div>}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(prod.id)} className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-primary/5 rounded-full text-primary border border-primary/10">
                      {prod.category}
                    </span>
                    <span className="text-sm font-black text-primary">TZS {prod.price}</span>
                  </div>
                  <h4 className="font-black font-headline text-lg text-foreground line-clamp-1">{prod.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2 font-medium">{prod.description}</p>
                </div>
                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className={`h-2 w-2 rounded-full ${prod.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{prod.isAvailable ? 'In Stock' : 'Sold Out'}</span>
                   </div>
                   <Button variant="ghost" size="sm" onClick={() => handleToggleAvailability(prod.id, prod.isAvailable)} className="h-8 text-[9px] font-black uppercase tracking-widest">
                     {prod.isAvailable ? 'Suspend' : 'Activate'}
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {products?.length === 0 && (
             <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] opacity-30">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
                <p className="font-bold uppercase tracking-widest text-sm italic">Store Shelf Empty</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
