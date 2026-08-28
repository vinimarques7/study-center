import { cn } from '@/lib/utils'
import { resolveBrandName } from '@/lib/theme'

interface BrandProps {
  title?: string
  subtitle?: string
  className?: string
  titleClassName?: string
  center?: boolean
}

export function Brand({
  title,
  subtitle = 'natureza, aprendizado e mente',
  className,
  titleClassName,
  center = false,
}: BrandProps) {
  const brandTitle = resolveBrandName(title)

  return (
    <div className={cn('flex items-center gap-3', center && 'justify-center', className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
        <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden="true" fill="none">
          <rect x="6" y="6" width="52" height="52" rx="18" fill="currentColor" opacity="0.12" />
          <path
            d="M32 47V29"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M32 29C32 21 38.5 14 47 14C47 22 40.5 29 32 29Z"
            fill="currentColor"
            opacity="0.95"
          />
          <path
            d="M32 29C32 21 25.5 14 17 14C17 22 23.5 29 32 29Z"
            fill="currentColor"
            opacity="0.65"
          />
          <path
            d="M18 45C21.5 39.5 26.4 37 32 37C37.6 37 42.5 39.5 46 45"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M23 49H41"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </div>

      <div className={cn('min-w-0', center && 'text-left')}>
        <div className={cn('text-lg font-semibold tracking-tight text-foreground', titleClassName)}>
          {brandTitle}
        </div>
        <div className="text-[11px] uppercase tracking-[0.24em] text-primary/80">
          {subtitle}
        </div>
      </div>
    </div>
  )
}