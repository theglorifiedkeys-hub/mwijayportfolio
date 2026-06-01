'use client';

import React, { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, getCountFromServer, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Loader2, Sparkles, Mail } from 'lucide-react';
import { validateEmail } from '@/lib/sanitize';
import { checkRateLimit, getSessionId } from '@/lib/rate-limiter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Newsletter({ source = 'homepage' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [subCount, setSubCount] = useState(58);
  const db = useFirestore();

  React.useEffect(() => {
    async function fetchCount() {
      if (!db) return;
      const snap = await getCountFromServer(collection(db, 'subscribers'));
      setSubCount(50 + snap.data().count);
    }
    fetchCount();
  }, [db]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      setStatus('error');
      setErrorMsg('Database connection offline.');
      return;
    }
    if (!validateEmail(email)) {
      setStatus('error');
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      const sessId = getSessionId();
      const rateLimit = await checkRateLimit(sessId, 'newsletter', 2, 60);
      if (!rateLimit.allowed) {
        throw new Error(`Too many attempts. Try again in ${rateLimit.resetInMinutes}m.`);
      }

      const subscribersRef = collection(db, 'subscribers');
      const q = query(subscribersRef, where('email', '==', email));
      const existing = await getDocs(q);

      if (!existing.empty) {
        throw new Error('You are already subscribed!');
      }

      await addDoc(subscribersRef, {
        email,
        subscribedAt: serverTimestamp(),
        source
      });

      setStatus('success');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Transmission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 px-6 bg-muted/20 relative overflow-hidden border-t border-border/50">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.1) 0%, transparent 70%)`,
        }} 
      />

      <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={14} /> Join {subCount}+ subscribers
          </div>
          <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-foreground leading-tight">
            Stay in the <span className="text-primary italic">Signal</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
            Get notified about new systems, deep-dive insights, and precision tech updates from Tanzania's IT landscape.
          </p>
        </div>

        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 rounded-[3rem] bg-primary/5 border-2 border-primary/20 space-y-4 max-w-md mx-auto"
          >
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-xl font-black font-headline">Welcome to the Registry!</h4>
            <p className="text-sm text-muted-foreground font-medium italic">Your signal has been authenticated. You will hear from me soon.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address" 
                  className="h-14 pl-12 rounded-2xl bg-background/50 border-2 border-primary/5 focus-visible:ring-primary focus-visible:border-primary font-medium"
                  required
                  disabled={loading}
                />
              </div>
              <Button 
                type="submit" 
                className="btn-bubble h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 bg-primary text-white border-none"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    <div className="bubble-layer bubble-1 bg-white/30" />
                    <div className="bubble-layer bubble-3 bg-accent/30" />
                    <span><Send size={14} className="inline mr-2" />Subscribe</span>
                  </>
                )}
              </Button>
            </div>
            {status === 'error' && (
              <p className="text-[10px] font-black text-destructive uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                {errorMsg}
              </p>
            )}
            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-50">
              No Spam • Zero Jank • Guaranteed 
            </p>
          </form>
        )}
      </div>
    </section>
  );
}