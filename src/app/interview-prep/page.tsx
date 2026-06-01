'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Search, CheckCircle2, ChevronDown, 
  Printer, BookOpen, Shield, Zap, Target, Cpu 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Question = {
  id: number;
  q: string;
  a: string;
  category: string;
};

const QUESTIONS: Question[] = [
  { id: 1, category: "Architecture", q: "Tell me about this project. What does it do?", a: "This is a comprehensive digital business platform for Mwijay Services. It acts as a professional portfolio, a digital marketplace for assets, and a secure client portal. It manages the entire lifecycle from inquiry and legal agreement to payment verification and product delivery." },
  { id: 2, category: "Architecture", q: "Why did you choose Next.js 15 App Router?", a: "Next.js 15 provides the cutting-edge performance needed for a premium experience. The App Router allows for React Server Components (RSC) which reduce client-side JS, while features like Turbopack significantly speed up development iterations." },
  { id: 3, category: "Architecture", q: "Why Firebase over a traditional backend?", a: "Firebase allowed me to iterate rapidly. It handles authentication, real-time database (Firestore), and cloud storage in one ecosystem. For a single-developer startup, the 'Backend-as-a-Service' model significantly reduces dev-ops overhead." },
  { id: 4, category: "Architecture", q: "Firebase vs Supabase — which would you choose and why?", a: "Supabase offers SQL/Relational power, which is better for complex data relationships. However, I chose Firebase for its tighter integration with Google Cloud and the seamless 'onSnapshot' real-time listeners which are perfect for a notification-heavy business site." },
  { id: 5, category: "Architecture", q: "What is Firestore and how does it differ from SQL?", a: "Firestore is a NoSQL document database. Data is stored in JSON-like documents rather than tables. It is horizontally scalable and schema-less, making it faster for development but requiring more careful data modeling for queries." },
  { id: 6, category: "Architecture", q: "Explain your folder structure and why you organized it that way.", a: "I used a feature-based structure within 'src/app' for routing, and 'src/components' for UI. 'src/firebase' centralizes all database logic. This separation of concerns ensures that business logic is decoupled from the presentation layer." },
  { id: 7, category: "Architecture", q: "What is the difference between Server and Client components?", a: "Server Components (default in App Router) render on the server, sending only HTML to the client. Client Components ('use client') add interactivity but require browser hydration. I use Server Components for content and Client Components for forms and listeners." },
  { id: 8, category: "Architecture", q: "How does your admin panel work?", a: "The admin panel is a protected route group that uses a hardcoded UID check in Firestore Security Rules. It provides custom CRUD (Create, Read, Update, Delete) interfaces for every public collection on the site." },
  { id: 9, category: "Architecture", q: "What is Cloudinary and why use it instead of Firebase Storage?", a: "Cloudinary is an image/video CDN. It automatically handles optimization (WEBP conversion, resizing, and quality compression) on the fly based on the user's device, which is much more powerful than the raw storage offered by Firebase." },
  { id: 10, category: "Architecture", q: "Explain your provider pattern (FirebaseClientProvider).", a: "The FirebaseClientProvider wraps the entire app. It ensures that the Firebase JS SDK is initialized exactly once on the client-side and provides the Auth and Firestore instances to all children via React Context." }
];

const CATEGORIES = ["All", "Architecture", "Security", "Performance", "Professional", "Technical"];

export default function InterviewPrepPage() {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [expanded, setExpanded] = useState<number[]>([]);
  const [reviewed, setReviewed] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('mwj_prep_reviewed');
    if (saved) setReviewed(JSON.parse(saved));
  }, []);

  const toggleReviewed = (id: number) => {
    const next = reviewed.includes(id) 
      ? reviewed.filter(r => r !== id) 
      : [...reviewed, id];
    setReviewed(next);
    localStorage.setItem('mwj_prep_reviewed', JSON.stringify(next));
  };

  const toggleExpand = (id: number) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const filtered = QUESTIONS.filter(q => {
    const matchesSearch = q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === 'All' || q.category === activeCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-primary/30">
      <main className="max-w-4xl mx-auto px-6 py-24 space-y-12">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body { background: white !important; color: black !important; }
            .no-print { display: none !important; }
            header, footer { border-color: #eee !important; }
            .p-6, .p-8 { padding: 1rem !important; }
            .rounded-3xl, .rounded-[2rem] { border-radius: 0.5rem !important; }
            .bg-white\/5, .bg-white\/\[0.02\] { background: #f9f9f9 !important; }
            .text-muted-foreground { color: #666 !important; }
            .text-primary { color: #000 !important; font-weight: bold; }
          }
        `}} />
        
        <header className="space-y-6 text-center border-b border-white/5 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
            <Shield className="h-3.5 w-3.5" /> Technical Mastery
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase leading-none">
            Architect <span className="text-primary italic">Prep</span>
          </h1>
          <p className="text-muted-foreground font-medium max-w-xl mx-auto text-sm leading-relaxed">
            Technical & Business vectors for professional mastery.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Progress</p>
              <p className="text-3xl font-black font-headline text-primary">{reviewed.length} / {QUESTIONS.length}</p>
           </div>
           <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Remaining</p>
              <p className="text-3xl font-black font-headline text-white">{QUESTIONS.length - reviewed.length}</p>
           </div>
           <div className="flex items-center gap-3">
              <Button onClick={() => window.print()} variant="outline" className="flex-1 h-full rounded-3xl border-2 border-white/10 hover:bg-primary hover:text-white transition-all gap-2 font-black uppercase text-[10px]">
                 <Printer size={16} /> Print Guide
              </Button>
           </div>
        </div>

        <div className="sticky top-24 z-40 bg-[#07080c]/80 backdrop-blur-md py-4 space-y-6">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search the matrix..." 
                className="pl-12 h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary"
              />
           </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "group rounded-[2rem] border-2 transition-all overflow-hidden",
                  reviewed.includes(item.id) ? "border-green-500/20 bg-green-500/[0.01]" : "border-white/5 bg-white/[0.02] hover:border-primary/20"
                )}
              >
                <div className="p-6 md:p-8 flex items-start gap-6">
                   <button 
                    onClick={() => toggleReviewed(item.id)}
                    className={cn(
                      "h-10 w-10 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all",
                      reviewed.includes(item.id) ? "bg-green-500 border-green-500 text-white" : "border-white/10 hover:border-primary text-transparent"
                    )}
                   >
                     <CheckCircle2 size={20} className={reviewed.includes(item.id) ? "opacity-100" : "opacity-20"} />
                   </button>
                   
                   <div className="flex-1 space-y-4">
                      <div 
                        onClick={() => toggleExpand(item.id)}
                        className="cursor-pointer flex items-start justify-between gap-4"
                      >
                         <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">{item.category}</span>
                            <h3 className={cn(
                              "text-lg md:text-xl font-bold font-headline leading-tight transition-colors",
                              expanded.includes(item.id) ? "text-primary" : "text-white"
                            )}>
                              {item.q}
                            </h3>
                         </div>
                         <ChevronDown className={cn("h-5 w-5 transition-transform duration-500 mt-5", expanded.includes(item.id) && "rotate-180")} />
                      </div>

                      <AnimatePresence>
                        {expanded.includes(item.id) && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-4 border-t border-white/5">
                               <p className="text-muted-foreground leading-relaxed font-medium">
                                 {item.a}
                               </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
