"use client";

import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';

/**
 * ChatBot - Deferred JS Strategy.
 * The core logic and Genkit synchronization load ONLY when the button is clicked.
 */
const DeferredChatInterface = dynamic(() => import('@/components/chat/chat-interface').then(m => m.ChatInterface), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin" /></div>
});

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[6000]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[320px] md:w-[400px] h-[550px] bg-background/95 backdrop-blur-2xl border-2 border-primary/20 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white">
                  <Bot size={22} />
                </div>
                <h4 className="font-headline font-black text-xs uppercase tracking-widest">AI Assistant</h4>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            
            <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
              <DeferredChatInterface />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 md:h-16 md:w-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white shadow-2xl border-2 border-white/10"
      >
        <Bot size={28} />
        <div className="absolute top-1.5 right-1.5 h-3 w-3 bg-green-500 rounded-full border-2 border-primary animate-pulse" />
      </motion.button>
    </div>
  );
}
