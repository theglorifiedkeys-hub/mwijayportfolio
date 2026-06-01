'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { aiGenerateBlog } from '@/ai/flows/ai-blog-generator';
import { collection, doc, serverTimestamp, setDoc, addDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Newspaper, Upload, Trash2, Loader2, Plus, 
  Send, Edit2, X, Image as ImageIcon, Code, 
  Quote, Video, Link as LinkIcon, Sparkles,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';

export function BlogEditor() {
  const firestore = useFirestore();
  const blogsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'blogs');
  }, [firestore]);

  const blogsQuery = useMemoFirebase(() => {
    if (!blogsRef) return null;
    return query(blogsRef, orderBy('publishedAt', 'desc'));
  }, [blogsRef]);

  const { data: posts, isLoading } = useCollection(blogsQuery);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Tech Strategy',
    imageUrl: '',
    readTime: '5',
    isPublished: true
  });

  const [uploading, setUploading] = useState<string | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiTopic, setAiTopic] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) return;
    setAiGenerating(true);
    try {
      toast({ title: "AI Pipeline Active", description: "Generating blog content..." });
      const result = await aiGenerateBlog(aiTopic, "technical and professional", formData.category);
      setFormData(prev => ({
        ...prev,
        title: result.title,
        excerpt: result.excerpt,
        content: result.content
      }));
      toast({ title: "Content Drafted", description: "AI generated fields applied." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "AI Error", description: err.message });
    } finally {
      setAiGenerating(false);
    }
  };
  const toolInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editingId && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, editingId]);

  const handleEdit = (post: any) => {
    setEditingId(post.id);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || 'Tech Strategy',
      imageUrl: post.imageUrl || '',
      readTime: post.readTime || '5',
      isPublished: post.isPublished ?? true
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      title: '', slug: '', excerpt: '', content: '', 
      category: 'Tech Strategy', imageUrl: '', readTime: '5', isPublished: true 
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'banner' | 'tool') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(field);
      const { url } = await uploadToCloudinary(file);
      if (field === 'banner') {
        setFormData(prev => ({ ...prev, imageUrl: url }));
        toast({ title: "Banner Synced" });
      } else {
        setTempImageUrl(url);
        toast({ title: "Asset Uploaded" });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({ variant: "destructive", title: "Missing Data", description: "Jaza Title na Content kwanza." });
      return;
    }

    try {
      const payload = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(firestore!, 'blogs', editingId), payload);
        toast({ title: "Registry Updated" });
      } else {
        await addDoc(blogsRef!, {
          ...payload,
          publishedAt: serverTimestamp(),
        });
        toast({ title: "Insight Published" });
      }
      handleCancel();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Error", description: err.message });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Terminate this insight from the registry?")) return;
    deleteDocumentNonBlocking(doc(firestore!, 'blogs', id));
    toast({ title: "Signal Terminated", variant: "destructive" });
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Newspaper size={20} />
          </div>
          <h1 className="text-3xl font-black font-headline tracking-tighter uppercase text-foreground">Insight <span className="text-primary italic">Publisher</span></h1>
        </div>
        <p className="text-muted-foreground font-medium text-sm">Architect and manage strategic content for your 2026 audience.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl overflow-hidden border-border/50">
            <CardHeader className="p-8 border-b bg-muted/20 border-border/50">
              <div className="flex items-center justify-between">
                 <CardTitle className="text-xl font-black font-headline uppercase flex items-center gap-3 text-foreground">
                   {editingId ? <Edit2 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                   {editingId ? 'Edit Insight Node' : 'Compose New Signal'}
                 </CardTitle>
                 {editingId && (
                   <Button variant="ghost" size="sm" onClick={handleCancel} className="rounded-full h-8 px-4 gap-2 font-black text-[10px] uppercase">
                     <X size={14} /> Cancel Edit
                   </Button>
                 )}
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* AI GENERATION ASSISTANT */}
              <div className="p-6 rounded-3xl bg-primary/5 border-2 border-dashed border-primary/20 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-primary animate-pulse" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">AI Content Architecture Generator</h4>
                </div>
                <div className="flex gap-4">
                  <Input 
                    value={aiTopic} 
                    onChange={(e) => setAiTopic(e.target.value)} 
                    placeholder="e.g. How custom AI agents buy back time for business..." 
                    className="h-12 rounded-xl border-2 flex-1 bg-background text-foreground" 
                  />
                  <Button 
                    onClick={handleAiGenerate} 
                    disabled={aiGenerating || !aiTopic.trim()} 
                    className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-white"
                  >
                    {aiGenerating ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles size={14} className="mr-2" />}
                    Build Post
                  </Button>
                </div>
                <p className="text-[8px] font-bold text-muted-foreground uppercase">Provide a topic and let Gemini generate a high-retention structured outline, excerpt, and content.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/60">Insight Headline</Label>
                  <Input 
                    value={formData.title} 
                    onChange={(e) => setFormData(p => ({...p, title: e.target.value}))} 
                    placeholder="e.g. Beyond Code: The 2026 Automation Wave" 
                    className="h-14 rounded-2xl border-2 text-lg font-bold bg-background text-foreground" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/60">Registry Slug (URL Node)</Label>
                    <Input 
                      value={formData.slug} 
                      onChange={(e) => setFormData(p => ({...p, slug: e.target.value}))} 
                      className="h-12 rounded-xl border-2 font-mono text-xs bg-muted/30 text-foreground" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/60">Category Node</Label>
                    <Input 
                      value={formData.category} 
                      onChange={(e) => setFormData(p => ({...p, category: e.target.value}))} 
                      className="h-12 rounded-xl border-2 font-bold bg-background text-foreground" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/60">Banner Architecture</Label>
                      <div className="aspect-video relative rounded-3xl overflow-hidden border-2 bg-muted shadow-inner group">
                        {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Banner" /> : <div className="h-full w-full flex items-center justify-center opacity-10"><ImageIcon size={48} /></div>}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Button variant="secondary" size="sm" className="rounded-full px-6" onClick={() => fileInputRef.current?.click()}>
                             {uploading === 'banner' ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload size={16} className="mr-2" />}
                             Change Visual
                           </Button>
                        </div>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner')} />
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/60">Read Time (Minutes)</Label>
                        <Input type="number" value={formData.readTime} onChange={(e) => setFormData(p => ({...p, readTime: e.target.value}))} className="h-12 rounded-xl border-2 bg-background text-foreground" />
                      </div>
                      
                      <div className="p-6 rounded-3xl bg-primary/5 border-2 border-dashed border-primary/20 space-y-4">
                         <h5 className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><Sparkles size={14} /> Media Asset Tool</h5>
                         {tempImageUrl ? (
                           <div className="space-y-2">
                              <Input readOnly value={tempImageUrl} className="h-10 text-[10px] font-mono bg-background text-foreground" />
                              <Button variant="outline" size="sm" className="w-full h-8 text-[9px] font-black" onClick={() => {navigator.clipboard.writeText(tempImageUrl!); toast({title: "Link Copied!"})}}>Copy Link</Button>
                              <Button variant="ghost" size="sm" className="w-full h-8 text-[9px] text-destructive" onClick={() => setTempImageUrl(null)}>Clear</Button>
                           </div>
                         ) : (
                           <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-primary/30 text-primary font-bold text-xs" onClick={() => toolInputRef.current?.click()}>
                              {uploading === 'tool' ? <Loader2 className="animate-spin h-4 w-4" /> : <ImageIcon size={14} className="mr-2" />}
                              Upload Internal Pic
                           </Button>
                         )}
                         <input type="file" ref={toolInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'tool')} />
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/60">Abstract Excerpt</Label>
                  <Textarea 
                    value={formData.excerpt} 
                    onChange={(e) => setFormData(p => ({...p, excerpt: e.target.value}))} 
                    className="min-h-[80px] rounded-2xl border-2 p-4 text-sm font-medium leading-relaxed bg-background text-foreground" 
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Full Content</Label>
                     <div className="flex gap-4">
                        <span className="text-[8px] font-black text-muted-foreground uppercase flex items-center gap-1"><Quote size={10} /> Use {">"} for quote</span>
                        <span className="text-[8px] font-black text-muted-foreground uppercase flex items-center gap-1"><Code size={10} /> Wrap in {"`"} for code</span>
                     </div>
                  </div>
                  <Textarea 
                    value={formData.content} 
                    onChange={(e) => setFormData(p => ({...p, content: e.target.value}))} 
                    className="min-h-[500px] rounded-[2rem] border-2 p-8 text-base font-medium leading-relaxed resize-none custom-scrollbar bg-background text-foreground" 
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-border/50">
                 <Button onClick={handleSave} className="w-full h-16 rounded-[2rem] font-black uppercase tracking-widest text-xs gap-3 shadow-2xl shadow-primary/20 bg-primary text-white">
                    <Send className="h-5 w-5" /> {editingId ? 'Update Registry' : 'Publish to Feed'}
                 </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Insight Registry</h4>
             <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">{posts?.length || 0} Nodes</span>
          </div>

          <div className="space-y-4 max-h-[1200px] overflow-y-auto pr-2 custom-scrollbar">
            {posts?.map((post) => (
              <Card key={post.id} className="border-2 rounded-[2rem] bg-card hover:border-primary/30 transition-all overflow-hidden group border-border/50">
                <div className="flex h-32">
                  <div className="w-32 relative bg-muted shrink-0 overflow-hidden">
                    {post.imageUrl ? <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={post.title} /> : <div className="flex items-center justify-center h-full"><Newspaper className="h-6 w-6 opacity-20" /></div>}
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <span className="text-[8px] font-black uppercase text-primary bg-primary/5 px-2 py-0.5 rounded-full">{post.category}</span>
                      <h4 className="font-black font-headline text-xs leading-tight mt-1 line-clamp-2 text-foreground uppercase tracking-tight">{post.title}</h4>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className={cn("text-[8px] font-black uppercase", post.isPublished ? 'text-green-500' : 'text-amber-500')}>
                        {post.isPublished ? 'Live Signal' : 'Draft Node'}
                      </span>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary rounded-full hover:bg-primary/10" onClick={() => handleEdit(post)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive rounded-full hover:bg-destructive/10" onClick={() => handleDelete(post.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
