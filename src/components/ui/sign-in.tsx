'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  isLoading?: boolean;
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

// --- SUB-COMPONENTS ---

const NeuInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md transition-all focus-within:border-primary/70 focus-within:shadow-[0_0_20px_rgba(49,130,206,0.1)]">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial; delay: string }) => (
  <div className={cn("flex items-start gap-4 rounded-3xl glass backdrop-blur-2xl border border-white/10 p-6 w-80 shadow-2xl transition-all duration-700 hover:scale-105", delay)}>
    <div className="h-12 w-12 rounded-2xl overflow-hidden border-2 border-white/20 shrink-0">
       <img src={testimonial.avatarSrc || "https://picsum.photos/seed/user/100/100"} className="h-full w-full object-cover" alt="avatar" />
    </div>
    <div className="text-sm leading-tight text-left">
      <p className="font-black text-white uppercase tracking-tight">{testimonial.name}</p>
      <p className="text-white/40 text-[10px] font-mono mt-0.5">{testimonial.handle}</p>
      <p className="mt-3 text-white/80 leading-relaxed italic text-xs font-medium">"{testimonial.text}"</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">Welcome</span>,
  description = "Access your account and continue your journey with us",
  heroImageSrc,
  testimonials = [],
  isLoading = false,
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-background overflow-hidden relative">
      {/* Decorative Blur Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]" />
      </div>

      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20 z-10 relative">
        <div className="w-full max-w-md space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-xl shadow-primary/10">
              {isLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Lock className="h-7 w-7" />}
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-tight text-foreground">{title}</h1>
              <p className="text-muted-foreground font-medium text-sm md:text-base">{description}</p>
            </div>
          </div>

          <form className="space-y-8" onSubmit={onSignIn}>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Access Protocol / Email</label>
              <NeuInputWrapper>
                <input 
                  name="email" 
                  type="email" 
                  placeholder="identification@node.com" 
                  className="w-full bg-transparent text-sm p-5 rounded-2xl focus:outline-none font-bold" 
                  required 
                  disabled={isLoading}
                />
              </NeuInputWrapper>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Encryption Key / Password</label>
              <NeuInputWrapper>
                <div className="relative">
                  <input 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••••••" 
                    className="w-full bg-transparent text-sm p-5 pr-14 rounded-2xl focus:outline-none font-bold tracking-widest" 
                    required 
                    disabled={isLoading}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-4 flex items-center p-2 text-muted-foreground hover:text-primary transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </NeuInputWrapper>
            </div>

            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" name="rememberMe" className="h-4 w-4 rounded border-border/50 text-primary focus:ring-primary bg-background" />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">Remember Node</span>
              </label>
              <button type="button" onClick={onResetPassword} className="text-primary hover:opacity-80 transition-opacity">Reset Signal?</button>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full rounded-2xl bg-primary py-5 font-black uppercase tracking-[0.3em] text-xs text-white hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Synchronizing...
                </>
              ) : (
                'Authorize Entry'
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <span className="w-full border-t border-border/50"></span>
            <span className="px-6 text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground bg-background absolute">OR SYNCHRONIZE VIA</span>
          </div>

          <button 
            onClick={onGoogleSignIn} 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 border-2 border-border/50 rounded-2xl py-5 hover:bg-primary/5 transition-all font-black text-[11px] uppercase tracking-widest group active:scale-95 disabled:opacity-50"
          >
            <GoogleIcon />
            Google Authentication
          </button>

          <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            No registry entry? <button onClick={onCreateAccount} className="text-primary hover:underline transition-all ml-1">Initialize Account</button>
          </p>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden lg:block lg:flex-1 relative p-8">
          <div className="absolute inset-8 rounded-[3.5rem] bg-cover bg-center shadow-2xl overflow-hidden border-4 border-muted/50 group" style={{ backgroundImage: `url(${heroImageSrc})` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-1000" />
            
            <div className="absolute top-12 left-12 flex items-center gap-3 px-6 py-3 rounded-full glass border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.4em] backdrop-blur-xl shadow-2xl">
              <ShieldCheck className="h-5 w-5 text-primary animate-pulse" />
              AUTHENTICATED_ACCESS_ONLY
            </div>

            {/* Testimonials Stack */}
            {testimonials.length > 0 && (
              <div className="absolute bottom-16 left-0 w-full px-12 z-20 space-y-6">
                <div className="flex flex-wrap gap-6 justify-center">
                   {testimonials.slice(0, 3).map((t, idx) => (
                     <TestimonialCard 
                      key={idx} 
                      testimonial={t} 
                      delay={idx === 0 ? "animate-delay-500" : idx === 1 ? "animate-delay-700 hidden xl:flex" : "animate-delay-900 hidden 2xl:flex"} 
                     />
                   ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
