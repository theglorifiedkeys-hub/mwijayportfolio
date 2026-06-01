"use client";

import React, { useState, useEffect } from "react";
import { Cpu, Rocket, Globe, GraduationCap, Check, Loader2 } from "lucide-react";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import FadeContent from "@/components/ui/fade-content";
import AnimatedContent from "@/components/ui/animated-content";
import { LocationMap } from "@/components/ui/location-map";
import CountUp from "@/components/ui/count-up";
import OptimizedImage from "@/components/ui/optimized-image";

export function About({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const [isReady, setIsReady] = useState(false);
  
  const profileRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);
  
  const { data: profile, isLoading } = useDoc(profileRef);

  useEffect(() => {
    if (!isLoading) setIsReady(true);
  }, [isLoading]);

  const displayData = {
    aboutBio: profile?.aboutBio || "Building intelligent applications and automated systems that solve real-world problems in the 2026 digital landscape.",
    profileImageUrl: profile?.profileImageUrl || "",
    systemsBuilt: Number(profile?.systemsBuilt) || 12,
    webSystems: Number(profile?.webSystems) || 10
  };

  if (isLoading) return (
    <div className="py-32 flex flex-col items-center justify-center space-y-4 opacity-50">
       <Loader2 className="h-10 w-10 animate-spin text-primary" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em]">Decrypting Profile Node...</p>
    </div>
  );

  return (
    <section id="about" className="py-24 px-6 md:px-12 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-5 space-y-8">
          <AnimatedContent direction="horizontal" distance={50} reverse={true}>
            <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-muted bg-muted group">
              {displayData.profileImageUrl ? (
                <OptimizedImage
                  src={displayData.profileImageUrl}
                  alt="David Erick Mwijage"
                  fill
                  priority
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-10">
                   <Cpu size={80} />
                </div>
              )}
            </div>
          </AnimatedContent>
          
          <div className="flex justify-center lg:justify-start">
            <LocationMap location="Kongowe, Dar es Salaam" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <FadeContent blur={true} duration={800}>
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-headline font-bold">Based in <span className="text-primary">Kongowe</span>, Dreaming Global</h2>
              <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                {displayData.aboutBio}
              </p>
            </div>
          </FadeContent>

          <FadeContent delay={200}>
            <div className="space-y-6 text-foreground/80 leading-relaxed font-medium">
              <p>
                My passion lies at the intersection of AI and software engineering. I focus on building applications that move beyond just consuming technology to architecting the intelligent systems of 2026.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {[
                  "AI App Architecture",
                  "Process Automation",
                  "Full-Stack Web Systems",
                  "Data-Driven Decisions"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-xs uppercase tracking-widest">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeContent>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
            {[
              { label: "AI Builds", value: displayData.systemsBuilt, suffix: "+", icon: Cpu },
              { label: "Web Systems", value: displayData.webSystems, suffix: "+", icon: Globe },
              { label: "Performance", value: 100, suffix: "%", icon: Rocket },
              { label: "UAUT Cohort", value: 2025, suffix: "", icon: GraduationCap },
            ].map((fact, idx) => (
              <AnimatedContent key={fact.label} direction="vertical" distance={20} delay={idx * 0.1}>
                <div className="text-center space-y-2">
                  <div className="h-10 w-10 mx-auto rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                    <fact.icon className="h-5 w-5" />
                  </div>
                  <p className="text-xl font-headline font-bold text-foreground">
                    <CountUp to={fact.value} duration={2} />{fact.suffix}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{fact.label}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
