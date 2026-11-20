"use client";

import React from "react";
import Image from "next/image";
import { Star, Loader2, UsersRound, MessageSquareQuote } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

/**
 * TeamSection - Dynamic supporter registry.
 * Fetches from 'team_members' collection.
 * Includes a distinct testimonial section at the bottom.
 */
export function TeamSection() {
  const db = useFirestore();
  const teamRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'team_members');
  }, [db]);
  const teamQuery = useMemoFirebase(() => {
    if (!teamRef) return null;
    return query(teamRef, orderBy('order', 'asc'));
  }, [teamRef]);

  const { data: members, isLoading } = useCollection(teamQuery);

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <section className="relative w-full overflow-hidden bg-background py-12 md:py-24 border-t border-border/50">
      {/* Background Graphic */}
      <div className="absolute right-0 bottom-0 pointer-events-none opacity-10">
        <svg width="460" height="154" viewBox="0 0 460 154" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
          <path d="M-87.463 458.432C-102.118 348.092 -77.3418 238.841 -15.0744 188.274C57.4129 129.408 180.708 150.071 351.748 341.128C278.246 -374.233 633.954 380.602 548.123 42.7707" stroke="currentColor" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto mb-16 flex max-w-5xl flex-col items-center px-6 text-center lg:px-0">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/20 text-white">
            <UsersRound className="h-7 w-7" />
          </div>

          <h2 className="relative mb-4 font-black text-4xl md:text-6xl tracking-tighter font-headline text-foreground uppercase">
            Supporter <span className="text-primary italic">Registry</span>
            <div className="absolute -top-4 -right-12 -z-10 opacity-20">
              <svg width="108" height="86" viewBox="0 0 108 86" fill="currentColor" className="text-primary">
                <path d="M38.8484 16.236L15 43.5793L78.2688 15L18.1218 71L93 34.1172L70.2047 65.2739" stroke="currentColor" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </h2>
          <p className="max-w-2xl text-muted-foreground text-sm md:text-lg font-medium leading-relaxed">
            Mwijay Services collaborates with a visionary network of partners and supporters to deliver high-performance technical systems.
          </p>
        </div>

        {/* Supporters Grid */}
        <div className="mb-24">
          {!members || members.length === 0 ? (
            <div className="p-20 text-center border-2 border-dashed rounded-[3rem] opacity-20 max-w-4xl mx-auto bg-card/50">
               <UsersRound className="h-12 w-12 mx-auto mb-4 opacity-50" />
               <p className="font-black uppercase tracking-widest text-sm italic">Supporter Registry empty • Integrate nodes in Admin Console</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 px-6">
              {members.map((member: any) => (
                <div key={member.id} className="flex flex-col items-center text-center space-y-4 group">
                  <div className="relative h-24 w-24 md:h-32 md:w-32 overflow-hidden rounded-[2rem] border-2 border-border/50 group-hover:border-primary/40 transition-all duration-700 shadow-lg">
                    <Image alt={member.name} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" fill src={member.imageUrl} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black font-headline text-sm text-foreground uppercase tracking-tight">{member.name}</p>
                    <p className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.2em]">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Separated Testimonial Node */}
        <div className="mx-auto max-w-4xl px-6">
           <div className="bg-primary/5 p-10 md:p-20 rounded-[3rem] border-2 border-dashed border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] -mr-24 -mt-24" />
              <div className="relative z-10 text-center space-y-10">
                 <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                       <MessageSquareQuote size={24} />
                    </div>
                 </div>
                 <p className="font-medium text-lg md:text-3xl leading-relaxed italic text-foreground/90">
                   "The exceptional support from Mwijay's network truly impressed us. We suggested a system improvement, and they implemented it with remarkable speed!"
                 </p>
                 <div className="flex flex-col items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-primary shadow-xl">
                      <Image alt="Natalia Kara" className="h-full w-full object-cover" fill src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" />
                    </div>
                    <div className="text-center">
                      <p className="font-black font-headline text-lg text-primary uppercase">Natalia Kara</p>
                      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">CTO · Aymi Africa Strategic Partner</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
