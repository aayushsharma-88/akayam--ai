'use client'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-white/10 bg-[#111520] px-3 py-2 text-sm text-[#F0F2F5]',
          'hover:border-white/20',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
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
Input.displayName = 'Input'

export { Input }
