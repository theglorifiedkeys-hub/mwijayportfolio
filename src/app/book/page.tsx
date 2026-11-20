'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Palette, Bot, Server, CheckCircle, ChevronRight, 
  ChevronLeft, Loader2, Zap, Clock, Calendar, Smartphone, 
  Mail, ShieldCheck, Target, MessageSquare, ArrowRight, X, Info, Check, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateInquiryId } from '@/lib/order-utils';
import { trackEvent } from '@/lib/analytics';
import { emailHelpers } from '@/lib/send-email-client';
import { validateEmail, validatePhone } from '@/lib/sanitize';
import { Footer } from '@/components/footer';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import BasicSignaturePad from '@/components/ui/signature-pad';

const SERVICE_CARDS = [
  { id: 'web_development', title: 'Web Systems', desc: 'Custom apps, e-commerce, and admin portals.', icon: Globe, color: 'text-blue-500' },
  { id: 'design_branding', title: 'Visual Identity', desc: 'Logos, brand guides, and UI/UX systems.', icon: Palette, color: 'text-pink-500' },
  { id: 'ai_automation', title: 'AI & Automation', desc: 'Intelligent workflows and custom chatbots.', icon: Bot, color: 'text-cyan-500' },
  { id: 'hosting_maintenance', title: 'Maintenance', desc: 'Cloud infrastructure and site management.', icon: Server, color: 'text-green-500' }
];

function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [inquiryId, setInquiryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [transmissionError, setTransmissionError] = useState(false);
  const db = useFirestore();

  const [formData, setFormData] = useState({
    services: [] as string[],
    projectName: '',
    description: '',
    timeline: 'standard',
    budgetRange: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    agreedToTerms: false,
    signatureDataUri: '',
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    setInquiryId(generateInquiryId());

    const servicesParam = searchParams.get('services');
    const projectParam = searchParams.get('projectName');
    const descParam = searchParams.get('description');
    const budgetParam = searchParams.get('budgetRange');
    const timelineParam = searchParams.get('timeline');

    if (servicesParam || projectParam || descParam || budgetParam || timelineParam) {
      setFormData(prev => ({
        ...prev,
        services: servicesParam ? servicesParam.split(',') : prev.services,
        projectName: projectParam || prev.projectName,
        description: descParam ? decodeURIComponent(descParam) : prev.description,
        budgetRange: budgetParam || prev.budgetRange,
        timeline: (timelineParam as any) || prev.timeline,
      }));
      // Jump directly to specifications details step
      setCurrentStep(2);
    }
  }, [searchParams]);

  const isTrashInput = (text: string) => {
    if (text.length < 5) return false;
    const consecutiveConsonants = text.match(/[^aeiou\s]{6,}/gi);
    return !!consecutiveConsonants;
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1 && formData.services.length === 0) newErrors.service = "Please select at least one service node.";
    if (currentStep === 2) {
      if (!formData.projectName) newErrors.projectName = "Project name is required.";
      if (isTrashInput(formData.projectName)) newErrors.projectName = "Invalid signal node.";
      if (formData.description.length < 10) newErrors.description = "Please provide a short description (min 10 chars).";
      if (!formData.budgetRange) newErrors.budgetRange = "Select a budget cluster.";
    }
    if (currentStep === 3) {
      if (!formData.clientName) newErrors.clientName = "Your name is required.";
      if (isTrashInput(formData.clientName)) newErrors.clientName = "Invalid name signal.";
      if (!validateEmail(formData.clientEmail)) newErrors.clientEmail = "Invalid email signal.";
      if (!validatePhone(formData.clientPhone)) newErrors.clientPhone = "Valid TZ phone required.";
    }
    if (currentStep === 4) {
      if (!formData.agreedToTerms) newErrors.agreedToTerms = "You must accept the terms.";
      if (!formData.signatureDataUri) newErrors.signatureDataUri = "Signature required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = async () => {
    if (!validateStep() || !db) return;
    setIsSubmitting(true);
    setTransmissionError(false);
    try {
      const servicesString = formData.services.join(', ');
      await addDoc(collection(db, 'project_inquiries'), {
        ...formData,
        service: servicesString,
        inquiryId,
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        adminNotes: '',
        ipAddress: 'logged'
      });

      trackEvent('submit_inquiry_system', 'conversion', servicesString);
      
      const submittedAt = new Date().toLocaleString('en-TZ', { timeZone: 'Africa/Dar_es_Salaam' });
      
      emailHelpers.notifyInquiry({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        clientMessage: `NEW BUILD REQUEST [${inquiryId}]\nProject: ${formData.projectName}\nServices: ${servicesString}\nTimeline: ${formData.timeline}\nBudget: ${formData.budgetRange}\nDescription: ${formData.description}`,
        submittedAt
      });

      setIsSubmitted(true);
    } catch (err) {
      setTransmissionError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* SIDEBAR INFO */}
        <div className="lg:col-span-4 space-y-10 lg:sticky lg:top-32 h-fit text-left">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
              <ShieldCheck className="h-3 w-3" /> SECURE INTAKE SYSTEM
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter leading-tight text-foreground">
              Initialize Your <span className="text-primary italic">Build Request</span>
            </h1>
            <p className="text-muted-foreground font-medium leading-relaxed">
              This system captures your technical requirements to generate a precision quotation and service agreement.
            </p>
          </div>

          <div className="space-y-6 pt-10 border-t border-border/50">
            {[
              { t: "Custom Quote (24h)", i: Clock, c: "text-blue-500" },
              { t: "Legal Agreement", i: ShieldCheck, c: "text-green-500" },
              { t: "Evidence Registry", i: Target, c: "text-pink-500" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className={cn("h-10 w-10 rounded-xl bg-muted flex items-center justify-center border", item.c)}>
                  <item.i className="h-5 w-5" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest opacity-70 text-foreground">{item.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN FORM */}
        <div className="lg:col-span-8 bg-card border-2 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col border-border/50">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div 
                key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-8"
              >
                <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <CheckCircle size={48} className="animate-in zoom-in duration-500" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black font-headline uppercase tracking-tight text-foreground">Signal Authenticated!</h3>
                  <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                    Your brief <span className="text-primary font-bold">#{inquiryId}</span> has been logged in our registry.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
                  <Button className="flex-1 h-16 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs gap-3 shadow-xl" asChild>
                    <a href={`https://wa.me/255620641695?text=Hi Mwijay, I've just submitted my project brief #${inquiryId} for ${formData.projectName}.`}>
                      <Smartphone size={18} /> Confirm via WhatsApp
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-xs border-2" asChild>
                    <Link href="/">Return to Genesis</Link>
                  </Button>
                </div>
              </motion.div>
            ) : transmissionError ? (
              <motion.div 
                key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="h-20 w-20 rounded-3xl bg-destructive/10 border-2 border-destructive/20 flex items-center justify-center text-destructive">
                   <AlertTriangle size={40} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black font-headline uppercase text-foreground">Transmission Failed</h3>
                   <p className="text-muted-foreground font-medium max-w-xs mx-auto">The system encountered an error while synchronizing your project signal.</p>
                </div>
                <div className="p-8 rounded-[2rem] bg-muted/50 border-2 border-dashed border-border/50 space-y-6 w-full max-w-sm">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Emergency Backup Protocol</p>
                      <p className="text-xs font-bold leading-relaxed text-foreground">Reach out directly via WhatsApp for manual registry entry:</p>
                   </div>
                   <Button className="w-full bg-green-600 hover:bg-green-700 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2" asChild>
                      <a href="https://wa.me/255620641695"><Smartphone size={16} /> +255 620 641 695</a>
                   </Button>
                </div>
                <Button variant="ghost" onClick={() => setTransmissionError(false)} className="font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5">Retry Build Signal</Button>
              </motion.div>
            ) : (
              <div className="space-y-12">
                {/* STEPPER UI */}
                <div className="flex items-center justify-between px-2">
                  {[1, 2, 3, 4].map((s) => (
                    <React.Fragment key={s}>
                      <div className={cn("flex flex-col items-center gap-2", currentStep >= s ? "text-primary" : "text-muted-foreground/30")}>
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all", 
                          currentStep === s ? "bg-primary text-white border-primary shadow-[0_0_10px_rgba(37,99,235,0.4)]" : 
                          currentStep > s ? "bg-green-500 border-green-500 text-white" : "border-muted")}>
                          {currentStep > s ? <Check size={14} /> : s}
                        </div>
                      </div>
                      {s < 4 && <div className={cn("h-0.5 flex-1 mx-2", currentStep > s ? "bg-green-500" : "bg-muted")} />}
                    </React.Fragment>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 text-left">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-black font-headline uppercase tracking-tight text-foreground">Select Architecture Node</h2>
                        <p className="text-sm text-muted-foreground">What domain are we building in today?</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {SERVICE_CARDS.map((card) => {
                          const isSelected = formData.services.includes(card.id);
                          return (
                            <button
                              key={card.id}
                              onClick={() => {
                                const newServices = isSelected
                                  ? formData.services.filter(s => s !== card.id)
                                  : [...formData.services, card.id];
                                setFormData({ ...formData, services: newServices });
                              }}
                              className={cn("p-6 text-left rounded-3xl border-2 transition-all relative overflow-hidden", 
                                isSelected ? "border-primary bg-primary/[0.03] shadow-lg" : "border-border/50 bg-muted/10 hover:border-primary/30")}
                            >
                              <card.icon className={cn("h-8 w-8 mb-4", card.color)} />
                              <h4 className="font-black text-sm uppercase tracking-widest mb-1 text-foreground">{card.title}</h4>
                              <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">{card.desc}</p>
                              {isSelected && <div className="absolute top-4 right-4 h-4 w-4 bg-primary rounded-full flex items-center justify-center"><Check className="h-3 w-3 text-white" /></div>}
                            </button>
                          );
                        })}
                      </div>
                      {errors.service && <p className="text-[10px] text-destructive font-black uppercase">{errors.service}</p>}
                      <Button onClick={handleNext} className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 bg-primary text-white shadow-xl shadow-primary/20">
                        Continue to Details <ChevronRight size={16} />
                      </Button>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 text-left">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-black font-headline uppercase tracking-tight text-foreground">System Specifications</h2>
                        <p className="text-sm text-muted-foreground">Provide the core logic of your build.</p>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Project Name</Label>
                          <Input value={formData.projectName} onChange={(e) => setFormData({...formData, projectName: e.target.value})} placeholder="e.g. AymiAfrica Portal" className="h-12 rounded-xl border-2" />
                          {errors.projectName && <p className="text-[9px] text-destructive font-bold uppercase">{errors.projectName}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Narrative Description</Label>
                          <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Briefly describe what you want to build (goals, features, etc. - min 10 characters)." className="min-h-[140px] rounded-2xl border-2 p-4 leading-relaxed" />
                          {errors.description && <p className="text-[9px] text-destructive font-bold uppercase">{errors.description}</p>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Timeline Signal</Label>
                              <div className="flex gap-2">
                                {['urgent', 'standard', 'flexible'].map(t => (
                                  <button key={t} onClick={() => setFormData({...formData, timeline: (t as any)})} className={cn("flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all", 
                                    formData.timeline === t ? "bg-primary text-white border-primary" : "border-border/50 text-foreground")}>
                                    {t}
                                  </button>
                                ))}
                              </div>
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Budget Cluster (TZS)</Label>
                              <select value={formData.budgetRange} onChange={(e) => setFormData({...formData, budgetRange: e.target.value})} className="w-full h-12 rounded-xl border-2 bg-background px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                                <option value="">Choose range</option>
                                <option value="250k-500k">250,000 - 500,000</option>
                                <option value="500k-1m">500,000 - 1,000,000</option>
                                <option value="1m-2m">1,000,000 - 2,000,000</option>
                                <option value="2m+">2,000,000+</option>
                              </select>
                              {errors.budgetRange && <p className="text-[9px] text-destructive font-bold uppercase">{errors.budgetRange}</p>}
                           </div>
                        </div>
                      </div>
                      <div className="flex gap-4 pt-6">
                        <Button variant="ghost" onClick={handleBack} className="rounded-xl h-16 px-8 font-bold text-xs uppercase tracking-widest border-2">Back</Button>
                        <Button onClick={handleNext} className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary text-white shadow-xl shadow-primary/20">Contact Signal →</Button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 text-left">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-black font-headline uppercase tracking-tight text-foreground">Identity Registry</h2>
                        <p className="text-sm text-muted-foreground">Who is architecting this project with me?</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Full Name</Label>
                          <Input value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} placeholder="Amina Hassan" className="h-12 rounded-xl border-2" />
                          {errors.clientName && <p className="text-[9px] text-destructive font-bold uppercase">{errors.clientName}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Registry Email</Label>
                          <Input value={formData.clientEmail} onChange={(e) => setFormData({...formData, clientEmail: e.target.value})} placeholder="amina@email.com" className="h-12 rounded-xl border-2" />
                          {errors.clientEmail && <p className="text-[9px] text-destructive font-bold uppercase">{errors.clientEmail}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">WhatsApp / Phone</Label>
                          <Input value={formData.clientPhone} onChange={(e) => setFormData({...formData, clientPhone: e.target.value})} placeholder="+255..." className="h-12 rounded-xl border-2" />
                          {errors.clientPhone && <p className="text-[9px] text-destructive font-bold uppercase">{errors.clientPhone}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Organization Node</Label>
                          <Input value={formData.clientCompany} onChange={(e) => setFormData({...formData, clientCompany: e.target.value})} placeholder="Optional" className="h-12 rounded-xl border-2" />
                        </div>
                      </div>
                      <div className="flex gap-4 pt-6">
                        <Button variant="ghost" onClick={handleBack} className="rounded-xl h-16 px-8 font-bold text-xs uppercase tracking-widest border-2">Back</Button>
                        <Button onClick={handleNext} className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary text-white shadow-xl shadow-primary/20">Agreement & Review →</Button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 4 && (
                    <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 text-left">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-black font-headline uppercase tracking-tight text-foreground">Agreement Protocol</h2>
                        <p className="text-sm text-muted-foreground">Verify your signal and approve the build terms.</p>
                      </div>
                      
                      <div className="p-8 rounded-[2rem] bg-muted/20 border-2 border-dashed border-border/50 space-y-6">
                        <div className="space-y-2">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Service Terms Summary</h4>
                           <ul className="text-xs space-y-3 font-medium text-muted-foreground list-disc pl-4">
                             <li>Estimates are preliminary until final scope approval.</li>
                             <li>50% deposit required to initiate the architecture build.</li>
                             <li>Intellectual property transfers only upon full settlement.</li>
                             <li>Domain/Hosting stays with provider until fully paid.</li>
                           </ul>
                        </div>
                        
                        <div className="pt-6 border-t border-border/50 space-y-4">
                           <div className="flex items-start gap-3">
                              <input type="checkbox" id="terms" checked={formData.agreedToTerms} onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})} className="mt-1 h-4 w-4 rounded border-2 border-primary/20" />
                              <Label htmlFor="terms" className="text-xs leading-relaxed font-bold text-foreground">I have read and agree to the Mwijay Services project terms & legal protocol.</Label>
                           </div>
                           {errors.agreedToTerms && <p className="text-[9px] text-destructive font-black uppercase">{errors.agreedToTerms}</p>}
                           
                           <div className="space-y-4 pt-4">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Digital Identity Signature *</Label>
                              <BasicSignaturePad onDrawEnd={(uri) => setFormData({...formData, signatureDataUri: uri})} />
                              {errors.signatureDataUri && <p className="text-[9px] text-destructive font-bold uppercase">{errors.signatureDataUri}</p>}
                           </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-6">
                        <Button variant="ghost" onClick={handleBack} className="rounded-xl h-16 px-8 font-bold text-xs uppercase tracking-widest border-2">Back</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20">
                          {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : <>Transmit Project Brief <Zap className="h-4 w-4" /></>}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
