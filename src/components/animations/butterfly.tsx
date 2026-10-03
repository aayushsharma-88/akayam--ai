'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButterflyProps {
  state?: 'thinking' | 'analyzing' | 'creating' | 'processing'
  className?: string
}

const stateLabels = {
  thinking: 'Akayam is thinking...',
  analyzing: 'Analyzing...',
  creating: 'Creating...',
  processing: 'Processing...',
}

export function ButterflyAnimation({ state = 'thinking', className }: ButterflyProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Butterfly SVG animation */}
      <motion.div
        className="relative w-12 h-12"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Wing left */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2"
          animate={{ scaleX: [1, 0.5, 1], rotateY: [0, 20, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
            <path
              d="M20 4C20 4 14 2 8 8C4 12 2 18 2 22C2 22 8 22 14 16C18 12 20 8 20 4Z"
              fill="url(#wing-left-grad)"
              opacity="0.85"
            />
            <defs>
              <linearGradient id="wing-left-grad" x1="2" y1="4" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60D4F5" />
                <stop offset="0.5" stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#D946EF" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
        {/* Wing right (mirror) */}
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2"
          animate={{ scaleX: [1, 0.5, 1], rotateY: [0, -20, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="22" height="26" viewBox="0 0 22 26" fill="none" style={{ transform: 'scaleX(-1)' }}>
            <path
              d="M20 4C20 4 14 2 8 8C4 12 2 18 2 22C2 22 8 22 14 16C18 12 20 8 20 4Z"
              fill="url(#wing-right-grad)"
              opacity="0.85"
            />
            <defs>
              <linearGradient id="wing-right-grad" x1="2" y1="4" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D946EF" />
                <stop offset="0.5" stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#60D4F5" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
        {/* Body center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-6 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400 opacity-90" />
        {/* Glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.3) 0%, transparent 70%)' }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
      {/* Particle trail */}
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full bg-cyan-400"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      {/* Label */}
      <p className="text-xs text-[#8B91A1] font-medium tracking-wide">
        {stateLabels[state]}
      </p>
    </div>
  )
}
