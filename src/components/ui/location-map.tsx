
"use client"

import type React from "react"
import { useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import { ExternalLink, MapPin, Navigation } from "lucide-react"

interface LocationMapProps {
  location?: string
  coordinates?: string
  className?: string;
  googleMapsUrl?: string;
}

export function LocationMap({
  location = "Kongowe, Dar es Salaam",
  className,
  googleMapsUrl = "https://www.google.com/maps/place/Kongowe,+Dar+es+Salaam,+Tanzania"
}: LocationMapProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useTransform(mouseY, [-50, 50], [8, -8])
  const rotateY = useTransform(mouseX, [-50, 50], [-8, 8])

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 })
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  return (
    <motion.div
      ref={containerRef}
      className={`relative cursor-pointer select-none ${className}`}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); setIsHovered(false); }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <motion.div
        className="bg-card border-border relative overflow-hidden rounded-[2.5rem] border-2 shadow-2xl"
        style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }}
        animate={{ width: isExpanded ? 320 : 240, height: isExpanded ? 240 : 140 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      >
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }} 
        />
        
        <div className="from-primary/10 to-accent/10 absolute inset-0 bg-gradient-to-br via-transparent" />

        <AnimatePresence>
          {isExpanded && (
            <motion.div className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-muted/50 absolute inset-0 rounded-[2.5rem]" />
              <svg className="absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none">
                <motion.line x1="0%" y1="35%" x2="100%" y2="35%" className="stroke-primary" strokeWidth="1" animate={{ pathLength: 1 }} initial={{ pathLength: 0 }} />
                <motion.line x1="30%" y1="0%" x2="30%" y2="100%" className="stroke-primary" strokeWidth="1" animate={{ pathLength: 1 }} initial={{ pathLength: 0 }} />
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl animate-pulse" />
                  <MapPin className="h-10 w-10 text-primary relative z-10 drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 flex h-full flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Navigation className="h-5 w-5" />
            </div>
            <div className="bg-primary/10 flex items-center gap-1.5 rounded-full px-3 py-1 border border-primary/20 backdrop-blur-md">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">Operations Hub</span>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-foreground text-sm font-black uppercase tracking-tighter">{location}</h3>
            <p className="text-[10px] text-muted-foreground font-medium">Dar es Salaam, TZ</p>
            {isExpanded && (
              <a 
                href={googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-primary font-black text-[10px] flex items-center gap-1.5 hover:underline mt-2 uppercase tracking-widest"
              >
                OPEN SIGNALS IN MAPS <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <motion.div className="h-1 bg-primary/30 rounded-full mt-2" initial={{ scaleX: 0.3, originX: 0 }} animate={{ scaleX: isHovered || isExpanded ? 1 : 0.3 }} />
          </div>
        </div>
      </motion.div>
      <motion.p className="text-primary absolute -bottom-6 left-1/2 text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap" style={{ x: "-50%" }} animate={{ opacity: isHovered && !isExpanded ? 1 : 0 }}>
        Click to Expand Registry
      </motion.p>
    </motion.div>
  );
}
