import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, GraduationCap, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getAdminDb } from "@/lib/firebase-admin";
import { getCloudinaryVideoUrl, getCloudinaryImageUrl } from "@/lib/cloudinary";
import { unstable_noStore as noStore } from 'next/cache';
import { TypewriterText } from "@/components/ui/scroll-primitives";

/**
 * Hero - High Performance Server Component.
 * Tagline now uses a typewriter effect for premium engagement.
 */
export async function Hero({ userId }: { userId: string }) {
  noStore();
  
  let profile: any = null;
  try {
    const db = getAdminDb();
    if (db) {
      const snap = await db.collection('users').doc(userId).get();
      profile = snap.exists ? snap.data() : null;
    }
  } catch (e) {
    console.warn("📡 [Hero Registry] Fetch failed.");
  }

  const location = profile?.location || "Dar es Salaam, TZ";
  const program = profile?.program || "IT Specialist";
  const taglineStr = profile?.heroTagline || "Building Web Systems*AI Automation";
  const taglines = taglineStr.split('*');
  
  const bgAsset = profile?.heroBackgroundUrl || "";
  const isVideo = bgAsset.includes('.mp4') || bgAsset.includes('video/upload');

  const lcpImageUrl = isVideo ? getCloudinaryImageUrl(bgAsset.replace('.mp4', '.jpg'), 1920) : getCloudinaryImageUrl(bgAsset, 1920);

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 md:px-12 pt-32 pb-24 overflow-hidden bg-background text-center">
      <div className="absolute inset-0 z-0">
        {bgAsset ? (
          <>
            <Image 
              src={lcpImageUrl} 
              alt="Handshake Background" 
              fill 
              priority 
              className="object-cover opacity-20 grayscale" 
              sizes="100vw"
            />
            {isVideo && (
              <video 
                autoPlay muted loop playsInline 
                className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"
              >
                <source src={getCloudinaryVideoUrl(bgAsset)} type="video/mp4" />
              </video>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <div className="max-w-5xl mx-auto w-full relative z-10 space-y-12">
        <header className="space-y-6">
          <div className="flex flex-wrap justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
              <MapPin className="h-3.5 w-3.5" /> {location}
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-primary/20 text-accent text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
              <GraduationCap className="h-3.5 w-3.5" /> {program}
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-headline font-black leading-[0.9] tracking-tighter text-foreground uppercase">
            MWIJAY <span className="text-primary italic">DAVIE</span>
          </h1>

          <h2 className="text-lg md:text-2xl lg:text-3xl text-primary font-bold tracking-tight italic min-h-[1.5em]">
            <TypewriterText words={taglines} speed={70} pauseTime={2500} />
          </h2>
        </header>

        <p className="text-base md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
          I build high-performance websites and intelligent AI systems to grow your business infrastructure.
        </p>

        <div className="flex flex-wrap justify-center gap-6 pt-6">
          <Button size="lg" className="rounded-full px-12 h-16 text-sm font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 text-white border-none transition-all" asChild>
            <Link href="/book">Start Your Project <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-12 h-16 text-sm font-black uppercase tracking-widest border-2 border-border/80 hover:bg-primary/10 text-foreground bg-transparent transition-all" asChild>
            <Link href="/agreement">Sign Agreement <FileText size={20} className="ml-2" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
