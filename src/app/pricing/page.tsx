"use client";

import React, { useState } from "react";
import Link from "next/link";
import { collection, orderBy, query } from "firebase/firestore";
import { ArrowRight, CheckCircle2, ExternalLink, FileText, Sparkles, Zap } from "lucide-react";
import { useCollectionOnce, useFirestore, useMemoFirebase } from "@/firebase";
import { Footer } from "@/components/footer";
import FadeContent from "@/components/ui/fade-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import SkeletonCard from "@/components/ui/skeleton-card";
import { SimpleProductCard } from "@/components/marketplace/simple-product-card";
import { CheckoutDrawer } from "@/components/marketplace/checkout-drawer";
import { ADDITIONAL_SERVICES, formatTsh, WEB_PACKAGES } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const db = useFirestore();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const productsQuery = useMemoFirebase(() => db ? query(collection(db, 'products'), orderBy('createdAt', 'desc')) : null, [db]);
  const { data: products, isLoading } = useCollectionOnce<any>(productsQuery);
  const availableProducts = (products || []).filter((product: any) => product.isAvailable !== false);

  return (
    <div className="min-h-screen bg-background">
      <main className="relative pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto space-y-24 md:space-y-32">
          <section className="text-center space-y-6 max-w-3xl mx-auto">
            <FadeContent threshold={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                <Sparkles className="h-3.5 w-3.5" /> Clear pricing
              </div>
              <h1 className="mt-6 text-4xl md:text-7xl font-headline font-black tracking-tighter text-foreground uppercase">
                Your project, <span className="text-primary italic">clearly priced.</span>
              </h1>
              <p className="mt-5 text-muted-foreground text-sm md:text-xl font-medium leading-relaxed">
                Start with a package that fits. For custom work, we’ll agree on the scope and provide a written quote before work begins.
              </p>
            </FadeContent>
          </section>

          <section aria-labelledby="web-packages">
            <div className="mb-8 space-y-2"><h2 id="web-packages" className="text-2xl md:text-3xl font-black font-headline uppercase tracking-tight">Websites & portals</h2><p className="text-muted-foreground">Website packages aligned with Altraware Technology.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {WEB_PACKAGES.map((pkg, idx) => (
                <FadeContent key={pkg.id} delay={idx * 100} className="h-full">
                  <Card className={cn("h-full flex flex-col border-2 rounded-[2.5rem] bg-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl relative group", pkg.popular ? "border-primary shadow-primary/20 ring-2 ring-primary" : "hover:border-primary/30 border-border/50")}>
                    {pkg.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full whitespace-nowrap">Most popular</div>}
                    <CardHeader className="p-8 pt-10">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6"><Zap className="h-7 w-7" /></div>
                      <CardTitle className="text-2xl font-black font-headline uppercase tracking-tight">{pkg.name}</CardTitle>
                      <p className="text-sm text-muted-foreground leading-relaxed">{pkg.description}</p>
                      <div className="pt-3"><span className="text-3xl font-black text-primary tracking-tighter">{formatTsh(pkg.price)}</span><span className="text-xs text-muted-foreground ml-2">/ fixed package</span></div>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 flex-1"><div className="space-y-4">{pkg.features.map(feature => <div key={feature} className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span className="text-sm font-medium text-foreground/80">{feature}</span></div>)}</div></CardContent>
                    <CardFooter className="p-8 pt-0"><Button asChild className="w-full h-14 rounded-2xl font-black uppercase text-[10px] gap-3"><a href={`https://altra.tanzaniareach.com/contact?package=${pkg.id}`}>Discuss {pkg.name} <ArrowRight size={16} /></a></Button></CardFooter>
                  </Card>
                </FadeContent>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8" aria-labelledby="custom-work">
            <div className="rounded-[2.5rem] border-2 border-border/50 bg-card/50 p-8 md:p-10 space-y-6">
              <h2 id="custom-work" className="text-2xl md:text-3xl font-black font-headline uppercase tracking-tight">Apps & business systems</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">Every system is different. These are starting prices; the final quote depends on your requirements.</p>
              {ADDITIONAL_SERVICES.map(service => <div key={service.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/50 pt-5"><div><h3 className="font-bold">{service.name}</h3><p className="text-sm text-muted-foreground">{service.description}</p></div><span className="text-primary font-black whitespace-nowrap">From {formatTsh(service.price)}</span></div>)}
              <Button asChild className="rounded-2xl h-12"><Link href="/contact">Tell me about your project <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            </div>
            <div className="rounded-[2.5rem] border-2 border-primary/20 bg-primary/5 p-8 md:p-10 space-y-6 flex flex-col items-start justify-center">
              <h2 className="text-2xl md:text-3xl font-black font-headline uppercase tracking-tight">Need an estimate?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">Explore features, timelines and support options using Altraware’s estimator. Estimates are indicative; your final quote is agreed in writing.</p>
              <Button asChild variant="outline" className="rounded-2xl h-12 border-2"><a href="https://altra.tanzaniareach.com/pricing">Open Altraware pricing <ExternalLink className="ml-2 h-4 w-4" /></a></Button>
              <p className="text-xs text-muted-foreground">Hosting, support, VAT and other extras depend on the agreed scope. Check the package details before booking.</p>
            </div>
          </section>

          {(isLoading || availableProducts.length > 0) && <section className="space-y-10 pt-12 border-t border-border/50">
            <div className="space-y-4"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[9px] font-black uppercase tracking-[0.3em] border border-accent/20"><FileText className="h-3.5 w-3.5" /> Digital resources</div><h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter uppercase">Guides & <span className="text-accent italic">resources</span></h2><p className="text-muted-foreground">Explore available digital products.</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">{isLoading ? [1, 2, 3].map(i => <SkeletonCard key={i} variant="product" />) : availableProducts.map((product: any, i: number) => <FadeContent key={product.id} delay={i * 100} threshold={0.1}><SimpleProductCard product={product} onBuy={() => setSelectedProduct({ id: product.id, name: product.title || product.name, price: product.price, description: product.description, image: product.imageUrl })} /></FadeContent>)}</div>
          </section>}
        </div>
      </main>
      <CheckoutDrawer isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} product={selectedProduct} />
      <Footer />
    </div>
  );
}
