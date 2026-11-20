'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, Copy, Check, 
  ShoppingCart, CreditCard, 
  CheckCircle, Loader2, Smartphone, ShieldCheck, 
  ArrowRight, Upload, MessageCircle, AlertCircle, FileText,
  Zap
} from 'lucide-react';
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateOrderId, formatTZS } from '@/lib/order-utils';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { validatePhone } from '@/lib/sanitize';
import Link from 'next/link';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    description: string;
    image: string;
  } | null;
}

/**
 * CheckoutDrawer - Precision Financial Handshake.
 * REFACTORED: Uses orderId as Document ID for guest-access tracking logic.
 */
export function CheckoutDrawer({ isOpen, onClose, product }: CheckoutDrawerProps) {
  const db = useFirestore();
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', refNo: '', paidFrom: '' });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState('PENDING_SUBMIT');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && product) {
      setOrderId(generateOrderId());
      setStep(1);
      setOrderStatus('PENDING_SUBMIT');
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (orderStatus === 'PENDING_VERIFY' && orderId && orderId.length > 5 && db) {
      const unsub = onSnapshot(doc(db, 'orders', orderId), (snap) => {
        if (snap.exists() && snap.data().status === 'VERIFIED') {
          setStep(4);
          setOrderStatus('VERIFIED');
        }
      });
      return () => unsub();
    }
  }, [orderStatus, orderId, db]);

  const handleUpload = async () => {
    if (!formData.refNo || !formData.paidFrom || !product || !db) {
       toast({ variant: "destructive", title: "Incomplete Signal", description: "Please fill all required payment nodes." });
       return;
    }

    if (!validatePhone(formData.paidFrom)) {
      toast({ variant: "destructive", title: "Invalid Signal", description: "TZ Phone must start with 07 or 06." });
      return;
    }
    
    setLoading(true);
    try {
      let url = '';
      if (file) {
        const result = await uploadToCloudinary(file, 'payment_proofs');
        url = result.url;
      }

      // REGISTRY_LOGIC: Document ID matches Order ID for accessible guest tracking
      await setDoc(doc(db, 'orders', orderId), {
        orderId,
        uid: 'anonymous', 
        planName: product.name,
        amount: product.price,
        customerName: formData.name,
        customerEmail: formData.email.toLowerCase(),
        customerPhone: formData.paidFrom,
        referenceNumber: formData.refNo.toUpperCase(),
        screenshotUrl: url,
        status: 'PENDING_VERIFY',
        submittedAt: serverTimestamp(),
        accessGranted: false,
        progress: 10
      });

      setOrderStatus('PENDING_VERIFY');
      setStep(3);
      trackEvent('submit_payment_proof', 'conversion', product.name);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Registry Sync Failed', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const copyRef = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!product) return null;

  const isServiceBuild = product.price >= 50000;

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-lg bg-background/95 backdrop-blur-2xl border-l border-border/50 p-0 flex flex-col h-full overflow-hidden z-[7000]"
      >
        <SheetHeader className="p-8 border-b bg-muted/20 shrink-0">
          <div className="flex items-center justify-between mb-2">
             <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg">
                <ShoppingCart size={20} />
             </div>
             <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary">
                Node {step} of 4
             </div>
          </div>
          <SheetTitle className="font-headline font-black text-2xl tracking-tighter uppercase text-foreground">
            Project <span className="text-primary italic">Handshake</span>
          </SheetTitle>
          <SheetDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Registry ID: <span className="text-primary font-mono font-black">{orderId}</span>
          </SheetDescription>
        </SheetHeader>

        <div data-lenis-prevent className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-32">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                
                {isServiceBuild && (
                  <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-600/20 flex gap-4 animate-in slide-in-from-top-2">
                    <Zap className="text-blue-600 h-6 w-6 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Architecture Note</p>
                      <p className="text-xs font-bold leading-relaxed">This is a custom build service. Initializing this node requires a manual system assessment by the architect.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">01_TRANSMIT_FEE</h4>
                  <div className="p-8 rounded-[2.5rem] bg-primary/5 border-2 border-primary/20 space-y-8 shadow-inner">
                    <p className="text-sm font-bold text-foreground leading-relaxed">Send <span className="font-black text-primary text-lg">{formatTZS(product.price)}</span> to verified nodes:</p>
                    <div className="space-y-4">
                      {[
                        { n: 'M-Pesa (Vodacom)', v: '0790942616', l: 'DAVID MWIJAGE' },
                        { n: 'Halotel (HaloPesa)', v: '0620641695', l: 'DAVID MWIJAGE' },
                      ].map(pay => (
                        <div key={pay.v} className="flex items-center justify-between p-5 rounded-2xl bg-background/50 border border-border/50 shadow-sm group hover:border-primary/40 transition-all">
                          <div>
                            <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">{pay.n}</p>
                            <p className="font-black text-base tracking-tighter text-foreground">{pay.v}</p>
                            <p className="text-[7px] font-bold text-primary/60 uppercase">{pay.l}</p>
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => copyRef(pay.v, pay.v)} className="h-10 w-10 rounded-xl hover:bg-primary/10">
                             {copiedId === pay.v ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-muted-foreground" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">02_PARTNER_IDENTITY</h4>
                   <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black ml-1 text-muted-foreground">Legal Name</Label>
                        <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Amina Hassan" className="h-14 rounded-2xl border-2" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black ml-1 text-muted-foreground">Contact Email</Label>
                        <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="amina@registry.com" className="h-14 rounded-2xl border-2" />
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <div className="space-y-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">03_SIGNAL_VERIFICATION</h4>
                  <div className="grid gap-8">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black ml-1 text-muted-foreground">Transaction Reference (ID)</Label>
                      <Input value={formData.refNo} onChange={(e) => setFormData({...formData, refNo: e.target.value})} placeholder="e.g. 9RK5XZ..." className="h-14 rounded-2xl border-2 font-mono uppercase font-black" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black ml-1 text-muted-foreground">Payment Origin (Your Number)</Label>
                      <Input value={formData.paidFrom} onChange={(e) => setFormData({...formData, paidFrom: e.target.value})} placeholder="07XXXXXXXX" className="h-14 rounded-2xl border-2 font-bold" />
                    </div>
                    <div className="space-y-4 pt-4">
                      <Label className="text-[10px] uppercase font-black ml-1 text-muted-foreground">Fulfillment Receipt (Screenshot)</Label>
                      <div className="relative group">
                         <div className="h-32 w-full rounded-3xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center bg-muted/20 group-hover:border-primary/40 transition-all cursor-pointer overflow-hidden relative">
                            {file ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                                 <CheckCircle className="text-primary h-8 w-8" />
                                 <span className="text-[10px] font-black uppercase ml-2 text-primary">{file.name}</span>
                              </div>
                            ) : (
                              <>
                                <Upload size={24} className="text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Payment Visual</span>
                              </>
                            )}
                            <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center space-y-10 py-10">
                <div className="h-28 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary relative">
                   <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                   <Smartphone size={40} className="animate-pulse" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black font-headline tracking-tighter uppercase text-foreground">Audit in Progress</h3>
                  <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-xs mx-auto">
                    Your signal <strong>{formData.refNo}</strong> is being audited. High-priority verification typically takes under 1 hour.
                  </p>
                </div>
                
                <div className="w-full">
                   <Button className="w-full h-16 rounded-[2rem] bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs gap-3 shadow-xl" asChild>
                      <a href={`https://wa.me/255620641695?text=Hi David, verifying payment signal for build ${orderId}. Ref: ${formData.refNo}.`}>
                        <MessageCircle size={20} /> Verify via WhatsApp
                      </a>
                   </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center space-y-10 py-10">
                 <div className="h-24 w-24 rounded-[2rem] bg-green-500/20 flex items-center justify-center text-green-500 shadow-2xl">
                    <ShieldCheck size={48} />
                 </div>
                 <div className="space-y-4">
                   <h3 className="text-3xl font-black font-headline tracking-tighter uppercase text-foreground">Signal Verified ✓</h3>
                   <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-xs mx-auto">
                     Build node initialized. You can now track your progress or access assets in the portal.
                   </p>
                 </div>
                 <Button className="w-full h-16 rounded-[2rem] bg-primary text-white font-black uppercase tracking-widest text-xs" asChild>
                    <Link href="/client-portal/dashboard">Enter Client Portal</Link>
                 </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 pt-4 bg-background/95 backdrop-blur-md border-t border-border/50 shrink-0 z-50">
          <div className="flex gap-4">
            {step < 3 && (
              <>
                {step > 1 && (
                  <Button variant="ghost" onClick={() => setStep(prev => prev - 1)} className="h-14 px-8 font-black uppercase text-[10px] tracking-widest border-2">
                    Back
                  </Button>
                )}
                {step === 1 ? (
                  <Button 
                    onClick={() => setStep(2)} 
                    disabled={!formData.name || !formData.email} 
                    className="flex-1 h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20"
                  >
                    I Have Sent Payment <ArrowRight size={18} />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleUpload} 
                    disabled={loading || !formData.refNo || !formData.paidFrom} 
                    className="flex-1 h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20"
                  >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Log Payment Signal <ShieldCheck size={18} /></>}
                  </Button>
                )}
              </>
            )}
            {step >= 3 && (
              <Button onClick={onClose} variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-2">
                Close Handshake
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
