"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Bot, Database, Palette, Code, Loader2 } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import AnimatedContent from "@/components/ui/animated-content";

export function Skills({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const skillsRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return collection(firestore, 'users', userId, 'skills');
  }, [firestore, userId]);
  const { data: skills, isLoading } = useCollection(skillsRef);

  const categories = [
    { id: "dev", label: "Web Dev", icon: Globe },
    { id: "ai", label: "AI & Automation", icon: Bot },
    { id: "db", label: "Database", icon: Database },
    { id: "creative", label: "Creative", icon: Palette },
    { id: "prog", label: "Programming", icon: Code },
  ];

  const staticSkills: Record<string, any[]> = {
    dev: [
      { name: "Next.js", proficiency: 90 },
      { name: "React.js", proficiency: 85 },
      { name: "Tailwind CSS", proficiency: 95 },
      { name: "Node.js", proficiency: 75 },
    ],
    ai: [
      { name: "n8n Automation", proficiency: 90 },
      { name: "OpenRouter", proficiency: 85 },
      { name: "Google AI Studio", proficiency: 80 },
      { name: "Prompt Engineering", proficiency: 95 },
    ],
    db: [
      { name: "Firebase/Firestore", proficiency: 85 },
      { name: "SQL", proficiency: 70 },
    ],
    creative: [
      { name: "Adobe Photoshop", proficiency: 80 },
      { name: "Premiere Pro", proficiency: 75 },
      { name: "Figma", proficiency: 85 },
    ],
    prog: [
      { name: "JavaScript", proficiency: 90 },
      { name: "C", proficiency: 70 },
      { name: "Python", proficiency: 65 },
    ]
  };

  if (isLoading) return (
    <div className="py-20 flex justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <section id="skills" className="py-24 px-6 md:px-12 bg-muted/30">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-headline font-bold">Technical <span className="text-primary">Mastery</span></h2>
          <p className="text-muted-foreground text-lg">
            A comprehensive stack built for the unique challenges of the African tech landscape.
          </p>
        </div>

        <Tabs defaultValue="dev" className="w-full">
          <TabsList className="flex flex-wrap h-auto p-1 bg-background border rounded-2xl mb-12 max-w-3xl mx-auto justify-center">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="py-3 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"
              >
                <cat.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {(skills?.filter(s => s.categoryId === cat.id).length ? skills.filter(s => s.categoryId === cat.id) : staticSkills[cat.id]).map((skill: any) => (
                  <AnimatedContent key={skill.name} direction="vertical" distance={10}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="font-bold text-foreground">{skill.name}</span>
                        <span className="text-sm font-semibold text-secondary">{skill.proficiency}%</span>
                      </div>
                      <div className="h-2 w-full bg-background rounded-full overflow-hidden border">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-1000"
                          style={{ width: `${skill.proficiency}%` }}
                        />
                      </div>
                    </div>
                  </AnimatedContent>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}