'use client';
/**
 * @fileOverview Progressive AI Chat Interface v3.
 * Synchronized with the Genkit Project Matchmaker flow.
 * Features structured rendering and direct action signals.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, User, Sparkles, MessageCircle, ArrowRight, Smartphone, Phone, Palette } from 'lucide-react';
import { aiProjectMatchmaker } from '@/ai/flows/ai-project-matchmaker';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { AIResponseRenderer } from './ai-response-renderer';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  suggestedProjects?: string[];
  suggestedActions?: { label: string; link: string; type: 'whatsapp' | 'call' | 'nav' | 'theme' }[];
  isError?: boolean;
}

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: '## Protocol Initiated\nHabari! I am Mwijay’s **AI Assistant**. How can I help you navigate the **architecture registry** today?' 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const next = isDark ? 'light' : 'dark';
    
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const result = await aiProjectMatchmaker({ 
        query: userMsg, 
        language: (language as 'en' | 'sw') 
      });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: result.response,
        intent: result.intent,
        suggestedProjects: result.suggestedProjects,
        suggestedActions: result.suggestedActions as any
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I encountered a signal interruption. David might be adjusting the AI core. Please transmit your message directly via WhatsApp for an immediate response.',
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background/50">
      {/* Messages Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar"
      >
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex flex-col max-w-[90%] md:max-w-[85%]",
            msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
          )}>
            <div className={cn(
              "rounded-[2.2rem] px-6 py-5 shadow-2xl transition-all duration-700",
              msg.role === 'user' 
                ? "bg-primary text-white rounded-tr-none" 
                : cn(
                    "bg-card border border-border/50 backdrop-blur-md rounded-tl-none", 
                    msg.isError && "border-destructive/30 bg-destructive/5",
                    !msg.isError && "bg-gradient-to-br from-primary/5 via-card to-background"
                  )
            )}>
              {msg.role === 'assistant' ? (
                <AIResponseRenderer text={msg.content} intent={msg.intent} />
              ) : (
                <p className="text-sm md:text-base font-medium leading-relaxed">{msg.content}</p>
              )}
            </div>

            {/* ERROR ACTION */}
            {msg.isError && (
              <div className="mt-4 w-full animate-in fade-in slide-in-from-bottom-2">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-black uppercase text-[10px] gap-2 rounded-2xl h-12 shadow-xl" asChild>
                  <a href="https://wa.me/255620641695">
                    <MessageCircle size={14} /> WhatsApp Lead Architect
                  </a>
                </Button>
              </div>
            )}

            {/* SUGGESTED ACTIONS (ELITE CHIPS) */}
            {(msg.suggestedActions || msg.suggestedProjects) && (
              <div className="mt-5 flex flex-wrap gap-2 justify-start animate-in fade-in slide-in-from-bottom-2 duration-1000">
                {msg.suggestedActions?.map((action, idx) => (
                  <Button 
                    key={idx}
                    variant="outline" 
                    size="sm" 
                    className="h-10 px-5 rounded-full border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-primary hover:text-white transition-all shadow-md group"
                    asChild={action.link !== '#theme'}
                    onClick={action.link === '#theme' ? toggleTheme : undefined}
                  >
                    {action.link === '#theme' ? (
                      <>
                        <Palette size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                        {action.label}
                      </>
                    ) : action.link.startsWith('/') ? (
                      <Link href={action.link}>
                        {action.type === 'nav' && <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />}
                        {action.label}
                      </Link>
                    ) : (
                      <a href={action.link} target="_blank" rel="noopener">
                        {action.type === 'whatsapp' && <Smartphone size={12} />}
                        {action.type === 'call' && <Phone size={12} />}
                        {action.label}
                      </a>
                    )}
                  </Button>
                ))}
                {msg.suggestedProjects?.map(p => (
                  <span key={p} className="text-[9px] font-black uppercase tracking-[0.2em] bg-muted/50 text-muted-foreground px-4 py-2 rounded-full border border-border/50">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-3 ml-2 animate-pulse">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Decoding Signal...</span>
          </div>
        )}
      </div>

      {/* Input Terminal */}
      <form onSubmit={handleSend} className="p-6 border-t border-border/50 bg-background/80 backdrop-blur-2xl">
        <div className="relative group">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search the architecture registry..."
            className="w-full h-16 bg-muted/30 border-2 border-border/50 rounded-[2rem] pl-8 pr-16 text-sm md:text-base font-medium focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2.5 opacity-20">
          <Sparkles size={12} className="text-primary" />
          <span className="text-[9px] font-black uppercase tracking-[0.6em] text-foreground">Registry Node v2.6.4</span>
        </div>
      </form>
    </div>
  );
}
