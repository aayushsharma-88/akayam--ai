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
    <div className={cn('flex flex-col items-start gap-1', className)}>
      <div className="flex items-center gap-3">
        {/* Butterfly SVG animation */}
        <motion.div
          className="relative w-8 h-8"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Wing left */}
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2"
            animate={{ scaleX: [1, 0.4, 1], rotateY: [0, 25, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="18" height="22" viewBox="0 0 22 26" fill="none">
              <path
                d="M20 4C20 4 14 2 8 8C4 12 2 18 2 22C2 22 8 22 14 16C18 12 20 8 20 4Z"
                fill="url(#wing-left-grad)"
                opacity="0.9"
              />
              <defs>
                <linearGradient id="wing-left-grad" x1="2" y1="4" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FDE047" />
                  <stop offset="0.5" stopColor="#F59E0B" />
                  <stop offset="1" stopColor="#EA580C" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          {/* Wing right (mirror) */}
          <motion.div
            className="absolute right-0 top-1/2 -translate-y-1/2"
            animate={{ scaleX: [1, 0.4, 1], rotateY: [0, -25, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="18" height="22" viewBox="0 0 22 26" fill="none" style={{ transform: 'scaleX(-1)' }}>
              <path
                d="M20 4C20 4 14 2 8 8C4 12 2 18 2 22C2 22 8 22 14 16C18 12 20 8 20 4Z"
                fill="url(#wing-right-grad)"
                opacity="0.9"
              />
              <defs>
                <linearGradient id="wing-right-grad" x1="2" y1="4" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#EA580C" />
                  <stop offset="0.5" stopColor="#F59E0B" />
                  <stop offset="1" stopColor="#FDE047" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          {/* Body center */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-gradient-to-b from-yellow-300 to-orange-500 opacity-100" />
          {/* Glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(250,204,21,0.4) 0%, transparent 60%)' }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
        
        {/* Particle trail (three dots) fixed inline with the butterfly */}
        <div className="flex gap-1.5 pt-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.8)]"
              animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
      
      {/* Label */}
      <p className="text-xs text-[#8B91A1] font-medium tracking-wide pl-1">
        {stateLabels[state]}
      </p>
    </div>
  )
}
