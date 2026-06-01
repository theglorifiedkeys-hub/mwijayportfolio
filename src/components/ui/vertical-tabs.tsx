"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

const DEFAULT_SERVICES = [
  {
    id: "01",
    title: "AI App Development",
    description:
      "Building intelligent applications that leverage local and cloud-based LLMs to solve business challenges.",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200",
  },
  {
    id: "02",
    title: "Web Architecture",
    description: "Architecting high-performance, scalable systems using Next.js and Firebase, optimized for modern business logic.",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200",
  },
  {
    id: "03",
    title: "Automation Systems",
    description:
      "Designing custom automation pipelines that reduce manual overhead and scale operations using tools like n8n and Python.",
    imageUrl: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?q=80&w=1200",
  },
];

const AUTO_PLAY_DURATION = 5000;

export function VerticalTabs({ userId }: { userId?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const firestore = useFirestore();
  const servicesRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return collection(firestore, 'users', userId, 'services');
  }, [firestore, userId]);
  
  const { data: dbServices, isLoading } = useCollection(servicesRef);

  const services = dbServices && dbServices.length > 0 
    ? [...dbServices].sort((a, b) => a.id.localeCompare(b.id)) 
    : DEFAULT_SERVICES;

  const handleNext = useCallback(() => {
    if (services.length === 0) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % services.length);
  }, [services.length]);

  const handlePrev = useCallback(() => {
    if (services.length === 0) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + services.length) % services.length);
  }, [services.length]);

  const handleTabClick = (index: number) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setIsPaused(false);
  };

  useEffect(() => {
    if (isPaused || services.length === 0) return;

    const interval = setInterval(() => {
      handleNext();
    }, AUTO_PLAY_DURATION);

    return () => clearInterval(interval);
  }, [activeIndex, isPaused, handleNext, services.length]);

  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      y: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  if (isLoading) return (
    <div className="py-20 flex justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (services.length === 0) return null;

  return (
    <section className="w-full bg-background py-12 md:py-24">
      <div className="w-full px-4 md:px-12 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1 pt-4">
            <div className="space-y-1 mb-8 md:mb-12">
              <h2 className="tracking-tighter text-balance text-3xl font-bold md:text-4xl lg:text-5xl text-foreground font-headline">
                How I can help you
              </h2>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] block ml-0.5">
                (EXPERTISE)
              </span>
            </div>

            <div className="flex flex-col space-y-0">
              {services.map((service, index) => {
                const isActive = activeIndex === index;
                const displayId = String(index + 1).padStart(2, '0');
                return (
                  <button
                    key={service.id || index}
                    onClick={() => handleTabClick(index)}
                    className={cn(
                      "group relative flex items-start gap-4 py-6 md:py-10 text-left transition-all duration-500 border-t border-border/50 first:border-0",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground/60 hover:text-foreground"
                    )}
                  >
                    <div className="absolute left-[-16px] md:left-[-24px] top-0 bottom-0 w-[2px] bg-muted">
                      {isActive && (
                        <motion.div
                          key={`progress-${index}-${isPaused}`}
                          className="absolute top-0 left-0 w-full bg-primary origin-top"
                          initial={{ height: "0%" }}
                          animate={
                            isPaused ? { height: "0%" } : { height: "100%" }
                          }
                          transition={{
                            duration: AUTO_PLAY_DURATION / 1000,
                            ease: "linear",
                          }}
                        />
                      )}
                    </div>

                    <span className="text-[9px] md:text-[10px] font-bold mt-1 tabular-nums text-primary/50">
                      /{displayId}
                    </span>

                    <div className="flex flex-col gap-2 flex-1">
                      <span
                        className={cn(
                          "text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight transition-colors duration-500 font-headline",
                          isActive ? "text-primary" : ""
                        )}
                      >
                        {service.title}
                      </span>

                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.23, 1, 0.32, 1],
                            }}
                            className="overflow-hidden"
                          >
                            <p className="text-muted-foreground text-sm md:text-base font-normal leading-relaxed max-w-sm pb-2">
                              {service.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-end h-full order-1 lg:order-2">
            <div
              className="relative group/gallery"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative aspect-square md:aspect-video lg:aspect-16/11 rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-muted/30 border-4 border-muted shadow-2xl">
                <AnimatePresence
                  initial={false}
                  custom={direction}
                  mode="popLayout"
                >
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      y: { type: "spring", stiffness: 260, damping: 32 },
                      opacity: { duration: 0.4 },
                    }}
                    className="absolute inset-0 w-full h-full cursor-pointer"
                    onClick={handleNext}
                  >
                    <img
                      src={services[activeIndex]?.imageUrl || "https://picsum.photos/seed/service/800/600"}
                      alt={services[activeIndex]?.title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 m-0! p-0! block"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex gap-2 md:gap-3 z-20">
                  <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all active:scale-90 shadow-xl">
                    <ArrowLeft size={20} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all active:scale-90 shadow-xl">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
