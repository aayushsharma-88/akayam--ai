'use client'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-cyan-500/20 text-cyan-300',
        secondary: 'border-transparent bg-[#1A2030] text-[#F0F2F5]',
        destructive: 'border-transparent bg-red-500/20 text-red-300',
        outline: 'text-[#F0F2F5] border-white/20',
        violet: 'border-transparent bg-violet-500/20 text-violet-300',
        success: 'border-transparent bg-green-500/20 text-green-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(({ className, variant, ...props }, ref) => {
  return <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
})
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
