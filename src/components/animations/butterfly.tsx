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
          className="relative w-10 h-10"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Antennae (Horns) */}
          <div className="absolute left-1/2 top-1 -translate-x-1/2 flex gap-1">
            <div className="w-0.5 h-2.5 bg-orange-400/80 -rotate-12 origin-bottom rounded-full" />
            <div className="w-0.5 h-2.5 bg-orange-400/80 rotate-12 origin-bottom rounded-full" />
          </div>

          {/* Wing left */}
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[18px] h-[24px]"
            animate={{ scaleX: [1, 0.2, 1], rotateY: [0, 30, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'right center' }}
          >
            {/* Top Wing */}
            <svg className="absolute top-0 right-0 w-[18px] h-[14px]" viewBox="0 0 18 14" fill="none">
              <path d="M18 14C18 14 10 12 4 8C0 5 0 0 0 0C0 0 8 2 12 6C16 10 18 14 18 14Z" fill="url(#wing-top-grad)" opacity="0.9" />
              <defs>
                <linearGradient id="wing-top-grad" x1="0" y1="0" x2="18" y2="14" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FDE047" />
                  <stop offset="1" stopColor="#EA580C" />
                </linearGradient>
              </defs>
            </svg>
            {/* Bottom Wing */}
            <svg className="absolute bottom-0 right-0 w-[14px] h-[12px]" viewBox="0 0 14 12" fill="none">
              <path d="M14 0C14 0 8 2 4 6C1 9 1 12 1 12C1 12 6 11 9 8C12 5 14 0 14 0Z" fill="url(#wing-bot-grad)" opacity="0.8" />
              <defs>
                <linearGradient id="wing-bot-grad" x1="0" y1="0" x2="14" y2="12" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F59E0B" />
                  <stop offset="1" stopColor="#B45309" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Wing right (mirror) */}
          <motion.div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-[18px] h-[24px]"
            animate={{ scaleX: [1, 0.2, 1], rotateY: [0, -30, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'left center' }}
          >
            {/* Top Wing */}
            <svg className="absolute top-0 left-0 w-[18px] h-[14px]" viewBox="0 0 18 14" fill="none" style={{ transform: 'scaleX(-1)' }}>
              <path d="M18 14C18 14 10 12 4 8C0 5 0 0 0 0C0 0 8 2 12 6C16 10 18 14 18 14Z" fill="url(#wing-top-grad)" opacity="0.9" />
            </svg>
            {/* Bottom Wing */}
            <svg className="absolute bottom-0 left-0 w-[14px] h-[12px]" viewBox="0 0 14 12" fill="none" style={{ transform: 'scaleX(-1)' }}>
              <path d="M14 0C14 0 8 2 4 6C1 9 1 12 1 12C1 12 6 11 9 8C12 5 14 0 14 0Z" fill="url(#wing-bot-grad)" opacity="0.8" />
            </svg>
          </motion.div>

          {/* Body center */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full bg-gradient-to-b from-yellow-300 to-orange-600 shadow-[0_0_5px_rgba(250,204,21,0.5)] z-10">
            {/* White dot eyes */}
            <div className="flex gap-[1px] justify-center pt-[2px]">
              <div className="w-[1.5px] h-[1.5px] bg-white rounded-full" />
              <div className="w-[1.5px] h-[1.5px] bg-white rounded-full" />
            </div>
          </div>

          {/* Glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(250,204,21,0.5) 0%, transparent 60%)' }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
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
