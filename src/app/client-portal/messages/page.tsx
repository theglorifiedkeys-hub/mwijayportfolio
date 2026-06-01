'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useClientPortal } from '@/contexts/client-portal-context';
import { useFirestore, useUser } from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc,
} from 'firebase/firestore';
import { ClientMessage } from '@/lib/client-portal-types';
import { Send, Smartphone, Loader2, MessageSquare, ShieldCheck, User, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { portalAutoReply } from '@/ai/flows/portal-auto-reply';

export const dynamic = 'force-dynamic';

export default function ClientMessagesPage() {
  const { client, project, isLoading } = useClientPortal();
  const { user } = useUser();
  const db = useFirestore();
  
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project?.projectId || !db) return;

    const messagesRef = collection(db, 'client_messages', project.projectId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(doc => ({ ...doc.data() as ClientMessage, id: doc.id }));
      setMessages(msgs);
      
      // Mark admin messages as read
      snap.docs.forEach(async (d) => {
        const data = d.data() as ClientMessage;
        if (data.senderRole === 'admin' && !data.isRead) {
          await updateDoc(doc(db, 'client_messages', project.projectId, 'messages', d.id), { isRead: true });
        }
      });
    });

    return () => unsubscribe();
  }, [project?.projectId, db]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !project || !client || isSending) return;

    const userMessage = input.trim();
    setIsSending(true);
    setInput('');

    try {
      const messagesRef = collection(db!, 'client_messages', project.projectId, 'messages');
      
      // 1. Save user message
      await addDoc(messagesRef, {
        projectId: project.projectId,
        senderId: client.uid,
        senderName: client.name,
        senderRole: 'client',
        message: userMessage,
        timestamp: serverTimestamp(),
        isRead: false
      });

      // 2. Trigger AI Auto-Reply after 2 seconds if user is active
      setIsAiThinking(true);
      setTimeout(async () => {
        try {
          const aiResponse = await portalAutoReply({
            clientName: client.name,
            clientMessage: userMessage,
            projectName: project.projectName,
            adminStatus: "OFFLINE (UAUT Academic Intensification Phase)"
          });

          await addDoc(messagesRef, {
            projectId: project.projectId,
            senderId: 'ai_assistant',
            senderName: 'MWJ Assistant',
            senderRole: 'admin', // AI speaks as admin representative
            message: aiResponse.reply,
            timestamp: serverTimestamp(),
            isRead: false
          });
        } catch (aiErr) {
          console.error("AI Auto-reply signal failed:", aiErr);
        } finally {
          setIsAiThinking(false);
        }
      }, 2000);

    } catch (err) {
      console.error("Message send failed:", err);
    } finally {
      setIsSending(false);
    }
  };

  const formatDateLabel = (date: Date) => {
    if (isToday(date)) return 'Leo';
    if (isYesterday(date)) return 'Jana';
    return format(date, 'MMMM dd, yyyy');
  };

  if (isLoading || !project) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-6">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Syncing Signal Terminal...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-80px)]">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black font-headline tracking-tighter uppercase text-white">Terminal <span className="text-primary italic">Signals</span></h1>
          <div className="flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lead_Architect: BUSY (Academic)</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-xl border-white/10 text-white text-[9px] font-black uppercase tracking-widest gap-2 bg-white/5 h-10 px-4" asChild>
             <a href="https://wa.me/255620641695"><Smartphone size={14} /> Fast Track</a>
           </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-zinc-950/40 rounded-[2.5rem] border-2 border-white/5 p-6 mb-6 custom-scrollbar flex flex-col gap-4 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
           <MessageSquare size={300} />
        </div>

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 italic p-10">
            <Bot size={64} className="mb-6 text-primary" />
            <p className="text-sm font-bold uppercase tracking-widest">Awaiting Transmission</p>
            <p className="text-xs mt-2 max-w-xs mx-auto">Send a message to discuss project milestones. My AI will acknowledge instantly if I am away.</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isMe = msg.senderRole === 'client';
              const isAi = msg.senderId === 'ai_assistant';
              const showDate = i === 0 || formatDateLabel(messages[i-1].timestamp?.toDate() || new Date()) !== formatDateLabel(msg.timestamp?.toDate() || new Date());
              
              return (
                <React.Fragment key={msg.id || i}>
                  {showDate && msg.timestamp && (
                    <div className="flex justify-center my-6">
                       <span className="text-[9px] font-black uppercase tracking-widest bg-white/5 px-4 py-1 rounded-full text-muted-foreground border border-white/5">{formatDateLabel(msg.timestamp.toDate())}</span>
                    </div>
                  )}
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "flex flex-col max-w-[85%] md:max-w-[70%]",
                      isMe ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    {!isMe && (
                      <div className="flex items-center gap-2 mb-1.5 ml-1">
                         <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                           {isAi ? 'MWJ Assistant' : 'Mwijay Services'}
                         </span>
                         {isAi && <Sparkles size={10} className="text-primary animate-pulse" />}
                      </div>
                    )}
                    <div className={cn(
                      "p-5 rounded-[1.8rem] text-sm font-medium leading-relaxed shadow-xl",
                      isMe ? "bg-primary text-white rounded-tr-none" : 
                      isAi ? "bg-zinc-800 text-foreground border-2 border-primary/20 rounded-tl-none" : 
                      "bg-zinc-800 text-foreground rounded-tl-none border border-white/5"
                    )}>
                      {msg.message}
                    </div>
                    <span className="text-[8px] font-bold text-muted-foreground mt-1.5 px-1 uppercase tracking-widest">
                      {msg.timestamp ? format(msg.timestamp.toDate(), 'HH:mm') : 'Syncing...'}
                    </span>
                  </motion.div>
                </React.Fragment>
              );
            })}
            
            {isAiThinking && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 ml-2">
                 <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot size={14} className="text-primary animate-bounce" />
                 </div>
                 <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-75" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-150" />
                 </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl mb-4 flex gap-3 items-center">
         <AlertCircle className="text-amber-500 h-4 w-4 shrink-0" />
         <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tight">
           David is in academic intensity (UAUT). Response signal may be delayed. AI Assistant is monitoring.
         </p>
      </div>

      <form onSubmit={handleSend} className="relative group">
        <Textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Tuma ujumbe kwenda kwa Mwijay Services..."
          className="min-h-[64px] h-20 rounded-[2.2rem] bg-zinc-950 border-2 border-white/5 pr-20 pl-8 pt-6 resize-none focus-visible:ring-primary focus-visible:border-primary/50 transition-all custom-scrollbar font-medium text-white"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
           <Button 
            type="submit" 
            disabled={!input.trim() || isSending}
            size="icon" 
            className="h-12 w-12 rounded-full bg-primary text-white shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
           >
             {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={20} />}
           </Button>
        </div>
      </form>
    </div>
  );
}
