"use client";

import React, { useState } from "react";
import { Footer } from "@/components/footer";
import FadeContent from "@/components/ui/fade-content";
import { 
  Zap, 
  Sparkles,
  ShoppingCart,
  CheckCircle2,
  FileText,
  Sliders,
  Cpu,
  Database,
  Key,
  FileDown,
  Coins,
  Globe,
  Palette,
  Server,
  Bot,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useCollectionOnce, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { cn } from "@/lib/utils";
import SkeletonCard from "@/components/ui/skeleton-card";
import { SimpleProductCard } from "@/components/marketplace/simple-product-card";
import { CheckoutDrawer } from "@/components/marketplace/checkout-drawer";

// TYPE DEFINITION
export type Package = {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: string;
  description: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  order: number;
};

const FALLBACK_PACKAGES: Package[] = [
  {
    id: "f1",
    name: "Starter",
    price: 120000,
    currency: "TZS",
    billingPeriod: "one-time",
    description: "Perfect for individuals and small projects",
    features: ["1 Project Setup", "Basic Web Presence", "WhatsApp Support", "3 Revision Rounds"],
    isPopular: false,
    isActive: true,
    order: 1
  },
  {
    id: "f2",
    name: "Professional",
    price: 350000,
    currency: "TZS",
    billingPeriod: "one-time",
    description: "For growing businesses that need real systems",
    features: ["Full Web Application", "Firebase Integration", "AI Automation", "Admin Dashboard"],
    isPopular: true,
    isActive: true,
    order: 2
  }
];

export default function PricingPage() {
  const db = useFirestore();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const packagesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'packages'), orderBy('order', 'asc'));
  }, [db]);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: dbPackages, isLoading: isPkgLoading } = useCollectionOnce<Package>(packagesQuery);
  const { data: rawProducts, isLoading: isProdLoading } = useCollectionOnce<any>(productsQuery);

  const displayPackages = (dbPackages || FALLBACK_PACKAGES).filter(p => p.isActive);
  const displayProducts = (rawProducts || []).filter((p: any) => p.isAvailable !== false);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0
    }).format(amount).replace('TZS', 'TZS ');
  };

  const handleBuy = (product: any) => {
    setSelectedProduct({
      id: product.id,
      name: product.title || product.name,
      price: product.price,
      description: product.description,
      image: product.imageUrl
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="relative pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto space-y-32">
          
          <section className="text-center space-y-6 max-w-3xl mx-auto">
            <FadeContent threshold={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                <Sparkles className="h-3.5 w-3.5" />
                Strategic Investment Nodes
              </div>
              <h1 className="mt-6 text-4xl md:text-7xl font-headline font-black tracking-tighter text-foreground uppercase">
                Service <span className="text-primary italic">Matrix</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-xl font-medium leading-relaxed">
                Precision architecture tiers designed for scalable business growth.
              </p>
            </FadeContent>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {isPkgLoading ? (
              [1, 2, 3].map(i => <SkeletonCard key={i} variant="pricing" className="h-[550px]" />)
            ) : (
              displayPackages.map((pkg, idx) => (
                <FadeContent key={pkg.id} delay={idx * 100} className="h-full">
                  <Card className={cn(
                    "h-full flex flex-col border-2 rounded-[2.5rem] bg-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl relative group",
                    pkg.isPopular ? "border-primary shadow-primary/20 scale-[1.02] z-10 ring-2 ring-primary" : "hover:border-primary/30 border-border/50"
                  )}>
                    {pkg.isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-xl">
                        Most Popular Build
                      </div>
                    )}
                    
                    <CardHeader className="p-8 pt-10 text-center">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                        <Zap className="h-7 w-7" />
                      </div>
                      <CardTitle className="text-2xl font-black font-headline uppercase tracking-tight">{pkg.name}</CardTitle>
                      <div className="mt-4">
                         <span className="text-4xl font-black text-primary tracking-tighter">
                           {formatPrice(pkg.price)}
                         </span>
                      </div>
                    </CardHeader>
 
                    <CardContent className="p-8 pt-0 flex-1">
                      <div className="space-y-4">
                        {pkg.features?.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-3">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-foreground/80">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
 
                    <CardFooter className="p-8 pt-0">
                      <Button className="w-full h-14 rounded-2xl font-black uppercase text-[10px] gap-3 bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all" onClick={() => handleBuy(pkg)}>
                        <ShoppingCart size={18} /> Initialize Build
                      </Button>
                    </CardFooter>
                  </Card>
                </FadeContent>
              ))
            )}
          </div>
 
          {/* INTERACTIVE PRICING BLUEPRINT CALCULATOR */}
          <FadeContent delay={100} threshold={0.05}>
            <InteractivePricingCalculator />
          </FadeContent>
 
          <section className="space-y-16 pt-12 border-t border-border/50">
             <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                <div className="space-y-4 text-left">
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[9px] font-black uppercase tracking-[0.3em] border border-accent/20">
                      <FileText className="h-3.5 w-3.5" /> Digital Asset Vault
                   </div>
                   <h2 className="text-3xl md:text-6xl font-black font-headline tracking-tighter text-foreground uppercase">High-Value <span className="text-accent italic">Resources</span></h2>
                   <p className="text-muted-foreground text-sm md:text-lg max-w-xl font-medium leading-relaxed">
                     Automated expert guides, system blueprints, and creative assets.
                   </p>
                </div>
             </div>

             {isProdLoading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[1, 2, 3].map(i => <SkeletonCard key={i} variant="product" />) }
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                 {displayProducts.map((product: any, i: number) => (
                   <FadeContent key={product.id} delay={i * 100} threshold={0.1}>
                      <SimpleProductCard product={product} onBuy={() => handleBuy(product)} />
                   </FadeContent>
                 ))}
               </div>
             )}
          </section>

        </div>
      </main>

      <CheckoutDrawer 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        product={selectedProduct} 
      />
      <Footer />
    </div>
  );
}

function InteractivePricingCalculator() {
  const [selectedServices, setSelectedServices] = useState<string[]>(['web_development']);
  const [features, setFeatures] = useState({
    database: false,
    auth: false,
    ai: false,
    pdf: false,
  });
  const [pages, setPages] = useState<number>(5);
  const [timeline, setTimeline] = useState<'standard' | 'urgent' | 'flexible'>('standard');

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id) 
        : [...prev, id]
    );
  };

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculation Logic
  let basePrice = 0;
  if (selectedServices.includes('web_development')) basePrice += 350000;
  if (selectedServices.includes('design_branding')) basePrice += 150000;
  if (selectedServices.includes('ai_automation')) basePrice += 450000;
  if (selectedServices.includes('hosting_maintenance')) basePrice += 120000;

  let featuresPrice = 0;
  if (features.database) featuresPrice += 180000;
  if (features.auth) featuresPrice += 220000;
  if (features.ai) featuresPrice += 380000;
  if (features.pdf) featuresPrice += 120000;

  let totalBase = basePrice + featuresPrice;

  let pagesMultiplier = 1.0;
  if (pages > 20) pagesMultiplier = 2.0;
  else if (pages > 10) pagesMultiplier = 1.6;
  else if (pages > 5) pagesMultiplier = 1.3;

  let subtotal = totalBase * pagesMultiplier;

  let timelineMultiplier = 1.0;
  if (timeline === 'urgent') timelineMultiplier = 1.4;
  else if (timeline === 'flexible') timelineMultiplier = 0.85;

  const finalTzs = Math.round(subtotal * timelineMultiplier);
  const finalUsd = Math.round(finalTzs / 2700);

  const getBudgetRange = (price: number) => {
    if (price < 500000) return "250k-500k";
    if (price < 1000000) return "500k-1m";
    if (price < 2000000) return "1m-2m";
    return "2m+";
  };

  const bookingUrl = `/book?services=${selectedServices.join(',')}&projectName=Custom%20Blueprint%20Build&description=Estimated%20Custom%20System%20Blueprint%20Built.%20Details:%20Services%20[${selectedServices.join(', ')}].%20Features:%20${features.database ? 'Database, ' : ''}${features.auth ? 'User Auth/Portal, ' : ''}${features.ai ? 'AI Integration, ' : ''}${features.pdf ? 'PDF Generation, ' : ''}(Estimated%20pages:%20${pages})&budgetRange=${getBudgetRange(finalTzs)}&timeline=${timeline}`;

  return (
    <Card className="border-2 rounded-[2.5rem] bg-card/30 backdrop-blur-sm border-border/50 shadow-2xl relative overflow-hidden text-left p-6 md:p-10">
      <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-40 w-40 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* Left Side Controls */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-black font-headline uppercase tracking-tight text-foreground flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" /> Cost Blueprint Configurator
            </h3>
            <p className="text-xs text-muted-foreground font-medium">Configure your platform specifications to calculate real-time pricing estimates.</p>
          </div>

          {/* Service selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">1. Select Service Nodes</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'web_development', label: 'Web Systems', icon: Globe, base: '350,000 TZS' },
                { id: 'design_branding', label: 'Visual Identity', icon: Palette, base: '150,000 TZS' },
                { id: 'ai_automation', label: 'AI & Automation', icon: Bot, base: '450,000 TZS' },
                { id: 'hosting_maintenance', label: 'Maintenance', icon: Server, base: '120,000 TZS' },
              ].map(s => {
                const active = selectedServices.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleService(s.id)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                      active 
                        ? "border-primary bg-primary/[0.04] text-foreground shadow-lg" 
                        : "border-border/50 hover:border-primary/20 text-muted-foreground"
                    )}
                  >
                    <s.icon className={cn("h-5 w-5 shrink-0", active ? "text-primary" : "opacity-60")} />
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider">{s.label}</div>
                      <div className="text-[9px] font-medium opacity-65">Base: {s.base}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature toggles */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">2. Add System Capabilities</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'database', label: 'Database & Cloud Integration', cost: '+180,000 TZS', icon: Database },
                { id: 'auth', label: 'User Auth & Client Portal', cost: '+220,000 TZS', icon: Key },
                { id: 'ai', label: 'Gemini AI Assistant / Genkit', cost: '+380,000 TZS', icon: Cpu },
                { id: 'pdf', label: 'PDF & Invoice Document Engine', cost: '+120,000 TZS', icon: FileDown },
              ].map(f => {
                const active = features[f.id as keyof typeof features];
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleFeature(f.id as keyof typeof features)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                      active 
                        ? "border-accent bg-accent/[0.03] text-foreground" 
                        : "border-border/50 hover:border-accent/20 text-muted-foreground"
                    )}
                  >
                    <f.icon className={cn("h-5 w-5 shrink-0", active ? "text-accent" : "opacity-60")} />
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider">{f.label}</div>
                      <div className="text-[9px] font-medium opacity-65">{f.cost}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scale Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">3. Visual Scope (Pages/Views)</label>
              <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-full">{pages} {pages === 1 ? 'View' : 'Views'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-muted-foreground">1</span>
              <input
                type="range"
                min="1"
                max="30"
                value={pages}
                onChange={(e) => setPages(parseInt(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-muted accent-primary focus:outline-none"
              />
              <span className="text-xs font-bold text-muted-foreground">30</span>
            </div>
            <p className="text-[9px] font-semibold text-muted-foreground/80">Scale factor applies multipliers: 1-5 views (1.0x), 6-10 views (1.3x), 11-20 views (1.6x), 20+ views (2.0x).</p>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">4. Speed Registry</label>
            <div className="flex gap-2">
              {[
                { id: 'flexible', label: 'Flexible', desc: '15% Off', factor: '0.85x' },
                { id: 'standard', label: 'Standard', desc: 'Standard Speed', factor: '1.0x' },
                { id: 'urgent', label: 'Urgent', desc: '40% Surcharge', factor: '1.4x' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTimeline(t.id as any)}
                  className={cn(
                    "flex-1 py-3 px-2 rounded-xl border-2 text-center transition-all",
                    timeline === t.id
                      ? "bg-primary border-primary text-white"
                      : "border-border/50 text-foreground hover:border-primary/20"
                  )}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider">{t.label}</div>
                  <div className="text-[8px] font-medium opacity-80">{t.desc} ({t.factor})</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Quote Card */}
        <div className="lg:col-span-5 flex flex-col justify-between border-2 border-border/60 bg-muted/20 p-6 md:p-8 rounded-[2rem] relative">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] font-black uppercase tracking-widest">
              <Coins className="h-3.5 w-3.5" /> Est. System Valuation
            </div>

            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black font-headline text-primary tracking-tighter uppercase">
                {new Intl.NumberFormat('en-TZ', {
                  style: 'currency',
                  currency: 'TZS',
                  maximumFractionDigits: 0
                }).format(finalTzs).replace('TZS', 'TZS ')}
              </div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                ≈ ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(finalUsd)} USD
              </div>
            </div>

            {/* Spec breakdown */}
            <div className="pt-6 border-t border-border/50 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Specifications Log</h4>
              <div className="space-y-2.5 text-xs text-muted-foreground font-medium">
                <div className="flex justify-between">
                  <span>Base Platforms:</span>
                  <span className="text-foreground font-semibold">{selectedServices.length > 0 ? `${selectedServices.length} Selected` : 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Add-on Engines:</span>
                  <span className="text-foreground font-semibold">
                    {Object.values(features).filter(Boolean).length} Active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Visual Scope Multiplier:</span>
                  <span className="text-foreground font-semibold">{pagesMultiplier}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Timeline Speed:</span>
                  <span className="text-foreground font-semibold capitalize">{timeline} ({timelineMultiplier}x)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <Button asChild className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
              <Link href={bookingUrl}>
                <Zap className="h-4 w-4" /> Book Estimated Build
              </Link>
            </Button>
            <p className="text-[9px] text-center text-muted-foreground/60 mt-3 font-semibold">Taxes & hosting calculated separately. Direct booking integrates specs into client agreement flow.</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
