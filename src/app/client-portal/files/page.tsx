'use client';

import React from 'react';
import { useClientPortal } from '@/contexts/client-portal-context';
import { 
  FolderOpen, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Archive, 
  Video, 
  Music, 
  Table, 
  Presentation, 
  File,
  Loader2,
  Search
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { trackEvent } from '@/lib/analytics';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function ClientFilesPage() {
  const { project, isLoading } = useClientPortal();

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('pdf')) return { icon: FileText, color: 'text-red-500', bg: 'bg-red-500/10' };
    if (t.includes('png') || t.includes('jpg') || t.includes('jpeg') || t.includes('webp')) return { icon: ImageIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (t.includes('zip') || t.includes('rar') || t.includes('7z')) return { icon: Archive, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    if (t.includes('mp4') || t.includes('mov')) return { icon: Video, color: 'text-purple-500', bg: 'bg-purple-500/10' };
    if (t.includes('mp3') || t.includes('wav')) return { icon: Music, color: 'text-green-500', bg: 'bg-green-500/10' };
    if (t.includes('xlsx') || t.includes('csv')) return { icon: Table, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (t.includes('pptx')) return { icon: Presentation, color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { icon: File, color: 'text-zinc-400', bg: 'bg-zinc-400/10' };
  };

  const handleDownload = (fileName: string) => {
    trackEvent('download_deliverable', 'client_portal', fileName);
  };

  if (isLoading || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Syncing Vault Node...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:grow justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tighter">Deliverable <span className="text-primary">Vault</span></h1>
          <p className="text-muted-foreground font-medium mt-1">Official files, assets, and project documentation for your build.</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <input placeholder="Tafuta faili..." className="w-full h-11 bg-zinc-950 border-2 border-white/5 rounded-xl pl-10 text-xs font-bold text-white focus:border-primary outline-none" />
        </div>
      </div>

      {project.deliverables.length === 0 ? (
        <Card className="rounded-[3rem] border-2 border-dashed bg-zinc-950/40 p-20 flex flex-col items-center justify-center text-center opacity-30">
          <FolderOpen size={64} className="mb-6 text-muted-foreground" />
          <h3 className="text-xl font-black uppercase tracking-widest">Vault Empty</h3>
          <p className="text-sm mt-2 max-w-xs mx-auto">Files and project assets will appear here as the architect completes project milestones.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {project.deliverables.map((file, idx) => {
            const config = getFileIcon(file.fileType);
            return (
              <motion.div 
                key={file.id || idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="rounded-[2.5rem] border-2 bg-zinc-950/40 hover:border-primary/30 transition-all group h-full flex flex-col overflow-hidden">
                  <CardContent className="p-8 flex-1 flex flex-col">
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110", config.bg, config.color)}>
                      <config.icon size={28} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-bold text-lg leading-tight line-clamp-1 text-white">{file.name}</h4>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[8px] font-black uppercase border-white/10 text-muted-foreground">{file.fileType}</Badge>
                        {file.size && <span className="text-[10px] text-muted-foreground font-bold">{file.size}</span>}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-4 uppercase font-black tracking-widest">Uploaded: {file.uploadedAt ? format(file.uploadedAt.toDate ? file.uploadedAt.toDate() : file.uploadedAt, 'MMM dd, yyyy') : 'Recently'}</p>
                    </div>
                    <Button 
                      onClick={() => handleDownload(file.name)}
                      className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-2 mt-8 shadow-lg shadow-primary/20" 
                      asChild
                    >
                      <a href={file.url} target="_blank">
                        Download Now <Download size={14} />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
