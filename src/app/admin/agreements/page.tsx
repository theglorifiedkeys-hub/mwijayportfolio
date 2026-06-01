'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { 
  collection, query, orderBy, doc, updateDoc, 
  serverTimestamp, deleteDoc, addDoc, setDoc 
} from 'firebase/firestore';
import { 
  FileText, Search, CheckCircle2, Clock, XCircle, 
  Loader2, User, MapPin, Target, DollarSign, 
  ArrowLeft, Calendar, PenTool, Trash2, Pen, 
  Download, Plus, X, Sparkles, Printer, Globe, 
  Mail, Smartphone, ShieldCheck, Info, Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { aiGenerateAgreement } from '@/ai/flows/ai-agreement-generator';

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: any }> = {
  PENDING_REVIEW: { label: 'New Signal',   color: 'bg-blue-500/10 text-blue-500',   icon: Clock },
  IN_PROGRESS:    { label: 'Active Build', color: 'bg-orange-500/10 text-orange-500', icon: Target },
  COMPLETED:      { label: 'Fulfilling',   color: 'bg-green-500/10 text-green-500',  icon: CheckCircle2 },
  CANCELLED:      { label: 'Terminated',   color: 'bg-red-500/10 text-red-500',      icon: XCircle },
};

/* ─────────────────────────────────────────
   SIGNATURE PAD COMPONENT
   ───────────────────────────────────────── */
function SignaturePad({ onSave }: { onSave: (sig: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing  = useRef(false);
  const [hasSig, setHasSig] = useState(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    isDrawing.current = true;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    e.preventDefault();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.strokeStyle = '#1b5e20'; // Green theme matching print template
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSig(true);
    e.preventDefault();
  };

  const stopDraw = () => { isDrawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSig) return;
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="space-y-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
        Draw Signature on Canvas
      </p>
      <div className="relative rounded-2xl border-2 border-dashed border-green-600/30 bg-muted/10 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          className="w-full h-40 cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {!hasSig && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 flex items-center gap-2">
              <Pen size={14} /> Draw Signature Here
            </p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={clear} className="rounded-xl text-xs font-bold h-9">
          Clear
        </Button>
        <Button size="sm" onClick={save} disabled={!hasSig} className="rounded-xl text-xs font-bold h-9 bg-green-700 hover:bg-green-800 text-white">
          Lock Signature
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────── */
export default function AdminAgreements() {
  const db = useFirestore();
  const [search, setSearch]       = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Custom Doc Preview states
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [previewActiveTab, setPreviewActiveTab] = useState('overview');
  
  // Image Upload references inside print preview
  const [ideazzyLogoUrl, setIdeazzyLogoUrl] = useState('');
  const [pulseLogoUrl, setPulseLogoUrl] = useState('');
  const [previewAdminSig, setPreviewAdminSig] = useState<string | null>(null);
  const [showPreviewSigPad, setShowPreviewSigPad] = useState(false);

  // Document Creator States
  const [isCreating, setIsCreating] = useState(false);
  const [newDocId, setNewDocId] = useState('');
  const [creatingDoc, setCreatingDoc] = useState({
    // Client Info
    clientName: '',
    clientBusiness: '',
    clientEmail: '',
    clientPhone: '',
    clientCity: 'Dar es Salaam',
    
    // Project Spec
    projectTitle: '',
    serviceType: 'Web Development',
    description: '',
    features: 'Contact form, Responsive layout, SEO configuration, SSL secure setup',
    projectMission: 'Kujenga website ya kisasa, professional, na yenye credibility inayoongeza credibility na digital footprint.',
    targetAudience: 'Youth, Communities, Partners, International Donors',

    // Quotation
    designPrice: '340000',
    featuresPrice: '115000',
    domainPrice: '60000',
    emailPrice: '20000',
    launchPrice: '65000',
    discount: '100000',

    // Payment Schedule
    depositPercent: '50%',
    depositAmount: '250000',
    depositWhen: 'Kabla ya kuanza kazi',
    midPercent: '30%',
    midAmount: '150000',
    midWhen: 'Baada ya design kukubaliwa',
    finalPercent: '20%',
    finalAmount: '100000',
    finalWhen: 'Website ikiwa tayari kwenda live',

    // Timelines
    budgetRange: 'TZS 500,000',
    completionDate: 'Standard (30 days)',
    paymentMethod: 'Mobile Money',

    // Signatures
    signatureName: '',
    signatureUri: ''
  });

  const [savingDoc, setSavingDoc] = useState(false);
  const { toast } = useToast();
  const [editingAgreementId, setEditingAgreementId] = useState<string | null>(null);
  const [aiGeneratingSpec, setAiGeneratingSpec] = useState(false);

  const agreementsRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'agreements');
  }, [db]);

  const agreementsQuery = useMemoFirebase(() => {
    if (!agreementsRef) return null;
    return query(agreementsRef, orderBy('submittedAt', 'desc'));
  }, [agreementsRef]);

  const { data: agreements, isLoading } = useCollection(agreementsQuery);

  useEffect(() => {
    if (isCreating && !editingAgreementId) {
      const year = new Date().getFullYear();
      const r = Math.floor(1000 + Math.random() * 8999);
      setNewDocId(`IDZ-PN-${r}-${year}`);
    }
  }, [isCreating, editingAgreementId]);

  const filtered = agreements?.filter(a =>
    a.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.project?.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.agreementId?.toLowerCase().includes(search.toLowerCase())
  );

  const selected = agreements?.find(a => a.id === selectedId);

  const updateStatus = async (id: string, status: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'agreements', id), { status, updatedAt: serverTimestamp() });
      toast({ title: "Signal Status Updated" });
    } catch {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  const deleteAgreement = async (id: string) => {
    if (!db || !confirm("Permanently delete this agreement from registry?")) return;
    try {
      await deleteDoc(doc(db, 'agreements', id));
      setSelectedId(null);
      toast({ title: "Agreement Purged", variant: "destructive" });
    } catch {
      toast({ variant: "destructive", title: "Deletion Failed" });
    }
  };

  const saveNotes = async (id: string, notes: string) => {
    if (!db) return;
    await updateDoc(doc(db, 'agreements', id), { "admin.notes": notes, updatedAt: serverTimestamp() });
    toast({ title: "Architecture Logs Saved" });
  };

  // Compose Custom Doc in Database
  const handleDeployDoc = async () => {
    if (!db || !agreementsRef) return;
    if (!creatingDoc.clientName || !creatingDoc.projectTitle) {
      toast({ variant: "destructive", title: "Missing details", description: "Jaza jina la mteja na kichwa cha mradi." });
      return;
    }
    setSavingDoc(true);
    try {
      const payload: any = {
        agreementId: newDocId,
        client: {
          name: creatingDoc.clientName,
          businessName: creatingDoc.clientBusiness || 'Independent',
          email: creatingDoc.clientEmail || 'hidden@registry.com',
          phone: creatingDoc.clientPhone || 'hidden',
          city: creatingDoc.clientCity
        },
        project: {
          title: creatingDoc.projectTitle,
          serviceType: creatingDoc.serviceType,
          description: creatingDoc.description,
          features: creatingDoc.features,
          projectMission: creatingDoc.projectMission,
          targetAudience: creatingDoc.targetAudience
        },
        timeline: {
          budgetRange: creatingDoc.budgetRange,
          completionDate: creatingDoc.completionDate,
          paymentMethod: creatingDoc.paymentMethod
        },
        pricing: {
          designPrice: parseInt(creatingDoc.designPrice) || 0,
          featuresPrice: parseInt(creatingDoc.featuresPrice) || 0,
          domainPrice: parseInt(creatingDoc.domainPrice) || 0,
          emailPrice: parseInt(creatingDoc.emailPrice) || 0,
          launchPrice: parseInt(creatingDoc.launchPrice) || 0,
          discount: parseInt(creatingDoc.discount) || 0
        },
        paymentSchedule: {
          depositPercent: creatingDoc.depositPercent,
          depositAmount: creatingDoc.depositAmount,
          depositWhen: creatingDoc.depositWhen,
          midPercent: creatingDoc.midPercent,
          midAmount: creatingDoc.midAmount,
          midWhen: creatingDoc.midWhen,
          finalPercent: creatingDoc.finalPercent,
          finalAmount: creatingDoc.finalAmount,
          finalWhen: creatingDoc.finalWhen
        },
        signature: {
          typedName: creatingDoc.signatureName || creatingDoc.clientName,
          dataUri: creatingDoc.signatureUri
        },
        updatedAt: serverTimestamp()
      };

      if (editingAgreementId) {
        await updateDoc(doc(db, 'agreements', editingAgreementId), payload);
        toast({ title: "Custom Document Updated!" });
        setEditingAgreementId(null);
      } else {
        payload.status = 'PENDING_REVIEW';
        payload.submittedAt = serverTimestamp();
        payload.createdAt = serverTimestamp();
        await setDoc(doc(db, 'agreements', newDocId), payload);
        toast({ title: "Custom Document Created!" });
      }
      setIsCreating(false);
      setSelectedId(newDocId);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error Saving", description: err.message });
    } finally {
      setSavingDoc(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'ideazzy' | 'pulse') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast({ title: "Uploading image..." });
      const { url } = await uploadToCloudinary(file);
      if (target === 'ideazzy') {
        setIdeazzyLogoUrl(url);
        if (previewDoc && db) {
          await updateDoc(doc(db, 'agreements', previewDoc.id), { ideazzyLogoUrl: url });
          setPreviewDoc((p: any) => p ? { ...p, ideazzyLogoUrl: url } : null);
        }
      } else {
        setPulseLogoUrl(url);
        if (previewDoc && db) {
          await updateDoc(doc(db, 'agreements', previewDoc.id), { clientLogoUrl: url });
          setPreviewDoc((p: any) => p ? { ...p, clientLogoUrl: url } : null);
        }
      }
      toast({ title: "Logo Uploaded & Saved!" });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Upload Failed" });
    }
  };

  if (isLoading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>
  );

  // Formatter for Pricing TZS display
  const fmt = (val: any) => `TZS ${(parseInt(val) || 0).toLocaleString('en-TZ')}`;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 relative">

      {/* List Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tighter uppercase text-foreground">
            Agreement & <span className="text-primary">Documents</span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Create, manage and print highly-styled project agreements and specifications.
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="pl-10 h-12 rounded-xl border-2"
            />
          </div>
          <Button onClick={() => setIsCreating(true)} className="h-12 rounded-xl font-black uppercase text-xs tracking-wider gap-2">
            <Plus size={16} /> New Document
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Agreements List */}
        <div className={cn("lg:col-span-5 space-y-4", selectedId && "hidden lg:block")}>
          {filtered?.map((a) => (
            <Card
              key={a.id}
              onClick={() => setSelectedId(a.id)}
              className={cn(
                "border-2 rounded-3xl cursor-pointer transition-all hover:scale-[1.02] group",
                selectedId === a.id ? "border-primary bg-primary/[0.03]" : "bg-card border-border/50"
              )}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{a.agreementId}</span>
                    <h4 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">{a.project?.title}</h4>
                  </div>
                  <Badge className={cn("rounded-lg border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5", STATUS_CONFIG[a.status]?.color)}>
                    {STATUS_CONFIG[a.status]?.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground">{a.client?.name}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
                    {a.submittedAt ? format(a.submittedAt.toDate(), 'MMM dd, HH:mm') : 'Syncing...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered?.length === 0 && (
            <div className="p-20 text-center opacity-20 italic font-black uppercase tracking-widest">
              Registry Empty
            </div>
          )}
        </div>

        {/* Agreement Detail */}
        <div className={cn("lg:col-span-7", !selectedId && "hidden lg:flex lg:items-center lg:justify-center")}>
          {!selectedId ? (
            <div className="text-center space-y-6 opacity-20">
              <FileText size={80} className="mx-auto" />
              <p className="font-black uppercase tracking-[0.3em] text-sm">Select a Document to View</p>
            </div>
          ) : selected ? (
            <Card className="border-2 rounded-[2.5rem] bg-card/50 overflow-hidden shadow-2xl sticky top-10">
              <CardHeader className="p-8 border-b bg-muted/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setSelectedId(null)}
                    className="lg:hidden -ml-2 mb-2 h-8 rounded-lg gap-1 font-bold text-xs"
                  >
                    <ArrowLeft size={14} /> Back
                  </Button>
                  <CardTitle className="text-2xl font-black font-headline uppercase leading-none">
                    {selected.project?.title}
                  </CardTitle>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">{selected.agreementId}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="icon" variant="destructive"
                    onClick={() => deleteAgreement(selected.id!)}
                    className="rounded-xl h-10 w-10"
                  >
                    <Trash2 size={18} />
                  </Button>

                  {/* HTML INTERACTIVE A4 PREVIEW BUTTON */}
                  <Button
                    onClick={() => {
                      setPreviewDoc(selected);
                      setIdeazzyLogoUrl(selected.ideazzyLogoUrl || '');
                      setPulseLogoUrl(selected.clientLogoUrl || selected.pulseLogoUrl || '');
                      setPreviewAdminSig(null);
                      setShowPreviewSigPad(false);
                      setPreviewActiveTab('overview');
                    }}
                    className="rounded-xl h-10 px-4 text-xs font-black uppercase tracking-wider bg-green-700 hover:bg-green-800 text-white gap-2"
                  >
                    <Printer size={16} /> View & Print A4
                  </Button>

                  {/* EDIT DOCUMENT BUTTON */}
                  <Button
                    onClick={() => {
                      setCreatingDoc({
                        clientName: selected.client?.name || '',
                        clientBusiness: selected.client?.businessName || '',
                        clientEmail: selected.client?.email || '',
                        clientPhone: selected.client?.phone || '',
                        clientCity: selected.client?.city || 'Dar es Salaam',
                        projectTitle: selected.project?.title || '',
                        serviceType: selected.project?.serviceType || 'Web Development',
                        description: selected.project?.description || '',
                        features: selected.project?.features || '',
                        projectMission: selected.project?.projectMission || '',
                        targetAudience: selected.project?.targetAudience || '',
                        designPrice: selected.pricing?.designPrice?.toString() || '0',
                        featuresPrice: selected.pricing?.featuresPrice?.toString() || '0',
                        domainPrice: selected.pricing?.domainPrice?.toString() || '0',
                        emailPrice: selected.pricing?.emailPrice?.toString() || '0',
                        launchPrice: selected.pricing?.launchPrice?.toString() || '0',
                        discount: selected.pricing?.discount?.toString() || '0',
                        depositPercent: selected.paymentSchedule?.depositPercent || '50%',
                        depositAmount: selected.paymentSchedule?.depositAmount?.toString() || '0',
                        depositWhen: selected.paymentSchedule?.depositWhen || '',
                        midPercent: selected.paymentSchedule?.midPercent || '30%',
                        midAmount: selected.paymentSchedule?.midAmount?.toString() || '0',
                        midWhen: selected.paymentSchedule?.midWhen || '',
                        finalPercent: selected.paymentSchedule?.finalPercent || '20%',
                        finalAmount: selected.paymentSchedule?.finalAmount?.toString() || '0',
                        finalWhen: selected.paymentSchedule?.finalWhen || '',
                        budgetRange: selected.timeline?.budgetRange || '',
                        completionDate: selected.timeline?.completionDate || '',
                        paymentMethod: selected.timeline?.paymentMethod || 'Mobile Money',
                        signatureName: selected.signature?.typedName || '',
                        signatureUri: selected.signature?.dataUri || ''
                      });
                      setNewDocId(selected.id);
                      setEditingAgreementId(selected.id);
                      setIsCreating(true);
                    }}
                    className="rounded-xl h-10 px-4 text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white gap-2 border border-primary/20"
                  >
                    <Pen size={14} /> Edit Specs
                  </Button>

                  <select
                    value={selected.status}
                    onChange={e => updateStatus(selected.id!, e.target.value)}
                    className="h-10 bg-background border-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary text-foreground"
                  >
                    {Object.keys(STATUS_CONFIG).map(s => (
                      <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                    ))}
                  </select>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">

                {/* Client */}
                <section className="space-y-6">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <User size={14} /> Client Identity
                  </h5>
                  <div className="grid grid-cols-2 gap-6 text-left">
                    <div><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Legal Name</p><p className="text-sm font-bold">{selected.client?.name}</p></div>
                    <div><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Organization</p><p className="text-sm font-bold">{selected.client?.businessName || 'Independent'}</p></div>
                    <div><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Email Node</p><p className="text-sm font-bold text-primary">{selected.client?.email}</p></div>
                    <div><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Direct Line</p><p className="text-sm font-bold">{selected.client?.phone}</p></div>
                    <div className="col-span-2"><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Registry Location</p><p className="text-sm font-bold flex items-center gap-1"><MapPin size={12} className="text-primary" /> {selected.client?.city}</p></div>
                  </div>
                </section>

                {/* Project */}
                <section className="space-y-6 pt-8 border-t border-border/50">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Target size={14} /> Project Scope
                  </h5>
                  <div className="space-y-4 text-left">
                    <div><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Service Node</p><p className="text-sm font-black text-foreground">{selected.project?.serviceType}</p></div>
                    <div><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Narrative Description</p><p className="text-sm leading-relaxed font-medium bg-muted/30 p-5 rounded-2xl">{selected.project?.description}</p></div>
                    {selected.project?.features && <div><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Technical Features</p><p className="text-xs leading-relaxed font-bold bg-primary/5 p-5 rounded-2xl text-primary">{selected.project?.features}</p></div>}
                  </div>
                </section>

                {/* Financials */}
                <section className="space-y-6 pt-8 border-t border-border/50">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <DollarSign size={14} /> Financials & Timelines
                  </h5>
                  <div className="grid grid-cols-2 gap-6 text-left">
                    <div><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Investment Cluster</p><p className="text-sm font-black text-foreground uppercase">{selected.timeline?.budgetRange}</p></div>
                    <div><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Target Delivery</p><p className="text-sm font-bold flex items-center gap-1"><Calendar size={12} className="text-primary" /> {selected.timeline?.completionDate || 'Flexible'}</p></div>
                    <div className="col-span-2"><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Settlement Method</p><p className="text-xs font-black uppercase bg-primary/10 text-primary px-3 py-1.5 rounded-lg w-fit">{selected.timeline?.paymentMethod}</p></div>
                  </div>
                </section>

                {/* Client Signature */}
                <section className="space-y-6 pt-8 border-t border-border/50">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <PenTool size={14} /> Signature Verification
                  </h5>
                  <div className="p-8 rounded-3xl bg-muted/20 border-2 border-dashed flex flex-col items-center justify-center space-y-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Digital Identity Signature</p>
                    <p className="text-4xl md:text-5xl font-headline italic text-foreground tracking-tighter">{selected.signature?.typedName}</p>
                    <p className="text-[8px] font-bold text-green-500 uppercase tracking-widest px-2 py-1 rounded-full bg-green-500/10">
                      LEGAL_SIGNAL_AUTHENTICATED ✓
                    </p>
                  </div>
                </section>

                {/* Admin Notes */}
                <section className="space-y-4 pt-8 border-t border-border/50">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Architecture Logs (Admin Notes)
                  </h5>
                  <Textarea
                    placeholder="Private technical logs for this build..."
                    defaultValue={selected.admin?.notes}
                    onBlur={e => saveNotes(selected.id!, e.target.value)}
                    className="min-h-[140px] rounded-2xl border-2 resize-none p-5 leading-relaxed font-medium bg-background text-foreground"
                  />
                </section>

              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {/* ─────────────────────────────────────────
         CREATOR FORM MODAL OVERLAY
         ───────────────────────────────────────── */}
      {isCreating && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <Card className="max-w-4xl w-full max-h-[85vh] flex flex-col border-2 rounded-[2.5rem] bg-card shadow-2xl relative overflow-hidden text-left border-border/50">
            <CardHeader className="p-8 border-b bg-muted/20 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black font-headline uppercase tracking-tight flex items-center gap-3">
                  <Plus className="text-primary h-6 w-6" /> {editingAgreementId ? 'Edit Project Document' : 'Compose Project Document'}
                </CardTitle>
                <CardDescription className="text-xs">Dynamic specifications, quotations, and contract generator.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setIsCreating(false); setEditingAgreementId(null); }} className="rounded-full h-10 w-10">
                <X size={20} />
              </Button>
            </CardHeader>

            <CardContent className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              
              {/* Client Info Section */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-2"><User size={14} /> 1. Client & Partner Node</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase ml-1">Client Legal Name</Label>
                    <Input value={creatingDoc.clientName} onChange={e => setCreatingDoc({...creatingDoc, clientName: e.target.value})} placeholder="e.g. Agness Liundi" className="h-12 rounded-2xl border-2" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase ml-1">Organization / Brand</Label>
                    <Input value={creatingDoc.clientBusiness} onChange={e => setCreatingDoc({...creatingDoc, clientBusiness: e.target.value})} placeholder="e.g. Pulse Network" className="h-12 rounded-2xl border-2" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase ml-1">Email Address</Label>
                    <Input value={creatingDoc.clientEmail} onChange={e => setCreatingDoc({...creatingDoc, clientEmail: e.target.value})} placeholder="info@pulsenetwork.org" className="h-12 rounded-2xl border-2" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase ml-1">WhatsApp / Phone</Label>
                    <Input value={creatingDoc.clientPhone} onChange={e => setCreatingDoc({...creatingDoc, clientPhone: e.target.value})} placeholder="+255..." className="h-12 rounded-2xl border-2" />
                  </div>
                </div>
              </div>

              {/* Project Specifications */}
              <div className="space-y-6 pt-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-2"><Target size={14} /> 2. Technical Specifications & PRD</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <Label className="text-xs font-bold uppercase ml-1">Project Title</Label>
                    <Input value={creatingDoc.projectTitle} onChange={e => setCreatingDoc({...creatingDoc, projectTitle: e.target.value})} placeholder="e.g. Pulse Network Website Project" className="h-12 rounded-2xl border-2" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-xs font-bold uppercase ml-1">Service Type Node</Label>
                    <Input value={creatingDoc.serviceType} onChange={e => setCreatingDoc({...creatingDoc, serviceType: e.target.value})} placeholder="e.g. Complete Web Infrastructure & System" className="h-12 rounded-2xl border-2" />
                  </div>

                  {/* AI SOLUTION SPEC GENERATOR HELPER CARD */}
                  <div className="col-span-2 p-6 rounded-3xl bg-primary/5 border-2 border-dashed border-primary/20 space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-primary animate-pulse" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Gemini-2.5-Flash Spec Generator</h4>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">
                      Provide a Project Title and Optional Service Type/Description, then let Gemini generate a high-end mission statement, key feature lists, strategic target audiences, and deep system overview.
                    </p>
                    <Button
                      type="button"
                      disabled={aiGeneratingSpec || !creatingDoc.projectTitle.trim()}
                      onClick={async () => {
                        if (!creatingDoc.projectTitle.trim()) return;
                        setAiGeneratingSpec(true);
                        toast({ title: "AI Blueprint Active", description: "Architecting specifications..." });
                        try {
                          const result = await aiGenerateAgreement(
                            creatingDoc.projectTitle, 
                            creatingDoc.description, 
                            creatingDoc.serviceType
                          );
                          setCreatingDoc(prev => ({
                            ...prev,
                            projectMission: result.projectMission,
                            features: result.features,
                            targetAudience: result.targetAudience,
                            description: result.description
                          }));
                          toast({ title: "AI Integration Complete", description: "All blueprint fields pre-filled successfully." });
                        } catch (err: any) {
                          console.error(err);
                          toast({ variant: "destructive", title: "AI Spec Error", description: err.message || "Failed to generate spec blueprint." });
                        } finally {
                          setAiGeneratingSpec(false);
                        }
                      }}
                      className="w-full h-12 rounded-2xl font-black uppercase tracking-wider text-[10px] bg-primary text-white gap-2 shadow-lg shadow-primary/10"
                    >
                      {aiGeneratingSpec ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles size={14} />}
                      AI Generate Specs & Mission Statement
                    </Button>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-xs font-bold uppercase ml-1">Project Mission Statement</Label>
                    <Textarea value={creatingDoc.projectMission} onChange={e => setCreatingDoc({...creatingDoc, projectMission: e.target.value})} className="min-h-[80px] rounded-2xl border-2" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-xs font-bold uppercase ml-1">Technical Narrative Overview</Label>
                    <Textarea value={creatingDoc.description} onChange={e => setCreatingDoc({...creatingDoc, description: e.target.value})} placeholder="Kujenga website ya kisasa yenye..." className="min-h-[100px] rounded-2xl border-2" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-xs font-bold uppercase ml-1">Core Features (Comma Separated)</Label>
                    <Textarea value={creatingDoc.features} onChange={e => setCreatingDoc({...creatingDoc, features: e.target.value})} className="min-h-[80px] rounded-2xl border-2" />
                  </div>
                </div>
              </div>

              {/* Quotation & Pricing matrix */}
              <div className="space-y-6 pt-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-2"><DollarSign size={14} /> 3. Quotation & pricing (TZS)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase ml-1">Design & Development</Label>
                    <Input type="number" value={creatingDoc.designPrice} onChange={e => setCreatingDoc({...creatingDoc, designPrice: e.target.value})} className="h-12 rounded-2xl border-2" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase ml-1">Features Integration</Label>
                    <Input type="number" value={creatingDoc.featuresPrice} onChange={e => setCreatingDoc({...creatingDoc, featuresPrice: e.target.value})} className="h-12 rounded-2xl border-2" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase ml-1">Domain & Hosting (1 Yr)</Label>
                    <Input type="number" value={creatingDoc.domainPrice} onChange={e => setCreatingDoc({...creatingDoc, domainPrice: e.target.value})} className="h-12 rounded-2xl border-2" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase ml-1">Business Email Setup</Label>
                    <Input type="number" value={creatingDoc.emailPrice} onChange={e => setCreatingDoc({...creatingDoc, emailPrice: e.target.value})} className="h-12 rounded-2xl border-2" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase ml-1">Launch Services (SEO)</Label>
                    <Input type="number" value={creatingDoc.launchPrice} onChange={e => setCreatingDoc({...creatingDoc, launchPrice: e.target.value})} className="h-12 rounded-2xl border-2" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase ml-1">Special Discount</Label>
                    <Input type="number" value={creatingDoc.discount} onChange={e => setCreatingDoc({...creatingDoc, discount: e.target.value})} className="h-12 rounded-2xl border-2 text-green-700 font-bold" />
                  </div>
                </div>
              </div>

              {/* Payment Schedule */}
              <div className="space-y-6 pt-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-2"><Calendar size={14} /> 4. Payment Milestones</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Step 1 */}
                  <div className="p-4 rounded-2xl bg-muted/20 border space-y-3">
                    <Label className="text-[10px] font-black text-primary uppercase tracking-widest">Milestone 1 (Deposit)</Label>
                    <Input value={creatingDoc.depositPercent} onChange={e => setCreatingDoc({...creatingDoc, depositPercent: e.target.value})} placeholder="50%" className="h-10 rounded-xl" />
                    <Input value={creatingDoc.depositAmount} onChange={e => setCreatingDoc({...creatingDoc, depositAmount: e.target.value})} placeholder="Amount TZS" className="h-10 rounded-xl" />
                    <Input value={creatingDoc.depositWhen} onChange={e => setCreatingDoc({...creatingDoc, depositWhen: e.target.value})} placeholder="When due" className="h-10 rounded-xl" />
                  </div>
                  {/* Step 2 */}
                  <div className="p-4 rounded-2xl bg-muted/20 border space-y-3">
                    <Label className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Milestone 2 (Mid-Way)</Label>
                    <Input value={creatingDoc.midPercent} onChange={e => setCreatingDoc({...creatingDoc, midPercent: e.target.value})} placeholder="30%" className="h-10 rounded-xl" />
                    <Input value={creatingDoc.midAmount} onChange={e => setCreatingDoc({...creatingDoc, midAmount: e.target.value})} placeholder="Amount TZS" className="h-10 rounded-xl" />
                    <Input value={creatingDoc.midWhen} onChange={e => setCreatingDoc({...creatingDoc, midWhen: e.target.value})} placeholder="When due" className="h-10 rounded-xl" />
                  </div>
                  {/* Step 3 */}
                  <div className="p-4 rounded-2xl bg-muted/20 border space-y-3">
                    <Label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Milestone 3 (Final)</Label>
                    <Input value={creatingDoc.finalPercent} onChange={e => setCreatingDoc({...creatingDoc, finalPercent: e.target.value})} placeholder="20%" className="h-10 rounded-xl" />
                    <Input value={creatingDoc.finalAmount} onChange={e => setCreatingDoc({...creatingDoc, finalAmount: e.target.value})} placeholder="Amount TZS" className="h-10 rounded-xl" />
                    <Input value={creatingDoc.finalWhen} onChange={e => setCreatingDoc({...creatingDoc, finalWhen: e.target.value})} placeholder="When due" className="h-10 rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="space-y-6 pt-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-2"><PenTool size={14} /> 5. Handshake Signatures</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase ml-1">Client Printed Signatory</Label>
                    <Input value={creatingDoc.signatureName} onChange={e => setCreatingDoc({...creatingDoc, signatureName: e.target.value})} placeholder="e.g. Agness Liundi" className="h-12 rounded-2xl border-2" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase ml-1">Document Registry ID (Auto Generated)</Label>
                    <Input readOnly value={newDocId} className="h-12 rounded-2xl border-2 bg-muted/40 font-mono text-sm" />
                  </div>
                </div>
              </div>

            </CardContent>

             <CardFooter className="p-8 border-t bg-muted/20 flex justify-end gap-3 rounded-b-[2.5rem]">
              <Button variant="ghost" onClick={() => { setIsCreating(false); setEditingAgreementId(null); }} className="rounded-xl h-12 font-bold px-6">
                Abort
              </Button>
              <Button onClick={handleDeployDoc} disabled={savingDoc} className="rounded-xl h-12 font-black uppercase tracking-wider px-8 bg-primary text-white shadow-xl shadow-primary/10">
                {savingDoc ? <Loader2 className="animate-spin h-5 w-5" /> : (editingAgreementId ? 'Update Specs' : 'Deploy Project Document')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ─────────────────────────────────────────
         INTERACTIVE A4 PRINT PREVIEW OVERLAY
         ───────────────────────────────────────── */}
      {previewDoc && (
        <div className="fixed inset-0 z-[6000] bg-zinc-950/95 overflow-y-auto flex justify-center p-0 md:p-10 text-slate-900 border-none print:p-0 print:bg-white print:overflow-visible">
          
          <div className="max-w-4xl w-full flex flex-col gap-6 print:gap-0 relative">
            
            {/* Top Toolbar (Hidden in Print) */}
            <div className="flex justify-between items-center bg-zinc-900 border border-white/10 p-4 rounded-3xl sticky top-4 z-[6100] shadow-2xl print:hidden mx-4 md:mx-0">
              <div className="flex items-center gap-3">
                <Printer className="text-green-500 h-5 w-5 animate-pulse" />
                <div>
                  <p className="text-[9px] font-black text-white/40 tracking-[0.4em] uppercase">PRINT_TERMINAL</p>
                  <p className="text-xs font-black text-white uppercase tracking-widest">Interactive Handshake Contract</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => window.print()} 
                  className="bg-green-700 hover:bg-green-800 text-white rounded-2xl h-11 px-6 font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl"
                >
                  <Printer size={14} /> Print A4 Contract
                </Button>
                <Button variant="ghost" onClick={() => setPreviewDoc(null)} className="h-11 w-11 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 close-preview-btn">
                  <X size={20} />
                </Button>
              </div>
            </div>

            {/* A4 PRINT LAYOUT CONTAINER */}
            <div className="document bg-white rounded-3xl overflow-hidden shadow-2xl border print:border-none print:shadow-none print:rounded-none mx-4 md:mx-0 print:mx-0">
              
              {/* Document Header */}
              <div className="header text-white text-center p-10 relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-700">
                <div className="logo-area flex justify-center items-center gap-8 mb-6 flex-wrap print:gap-4 print:mb-4">
                  
                  {/* Service Provider Logo upload */}
                  <div className="logo-placeholder w-20 h-20 bg-white/15 border-2 border-dashed border-white/40 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-white/25 relative overflow-hidden print:w-16 print:h-16" onClick={() => document.getElementById('ideazzyLogoPreview')?.click()}>
                    {ideazzyLogoUrl ? <img src={ideazzyLogoUrl} className="absolute inset-0 w-full h-full object-cover rounded-full" alt="Ideazzy" /> : <span className="text-[9px] text-white/60 font-black text-center leading-tight">Ideazzy<br/>Logo</span>}
                  </div>
                  <input type="file" id="ideazzyLogoPreview" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'ideazzy')} />
                  
                  <div className="partnership text-white/60 text-xl font-light">×</div>
                  
                  {/* Client Logo upload */}
                  <div className="logo-placeholder w-20 h-20 bg-white/15 border-2 border-dashed border-white/40 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-white/25 relative overflow-hidden print:w-16 print:h-16" onClick={() => document.getElementById('pulseLogoPreview')?.click()}>
                    {pulseLogoUrl ? <img src={pulseLogoUrl} className="absolute inset-0 w-full h-full object-cover rounded-full" alt="Pulse" /> : <span className="text-[9px] text-white/60 font-black text-center leading-tight">Client<br/>Logo</span>}
                  </div>
                  <input type="file" id="pulseLogoPreview" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'pulse')} />

                </div>

                <h1 className="text-3xl font-black font-headline text-white uppercase tracking-wider">{previewDoc.project?.title || 'Website Project'}</h1>
                <h2 className="text-xs font-bold text-white/80 uppercase tracking-[0.3em] mt-2">Complete Project Handshake Specification</h2>
                <div className="w-16 h-1 bg-yellow-500 mx-auto mt-4 rounded-full" />
              </div>

              {/* Meta bar */}
              <div className="meta-bar bg-green-50/50 border-b-2 border-green-200/50 px-10 py-5 flex justify-between items-center flex-wrap gap-4 text-left">
                <div className="meta-item">
                  <span className="meta-label text-[9px] font-black uppercase text-green-700 tracking-wider">Document No</span>
                  <span className="meta-value text-xs font-black font-headline text-green-900">{previewDoc.agreementId || 'IDZ-DOC-PN'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label text-[9px] font-black uppercase text-green-700 tracking-wider">Issue Date</span>
                  <span className="meta-value text-xs font-black font-headline text-green-900">
                    {previewDoc.submittedAt ? format(previewDoc.submittedAt.toDate(), 'MMMM dd, yyyy') : format(new Date(), 'MMMM dd, yyyy')}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label text-[9px] font-black uppercase text-green-700 tracking-wider">Valid Until</span>
                  <span className="meta-value text-xs font-black font-headline text-green-900">
                    {format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'MMMM dd, yyyy')}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="status-badge bg-yellow-100 text-yellow-800 border border-yellow-300 font-black text-[9px] tracking-wider uppercase px-3 py-1 rounded-full">
                    ● Pending Signature
                  </span>
                </div>
              </div>

              {/* Tabs Navigation (Hidden in Print) */}
              <div className="tabs-nav border-b flex overflow-x-auto print:hidden">
                {[
                  { id: 'overview', label: '📋 Overview' },
                  { id: 'prd', label: '📐 PRD' },
                  { id: 'quotation', label: '💰 Quotation' },
                  { id: 'agreement', label: '📜 Agreement' },
                  { id: 'signatures', label: '✍️ Signatures' }
                ].map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => setPreviewActiveTab(t.id)}
                    className={cn(
                      "flex-1 text-center font-black uppercase text-[10px] tracking-widest py-4 border-b-4 transition-all whitespace-nowrap px-6",
                      previewActiveTab === t.id 
                        ? "border-green-700 bg-green-50 text-green-900 font-bold" 
                        : "border-transparent text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Content Panel (Renders all divs sequentially on window.print()) */}
              <div className="content p-10 md:p-12 text-left">
                
                {/* ── TAB 1: OVERVIEW ── */}
                <div className={cn("tab-content", previewActiveTab === 'overview' ? 'active' : 'hidden print:block print:page-break-after-always')}>
                  <div className="section-title flex items-center gap-3 border-b-2 border-slate-100 pb-3 mb-6">
                    <div className="section-icon w-8 h-8 rounded-lg bg-green-800 text-white flex items-center justify-center font-bold text-sm">📋</div>
                    <h3 className="text-green-900 font-black uppercase tracking-wider text-base">Project Overview</h3>
                  </div>

                  <div className="info-grid grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:grid-cols-2">
                    {/* Provider */}
                    <div className="info-card p-6 rounded-2xl bg-green-50/50 border-l-4 border-green-800">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-green-800 mb-4">⚡ Service Provider</h4>
                      {[
                        ['Name', 'Mwijay Davie'],
                        ['Brand', 'Ideazzy Digital Solutions'],
                        ['Location', 'Dar es Salaam, TZ'],
                        ['Phone', '+255 620 641 695']
                      ].map(([k,v]) => (
                        <div key={k} className="info-row flex justify-between py-1.5 border-b border-dashed border-slate-200 text-xs last:border-0">
                          <span className="label text-slate-500 font-bold">{k}:</span>
                          <span className="value text-green-950 font-bold">{v}</span>
                        </div>
                      ))}
                    </div>
                    {/* Client */}
                    <div className="info-card p-6 rounded-2xl bg-amber-50/50 border-l-4 border-amber-600">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-800 mb-4">🌱 Contracting Partner</h4>
                      {[
                        ['Name', previewDoc.client?.name],
                        ['Organization', previewDoc.client?.businessName],
                        ['Location', previewDoc.client?.city || 'Tanzania'],
                        ['Phone', previewDoc.client?.phone]
                      ].map(([k,v]) => (
                        <div key={k} className="info-row flex justify-between py-1.5 border-b border-dashed border-slate-200 text-xs last:border-0">
                          <span className="label text-slate-500 font-bold">{k}:</span>
                          <span className="value text-amber-950 font-bold">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="section-block space-y-3 mb-8">
                    <h4 className="text-xs font-black text-green-800 uppercase tracking-widest">🎯 Project Mission Statement</h4>
                    <p className="text-sm leading-relaxed text-slate-700 font-medium">
                      {previewDoc.project?.projectMission || 'Kujenga website ya kisasa, professional, na yenye credibility.'}
                    </p>
                  </div>

                  <div className="section-block space-y-4 mb-8">
                    <h4 className="text-xs font-black text-green-800 uppercase tracking-widest">🌍 Strategic Target Audience</h4>
                    <div className="feature-list grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-green-900 font-bold print:grid-cols-2">
                      {previewDoc.project?.targetAudience?.split(',').map((aud: string) => (
                        <div key={aud} className="flex items-center gap-2 p-3 rounded-xl bg-green-50/30 border border-green-100">
                          ✓ {aud.trim()}
                        </div>
                      )) || <div className="p-3 rounded-xl bg-green-50/30 border border-green-100">✓ Youth, Communities, partners & Donors</div>}
                    </div>
                  </div>

                  <div className="highlight-box bg-green-50 border-l-4 border-green-700 text-green-900 p-5 rounded-2xl text-xs font-medium leading-relaxed mb-4 flex gap-3">
                    <span>✅</span>
                    <p>
                      <strong>Document Handshake Protocol:</strong> Document hii inashikilia Specs, PRD, Quotation, legal agreements, na digital verification. Ruka kwenye tabs au bofya "Print" ili kutengeneza makubaliano rasmi.
                    </p>
                  </div>
                </div>

                {/* ── TAB 2: PRD ── */}
                <div className={cn("tab-content", previewActiveTab === 'prd' ? 'active' : 'hidden print:block print:page-break-after-always')}>
                  <div className="section-title flex items-center gap-3 border-b-2 border-slate-100 pb-3 mb-6">
                    <div className="section-icon w-8 h-8 rounded-lg bg-green-800 text-white flex items-center justify-center font-bold text-sm">📐</div>
                    <h3 className="text-green-900 font-black uppercase tracking-wider text-base">Product Requirements (PRD)</h3>
                  </div>

                  <div className="section-block space-y-3 mb-8">
                    <h4 className="text-xs font-black text-green-800 uppercase tracking-widest">🏠 1. Scope Architecture & Core Pages</h4>
                    <div className="pages-grid grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4">
                      {['Home', 'About Us', 'Programs', 'Team', 'Gallery', 'Blog/News', 'Join Us', 'Contact'].map(p => (
                        <div key={p} className="page-card p-4 rounded-xl border border-slate-100 text-center font-bold text-xs text-green-950 bg-slate-50/40 hover:border-green-600/30 hover:shadow-md transition-all">
                          <div className="text-2xl mb-1">📄</div>
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="section-block space-y-3 mb-8">
                    <h4 className="text-xs font-black text-green-800 uppercase tracking-widest">⚙️ 2. Core Functional Requirements</h4>
                    <div className="feature-list grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-green-950 font-bold print:grid-cols-2">
                      {previewDoc.project?.features?.split(',').map((f: string) => (
                        <div key={f} className="p-3 bg-green-50/20 border rounded-xl flex items-center gap-2">
                          ✓ {f.trim()}
                        </div>
                      )) || <div className="p-3 bg-green-50/20 border rounded-xl">✓ Standard specifications active</div>}
                    </div>
                  </div>

                  <div className="section-block space-y-3 mb-8">
                    <h4 className="text-xs font-black text-green-800 uppercase tracking-widest">🛠️ 3. Industrial Tech Stack Matrix</h4>
                    <div className="tech-grid grid grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3">
                      {[
                        { t: 'Next.js 15', d: 'Frontend framework', i: '⚛️' },
                        { t: 'Tailwind CSS', d: 'Premium styling', i: '🎨' },
                        { t: 'Firebase Admin', d: 'Secure database', i: '🔥' },
                        { t: 'Vercel CDN', d: 'Production hosting', i: '🚀' },
                        { t: 'Cloudflare', d: 'VPC Security', i: '🛡️' },
                        { t: 'Nodemailer API', d: 'Mail gateways', i: '📧' }
                      ].map(tech => (
                        <div key={tech.t} className="tech-card p-4 rounded-xl border border-slate-100 bg-slate-50/50 text-center">
                          <div className="text-2xl mb-1">{tech.i}</div>
                          <p className="text-xs font-black text-green-900">{tech.t}</p>
                          <p className="text-[10px] text-slate-500">{tech.d}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── TAB 3: QUOTATION ── */}
                <div className={cn("tab-content", previewActiveTab === 'quotation' ? 'active' : 'hidden print:block print:page-break-after-always')}>
                  <div className="section-title flex items-center gap-3 border-b-2 border-slate-100 pb-3 mb-6">
                    <div className="section-icon w-8 h-8 rounded-lg bg-green-800 text-white flex items-center justify-center font-bold text-sm">💰</div>
                    <h3 className="text-green-900 font-black uppercase tracking-wider text-base">Project Quotation</h3>
                  </div>

                  <div className="pricing-summary p-8 rounded-3xl bg-gradient-to-br from-green-900 to-green-800 text-white shadow-xl mb-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/80 mb-6">📊 Structured Cost Sheet</h4>
                    <div className="pricing-rows flex flex-col gap-3.5">
                      {[
                        ['Website Design & Development', previewDoc.pricing?.designPrice || 340000],
                        ['Features Integration', previewDoc.pricing?.featuresPrice || 115000],
                        ['Domain & Hosting (1 Year)', previewDoc.pricing?.domainPrice || 60000],
                        ['Business Email Setup', previewDoc.pricing?.emailPrice || 20000],
                        ['Launch Services & SEO', previewDoc.pricing?.launchPrice || 65000]
                      ].map(([label, val]) => (
                        <div key={label} className="pricing-row flex justify-between py-2 border-b border-white/10 text-xs">
                          <span className="label opacity-90">{label}</span>
                          <span className="value font-mono font-black">{fmt(val)}</span>
                        </div>
                      ))}
                      <div className="pricing-row flex justify-between py-2 border-b border-white/10 text-xs text-yellow-400 font-black">
                        <span className="label">🎁 NGO Special Discount Offer</span>
                        <span className="value font-mono font-black">-{fmt(previewDoc.pricing?.discount || 100000)}</span>
                      </div>
                      
                      {/* Final Price calculation */}
                      <div className="pricing-row flex justify-between py-4 border-t-2 border-white/30 text-xl md:text-2xl font-black mt-2">
                        <span className="label font-headline">FINAL BUDGET</span>
                        <span className="value font-mono">
                          {fmt(
                            (previewDoc.pricing?.designPrice || 340000) +
                            (previewDoc.pricing?.featuresPrice || 115000) +
                            (previewDoc.pricing?.domainPrice || 60000) +
                            (previewDoc.pricing?.emailPrice || 20000) +
                            (previewDoc.pricing?.launchPrice || 65000) -
                            (previewDoc.pricing?.discount || 100000)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="section-block space-y-4">
                    <h4 className="text-xs font-black text-green-800 uppercase tracking-widest">💳 Milestone Payment Schedule</h4>
                    <div className="payment-schedule grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
                      {/* Deposit */}
                      <div className="payment-step p-6 rounded-2xl bg-white border border-slate-100 border-t-4 border-t-green-700 text-center shadow-lg shadow-slate-100">
                        <div className="step-percent text-3xl font-black text-green-800">{previewDoc.paymentSchedule?.depositPercent || '50%'}</div>
                        <div className="step-label text-[9px] font-black uppercase text-slate-500 tracking-wider my-2">Milestone 1: Deposit</div>
                        <div className="step-amount text-sm font-black text-green-950">{fmt(previewDoc.paymentSchedule?.depositAmount || 250000)}</div>
                        <div className="step-when text-[10px] text-slate-500 font-medium mt-2">{previewDoc.paymentSchedule?.depositWhen || 'Kabla ya kuanza kazi'}</div>
                      </div>
                      {/* Mid */}
                      <div className="payment-step p-6 rounded-2xl bg-white border border-slate-100 border-t-4 border-t-amber-600 text-center shadow-lg shadow-slate-100">
                        <div className="step-percent text-3xl font-black text-amber-700">{previewDoc.paymentSchedule?.midPercent || '30%'}</div>
                        <div className="step-label text-[9px] font-black uppercase text-slate-500 tracking-wider my-2">Milestone 2: Progress</div>
                        <div className="step-amount text-sm font-black text-green-950">{fmt(previewDoc.paymentSchedule?.midAmount || 150000)}</div>
                        <div className="step-when text-[10px] text-slate-500 font-medium mt-2">{previewDoc.paymentSchedule?.midWhen || 'Baada ya design kukubaliwa'}</div>
                      </div>
                      {/* Final */}
                      <div className="payment-step p-6 rounded-2xl bg-white border border-slate-100 border-t-4 border-t-blue-600 text-center shadow-lg shadow-slate-100">
                        <div className="step-percent text-3xl font-black text-blue-700">{previewDoc.paymentSchedule?.finalPercent || '20%'}</div>
                        <div className="step-label text-[9px] font-black uppercase text-slate-500 tracking-wider my-2">Milestone 3: Finality</div>
                        <div className="step-amount text-sm font-black text-green-950">{fmt(previewDoc.paymentSchedule?.finalAmount || 100000)}</div>
                        <div className="step-when text-[10px] text-slate-500 font-medium mt-2">{previewDoc.paymentSchedule?.finalWhen || 'Website ikiwa live'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── TAB 4: SERVICE AGREEMENT ── */}
                <div className={cn("tab-content", previewActiveTab === 'agreement' ? 'active' : 'hidden print:block print:page-break-after-always')}>
                  <div className="section-title flex items-center gap-3 border-b-2 border-slate-100 pb-3 mb-6">
                    <div className="section-icon w-8 h-8 rounded-lg bg-green-800 text-white flex items-center justify-center font-bold text-sm">📜</div>
                    <h3 className="text-green-900 font-black uppercase tracking-wider text-base">Service Agreement Terms</h3>
                  </div>

                  <div className="section-block">
                    <ol className="terms-list space-y-4">
                      {[
                        { t: 'Scope of Work', d: 'Mtoa huduma (Mwijay Davie) atajenga project kulingana na spec na core features zilizotajwa kwenye PRD tab. Kazi ya nyongeza itahitaji review tofauti.' },
                        { t: 'Payment Terms & Security', d: '50% deposit kabla ya kazi, 30% katikati ya mradi, na 20% kabla ya kukabidhi domain/hosting na source code.' },
                        { t: 'Domain Ownership Node', d: 'Domain litasajiliwa kwa jina la mteja. Platform na database access inakuwa mali ya client baada ya malipo kamili.' },
                        { t: 'Support & Revisions', d: 'Toleo hili linakuja na 30-days support baada ya launch kurekebisha bugs au issues zitakazojitokeza.' }
                      ].map((term, i) => (
                        <li key={i} className="flex gap-4 p-5 bg-slate-50/50 border rounded-2xl border-l-4 border-l-green-700 text-xs leading-relaxed text-slate-700 font-medium">
                          <span className="font-bold text-green-800 font-mono text-sm">0{i+1}</span>
                          <div>
                            <p className="font-black text-green-950 uppercase tracking-wide mb-1">{term.t}</p>
                            <p>{term.d}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* ── TAB 5: SIGNATURES ── */}
                <div className={cn("tab-content", previewActiveTab === 'signatures' ? 'active' : 'hidden print:block')}>
                  <div className="section-title flex items-center gap-3 border-b-2 border-slate-100 pb-3 mb-6">
                    <div className="section-icon w-8 h-8 rounded-lg bg-green-800 text-white flex items-center justify-center font-bold text-sm">✍️</div>
                    <h3 className="text-green-900 font-black uppercase tracking-wider text-base">Contract Handshake Authentication</h3>
                  </div>

                  <div className="signature-grid grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:grid-cols-2">
                    
                    {/* Client Signature Card */}
                    <div className="sig-card p-6 bg-amber-50/20 border border-amber-200/50 rounded-2xl flex flex-col justify-between h-56">
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-700">Client Signatory Block</span>
                      <div className="border-b-2 border-slate-900 pb-4 text-center my-auto">
                        {previewDoc.signature?.dataUri ? (
                          <img src={previewDoc.signature.dataUri} className="h-16 object-contain mx-auto filter grayscale" alt="Client Sig" />
                        ) : (
                          <p className="text-3xl font-headline italic font-bold text-slate-900">{previewDoc.signature?.typedName || previewDoc.client?.name}</p>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black text-amber-900 uppercase">
                        <span>{previewDoc.client?.name}</span>
                        <span className="text-green-700">Electronically Verified ✓</span>
                      </div>
                    </div>

                    {/* Service Provider Signature Card */}
                    <div className="sig-card p-6 bg-green-50/20 border border-green-200/50 rounded-2xl flex flex-col justify-between h-56">
                      <span className="text-[9px] font-black uppercase tracking-widest text-green-700">Architect Signatory Block</span>
                      <div className="border-b-2 border-slate-900 pb-4 text-center my-auto flex items-center justify-center relative">
                        {previewAdminSig ? (
                          <img src={previewAdminSig} className="h-16 object-contain" alt="Admin Sig" />
                        ) : (
                          <div className="text-center">
                            <Button size="sm" onClick={() => setShowPreviewSigPad(true)} className="rounded-xl bg-green-800 text-white text-[10px] font-bold">
                              Sign Document
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black text-green-900 uppercase">
                        <span>David Erick Mwijage</span>
                        <span className="text-green-700">Service Provider Signature</span>
                      </div>
                    </div>

                  </div>

                  {showPreviewSigPad && (
                    <div className="p-6 bg-slate-50 border rounded-2xl mt-4">
                      <SignaturePad 
                        onSave={(sig) => {
                          setPreviewAdminSig(sig);
                          setShowPreviewSigPad(false);
                          toast({ title: "Authorized Signature Ready!" });
                        }} 
                      />
                    </div>
                  )}

                  <div className="digital-note bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold leading-relaxed p-5 rounded-2xl text-center">
                    📢 **Handshake Security**: Document na saini hizi zinashikiliwa kwa njia ya kimtandao kwenye **Ideazzy Digital Registry** (Dar es Salaam).
                  </div>
                </div>

              </div>

              {/* Document Footer */}
              <div className="footer bg-slate-900 text-white p-6 flex justify-between items-center flex-wrap gap-4 text-xs font-mono">
                <p className="opacity-50">IDEAZZY CONTRACT GATEWAY · Dar es Salaam, Tanzania · 2026</p>
                <p className="text-green-500 font-bold">#{previewDoc.agreementId}</p>
              </div>

            </div>

            {/* Back Button (Floating Close) */}
            <div className="pt-6 pb-20 flex justify-center print:hidden">
              <Button variant="outline" onClick={() => setPreviewDoc(null)} className="h-14 rounded-full border-2 font-black uppercase tracking-widest text-xs px-10 text-white hover:bg-white/10 hover:text-white bg-zinc-900">
                Close Preview Terminal
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
