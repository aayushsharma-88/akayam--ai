'use client'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-white/10 bg-[#111520] px-3 py-2 text-sm text-[#F0F2F5]',
          'hover:border-white/20',
          'placeholder:text-[#8B91A1]',
          'focus-visible:outline-none focus-visible:border-cyan-500/50 focus-visible:ring-2 focus-visible:ring-cyan-500/10',
          'disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
