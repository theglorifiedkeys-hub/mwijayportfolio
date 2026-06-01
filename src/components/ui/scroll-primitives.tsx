"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
import { motion, useInView, useScroll, useTransform, useSpring, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════
   1. REVEAL ON SCROLL
   Usage: <ScrollReveal>content</ScrollReveal>
═══════════════════════════════════════════ */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.6,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  once?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-80px" });

  const directions = {
    up:    { hidden: { y: 40,   opacity: 0 }, visible: { y: 0,   opacity: 1 } },
    down:  { hidden: { y: -40,  opacity: 0 }, visible: { y: 0,   opacity: 1 } },
    left:  { hidden: { x: 60,   opacity: 0 }, visible: { x: 0,   opacity: 1 } },
    right: { hidden: { x: -60,  opacity: 0 }, visible: { x: 0,   opacity: 1 } },
    none:  { hidden: { opacity: 0 },           visible: { opacity: 1 } },
  };

  return (
    <motion.div
      ref={ref}
      variants={directions[direction]}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   2. STAGGER CHILDREN ON SCROLL
═══════════════════════════════════════════ */
const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function StaggerReveal({
  children,
  className,
  stagger = 0.1,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants}>{child}</motion.div>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   3. TYPEWRITER EFFECT
═══════════════════════════════════════════ */
export function TypewriterText({
  words,
  className,
  speed = 80,
  deleteSpeed = 40,
  pauseTime = 2000,
}: {
  words: string[];
  className?: string;
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
}) {
  const [displayed, setDisplayed]   = useState("");
  const [wordIndex, setWordIndex]   = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPausing, setIsPausing]   = useState(false);

  useEffect(() => {
    if (isPausing || words.length === 0) return;

    const current = words[wordIndex % words.length];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayed(current.slice(0, displayed.length + 1));
        if (displayed.length + 1 === current.length) {
          setIsPausing(true);
          setTimeout(() => {
            setIsPausing(false);
            setIsDeleting(true);
          }, pauseTime);
        }
      } else {
        setDisplayed(current.slice(0, displayed.length - 1));
        if (displayed.length === 0) {
          setIsDeleting(false);
          setWordIndex((i) => i + 1);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, isPausing, wordIndex, words, speed, deleteSpeed, pauseTime]);

  return (
    <span className={className}>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.7 }}
        className="inline-block w-[3px] h-[1em] bg-current ml-1 align-middle"
      />
    </span>
  );
}

/* ═══════════════════════════════════════════
   4. COUNT UP NUMBER
═══════════════════════════════════════════ */
export function CountUpNumber({
  end,
  duration = 2000,
  prefix = "",
  suffix = "",
  className,
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [count, setCount]   = useState(0);
  const ref                 = useRef(null);
  const isInView            = useInView(ref, { once: true });
  const hasStarted          = useRef(false);

  useEffect(() => {
    if (!isInView || hasStarted.current) return;
    hasStarted.current = true;

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════
   5. PARALLAX SECTION
═══════════════════════════════════════════ */
export function ParallaxSection({
  children,
  className,
  speed = 0.3,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}px`, `${speed * 100}px`]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div style={{ y: smoothY }}>
        {children}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   6. MAGNETIC BUTTON
═══════════════════════════════════════════ */
export function MagneticButton({
  children,
  className,
  strength = 30,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect    = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setPos({
      x: (e.clientX - centerX) / (rect.width  / 2) * strength,
      y: (e.clientY - centerY) / (rect.height / 2) * strength,
    });
  };

  const handleMouseLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   7. SCROLL PROGRESS BAR
═══════════════════════════════════════════ */
export function ScrollProgressBar({ color = "hsl(var(--primary))" }: { color?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      style={{
        scaleX,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: color,
        transformOrigin: "0%",
        zIndex: 9999,
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   8. WORD REVEAL
═══════════════════════════════════════════ */
export function WordReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const words    = text.split(" ");

  return (
    <span ref={ref} className={cn("inline-flex flex-wrap gap-x-[0.25em]", className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.4,
            delay: delay + i * 0.07,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ═══════════════════════════════════════════
   9. GLOWING CARD ON HOVER
═══════════════════════════════════════════ */
export function GlowCard({
  children,
  className,
  glowColor = "hsl(var(--primary))",
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width)  * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMouse({ x: 50, y: 50 });
      }}
      className={cn("relative overflow-hidden", className)}
      style={{
        background: hovered
          ? `radial-gradient(circle at ${mouse.x}% ${mouse.y}%, ${glowColor}15 0%, transparent 60%)`
          : undefined,
        transition: "background 0.3s ease",
      }}
    >
      {children}
    </div>
  );
}
