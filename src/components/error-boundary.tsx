'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary - Component-level crash shield.
 * Protects specific UI sections from taking down the whole app.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('System Exception Signal:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 rounded-[2.5rem] border-2 border-dashed border-destructive/20 bg-destructive/5 text-center space-y-6">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto opacity-40" />
          <div className="space-y-2">
            <h3 className="text-xl font-black font-headline uppercase tracking-tight">Component Decryption Failed</h3>
            <p className="text-muted-foreground text-sm font-medium">A technical error occurred in this segment of the registry.</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-xl h-10 px-6 font-black uppercase text-[10px] border-destructive/20 hover:bg-destructive hover:text-white transition-all"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw size={14} className="mr-2" /> Reload Logic
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
