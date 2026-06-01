'use client';

import React, { useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, Loader2, Package, CheckCircle2, Clock, XCircle, 
  ShieldCheck, Smartphone, Zap, Code2, Rocket, Download,
  Mail, MapPin, DollarSign, Calendar, FileText, Check
} from 'lucide-react';
import { formatTZS } from '@/lib/order-utils';
import { format } from 'date-fns';
import { Footer } from '@/components/footer';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

/* ═══════════════════════════════════════════
   ORDER MILESTONES CONFIGURATION
═══════════════════════════════════════════ */
const BUILD_MILESTONES = [
  { 
    id: 'pending_payment', 
    label: 'Payment', 
    icon: Clock,
    progress: 10,
    desc: 'Waiting for payment verification.'
  },
  { 
    id: 'payment_confirmed', 
    label: 'Start', 
    icon: Zap,
    progress: 25,
    desc: 'Payment confirmed. Project is starting.'
  },
  { 
    id: 'architecture_phase', 
    label: 'Build', 
    icon: Code2,
    progress: 50,
    desc: 'The project is currently being built.'
  },
  { 
    id: 'testing_phase', 
    label: 'Testing', 
    icon: ShieldCheck,
    progress: 75,
    desc: 'Checking for errors and optimizing performance.'
  },
  { 
    id: 'delivered', 
    label: 'Finished', 
    icon: Rocket,
    progress: 100,
    desc: 'Project successfully completed and delivered.'
  },
];

const statusConfig: Record<string, { 
  label: string; 
  icon: any; 
  color: string; 
  bgColor: string;
  desc: string;
}> = {
  pending_payment: { 
    label: 'Waiting for Payment', 
    icon: Clock, 
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    desc: 'We are waiting for your payment. If you have already paid, please send a screenshot on WhatsApp for fast approval.'
  },
  payment_confirmed: { 
    label: 'Project Started', 
    icon: Zap, 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10',
    desc: 'Payment confirmed! We have started setting up your project.'
  },
  architecture_phase: { 
    label: 'In Progress', 
    icon: Code2, 
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    desc: 'We are currently coding and building your system. Expect an update soon.'
  },
  testing_phase: { 
    label: 'Testing Phase', 
    icon: ShieldCheck, 
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    desc: 'We are finishing up and testing everything to make sure it works perfectly.'
  },
  delivered: { 
    label: 'Delivered', 
    icon: CheckCircle2, 
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    desc: 'Your project is finished! Check your email or WhatsApp for your files.'
  },
  cancelled: { 
    label: 'Cancelled', 
    icon: XCircle, 
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    desc: 'This order has been cancelled. Contact us if you have any questions.'
  }
};

function BuildProgressTimeline({ currentStatus, progress }: { currentStatus: string; progress: number }) {
  const currentIndex = BUILD_MILESTONES.findIndex(m => m.id === currentStatus);
  const cancelled = currentStatus === 'cancelled';

  return (
    <div className="relative py-8">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted/30 rounded-full" />
      
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full",
          cancelled ? "bg-red-500" : "bg-gradient-to-r from-primary to-blue-400"
        )}
      />

      <div className="relative flex justify-between">
        {BUILD_MILESTONES.map((milestone, idx) => {
          const Icon = milestone.icon;
          const isCompleted = idx <= currentIndex && !cancelled;
          const isCurrent = idx === currentIndex && !cancelled;
          const isCancelled = cancelled;

          return (
            <motion.div
              key={milestone.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1, type: 'spring' }}
              className="flex flex-col items-center gap-3 z-10"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: isCurrent ? [1, 1.1, 1] : 1 }}
                  transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                  className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-lg",
                    isCompleted 
                      ? "bg-primary border-primary text-white shadow-primary/30" 
                      : isCancelled
                      ? "bg-red-500 border-red-500 text-white"
                      : "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                </motion.div>
                {isCurrent && (
                  <motion.div
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-2xl bg-primary"
                  />
                )}
              </div>
              <div className="text-center max-w-[100px] hidden md:block">
                <p className={cn(
                  "text-[9px] font-black uppercase tracking-wider",
                  isCompleted ? "text-primary" : "text-muted-foreground"
                )}>
                  {milestone.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function generateTrackingPDF(order: any, progress: number, status: string) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;

  pdf.setFillColor(7, 8, 12);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('MWIJAY SERVICES', 20, 20);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(37, 99, 235);
  pdf.text('OFFICIAL PROJECT TRACKING REPORT', 20, 28);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text(`Order ID: ${order.orderId}`, 140, 20);

  pdf.setTextColor(7, 8, 12);
  pdf.setFontSize(16);
  pdf.text(order.productName || order.planName, 20, 60);
  
  pdf.setFontSize(10);
  pdf.setTextColor(100, 116, 139);
  pdf.text('CURRENT STATUS:', 20, 75);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(37, 99, 235);
  pdf.text(statusConfig[status].label.toUpperCase(), 60, 75);

  pdf.setDrawColor(226, 232, 240);
  pdf.line(20, 85, 190, 85);

  let y = 100;
  const details = [
    ['Client', order.customerName],
    ['Email', order.customerEmail],
    ['Amount', formatTZS(order.amount)],
    ['Date', order.submittedAt ? format(order.submittedAt.toDate(), 'MMM dd, yyyy') : 'Recent'],
    ['Progress', `${progress}%`],
  ];

  details.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 116, 139);
    pdf.text(label.toUpperCase(), 20, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(7, 8, 12);
    pdf.text(String(value), 70, y);
    y += 10;
  });

  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139);
  pdf.text('OPERATIONAL UPDATE:', 20, y + 10);
  pdf.setTextColor(7, 8, 12);
  const lines = pdf.splitTextToSize(statusConfig[status].desc, 170);
  pdf.text(lines, 20, y + 20);

  pdf.save(`Tracking_${order.orderId}.pdf`);
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const db = useFirestore();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !email) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      // REGISTRY_SIGNAL: Directly fetch doc by ID for guest-accessible tracking
      const docRef = doc(db!, 'orders', orderId.trim());
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        if (data.customerEmail?.toLowerCase() === email.trim().toLowerCase()) {
           setOrder({ ...data, id: snap.id });
        } else {
           setError("Email node mismatch. Please verify your contact email.");
        }
      } else {
        setError("Order ID not found in our registry.");
      }
    } catch (err: any) {
      setError("Sync failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = order?.status || 'pending_payment';
  const currentMilestone = BUILD_MILESTONES.find(m => m.id === currentStatus);
  const progress = order?.progress || currentMilestone?.progress || 10;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto space-y-12">

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
              <ShieldCheck size={12} /> Secure Tracking Node
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Track Your <span className="text-primary italic">Build</span>
            </h1>
            <p className="text-muted-foreground text-base font-medium max-w-md mx-auto leading-relaxed">
              Enter your registry details to monitor your technical build in real-time.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-2 rounded-[2.5rem] shadow-2xl overflow-hidden border-border/50">
              <CardContent className="p-8 md:p-12">
                <form onSubmit={handleTrack} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Order ID</Label>
                      <Input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="MWJ-2026-XXXX" className="h-14 rounded-2xl border-2 font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Contact Email</Label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="amina@registry.com" className="h-14 rounded-2xl border-2 font-bold" />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-xl bg-primary text-white">
                    {loading ? <><Loader2 className="animate-spin h-5 w-5" /> Syncing Registry...</> : <><Search size={18} /> Track Order</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-2xl bg-destructive/10 border-2 border-destructive/20 text-destructive text-center text-sm font-bold flex items-center justify-center gap-2">
                <XCircle size={18} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {order && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <Card className="border-2 rounded-[2.5rem] overflow-hidden shadow-2xl border-primary/20 relative bg-card/50">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-400" />
                  
                  <CardHeader className="p-8 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <CardTitle className="font-black text-2xl uppercase tracking-tight">{order.productName || order.planName}</CardTitle>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Registry ID: {order.orderId}</p>
                    </div>
                    <div className={cn(
                      "px-5 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-2",
                      statusConfig[currentStatus].color,
                      statusConfig[currentStatus].bgColor
                    )}>
                      {React.createElement(statusConfig[currentStatus].icon, { size: 14 })}
                      {statusConfig[currentStatus].label}
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 md:p-12 space-y-12">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Build Progress</h4>
                        <span className="text-xl font-black text-primary">{progress}%</span>
                      </div>
                      <BuildProgressTimeline currentStatus={currentStatus} progress={progress} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { icon: DollarSign, label: 'Fee',  value: formatTZS(order.amount) },
                        { icon: Calendar,   label: 'Date', value: order.submittedAt ? format(order.submittedAt.toDate(), 'MMM dd, yyyy') : 'Recent' },
                        { icon: Mail,       label: 'Email', value: order.customerEmail },
                        { icon: Smartphone, label: 'Phone', value: order.customerPhone || '—' },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="p-4 rounded-2xl bg-muted/20 border border-border/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon size={12} className="text-primary" />
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
                          </div>
                          <p className="text-sm font-bold text-foreground truncate">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                        <Zap size={12} className="text-primary" /> System Update
                      </h4>
                      <div className="p-8 rounded-[2rem] bg-primary/5 border-2 border-dashed border-primary/20">
                        <p className="text-base leading-relaxed font-medium text-muted-foreground italic">
                          "{statusConfig[currentStatus].desc}"
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button className="h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs gap-3 shadow-xl" asChild>
                        <a href={`https://wa.me/255620641695?text=Hi David, checking status for order ${order.orderId}...`} target="_blank" rel="noopener">
                          <Smartphone size={18} /> WhatsApp Support
                        </a>
                      </Button>
                      <Button variant="outline" className="h-14 rounded-2xl border-2 font-black uppercase tracking-widest text-xs gap-3" onClick={() => generateTrackingPDF(order, progress, currentStatus)}>
                        <Download size={18} /> Export Registry Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
