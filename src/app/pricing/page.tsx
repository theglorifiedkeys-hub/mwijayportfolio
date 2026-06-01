"use client";

import React, { useState } from "react";
import { Footer } from "@/components/footer";
import FadeContent from "@/components/ui/fade-content";
import { 
  Zap, 
  Sparkles,
  ShoppingCart,
  CheckCircle2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
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
