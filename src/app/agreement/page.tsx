'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, ChevronRight, ShieldCheck, Download,
  Send, Loader2, CheckCircle2, Lock, LogIn,
  Check, AlertTriangle, Smartphone, Globe, Mail,
  User, Building2, MapPin, Zap, Code2, Brain,
  Palette, ShoppingBag, MoreHorizontal, ArrowRight,
  Sparkles, Star, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser, useAuth, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import BasicSignaturePad from '@/components/ui/signature-pad';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const SERVICE_TYPES = [
  { value: "web_dev",       label: "Web Development", icon: Globe,        desc: "Landing pages & corporate sites" },
  { value: "ecommerce",     label: "Online Store",         icon: ShoppingBag,  desc: "E-commerce & payments" },
  { value: "webapp",        label: "Web Application",      icon: Code2,        desc: "SaaS platforms & dashboards" },
  { value: "ai_automation", label: "AI & Automation",      icon: Brain,        desc: "n8n workflows & AI agents" },
  { value: "design",        label: "Graphic Design",       icon: Palette,      desc: "Branding & visual systems" },
  { value: "other",         label: "Other Services",       icon: MoreHorizontal, desc: "Custom scope & consultation" },
];

const OWNER_ID = "mwijay-davie-admin";

/* ─────────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────────── */
const steps = [
  { id: 1, label: "Identity",  icon: User },
  { id: 2, label: "Project",   icon: Code2 },
  { id: 3, label: "Authorize", icon: Shield },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const done    = current > s.id;
        const active  = current === s.id;
        return (
          <React.Fragment key={s.id}>
            <motion.div
              initial={false}
              animate={{
                scale: active ? 1.1 : 1,
              }}
              className="flex flex-col items-center gap-2 z-10"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all",
                  done   ? "bg-green-500 text-white"
                  : active ? "bg-primary text-primary-foreground shadow-primary/30"
                  : "bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check size={18} /> : <Icon size={18} />}
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                active ? "text-primary" : done ? "text-green-500" : "text-muted-foreground"
              )}>
                {s.label}
              </span>
            </motion.div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-2 rounded-full overflow-hidden bg-muted max-w-[80px]">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: current > s.id ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FLOATING LABEL INPUT
───────────────────────────────────────────── */
function FieldInput({
  label, value, onChange, placeholder, readOnly, type = "text", icon: Icon
}: {
  label: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; readOnly?: boolean; type?: string; icon?: any;
}) {
  return (
    <div className="space-y-2 group">
      <Label className="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-1.5">
        {Icon && <Icon size={10} />} {label}
      </Label>
      <div className="relative">
        <Input
          type={type}
          value={value}
          readOnly={readOnly}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-14 rounded-2xl border-2 px-5 font-medium text-sm transition-all",
            "focus:border-primary focus:ring-0 focus:ring-offset-0",
            "group-hover:border-primary/30",
            readOnly && "bg-muted/30 cursor-not-allowed text-muted-foreground"
          )}
        />
        {readOnly && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Lock size={12} className="text-muted-foreground/50" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function AgreementPage() {
  const { user, isUserLoading } = useUser();
  const auth  = useAuth();
  const db    = useFirestore();
  const { toast } = useToast();

  const [step,            setStep]            = useState(1);
  const [loading,         setLoading]         = useState(false);
  const [pdfLoading,      setPdfLoading]      = useState(false);
  const [submitted,       setSubmitted]       = useState(false);
  const [agreementId,     setAgreementId]     = useState('');
  const [isAuthenticating,setIsAuthenticating]= useState(false);

  const profileRef = useMemoFirebase(() => db ? doc(db, 'users', OWNER_ID) : null, [db]);
  const { data: profile } = useDoc(profileRef);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', city: '',
    serviceType: '', projectTitle: '', description: '', signatureDataUri: '',
  });

  useEffect(() => {
    if (user) setFormData(p => ({ ...p, name: user.displayName || '', email: user.email || '' }));
  }, [user]);

  useEffect(() => {
    const y = new Date().getFullYear();
    const r = Math.floor(1000 + Math.random() * 8999);
    setAgreementId(`MWJ-${y}-${r}-DAV`);
  }, []);

  const update = (key: keyof typeof formData, val: string) =>
    setFormData(p => ({ ...p, [key]: val }));

  const isTrash = (t: string) => t.length >= 5 && !!t.match(/[^aeiou\s]{6,}/gi);

  /* ── Auth ── */
  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsAuthenticating(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast({ title: "Identity Verified ✓" });
    } catch {
      toast({ variant: "destructive", title: "Authentication Failed" });
    } finally {
      setIsAuthenticating(false);
    }
  };

  /* ── PDF ── */
  const generatePDF = async () => {
    const el = document.getElementById('agreement-printable-node');
    if (!el) return;
    setPdfLoading(true);

    try {
      // Temporarily show the node off-screen for capture
      el.style.display = 'block';
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      el.style.top = '0';
      el.style.width = '794px'; // 210mm at 96dpi
      el.style.zIndex = '-1';

      // Small delay to ensure any images/rendering settle
      await new Promise(r => setTimeout(r, 600));

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth  = 210; 
      const pageHeight = 297; 
      const pxPerMm   = 794 / 210; // ~3.78

      const totalHeightPx = el.scrollHeight;
      const totalHeightMm = totalHeightPx / pxPerMm;
      const totalPages = Math.ceil(totalHeightMm / pageHeight);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();

        const canvas = await html2canvas(el, {
          scale: 2, // Sharp but reasonable size
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          y: i * pageHeight * pxPerMm,
          height: pageHeight * pxPerMm,
          windowHeight: el.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.85);

        pdf.addImage(
          imgData,
          'JPEG',
          0, 0,
          pageWidth, pageHeight,
          undefined,
          'FAST'
        );
      }

      pdf.save(`Agreement_${agreementId}.pdf`);
      toast({ title: "PDF Registry Sync Complete ✓" });

    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "PDF Export Failed" });
    } finally {
      // Re-hide the node
      const node = document.getElementById('agreement-printable-node');
      if (node) {
        node.style.display = 'none';
      }
      setPdfLoading(false);
    }
  };

  /* ── Navigation ── */
  const next = () => {
    if (step === 1) {
      if (!formData.name || !formData.phone) { toast({ title: "Please fill all fields", variant: "destructive" }); return; }
      if (isTrash(formData.name))            { toast({ title: "Invalid name signal detected", variant: "destructive" }); return; }
    }
    if (step === 2) {
      if (!formData.serviceType || !formData.projectTitle || !formData.description) { toast({ title: "All details required", variant: "destructive" }); return; }
      if (isTrash(formData.description) || isTrash(formData.projectTitle))          { toast({ title: "Please enter valid project logic", variant: "destructive" }); return; }
      if (formData.description.length < 30) { toast({ title: "Brief too short (min 30 chars)", variant: "destructive" }); return; }
    }
    setStep(s => s + 1);
  };
  const prev = () => setStep(s => s - 1);

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!db || !user) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'agreements', agreementId), {
        agreementId, uid: user.uid, status: 'PENDING_REVIEW',
        submittedAt: serverTimestamp(),
        client:    { name: formData.name, email: formData.email, phone: formData.phone, city: formData.city },
        project:   { serviceType: formData.serviceType, title: formData.projectTitle, description: formData.description },
        signature: { dataUri: formData.signatureDataUri, signedAt: serverTimestamp(), typedName: formData.name },
      });
      setSubmitted(true);
      toast({ title: "Agreement Registered ✓" });
    } catch {
      toast({ variant: "destructive", title: "Submission Error" });
    } finally {
      setLoading(false);
    }
  };

  /* ════════════════════════════════════════
     LOADING
  ════════════════════════════════════════ */
  if (isUserLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
        <Loader2 className="h-10 w-10 text-primary" />
      </motion.div>
    </div>
  );

  /* ════════════════════════════════════════
     AUTH WALL
  ════════════════════════════════════════ */
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative max-w-sm w-full"
      >
        <div className="bg-card border-2 border-border/50 rounded-[2.5rem] p-10 shadow-2xl text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent rounded-t-[2.5rem]" />
          <Lock className="h-12 w-12 text-primary mx-auto opacity-20" />
          <div className="space-y-3">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Identity Check</h2>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
              Sign in to securely generate and register your project agreement.
            </p>
          </div>
          <Button
            onClick={handleGoogleSignIn}
            disabled={isAuthenticating}
            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-xl"
          >
            {isAuthenticating ? <Loader2 className="animate-spin h-5 w-5" /> : <LogIn size={18} />}
            Sign In with Google
          </Button>
        </div>
      </motion.div>
    </div>
  );

  /* ════════════════════════════════════════
     SUCCESS STATE
  ════════════════════════════════════════ */
  if (submitted) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 text-center relative"
      >
        <div className="w-24 h-24 rounded-[2rem] bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center mx-auto shadow-2xl">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>

        <div className="space-y-3">
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">
            Agreement <span className="text-primary italic">Logged</span>
          </h2>
          <p className="text-muted-foreground font-medium text-sm leading-relaxed">
            Your project handshake is verified and stored in the Mwijay Registry.
          </p>
        </div>

        <div className="relative p-6 rounded-[2rem] bg-card border-2 border-primary/20 shadow-inner overflow-hidden">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-2">Registry ID</p>
          <p className="text-xl font-mono font-black text-primary">{agreementId}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Button
            disabled={pdfLoading}
            className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20"
            onClick={generatePDF}
          >
            {pdfLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Download size={18} />}
            Export PDF
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-2"
            asChild
          >
            <Link href="/">Return to Base</Link>
          </Button>
        </div>
      </motion.div>

      {/* ── HIDDEN PRINTABLE PDF NODE (RE-ENGINEERED FOR MULTI-PAGE) ── */}
      <div
        id="agreement-printable-node"
        style={{
          display: 'none',
          background: '#ffffff',
          fontFamily: "'Inter', system-ui, sans-serif",
          width: '794px',
        }}
      >
        {/* ══ PAGE 1: Handshake Genesis ══ */}
        <div style={{ width: '794px', minHeight: '1123px', background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ height: 6, background: 'linear-gradient(90deg, #0A0F1E 0%, #1A56DB 50%, #00C896 100%)' }} />

          <div style={{ padding: '40px 48px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {profile?.logoUrl ? (
                <img src={profile.logoUrl} style={{ height: 52, width: 'auto', objectFit: 'contain' }} alt="Logo" />
              ) : (
                <div style={{ width: 52, height: 52, background: '#0A0F1E', clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 28, height: 28, background: '#1A56DB', clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' }} />
                </div>
              )}
              <div>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#0A0F1E', letterSpacing: 5, lineHeight: 1 }}>MWIJAY</p>
                <p style={{ fontSize: 8, fontWeight: 700, color: '#64748B', letterSpacing: 3, marginTop: 4, textTransform: 'uppercase' }}>Systems Architecture & Automation</p>
                <p style={{ fontSize: 9, color: '#94A3B8', marginTop: 5 }}>theglorifiedkeys@gmail.com · +255 620 641 695</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-block', background: '#0A0F1E', color: '#FFFFFF', padding: '7px 18px', borderRadius: 8, fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                Official Agreement
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: '#1A56DB' }}>#{agreementId}</p>
              <p style={{ fontSize: 10, color: '#94A3B8', marginTop: 5 }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '12px 48px', display: 'flex', gap: 32, alignItems: 'center' }}>
            {[
              { label: 'STATUS',     value: 'PENDING REVIEW' },
              { label: 'SERVICE',    value: formData.serviceType },
              { label: 'CITY',       value: formData.city || '—' },
              { label: 'GENESIS',    value: new Date().toLocaleDateString() },
            ].map(({ label, value }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <div style={{ width: 1, height: 30, background: '#E2E8F0' }} />}
                <div>
                  <p style={{ fontSize: 7, fontWeight: 800, color: '#94A3B8', letterSpacing: 2, textTransform: 'uppercase' }}>{label}</p>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#0A0F1E', fontFamily: 'monospace', marginTop: 3 }}>{value}</p>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div style={{ padding: '28px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ padding: '20px 22px', background: '#F0F5FF', borderLeft: '4px solid #1A56DB', borderRadius: '0 10px 10px 0' }}>
              <p style={{ fontSize: 8, fontWeight: 800, color: '#1A56DB', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>The Architect — Provider</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#0D1117', marginBottom: 3 }}>David Erick Mwijage</p>
              <p style={{ fontSize: 9, fontStyle: 'italic', color: '#64748B', marginBottom: 10 }}>Lead Systems Architect</p>
              {[['Company','Mwijay Services'],['Location','Dar es Salaam'],['Web','mwijay.vercel.app']].map(([k,v]) => (
                <p key={k} style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}><strong style={{ color: '#0D1117', minWidth: 60, display: 'inline-block' }}>{k}:</strong> {v}</p>
              ))}
            </div>
            <div style={{ padding: '20px 22px', background: '#FFFDF0', borderLeft: '4px solid #C9A84C', borderRadius: '0 10px 10px 0' }}>
              <p style={{ fontSize: 8, fontWeight: 800, color: '#C9A84C', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>The Client — Partner</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#0D1117', marginBottom: 3 }}>{formData.name}</p>
              <p style={{ fontSize: 9, fontStyle: 'italic', color: '#64748B', marginBottom: 10 }}>Contracting Party</p>
              {[['Email', formData.email],['Phone', formData.phone],['City', formData.city || '—']].map(([k,v]) => (
                <p key={k} style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}><strong style={{ color: '#0D1117', minWidth: 60, display: 'inline-block' }}>{k}:</strong> {v}</p>
              ))}
            </div>
          </div>

          <div style={{ padding: '0 48px 20px' }}>
            <p style={{ fontSize: 8, fontWeight: 800, color: '#1A56DB', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
              Build Specification
            </p>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '24px 26px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #1A56DB, #00C896)' }} />
              <p style={{ fontSize: 20, fontWeight: 900, color: '#0D1117', letterSpacing: -0.5, marginBottom: 8 }}>{formData.projectTitle}</p>
              <div style={{ display: 'inline-block', background: '#EEF2FF', color: '#1A56DB', padding: '3px 14px', borderRadius: 20, fontSize: 9, fontWeight: 700, marginBottom: 14 }}>
                {formData.serviceType}
              </div>
              <p style={{ fontSize: 11, color: '#4A5568', lineHeight: 1.8, borderTop: '1px solid #E2E8F0', paddingTop: 14 }}>{formData.description}</p>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#0A0F1E', padding: '10px 48px', display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 8, color: '#475569', fontFamily: 'monospace' }}>MWIJAY SERVICES · OFFICIAL REGISTRY · PAGE 1 of 2</p>
            <p style={{ fontSize: 8, color: '#00C896', fontFamily: 'monospace' }}>{agreementId}</p>
          </div>
        </div>

        {/* ══ PAGE 2: Legal Matrix & Auth ══ */}
        <div style={{ width: '794px', minHeight: '1123px', background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ height: 6, background: 'linear-gradient(90deg, #0A0F1E 0%, #1A56DB 50%, #00C896 100%)' }} />
          
          <div style={{ padding: '40px 48px 24px', background: '#0A0F1E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: 5 }}>MWIJAY SERVICES</p>
            <p style={{ fontSize: 10, color: '#64748B', fontWeight: 800 }}>LEGAL_GOVERNANCE_2026</p>
          </div>

          <div style={{ padding: '36px 48px' }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: '#0A0F1E', letterSpacing: 4, textAlign: 'center', marginBottom: 8 }}>TERMS & CONDITIONS</p>
            <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, #1A56DB, #00C896)', margin: '0 auto 32px', borderRadius: 4 }} />
            
            {[
              { n: '01', title: 'Payment Protocol', text: 'A non-refundable advance of 50% is required before any architectural build begins. Remaining balance is due prior to deployment to production environment.' },
              { n: '02', title: 'Build Revisions', text: 'Up to 2 standard rounds of revisions are included in the agreed build price. Additional modifications outside original brief are subject to change-order fees.' },
              { n: '03', title: 'Intellectual Property', text: 'Full ownership of custom code and visual assets transfers to the Client only upon 100% financial fulfillment. Systems remain in registry until paid.' },
              { n: '04', title: 'Maintenance & Support', text: 'Standard delivery includes 30 days of high-priority post-launch support. Extended maintenance contracts are available as separate service nodes.' },
              { n: '05', title: 'Termination Signal', text: 'Either party may terminate the handshake with 7 days written notice. Payment for work-completed-to-date remains a binding requirement.' },
            ].map(c => (
              <div key={c.n} style={{ display: 'flex', gap: 16, padding: '16px 20px', background: '#F8FAFC', borderLeft: '4px solid #1A56DB', borderRadius: '0 8px 8px 0', marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', fontFamily: 'monospace', minWidth: 24 }}>{c.n}</span>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 800, color: '#0D1117', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>{c.title}</p>
                  <p style={{ fontSize: 10, color: '#64748B', lineHeight: 1.7 }}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', borderTop: '2px solid #0A0F1E', margin: '0 48px', paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 80 }}>
            <div>
              <p style={{ fontSize: 8, fontWeight: 800, color: '#1A56DB', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 14 }}>Client Authorization</p>
              {formData.signatureDataUri && (
                <img src={formData.signatureDataUri} style={{ height: 70, width: 'auto', filter: 'grayscale(1)', marginBottom: 6 }} alt="sig" />
              )}
              <div style={{ borderTop: '2px solid #0D1117', paddingTop: 8, minWidth: 240 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#0D1117', textTransform: 'uppercase' }}>{formData.name}</p>
                <p style={{ fontSize: 9, color: '#94A3B8', letterSpacing: 1.5, marginTop: 3 }}>Digital Identity — Authorized Signal</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: '#0A0F1E', borderRadius: 14, marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, background: '#00C896', borderRadius: '50%', boxShadow: '0 0 10px rgba(0,200,150,0.5)' }} />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: '#FFFFFF', letterSpacing: 2.5, textTransform: 'uppercase' }}>MWJ Verified</p>
                  <p style={{ fontSize: 8, color: '#475569', letterSpacing: 1 }}>Registry_Signal_Active</p>
                </div>
              </div>
              <p style={{ fontSize: 9, color: '#94A3B8', display: 'block' }}>© 2026 Mwijay Services · Tanzania</p>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#0A0F1E', padding: '10px 48px', display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 8, color: '#475569', fontFamily: 'monospace' }}>© 2026 MWIJAY SERVICES · mwijay.vercel.app · PAGE 2 of 2</p>
            <p style={{ fontSize: 8, color: '#00C896', fontFamily: 'monospace' }}>AUTH: {agreementId} ✓</p>
          </div>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════
     MAIN FORM
  ════════════════════════════════════════ */
  return (
    <div className="min-h-screen pt-28 pb-24 px-6 bg-background relative overflow-hidden">
      <main className="max-w-3xl mx-auto space-y-10">

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.35em]">
            <ShieldCheck size={12} /> Project Handshake Registry
          </div>

          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            Service{' '}
            <span className="text-primary italic">Agreement</span>
          </h1>

          <p className="text-muted-foreground text-base font-medium max-w-md mx-auto leading-relaxed">
            Provide your project details below to generate your professional service agreement.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-card border border-border/50 shadow-sm">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Draft ID:</span>
            <span className="text-[10px] font-mono font-black text-primary">{agreementId}</span>
          </div>
        </motion.header>

        <StepIndicator current={step} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border-2 border-border/50 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">

              {/* ══ STEP 1: Your Information ══ */}
              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <User size={16} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Your Information</h3>
                      <p className="text-muted-foreground text-xs font-medium">Provide your contact info for the agreement</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldInput
                      label="Full Legal Name"
                      value={formData.name}
                      onChange={v => update('name', v)}
                      placeholder="Amina Hassan"
                      icon={User}
                    />
                    <FieldInput
                      label="Contact Email"
                      value={formData.email}
                      readOnly
                      icon={Mail}
                    />
                    <FieldInput
                      label="WhatsApp Number"
                      value={formData.phone}
                      onChange={v => update('phone', v)}
                      placeholder="+255..."
                      icon={Smartphone}
                    />
                    <FieldInput
                      label="Current City"
                      value={formData.city}
                      onChange={v => update('city', v)}
                      placeholder="Dar es Salaam"
                      icon={MapPin}
                    />
                  </div>

                  <Button onClick={next} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-xl">
                    Continue to Project Details
                    <ChevronRight size={16} />
                  </Button>
                </motion.div>
              )}

              {/* ══ STEP 2: Project Details ══ */}
              {step === 2 && (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Code2 size={16} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Project Details</h3>
                      <p className="text-muted-foreground text-xs font-medium">Describe your vision</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Select Service Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {SERVICE_TYPES.map(s => {
                        const Icon    = s.icon;
                        const selected = formData.serviceType === s.label;
                        return (
                          <motion.button
                            key={s.value}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => update('serviceType', s.label)}
                            className={cn(
                              "relative p-4 rounded-2xl border-2 text-left transition-all",
                              selected
                                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "bg-muted/10 border-border/50 hover:border-primary/30"
                            )}
                          >
                            <Icon size={18} className={cn("mb-2", selected ? "text-white/80" : "text-primary")} />
                            <p className={cn("text-[10px] font-black uppercase tracking-wider leading-tight", selected ? "text-white" : "text-foreground")}>
                              {s.label}
                            </p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <FieldInput
                    label="Project Title"
                    value={formData.projectTitle}
                    onChange={v => update('projectTitle', v)}
                    placeholder="AymiAfrica Platform"
                    icon={Zap}
                  />

                  <div className="space-y-2 group">
                    <Label className="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground ml-1">
                      Brief Description
                    </Label>
                    <Textarea
                      value={formData.description}
                      onChange={e => update('description', e.target.value)}
                      placeholder="Describe your vision and requirements..."
                      className="min-h-[130px] rounded-2xl border-2 p-5 resize-none text-sm"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={prev} className="h-14 px-8 rounded-2xl font-black uppercase text-xs border-2">
                      Back
                    </Button>
                    <Button onClick={next} className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-xl">
                      Final Step: Authorize
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ══ STEP 3: Sign & Finalize ══ */}
              {step === 3 && (
                <motion.div
                  key="s3"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Shield size={16} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Sign & Finalize</h3>
                      <p className="text-muted-foreground text-xs font-medium">Review terms and apply digital signature</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-primary/5 border-2 border-dashed border-primary/20 space-y-4">
                    <p className="text-sm font-bold leading-relaxed text-foreground/80">
                      By signing below, you agree that David Erick Mwijage will build your project based on the specifications provided. A 50% advance payment is required to start the build phase.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground ml-1">
                      Digital Signature — Draw Below
                    </Label>
                    <BasicSignaturePad
                      onDrawEnd={uri => update('signatureDataUri', uri)}
                    />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button variant="outline" onClick={prev} className="h-14 px-8 rounded-2xl font-black uppercase text-xs border-2">
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading || !formData.signatureDataUri}
                      className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-xl disabled:opacity-40"
                    >
                      {loading
                        ? <><Loader2 className="animate-spin h-4 w-4" /> Syncing...</>
                        : <><Send size={16} /> Register Agreement</>
                      }
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>

        <div className="flex items-center justify-center gap-6 pb-4 opacity-30">
          {[
            { icon: Lock,       label: "Encrypted" },
            { icon: ShieldCheck, label: "Secured"    },
            { icon: FileText,   label: "Legal"       },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={12} />
              <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
