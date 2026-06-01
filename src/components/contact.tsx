"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Mail, Phone, Send, CheckCircle2, Sparkles, 
  MessageCircle, ArrowRight, MapPin, Zap,
  Shield, Clock, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LocationMap } from "@/components/ui/location-map";
import { MultiSelect } from "@/components/ui/multi-select";
import { BlurFade } from "@/components/ui/blur-fade";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { getSessionId, checkRateLimit } from '@/lib/rate-limiter';
import { sanitizeFormData, validateEmail, validatePhone } from '@/lib/sanitize';
import { emailHelpers } from '@/lib/send-email-client';
import { trackEvent } from '@/lib/analytics';
import { useLanguage } from "@/contexts/language-context";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════
   CONTACT INFO CARD
═══════════════════════════════════════════ */
function ContactInfoCard({
  icon: Icon,
  label,
  value,
  href,
  color = "text-primary",
  bgColor = "bg-primary/10",
  borderColor = "border-primary/20",
}: {
  icon: any;
  label: string;
  value: string;
  href: string;
  color?: string;
  bgColor?: string;
  borderColor?: string;
}) {
  return (
    <motion.a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      whileHover={{ x: 6 }}
      transition={{ type: "spring", stiffness: 400 }}
      className="flex items-center gap-5 group"
    >
      <div className={cn(
        "h-14 w-14 rounded-2xl flex items-center justify-center transition-all",
        "group-hover:scale-110 border shadow-lg shrink-0",
        bgColor, borderColor
      )}>
        <Icon className={cn("h-6 w-6", color)} />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-0.5">
          {label}
        </p>
        <p className={cn(
          "text-base font-bold transition-colors group-hover:text-primary",
          "text-foreground"
        )}>
          {value}
        </p>
      </div>
      <ArrowRight size={14} className="ml-auto text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </motion.a>
  );
}

/* ═══════════════════════════════════════════
   TRUST BADGE
═══════════════════════════════════════════ */
function TrustBadge({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/20 border border-border/30">
      <Icon size={16} className="text-primary" />
      <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground text-center">
        {label}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   FIELD INPUT WITH ERROR
═══════════════════════════════════════════ */
function FormField({
  id,
  name,
  label,
  placeholder,
  type = "text",
  required,
  error,
  className,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  error?: string;
  className?: string;
}) {
  return (
    <div className="space-y-2 group">
      <Label
        htmlFor={id}
        className="text-[9px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground flex items-center gap-1"
      >
        {label}
        {required && <span className="text-primary text-xs">*</span>}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className={cn(
          "h-13 rounded-2xl border-2 px-5 font-medium text-sm transition-all",
          "focus:border-primary focus:ring-0",
          "group-hover:border-primary/30",
          error
            ? "border-destructive bg-destructive/5"
            : "border-border/50",
          className
        )}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[10px] text-destructive font-bold ml-1"
          >
            ⚠ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN CONTACT COMPONENT
═══════════════════════════════════════════ */
export function Contact() {
  const [loading, setLoading]             = useState(false);
  const [submitted, setSubmitted]         = useState(false);
  const [selectedServices, setSelected]   = useState<string[]>([]);
  const [formErrors, setFormErrors]       = useState<Record<string, string>>({});
  const { toast }                         = useToast();
  const db                                = useFirestore();
  const { t }                             = useLanguage();

  const serviceOptions = [
    { label: t('cap_web_title'),          value: "web" },
    { label: t('cap_design_title'),       value: "design" },
    { label: t('cap_ai_title'),           value: "automation" },
    { label: t('services_content_title'), value: "content" },
    { label: t('nav_marketplace'),        value: "other" },
  ];

  // Gibberish Shield: Detects and blocks "trash" typing signal
  const isTrashInput = (text: string) => {
    if (!text || text.length < 5) return false;
    const consecutiveConsonants = text.match(/[^aeiou\s]{6,}/gi);
    return !!consecutiveConsonants;
  };

  /* ── SUBMIT HANDSHAKE ── */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});

    const formData = new FormData(e.currentTarget);
    const rawData = {
      name:    formData.get('name')    as string,
      email:   formData.get('email')   as string,
      phone:   formData.get('phone')   as string,
      message: formData.get('message') as string,
    };

    // 1. Gibberish Protection
    if (isTrashInput(rawData.name) || isTrashInput(rawData.message)) {
      toast({ variant: "destructive", title: "Signal Rejected", description: "Please provide valid project information." });
      setLoading(false);
      return;
    }

    // 2. Rate Limiting
    const sessionId  = getSessionId();
    const rateLimit  = await checkRateLimit(sessionId, 'contact_form', 3, 60);
    if (!rateLimit.allowed) {
      toast({ variant: "destructive", title: t('common_error'), description: t('contact_error') });
      setLoading(false);
      return;
    }

    // 3. Sanitization
    const schema = {
      name:    { required: true,  maxLength: 100,  type: 'string' },
      email:   { required: true,  maxLength: 200,  type: 'string' },
      phone:   { required: false, maxLength: 20,   type: 'string' },
      message: { required: true,  maxLength: 2000, type: 'string' },
    };

    const { sanitized, errors } = sanitizeFormData(rawData, schema);
    if (!validateEmail(sanitized.email))                        errors.email = t('newsletter_invalid');
    if (sanitized.phone && !validatePhone(sanitized.phone))    errors.phone = t('newsletter_invalid');

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    const payload: any = {
      ...sanitized,
      subject: selectedServices.join(', ') || 'General Inquiry',
    };

    try {
      await addDoc(collection(db!, 'inquiries'), {
        ...payload,
        createdAt: serverTimestamp(),
        status: 'new',
      });

      trackEvent('submit_contact', 'conversion', 'contact_form');

      const submittedAt = new Date().toLocaleString('en-TZ', {
        timeZone: 'Africa/Dar_es_Salaam',
        dateStyle: 'full',
        timeStyle: 'short',
      });

      Promise.all([
        emailHelpers.notifyInquiry({
          clientName:    payload.name,
          clientEmail:   payload.email,
          clientPhone:   payload.phone || 'Not provided',
          clientMessage: payload.message,
          submittedAt,
        }),
        emailHelpers.sendAutoReply({
          clientName:  payload.name,
          clientEmail: payload.email,
        }),
      ]).catch(err => console.warn('Email signal fault:', err));

      setSubmitted(true);
      toast({ title: t('contact_success') });
    } catch {
      toast({ variant: "destructive", title: t('contact_error') });
    } finally {
      setLoading(false);
    }
  };

  /* ════════════════════════════════════════
     RENDER TERMINAL
  ════════════════════════════════════════ */
  return (
    <section id="contact" className="py-24 px-4 md:px-0 bg-transparent relative overflow-hidden">

      {/* Dynamic blobs */}
      <div className="absolute -top-40 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* ══ LEFT — INFO ══ */}
          <div className="space-y-12">
            <div className="space-y-6">
              <BlurFade inView>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.25em]">
                  <Sparkles className="h-3" />
                  Registry Signal
                </div>
              </BlurFade>

              <BlurFade delay={0.1} inView>
                <h2 className="text-3xl md:text-5xl font-headline font-black leading-tight text-left tracking-tighter">
                  Send Your <span className="text-primary italic">Build Brief</span>
                </h2>
              </BlurFade>

              <BlurFade delay={0.2} inView>
                <p className="text-muted-foreground text-base md:text-lg max-w-md font-medium leading-relaxed">
                  Have a project in mind? Let us architect something extraordinary for your business.
                </p>
              </BlurFade>
            </div>

            {/* Contact Cards */}
            <BlurFade delay={0.3} inView>
              <div className="space-y-4">
                <ContactInfoCard
                  icon={Mail}
                  label="Registry Email"
                  value="theglorifiedkeys@gmail.com"
                  href="mailto:theglorifiedkeys@gmail.com"
                  color="text-blue-500"
                  bgColor="bg-blue-500/10"
                  borderColor="border-blue-500/20"
                />
                <ContactInfoCard
                  icon={MessageCircle}
                  label="WhatsApp Handshake"
                  value="+255 620 641 695"
                  href="https://wa.me/255620641695"
                  color="text-green-500"
                  bgColor="bg-green-500/10"
                  borderColor="border-green-500/20"
                />
                <ContactInfoCard
                  icon={MapPin}
                  label="Operations Base"
                  value="Dar es Salaam, Tanzania"
                  href="https://maps.google.com/?q=Dar+es+Salaam"
                  color="text-orange-500"
                  bgColor="bg-orange-500/10"
                  borderColor="border-orange-500/20"
                />
              </div>
            </BlurFade>

            <BlurFade delay={0.4} inView>
              <div className="grid grid-cols-3 gap-3">
                <TrustBadge icon={Shield}       label="Encrypted"   />
                <TrustBadge icon={Clock}        label="24h Sync"    />
                <TrustBadge icon={Zap}          label="Instant"     />
              </div>
            </BlurFade>

            <BlurFade delay={0.5} inView>
              <LocationMap className="w-full rounded-[2rem] overflow-hidden border-2 border-border/30 shadow-lg" />
            </BlurFade>
          </div>

          {/* ══ RIGHT — FORM ══ */}
          <BlurFade delay={0.2} inView>
            <div className="relative bg-card rounded-[2.5rem] shadow-2xl border-2 border-border/50 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

              <div className="p-8 md:p-12">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center justify-center text-center space-y-8 py-16"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-24 w-24 rounded-[2rem] bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center"
                      >
                        <CheckCircle2 size={48} className="text-green-500" />
                      </motion.div>

                      <div className="space-y-3">
                        <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Signal Received ✓</h3>
                        <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-xs mx-auto">
                          Your inquiry has been authenticated. Expect a technical proposal within 24 hours.
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => setSubmitted(false)}
                        className="h-12 px-8 rounded-2xl border-2 font-black uppercase tracking-widest text-xs"
                      >
                        Send Another <ArrowRight size={14} className="ml-2" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      <div className="mb-8">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-1">Compose Signal</h3>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                          Fields marked with * are mandatory
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField
                          id="name"
                          name="name"
                          label="Your Name"
                          placeholder="Amina Hassan"
                          required
                          error={formErrors.name}
                        />
                        <FormField
                          id="email"
                          name="email"
                          label="Email Address"
                          placeholder="amina@registry.com"
                          type="email"
                          required
                          error={formErrors.email}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField
                          id="phone"
                          name="phone"
                          label="WhatsApp / Phone"
                          placeholder="+255..."
                          error={formErrors.phone}
                        />
                        <div className="space-y-2 group">
                          <Label className="text-[9px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Select Build Type</Label>
                          <MultiSelect
                            options={serviceOptions}
                            placeholder="Choose services..."
                            onChange={setSelected}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 group">
                        <Label htmlFor="message" className="text-[9px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground flex items-center gap-1">
                          The Narrative <span className="text-primary">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Describe your vision and technical requirements..."
                          required
                          className={cn(
                            "min-h-[130px] rounded-2xl border-2 resize-none font-medium text-sm transition-all",
                            "focus:border-primary focus:ring-0 group-hover:border-primary/30",
                            formErrors.message ? "border-destructive bg-destructive/5" : "border-border/50"
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20 bg-primary text-white"
                      >
                        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Transmitting...</> : <><Send size={16} /> Transmit Signal</>}
                      </Button>

                      <p className="text-center text-[9px] text-muted-foreground/60 font-medium uppercase tracking-[0.2em]">
                        🔒 256-BIT_ENCRYPTED_HANDSHAKE
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
