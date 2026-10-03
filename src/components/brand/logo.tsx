import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function AkayamLogo({ size = 'md', showText = true, className }: LogoProps) {
  const iconSizes = { sm: 24, md: 32, lg: 44 }
  const textSizes = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' }
  const iconSize = iconSizes[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Icon mark: A stylized "A" with a subtle intelligence motif */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60D4F5" />
            <stop offset="0.5" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#D946EF" />
          </linearGradient>
          <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Rounded square background */}
        <rect width="40" height="40" rx="10" fill="#141820" />
        {/* A letterform */}
        <path
          d="M20 7L31 33H26L23.5 27H16.5L14 33H9L20 7Z"
          fill="url(#logo-grad)"
          filter="url(#logo-glow)"
        />
        {/* Crossbar */}
        <path
          d="M17.5 22H22.5"
          stroke="#080A0F"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Small orbital dot — intelligence symbol */}
        <circle cx="32" cy="9" r="3" fill="#60D4F5" opacity="0.9" />
      </svg>

      {showText && (
        <span className={cn('font-semibold tracking-tight', textSizes[size])}>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500">Ak</span>
          <span className="text-[#F0F2F5]">ayam</span>
        </span>
      )}
    </div>
  )
}
