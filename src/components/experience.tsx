"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, Briefcase, Award, Code, MapPin, Loader2, ShieldCheck } from "lucide-react";
import AnimatedContent from "@/components/ui/animated-content";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { TreeView } from "@/components/ui/tree-view";

const TECH_TREE_DATA = [
  {
    id: 'src',
    label: 'stack',
    type: 'folder',
    children: [
      {
        id: 'web',
        label: 'web-dev',
        type: 'folder',
        children: [
          { id: 'next', label: 'Next.js 15.tsx', type: 'file', fileType: 'ts' },
          { id: 'tail', label: 'Tailwind.css', type: 'file', fileType: 'css' },
          { id: 'framer', label: 'FramerMotion.ts', type: 'file', fileType: 'ts' }
        ]
      },
      {
        id: 'ai',
        label: 'automation-ai',
        type: 'folder',
        children: [
          { id: 'genkit', label: 'GenkitAI.ts', type: 'file', fileType: 'ts' },
          { id: 'n8n', label: 'n8n-workflows.json', type: 'file', fileType: 'json' },
          { id: 'py', label: 'PythonScripts.py', type: 'file', fileType: 'ts' }
        ]
      },
      { id: 'read', label: 'README.md', type: 'file', fileType: 'md' }
    ]
  }
];

/**
 * ExperienceContent - Internal component that handles data fetching.
 * Isolated to prevent SSR hooks execution.
 */
function ExperienceContent({ userId }: { userId: string }) {
  const firestore = useFirestore();
  
  const experienceRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return collection(firestore, 'users', userId, 'experienceItems');
  }, [firestore, userId]);

  const { data: dbExperience, isLoading } = useCollection(experienceRef as any);

  if (isLoading) return (
    <div className="py-20 flex justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const educationItems = dbExperience?.filter(i => i.type === 'education') || [];
  const profItems = dbExperience?.filter(i => i.type === 'work' || i.type === 'learning') || [];

  return (
    <div className="space-y-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-12">
            <div className="flex items-center gap-4 border-b pb-4 border-muted">
              <div className="h-12 w-12 rounded-2xl neu-raised flex items-center justify-center text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-headline font-bold">Academic Core</h3>
            </div>

            <div className="relative border-l-2 border-primary/20 pl-8 ml-6 space-y-12">
              {educationItems.length > 0 ? educationItems.sort((a,b) => b.displayOrder - a.displayOrder).map((item) => (
                <TimelineItem 
                  key={item.id}
                  year={`${new Date(item.startDate).getFullYear()} - ${item.isCurrent ? 'Present' : new Date(item.endDate).getFullYear()}`}
                  title={item.title}
                  org={item.organizationInstitution}
                  loc={item.location}
                  desc={item.description}
                  isCurrent={item.isCurrent}
                />
              )) : (
                <TimelineItem 
                  year="2025 - Present"
                  title="BBIT - Bachelor of Business IT"
                  org="United Africa University of Tanzania (UAUT)"
                  loc="Kigamboni Campus"
                  desc="Focusing on information systems, business strategy, and AI-driven technical architecture."
                  isCurrent
                />
              )}
            </div>

            <div className="flex items-center gap-4 border-b pb-4 border-muted pt-8">
              <div className="h-12 w-12 rounded-2xl neu-raised flex items-center justify-center text-secondary">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-headline font-bold">Professional Registry</h3>
            </div>

            <div className="relative border-l-2 border-secondary/20 pl-8 ml-6 space-y-12">
              {profItems.length > 0 ? profItems.sort((a,b) => b.displayOrder - a.displayOrder).map((item) => (
                <TimelineItem 
                  key={item.id}
                  year={`${new Date(item.startDate).getFullYear()} - ${item.isCurrent ? 'Present' : new Date(item.endDate).getFullYear()}`}
                  title={item.title}
                  org={item.organizationInstitution}
                  loc={item.location}
                  desc={item.description}
                  isCurrent={item.isCurrent}
                  color="secondary"
                />
              )) : (
                <TimelineItem 
                  year="2025 - Present"
                  title="Freelance Automation Architect"
                  org="Mwijay Services"
                  loc="Dar es Salaam"
                  desc="Developing AI-powered workflows and Next.js platforms for Tanzanian startups."
                  isCurrent
                  color="secondary"
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-12">
            <div className="flex items-center gap-4 border-b pb-4 border-muted">
              <div className="h-12 w-12 rounded-2xl neu-raised flex items-center justify-center text-accent">
                <Code className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-headline font-bold">Tech Anatomy</h3>
            </div>
            
            <AnimatedContent direction="horizontal" distance={30}>
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  Explore my technical ecosystem. I structure my projects with modularity and scalability in mind.
                </p>
                <TreeView data={TECH_TREE_DATA as any} className="min-h-[400px]" />
              </div>
            </AnimatedContent>

            <div className="space-y-8 pt-8">
              <div className="flex items-center gap-4 border-b pb-4 border-muted">
                <div className="h-12 w-12 rounded-2xl neu-raised flex items-center justify-center text-green-600">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-headline font-bold">Verified Skills</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {[
                  "Google: AI for Content Creation",
                  "Google: AI for Data Analysis",
                  "Google: AI for Research & Insights"
                ].map((cert) => (
                  <div key={cert} className="flex items-center gap-3 p-4 rounded-2xl neu-raised bg-card/50 hover:scale-[1.02] transition-transform">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

export function Experience({ userId }: { userId: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <div className="py-20 flex justify-center opacity-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return <ExperienceContent userId={userId} />;
}

function TimelineItem({ year, title, org, loc, desc, isCurrent, color = "primary" }: any) {
  const dotColor = color === "primary" ? "bg-primary shadow-[0_0_15px_rgba(49,130,206,0.5)]" : "bg-secondary shadow-[0_0_15px_rgba(30,58,95,0.5)]";
  const badgeColor = color === "primary" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary";

  return (
    <AnimatedContent direction="horizontal" distance={20}>
      <div className="relative group">
        <div className={`absolute -left-[41px] top-1 h-5 w-5 rounded-full ${dotColor} border-4 border-background z-10 transition-transform group-hover:scale-125`} />
        <div className="space-y-2">
          <Badge variant="outline" className={`${badgeColor} border-none font-bold rounded-full px-3 py-0.5 text-[10px] uppercase tracking-widest`}>
            {year}
          </Badge>
          <h4 className="text-xl font-bold tracking-tight text-foreground/90">{title}</h4>
          <p className="text-muted-foreground font-semibold text-sm">{org}</p>
          {loc && (
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
              <MapPin className="h-2.5 w-2.5" /> {loc}
            </p>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed pt-2 max-w-lg font-medium">
            {desc}
          </p>
        </div>
      </div>
    </AnimatedContent>
  );
}
