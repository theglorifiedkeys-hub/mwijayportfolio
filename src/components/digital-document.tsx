'use client';

import React, { useRef, useState } from 'react';
import { 
  ShieldCheck, Download, Zap, FileText, 
  Globe, Smartphone, Mail, X, Check,
  Building2, Calendar, Hash, Award, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { formatTZS } from '@/lib/order-utils';
import { cn } from '@/lib/utils';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';

interface DigitalDocumentProps {
  type: 'RECEIPT' | 'AGREEMENT' | 'BLUEPRINT';
  data: {
    id: string;
    clientName: string;
    projectName: string;
    amount: number;
    date: Date;
    details?: string;
    customerPhone?: string;
    customerEmail?: string;
  };
  onClose: () => void;
}

const OWNER_ID = "mwijay-davie-admin";

/* ═══════════════════════════════════════════
   TYPE CONFIG
═══════════════════════════════════════════ */
const TYPE_CONFIG = {
  RECEIPT: {
    color:        '#16a34a',
    lightColor:   '#f0fdf4',
    label:        'Official Receipt',
    icon:         Check,
    bodyTitle:    'Fulfillment Record',
    bodyText:     'This document provides non-repudiable evidence of successful financial signal transmission. Mwijay Services has verified the transaction reference in the mobile money registry. Access to the requested digital assets and project initialization phases has been unlocked in the client vault.',
  },
  AGREEMENT: {
    color:        '#2563eb',
    lightColor:   '#eff6ff',
    label:        'Official Agreement',
    icon:         FileText,
    bodyTitle:    'Technical Partnership',
    bodyText:     'This digital agreement establishes a professional technical partnership between the Architect and the Client. David Erick Mwijage commits to delivering custom, precision-engineered code based on the approved specifications. Intellectual property remains with the Architect until 100% financial fulfillment is detected in the registry.',
  },
  BLUEPRINT: {
    color:        '#7c3aed',
    lightColor:   '#f5f3ff',
    label:        'Build Blueprint',
    icon:         Zap,
    bodyTitle:    'Architecture Strategy',
    bodyText:     'This architecture blueprint provides the logic tree and technical foundation for the project build. It covers high-performance Next.js 15 routing, localized database synchronization, and automated UI scaling protocols designed for the 2026 African digital landscape. All logic paths are optimized for mobile-first speed.',
  },
} as const;

/* ═══════════════════════════════════════════
   PDF GENERATOR (Multi-Page Capture)
═══════════════════════════════════════════ */
async function generatePDF(el: HTMLDivElement, type: string, id: string) {
  const A4_W_MM = 210;
  const A4_H_MM = 297;
  
  // High-fidelity capture logic
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pages = el.querySelectorAll('.pdf-page');

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();
    
    const canvas = await html2canvas(pages[i] as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    pdf.addImage(imgData, 'JPEG', 0, 0, A4_W_MM, A4_H_MM, undefined, 'FAST');
  }

  pdf.save(`MWIJAY_${type}_${id}.pdf`);
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export function DigitalDocument({ type, data, onClose }: DigitalDocumentProps) {
  const docRef = useRef<HTMLDivElement>(null);
  const db = useFirestore();
  const [downloading, setDownloading] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'users', OWNER_ID);
  }, [db]);
  const { data: profile } = useDoc(profileRef);

  const cfg = TYPE_CONFIG[type];
  const TypeIcon = cfg.icon;

  const handleDownload = async () => {
    if (!docRef.current) return;
    setDownloading(true);
    try {
      await generatePDF(docRef.current, type, data.id || 'DOC');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[7000] flex items-start justify-center p-4 md:p-10 bg-black/95 backdrop-blur-2xl overflow-y-auto"
    >
      <div className="max-w-4xl w-full flex flex-col gap-6 my-auto pt-16 pb-20">

        {/* ══ TOP ACTION BAR ══ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center bg-zinc-900 p-4 rounded-3xl border border-white/10 shadow-2xl sticky top-0 z-[7001]"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: `${cfg.color}20` }}>
              <TypeIcon size={20} style={{ color: cfg.color }} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">REGISTRY_TERMINAL</p>
              <p className="text-xs font-black text-white uppercase tracking-widest">{cfg.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              className="h-11 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl"
              style={{ background: cfg.color }}
            >
              {downloading ? <Loader2 className="animate-spin h-4 w-4" /> : <Download size={14} />}
              {downloading ? 'Capturing...' : 'Download PDF'}
            </Button>
            <Button variant="ghost" onClick={onClose} className="h-11 w-11 rounded-2xl text-white/40 hover:text-white hover:bg-white/5">
              <X size={20} />
            </Button>
          </div>
        </motion.div>

        {/* ══ DOCUMENT PREVIEW ══ */}
        <div ref={docRef} className="bg-slate-200 p-0 shadow-2xl flex flex-col gap-4">
          
          {/* ── PAGE 1: GENESIS HANDSHAKE ── */}
          <div className="pdf-page bg-white w-[210mm] h-[297mm] flex flex-col relative overflow-hidden text-slate-900 shrink-0" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="h-3 w-full" style={{ background: `linear-gradient(90deg, ${cfg.color}, #07080c)` }} />
            
            {/* Header */}
            <div className="px-16 pt-12 pb-10 flex justify-between items-start border-b-4 border-slate-900">
              <div className="flex items-center gap-6">
                {profile?.logoUrl ? (
                  <img src={profile.logoUrl} className="h-16 w-auto" alt="Logo" />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-xl">DM</div>
                )}
                <div>
                  <p className="text-3xl font-black tracking-[0.2em] uppercase text-slate-900">MWIJAY</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-1" style={{ color: cfg.color }}>SYSTEMS_ARCHITECTURE_2026</p>
                </div>
              </div>
              <div className="text-right">
                 <div className="inline-block px-6 py-3 rounded-2xl text-white font-black text-[11px] uppercase tracking-widest shadow-xl mb-4" style={{ background: cfg.color }}>
                   {cfg.label}
                 </div>
                 <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Registry Signal ID</p>
                 <p className="text-lg font-mono font-black text-slate-900">#{data.id}</p>
                 <p className="text-[10px] text-slate-400 font-bold mt-2">{format(data.date, 'MMMM dd, yyyy')}</p>
              </div>
            </div>

            {/* Sub-header info */}
            <div className="px-16 py-6 border-b border-slate-100 flex justify-between bg-slate-50">
               <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                 <Globe size={12} style={{ color: cfg.color }} /> mwijayportfolio.vercel.app
               </div>
               <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                 <Mail size={12} style={{ color: cfg.color }} /> theglorifiedkeys@gmail.com
               </div>
               <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                 <Smartphone size={12} style={{ color: cfg.color }} /> +255 620 641 695
               </div>
            </div>

            {/* Parties */}
            <div className="px-16 py-12 grid grid-cols-2 gap-12">
               <div className="p-8 rounded-[2rem] border-l-4 relative overflow-hidden" style={{ background: cfg.lightColor, borderColor: cfg.color }}>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-6" style={{ color: cfg.color }}>IDENTIFIED_PARTNER</p>
                  <p className="text-2xl font-black text-slate-900 uppercase mb-2">{data.clientName}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified Digital Identity Node</p>
                  <div className="mt-8 pt-6 border-t border-slate-900/10 space-y-2">
                    <p className="text-[10px] font-medium text-slate-500">{data.customerEmail || 'Registry node hidden'}</p>
                    <p className="text-[10px] font-medium text-slate-500">{data.customerPhone || 'Signal node hidden'}</p>
                  </div>
               </div>
               <div className="p-8 rounded-[2rem] border-l-4 border-slate-900 bg-slate-50">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-6 text-slate-400">IDENTIFIED_ARCHITECT</p>
                  <p className="text-2xl font-black text-slate-900 uppercase mb-2">David Erick Mwijage</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Systems Architect & AI Engineer</p>
                  <div className="mt-8 pt-6 border-t border-slate-900/10 space-y-2">
                    <p className="text-[10px] font-medium text-slate-500">Mwijay Services · Africa Node</p>
                    <p className="text-[10px] font-medium text-slate-500">Dar es Salaam, Tanzania</p>
                  </div>
               </div>
            </div>

            {/* Values */}
            <div className="px-16 py-12 border-y-2 border-slate-100 grid grid-cols-2 gap-12 items-center">
               <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3">Project Domain</p>
                  <p className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-tight">{data.projectName}</p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3">Fulfillment Value</p>
                  <p className="text-5xl font-black tracking-tighter" style={{ color: cfg.color }}>{formatTZS(data.amount)}</p>
                  <div className="flex items-center justify-end gap-2 text-[9px] font-black text-green-600 uppercase tracking-widest mt-4">
                    <ShieldCheck size={14} /> Authenticated_Signal_Confirmed
                  </div>
               </div>
            </div>

            {/* Footer Page 1 */}
            <div className="mt-auto px-16 py-10 bg-slate-900 text-white flex justify-between items-center">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Official_Registry_Record</p>
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">Page 01 of 02</p>
            </div>
          </div>

          {/* ── PAGE 2: GOVERNANCE & AUTH ── */}
          <div className="pdf-page bg-white w-[210mm] h-[297mm] flex flex-col relative overflow-hidden text-slate-900 shrink-0" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="h-3 w-full" style={{ background: `linear-gradient(90deg, #07080c, ${cfg.color})` }} />
            
            <div className="px-16 py-12 space-y-12 flex-1">
               <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl flex items-center justify-center" style={{ background: `${cfg.color}10` }}>
                       <Award size={20} style={{ color: cfg.color }} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight">{cfg.bodyTitle}</h3>
                 </div>
                 <div className="p-10 rounded-[3rem] bg-slate-50 border-2 border-dashed border-slate-200 text-slate-600 text-sm leading-[1.85] font-medium relative">
                    <TypeIcon className="absolute top-8 right-8 opacity-5 h-20 w-20" style={{ color: cfg.color }} />
                    {cfg.bodyText}
                 </div>
               </div>

               {data.details && (
                 <div className="space-y-6">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Registry Brief Logic</p>
                   <div className="p-10 rounded-[3rem] bg-slate-900 text-white text-base font-bold italic leading-relaxed shadow-2xl">
                     "{data.details}"
                   </div>
                 </div>
               )}

               <div className="space-y-6 pt-12">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">SYSTEM_SECURITY_HANDSHAKE</p>
                  <div className="grid grid-cols-2 gap-16 pt-10">
                    <div className="space-y-6">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Client Authorization</p>
                       <div className="h-32 border-b-2 border-slate-900 flex items-end pb-4">
                          <p className="text-2xl font-black uppercase tracking-tight text-slate-900">{data.clientName}</p>
                       </div>
                       <p className="text-[8px] font-bold text-slate-400 uppercase">Signed via Verified Signal Node</p>
                    </div>
                    <div className="space-y-6">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Architect Authentication</p>
                       <div className="h-32 border-b-2 border-slate-900 flex items-end pb-4 relative">
                          {/* Signature Simulation */}
                          <p className="text-4xl font-black italic tracking-tighter text-slate-900 leading-none">D. Mwijay</p>
                          <div className="absolute right-0 bottom-6 bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-3">
                             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                             <span className="text-[8px] font-black uppercase tracking-widest">Authenticated</span>
                          </div>
                       </div>
                       <p className="text-[8px] font-bold text-slate-400 uppercase">Lead Architect Registry Node</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Bottom Finality Page 2 */}
            <div className="px-16 py-12 border-t-2 border-slate-100 flex justify-between items-end">
               <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Mwijay Services</p>
                 <p className="text-[9px] text-slate-400 font-medium">Professional Tech Solutions · Tanzania Node</p>
                 <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">© 2026 MWIJAY_SERVICES // ALL_LOGIC_RESERVED</p>
               </div>
               <div className="text-right space-y-2">
                  <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                    <ShieldCheck size={12} style={{ color: cfg.color }} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Secure Registry Handshake</span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Page 02 of 02</p>
               </div>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}

