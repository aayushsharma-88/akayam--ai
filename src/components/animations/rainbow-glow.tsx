'use client'
import { cn } from '@/lib/utils'

export function RainbowGlow({ children, className, active = false }: {
  children: React.ReactNode
  className?: string
  active?: boolean
}) {
  return (
    <div className={cn('rainbow-glow-container', active && 'active', className)}>
      {children}
    </div>
  )
}
