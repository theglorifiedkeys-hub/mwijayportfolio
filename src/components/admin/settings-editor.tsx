
'use client';

import React, { useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, Settings, BarChart3, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SettingsEditor() {
  const db = useFirestore();
  const statsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'site_config', 'stats');
  }, [db]);
  const { data: stats, isLoading } = useDoc(statsRef);
  const [formData, setFormData] = useState<any>(null);
  const [saving, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (stats) setFormData(stats);
  }, [stats]);

  const handleSave = async () => {
    if (!db || !formData || !statsRef) return;
    setLoading(true);
    try {
      await updateDoc(statsRef, {
        ...formData,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Registry Updated", description: "Global stats synced successfully." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !formData) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-black font-headline tracking-tight">Site <span className="text-primary">Configuration</span></h3>
        <p className="text-sm text-muted-foreground font-medium">Manage global variables and live work status tokens.</p>
      </div>

      <Card className="border-2 rounded-[2.5rem] bg-card/50 shadow-xl overflow-hidden">
        <CardHeader className="p-8 border-b bg-muted/20">
          <CardTitle className="text-xl font-black font-headline flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" /> Core Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Projects Completed</Label>
              <Input type="number" value={formData.projectsCompleted} onChange={(e) => setFormData({...formData, projectsCompleted: parseInt(e.target.value)})} className="h-12 rounded-2xl border-2" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Happy Clients</Label>
              <Input type="number" value={formData.happyClients} onChange={(e) => setFormData({...formData, happyClients: parseInt(e.target.value)})} className="h-12 rounded-2xl border-2" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Lines of Code</Label>
              <Input type="number" value={formData.linesOfCode} onChange={(e) => setFormData({...formData, linesOfCode: parseInt(e.target.value)})} className="h-12 rounded-2xl border-2" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Years Experience</Label>
              <Input type="number" value={formData.yearsExperience} onChange={(e) => setFormData({...formData, yearsExperience: parseInt(e.target.value)})} className="h-12 rounded-2xl border-2" />
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 space-y-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Currently Working On</Label>
              <Input value={formData.currentProject} onChange={(e) => setFormData({...formData, currentProject: e.target.value})} className="h-12 rounded-2xl border-2" />
            </div>

            <div className="flex items-center justify-between p-6 rounded-3xl border-2 border-dashed bg-muted/10">
              <div className="space-y-1">
                <Label className="text-sm font-black uppercase tracking-widest">Availability Signal</Label>
                <p className="text-xs text-muted-foreground font-medium">Broadcast your status to the public badge.</p>
              </div>
              <Switch checked={formData.availableForWork} onCheckedChange={(val) => setFormData({...formData, availableForWork: val})} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-8 bg-muted/20 border-t flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2 h-12 px-8 rounded-full font-bold shadow-xl shadow-primary/20 bg-primary text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Deploy Configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
