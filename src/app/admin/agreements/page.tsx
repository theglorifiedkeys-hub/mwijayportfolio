'use client';

import React, { useState, useRef } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { 
  FileText, Search, 
  CheckCircle2, Clock, XCircle, 
  Loader2, User, MapPin, Target, DollarSign, 
  ArrowLeft, Calendar,
  PenTool, Trash2, Pen, Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { AgreementPDF } from '@/components/agreement-pdf';

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
    ctx.strokeStyle = '#3b82f6';
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
        Draw Your Signature Below
      </p>
      <div className="relative rounded-2xl border-2 border-dashed border-primary/30 bg-muted/10 overflow-hidden">
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
              <Pen size={14} /> Sign here
            </p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={clear} className="rounded-xl text-xs font-bold h-9">
          Clear
        </Button>
        <Button size="sm" onClick={save} disabled={!hasSig} className="rounded-xl text-xs font-bold h-9">
          Save Signature
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
  const [adminSig, setAdminSig]   = useState<string | null>(null);
  const [showSigPad, setShowSigPad] = useState(false);
  const { toast } = useToast();

  const agreementsRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'agreements');
  }, [db]);

  const agreementsQuery = useMemoFirebase(() => {
    if (!agreementsRef) return null;
    return query(agreementsRef, orderBy('submittedAt', 'desc'));
  }, [agreementsRef]);

  const { data: agreements, isLoading } = useCollection(agreementsQuery);

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
      toast({ title: "Registry Updated" });
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

  if (isLoading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">

      {/* List Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tighter uppercase text-foreground">
            Agreement <span className="text-primary">Registry</span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Manage project intake signals and legal service contracts.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search registry..."
            className="pl-10 h-12 rounded-xl border-2"
          />
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
              <p className="font-black uppercase tracking-[0.3em] text-sm">Select a Signal to Decode</p>
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

                  {/* ── VECTOR PDF EXPORT NODE ── */}
                  {adminSig ? (
                    <PDFDownloadLink
                      document={<AgreementPDF agreement={selected} adminSignature={adminSig} />}
                      fileName={`Agreement_${selected.agreementId}.pdf`}
                    >
                      {({ loading }) => (
                        <Button
                          size="icon" variant="outline"
                          className="rounded-xl h-10 w-10"
                          disabled={loading}
                          title="Download Vector PDF"
                        >
                          {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  ) : (
                    <Button
                      size="icon" variant="outline"
                      onClick={() => {
                        setShowSigPad(true);
                        toast({ 
                          title: "Signature Required", 
                          description: "Please add your signature before generating the vector PDF.",
                          variant: "destructive" 
                        });
                      }}
                      className="rounded-xl h-10 w-10"
                      title="Add signature to download"
                    >
                      <Download size={18} className="opacity-40" />
                    </Button>
                  )}

                  <select
                    value={selected.status}
                    onChange={e => updateStatus(selected.id!, e.target.value)}
                    className="h-10 bg-background border-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary"
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
                    <User size={14} /> Client Signal
                  </h5>
                  <div className="grid grid-cols-2 gap-6">
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
                    <Target size={14} /> Architecture Brief
                  </h5>
                  <div className="space-y-4">
                    <div><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Service Node</p><p className="text-sm font-black text-foreground">{selected.project?.serviceType}</p></div>
                    <div><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Narrative Description</p><p className="text-sm leading-relaxed font-medium bg-muted/30 p-5 rounded-2xl">{selected.project?.description}</p></div>
                    {selected.project?.features && <div><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Technical Features</p><p className="text-xs leading-relaxed font-bold bg-primary/5 p-5 rounded-2xl text-primary">{selected.project?.features}</p></div>}
                  </div>
                </section>

                {/* Financials */}
                <section className="space-y-6 pt-8 border-t border-border/50">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <DollarSign size={14} /> Financials & Timeline
                  </h5>
                  <div className="grid grid-cols-2 gap-6">
                    <div><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Investment Cluster</p><p className="text-sm font-black text-foreground uppercase">{selected.timeline?.budgetRange}</p></div>
                    <div><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Target Delivery</p><p className="text-sm font-bold flex items-center gap-1"><Calendar size={12} className="text-primary" /> {selected.timeline?.completionDate || 'Flexible'}</p></div>
                    <div className="col-span-2"><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Settlement Method</p><p className="text-xs font-black uppercase bg-primary/10 text-primary px-3 py-1.5 rounded-lg w-fit">{selected.timeline?.paymentMethod}</p></div>
                  </div>
                </section>

                {/* Client Signature */}
                <section className="space-y-6 pt-8 border-t border-border/50">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <PenTool size={14} /> Agreement Authentication
                  </h5>
                  <div className="p-8 rounded-3xl bg-muted/20 border-2 border-dashed flex flex-col items-center justify-center space-y-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Digital Identity Signature</p>
                    <p className="text-4xl md:text-5xl font-headline italic text-foreground tracking-tighter">{selected.signature?.typedName}</p>
                    <p className="text-[8px] font-bold text-green-500 uppercase tracking-widest px-2 py-1 rounded-full bg-green-500/10">
                      LEGAL_SIGNAL_AUTHENTICATED ✓
                    </p>
                  </div>
                </section>

                {/* Admin Signature */}
                <section className="space-y-4 pt-8 border-t border-border/50">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Pen size={14} /> Your Signature
                  </h5>

                  {adminSig ? (
                    <div className="space-y-3">
                      <div className="rounded-2xl border-2 border-green-500/30 bg-green-500/5 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={adminSig} alt="Your signature" className="h-12 object-contain" />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm" variant="outline"
                            onClick={() => setShowSigPad(!showSigPad)}
                            className="rounded-xl text-xs font-bold h-8"
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                      <p className="text-[8px] font-bold text-green-500 uppercase tracking-widest">
                        ✓ Signature ready — vector PDF node initialized
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-border/50 p-4">
                      <p className="text-[9px] font-bold text-muted-foreground mb-3">
                        No signature added yet. Sign before downloading vector PDF.
                      </p>
                      <Button
                        size="sm" variant="outline"
                        onClick={() => setShowSigPad(true)}
                        className="rounded-xl text-xs font-bold h-9 gap-2"
                      >
                        <Pen size={12} /> Add My Signature
                      </Button>
                    </div>
                  )}

                  {showSigPad && (
                    <div className="pt-2">
                      <SignaturePad
                        onSave={(sig) => {
                          setAdminSig(sig);
                          setShowSigPad(false);
                          toast({ title: "Signature Saved", description: "Vector PDF node ready for download." });
                        }}
                      />
                    </div>
                  )}
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
                    className="min-h-[140px] rounded-2xl border-2 resize-none p-5 leading-relaxed font-medium"
                  />
                </section>

              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
