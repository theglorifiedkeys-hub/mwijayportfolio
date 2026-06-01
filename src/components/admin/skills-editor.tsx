'use client';

import React, { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, Loader2, Code, Zap, Database, Briefcase, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const SKILL_CATEGORIES = [
  { id: "dev", label: "Web Development", icon: Code, color: "text-blue-500" },
  { id: "ai", label: "AI & Automation", icon: Zap, color: "text-yellow-500" },
  { id: "db", label: "Database / Architecture", icon: Database, color: "text-purple-500" },
  { id: "creative", label: "Creative Tech", icon: Award, color: "text-pink-500" },
  { id: "prog", label: "Core Programming", icon: Briefcase, color: "text-emerald-500" },
];

export function SkillsEditor({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const skillsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users', userId, 'skills');
  }, [firestore, userId]);
  const { data: skills, isLoading } = useCollection(skillsRef);
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 80, categoryId: 'dev' });
  const { toast } = useToast();

  const handleAddSkill = () => {
    if (!newSkill.name.trim() || !skillsRef) return;
    addDocumentNonBlocking(skillsRef, {
      ...newSkill,
      userId,
      isLearning: false,
    });
    setNewSkill({ name: '', proficiency: 80, categoryId: 'dev' });
    toast({ title: "Skill Implemented", description: `Node added to ${SKILL_CATEGORIES.find(c => c.id === newSkill.categoryId)?.label}` });
  };

  const handleUpdateProficiency = (id: string, val: number[]) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'users', userId, 'skills', id);
    updateDocumentNonBlocking(docRef, { proficiency: val[0] });
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'users', userId, 'skills', id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Node Archieved", variant: "destructive" });
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="md:col-span-4 space-y-8">
        <Card className="rounded-[2.5rem] border-2 shadow-xl sticky top-24 overflow-hidden">
          <CardHeader className="p-8 pb-4 bg-primary text-white">
            <CardTitle className="text-xl font-black font-headline flex items-center gap-3">
              <Plus className="h-5 w-5" /> Ingest Skill
            </CardTitle>
            <CardDescription className="text-primary-foreground/70">Add a new expertise vector to your matrix.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Expertise Token</Label>
              <Input 
                value={newSkill.name} 
                onChange={(e) => setNewSkill(s => ({...s, name: e.target.value}))}
                placeholder="e.g. Next.js, Python"
                className="h-12 rounded-2xl border-2"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Domain Cluster</Label>
              <Select 
                value={newSkill.categoryId} 
                onValueChange={(val) => setNewSkill(s => ({...s, categoryId: val}))}
              >
                <SelectTrigger className="h-12 rounded-2xl border-2">
                  <SelectValue placeholder="Select Domain" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2">
                  {SKILL_CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Proficiency Level</Label>
                <span className="text-lg font-black font-headline text-primary">{newSkill.proficiency}%</span>
              </div>
              <Slider 
                value={[newSkill.proficiency]} 
                onValueChange={(val) => setNewSkill(s => ({...s, proficiency: val[0]}))}
                max={100} 
                step={5}
                className="py-4"
              />
            </div>
            <Button onClick={handleAddSkill} className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 gap-2">
              <Plus className="h-4 w-4" /> Add Skill Node
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-8 space-y-12">
        {SKILL_CATEGORIES.map(cat => {
          const categorySkills = skills?.filter(s => s.categoryId === cat.id) || [];
          return (
            <div key={cat.id} className="space-y-6">
              <div className="flex items-center gap-4 border-b-2 pb-4 border-muted">
                <div className={cn("h-10 w-10 rounded-xl bg-muted flex items-center justify-center", cat.color)}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <h4 className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground">{cat.label}</h4>
                <div className="ml-auto bg-muted px-3 py-1 rounded-full text-[10px] font-black uppercase text-muted-foreground">
                  {categorySkills.length} Units
                </div>
              </div>

              {categorySkills.length === 0 ? (
                <div className="p-10 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-muted-foreground opacity-40">
                  <p className="text-xs font-bold uppercase tracking-widest italic">Matrix cluster empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {categorySkills.map((skill) => (
                    <Card key={skill.id} className="p-6 border-2 rounded-3xl bg-card hover:border-primary/20 hover:shadow-xl transition-all group overflow-hidden">
                      <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-black font-headline text-lg group-hover:text-primary transition-colors">{skill.name}</h4>
                          <span className="font-mono text-xs font-black bg-primary/5 px-2 py-1 rounded text-primary">{skill.proficiency}%</span>
                        </div>
                        <Slider 
                          value={[skill.proficiency]} 
                          onValueChange={(val) => handleUpdateProficiency(skill.id, val)}
                          max={100} 
                          step={5}
                        />
                        <div className="flex justify-end pt-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive h-8 w-8 p-0 rounded-full hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" 
                            onClick={() => handleDelete(skill.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
