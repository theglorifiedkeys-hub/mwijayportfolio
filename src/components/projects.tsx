"use client";

import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  Loader2, 
  Maximize2, 
  X,
  Globe,
  Github
} from "lucide-react";
import AnimatedContent from "@/components/ui/animated-content";
import { useCollectionOnce, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trackProjectView } from '@/lib/analytics';

/**
 * Projects - Displays the work gallery.
 * OPTIMIZED: Uses useCollectionOnce to reduce Firestore read costs.
 */
export function Projects({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const projectsRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return collection(firestore, 'users', userId, 'projects');
  }, [firestore, userId]);
  const { data: dbProjects, isLoading } = useCollectionOnce(projectsRef);

  if (isLoading) return (
    <div className="py-20 flex justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const projectsToDisplay = dbProjects || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projectsToDisplay.sort((a: any, b: any) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).map((proj: any, idx: number) => (
        <ProjectCard key={proj.id} proj={proj} idx={idx} />
      ))}
      
      {projectsToDisplay.length === 0 && (
         <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] opacity-30">
            <p className="font-black uppercase tracking-widest text-sm italic">Gallery empty • Map builds in Admin Console</p>
         </div>
      )}
    </div>
  );
}

function ProjectCard({ proj, idx }: { proj: any, idx: number }) {
  const handleOpen = () => {
    trackProjectView(proj.id, proj.name);
  };

  return (
    <AnimatedContent direction="vertical" delay={idx * 0.1}>
      <Dialog onOpenChange={(open) => open && handleOpen()}>
        <DialogTrigger asChild>
          <div className="h-full transition-all duration-500 ease-out cursor-pointer group text-left">
            <Card className="group overflow-hidden border-2 hover:border-primary/40 transition-all h-full flex flex-col rounded-[2.5rem] bg-card hover:shadow-2xl relative border-border/50 shadow-sm">
              <div className="relative aspect-video overflow-hidden bg-muted">
                {proj.thumbnailImageUrl && (
                  <Image
                    src={proj.thumbnailImageUrl}
                    alt={proj.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    priority={idx < 3}
                  />
                )}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-white/90 text-primary p-3 rounded-full shadow-xl transform scale-50 group-hover:scale-100 transition-transform duration-500">
                    <Maximize2 className="h-6 w-6" />
                  </div>
                </div>
              </div>
              
              <CardContent className="p-8 flex-1 flex flex-col space-y-4 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Zap className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{proj.type || "Technical Build"}</span>
                  </div>
                  <h4 className="text-2xl font-headline font-black tracking-tight text-foreground group-hover:text-primary transition-colors uppercase">{proj.name}</h4>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 font-medium">
                  {proj.description}
                </p>

                <div className="pt-4 mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
                  <span className="underline decoration-primary/30 underline-offset-4">Open System Brief</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogTrigger>

        <DialogContent className="fixed left-[50%] top-[50%] z-[7000] grid w-full max-w-[95vw] md:max-w-5xl translate-x-[-50%] translate-y-[-50%] h-[85vh] p-0 border-none bg-background shadow-2xl rounded-[2.5rem] overflow-hidden outline-none">
          <ScrollArea className="h-full w-full custom-scrollbar" data-lenis-prevent>
            <div className="p-8 md:p-12 space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                   PROJECT_NODE_{String(idx + 1).padStart(2, '0')}
                </div>
                <DialogTitle className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-foreground leading-tight uppercase">
                  {proj.name}
                </DialogTitle>
                <div className="flex wrap gap-3 pt-2">
                   <Badge variant="outline" className="rounded-full border-border/50 text-muted-foreground font-black uppercase text-[8px] px-3">{proj.type}</Badge>
                   <Badge variant="outline" className="rounded-full border-primary/20 text-primary font-black uppercase text-[8px] px-3 bg-primary/5">2026_ARCHITECTURE</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7 space-y-8">
                  <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-border/50 shadow-2xl bg-zinc-950 group/img">
                    {proj.thumbnailImageUrl && (
                      <Image src={proj.thumbnailImageUrl} alt={proj.name} fill className="object-cover group-hover/img:scale-105 transition-transform duration-1000" priority />
                    )}
                  </div>
                  
                  {proj.screenshots && proj.screenshots.length > 0 && (
                    <div className="grid grid-cols-1 gap-8 pt-4">
                       {proj.screenshots.map((url: string, i: number) => (
                         <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border border-border/30 bg-muted">
                           <Image src={url} alt={`Preview ${i}`} fill className="object-cover" />
                         </div>
                       ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-5 space-y-10">
                  <div className="space-y-6 bg-muted/20 p-8 rounded-3xl border border-border/50">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Technical Narrative</h5>
                    <p className="text-base md:text-lg text-foreground leading-relaxed font-medium whitespace-pre-wrap">
                      {proj.description}
                    </p>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-border/50">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">System Signals</h5>
                    <div className="flex flex-col gap-3">
                      {proj.liveUrl && (
                        <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl bg-primary text-primary-foreground" asChild>
                          <a href={proj.liveUrl} target="_blank" rel="noopener"><Globe size={16} /> Live Environment</a>
                        </Button>
                      )}
                      {proj.githubUrl && (
                        <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 border-2 text-foreground" asChild>
                          <a href={proj.githubUrl} target="_blank" rel="noopener"><Github size={16} /> Source Repository</a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-20" />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </AnimatedContent>
  );
}
