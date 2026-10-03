import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function AkayamLogo({ size = 'md', className }: LogoProps) {
  const imageSizes = { sm: 32, md: 48, lg: 80 }
  const sizePx = imageSizes[size]

  return (
    <div className={cn('flex items-center', className)}>
      <img 
        src="/logo.png" 
        alt="Akayam Logo" 
        width={sizePx} 
        height={sizePx} 
        className="object-contain rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.3)]"
      />
    </div>
  )
}
