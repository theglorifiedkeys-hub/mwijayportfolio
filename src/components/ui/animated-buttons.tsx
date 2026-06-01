'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MessageCircle, Instagram, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 1. Send Message Button (Animated Plane with Theme Adaptation)
 */
export const SendMessageButton = ({ 
  className, 
  loading, 
  submitted,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; submitted?: boolean }) => {
  return (
    <button 
      className={cn("send-button-wrapper group", className)} 
      disabled={loading || submitted}
      {...props}
    >
      <div className="outline-animation" />
      <div className={cn("state state--default", (submitted || loading) && "opacity-0")}>
        <div className="icon">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path d="M14.2199 21.63C13.0399 21.63 11.3699 20.8 10.0499 16.83L9.32988 14.67L7.16988 13.95C3.20988 12.63 2.37988 10.96 2.37988 9.78001C2.37988 8.61001 3.20988 6.93001 7.16988 5.60001L15.6599 2.77001C17.7799 2.06001 19.5499 2.27001 20.6399 3.35001C21.7299 4.43001 21.9399 6.21001 21.2299 8.33001L18.3999 16.82C17.0699 20.8 15.3999 21.63 14.2199 21.63ZM7.63988 7.03001C4.85988 7.96001 3.86988 9.06001 3.86988 9.78001C3.86988 10.5 4.85988 11.6 7.63988 12.52L10.1599 13.36C10.3799 13.43 10.5599 13.61 10.6299 13.83L11.4699 16.35C12.3899 19.13 13.4999 20.12 14.2199 20.12C14.9399 20.12 16.0399 19.13 16.9699 16.35L19.7999 7.86001C20.3099 6.32001 20.2199 5.06001 19.5699 4.41001C18.9199 3.76001 17.6599 3.68001 16.1299 4.19001L7.63988 7.03001Z" fill="currentColor" />
              <path d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z" fill="currentColor" />
            </g>
          </svg>
        </div>
        <p className="flex items-center justify-center font-bold">
          {"SendMessage".split("").map((l, i) => (
            <span key={i} className="inline-block opacity-0 translate-y-[-20px] group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" style={{ transitionDelay: `${i * 30}ms` }}>{l}</span>
          ))}
        </p>
      </div>
      {(loading || submitted) && (
        <div className="state state--sent flex items-center justify-center gap-2">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="1.2em" width="1.2em">
              <path fill="currentColor" d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z" />
              <path fill="currentColor" d="M10.5795 15.5801C10.3795 15.5801 10.1895 15.5001 10.0495 15.3601L7.21945 12.5301C6.92945 12.2401 6.92945 11.7601 7.21945 11.4701C7.50945 11.1801 7.98945 11.1801 8.27945 11.4701L10.5795 13.7701L15.7195 8.6301C16.0095 8.3401 16.4895 8.3401 16.7795 8.6301C17.0695 8.9201 17.0695 9.4001 16.7795 9.6901L11.1095 15.3601C10.9695 15.5001 10.7795 15.5801 10.5795 15.5801Z" />
            </svg>
          </div>
          <p className="font-bold text-sm tracking-widest">
            {submitted ? "SENT" : "SENDING..."}
          </p>
        </div>
      )}
    </button>
  );
};

/**
 * 2. Documents Button (Folder Style)
 */
export const DocumentsButton = ({ 
  className, 
  text = "Documents",
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { text?: string }) => {
  return (
    <button className={cn("Documents-btn group", className)} {...props}>
      <span className="folderContainer">
        <svg className="fileBack" width={146} height={113} viewBox="0 0 146 113" fill="none">
          <path d="M0 4C0 1.79086 1.79086 0 4 0H50.3802C51.8285 0 53.2056 0.627965 54.1553 1.72142L64.3303 13.4371C65.2799 14.5306 66.657 15.1585 68.1053 15.1585H141.509C143.718 15.1585 145.509 16.9494 145.509 19.1585V109C145.509 111.209 143.718 113 141.509 113H3.99999C1.79085 113 0 111.209 0 109V4Z" fill="url(#paint0_linear_117_4)" />
          <defs>
            <linearGradient id="paint0_linear_117_4" x1={0} y1={0} x2="72.93" y2="95.4804" gradientUnits="userSpaceOnUse">
              <stop stopColor="hsl(var(--primary))" />
              <stop offset={1} stopColor="hsl(var(--secondary))" />
            </linearGradient>
          </defs>
        </svg>
        <svg className="filePage" width={88} height={99} viewBox="0 0 88 99" fill="none">
          <rect width={88} height={99} fill="url(#paint0_linear_117_6)" />
          <defs>
            <linearGradient id="paint0_linear_117_6" x1={0} y1={0} x2={81} y2="160.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" />
              <stop offset={1} stopColor="#686868" />
            </linearGradient>
          </defs>
        </svg>
        <svg className="fileFront" width={160} height={79} viewBox="0 0 160 79" fill="none">
          <path d="M0.29306 12.2478C0.133905 9.38186 2.41499 6.97059 5.28537 6.97059H30.419H58.1902C59.5751 6.97059 60.9288 6.55982 62.0802 5.79025L68.977 1.18034C70.1283 0.410771 71.482 0 72.8669 0H77H155.462C157.87 0 159.733 2.1129 159.43 4.50232L150.443 75.5023C150.19 77.5013 148.489 79 146.474 79H7.78403C5.66106 79 3.9079 77.3415 3.79019 75.2218L0.29306 12.2478Z" fill="url(#paint0_linear_117_5)" />
          <defs>
            <linearGradient id="paint0_linear_117_5" x1="38.7619" y1="8.71323" x2="66.9106" y2="82.8317" gradientUnits="userSpaceOnUse">
              <stop stopColor="hsl(var(--accent))" />
              <stop offset={1} stopColor="hsl(var(--primary))" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <p className="text-white! font-bold whitespace-nowrap">{text}</p>
    </button>
  );
};

/**
 * 3. Share Button (Expandable with Web Share API)
 * Hardened for 2026: Direct access to share signals.
 */
export const ShareButton = ({ 
  className, 
  whatsapp = "+255620641695", 
  instagram = "mwijaydavie",
  title = "Mwijay Services",
  text = "Check out this precision tech architecture by Mwijay Davie.",
  url = "https://mwijay.vercel.app",
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  whatsapp?: string; 
  instagram?: string;
  title?: string;
  text?: string;
  url?: string;
}) => {
  const { toast } = useToast();

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        console.warn('Share signal canceled.');
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link Authenticated", description: "Signal copied to clipboard." });
      } catch (err) {
        window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank');
      }
    }
  };

  return (
    <div className="share-button-container group">
      <button className={cn("share-main-btn", className)} onClick={handleShare} {...props}>
        <div className="icon-wrapper">
          <Share2 className="share-default-icon h-[18px] w-[18px] text-white" />
          <div className="share-icons-reveal">
            <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" className="hover:scale-110 transition-transform">
              <MessageCircle size={16} />
            </a>
            <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" className="hover:scale-110 transition-transform">
              <Instagram size={16} />
            </a>
          </div>
        </div>
        <p className="share-text font-black uppercase tracking-widest text-[10px]">Share Build</p>
      </button>
    </div>
  );
};
