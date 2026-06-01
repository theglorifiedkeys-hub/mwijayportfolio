
"use client";

import { SignaturePad } from "@ark-ui/react/signature-pad";
import { cn } from "@/lib/utils";

interface BasicSignaturePadProps {
  onDrawEnd?: (dataUri: string) => void;
  className?: string;
}

export default function BasicSignaturePad({ onDrawEnd, className }: BasicSignaturePadProps) {
  return (
    <div className={cn("bg-card w-full rounded-2xl border-2 border-border/50 overflow-hidden", className)}>
      <SignaturePad.Root 
        onDrawEnd={(details) => {
          // details.getDataUrl('image/png') provides the signature data
          details.getDataUrl('image/png').then(url => {
            if (onDrawEnd) onDrawEnd(url);
          });
        }}
      >
        <div className="p-4 border-b border-border/50 bg-muted/20 flex justify-between items-center">
          <SignaturePad.Label className="text-[10px] font-black uppercase tracking-widest text-primary">
            Digital Identity Signature *
          </SignaturePad.Label>
          <SignaturePad.ClearTrigger className="text-[9px] font-bold text-muted-foreground hover:text-destructive uppercase tracking-widest bg-muted px-3 py-1 rounded-full transition-colors">
            Clear Pad
          </SignaturePad.ClearTrigger>
        </div>
        
        <SignaturePad.Control className="relative w-full h-40 bg-white dark:bg-zinc-950">
          <SignaturePad.Segment className="w-full h-full stroke-primary fill-none stroke-[3]" />
          <SignaturePad.Guide className="absolute bottom-6 left-6 right-6 border-b-2 border-dashed border-muted/50" />
        </SignaturePad.Control>
      </SignaturePad.Root>
    </div>
  );
}
