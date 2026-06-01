
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, Target, CheckCircle2 } from "lucide-react";
import { aiProjectMatchmaker, AIProjectMatchmakerOutput } from "@/ai/flows/ai-project-matchmaker";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";

export function ProjectMatchmaker() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIProjectMatchmakerOutput | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const output = await aiProjectMatchmaker({ query, language });
      setResult(output);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Matchmaker Error",
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 px-6 md:px-12 bg-muted/30">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            AI-Powered Assistant
          </div>
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Project Matchmaker</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tell me about your business needs or ask a question about my work, and I'll suggest the most relevant projects and skills.
          </p>
        </div>

        <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Describe your project or requirement
            </CardTitle>
            <CardDescription>Example: "I need a booking system for my salon" or "How can you help with automation?"</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <form onSubmit={handleMatch} className="flex gap-4">
              <Input
                placeholder="Type your needs here..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 h-12 text-base rounded-full px-6"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="h-12 w-12 rounded-full" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>

            {result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="p-4 rounded-xl bg-muted/50 border">
                  <p className="text-foreground leading-relaxed italic">
                    "{result.response}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.suggestedProjects && result.suggestedProjects.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        Suggested Projects
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.suggestedProjects.map((proj) => (
                          <Badge key={proj} variant="secondary" className="px-3 py-1 text-sm bg-background border">
                            {proj}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.suggestedActions && result.suggestedActions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Suggested Actions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.suggestedActions.map((action, index) => (
                          <Button 
                            key={index} 
                            asChild 
                            variant="outline" 
                            className="rounded-full px-4 h-10 text-xs border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <a 
                              href={action.link} 
                              target={action.type === 'whatsapp' || action.type === 'call' ? '_blank' : undefined} 
                              rel="noopener noreferrer"
                            >
                              {action.label}
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
