'use client'
import { cn } from '@/lib/utils'

export function Tooltip({ children, content, className }: {
  children: React.ReactNode
  content: string
  className?: string
}) {
  return (
    <div className={cn('relative group inline-flex', className)}>
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-[#1E2535] text-xs text-[#F0F2F5] whitespace-nowrap border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-50">
        {content}
      </div>
    </div>
  )
}
