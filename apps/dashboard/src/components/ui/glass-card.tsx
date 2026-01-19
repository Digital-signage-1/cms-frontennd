'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  variant?: 'light' | 'heavy' | 'frosted'
  className?: string
  hover?: boolean
}

export function GlassCard({ 
  children, 
  variant = 'light', 
  className,
  hover = true 
}: GlassCardProps) {
  const variantClasses = {
    light: 'glass-light',
    heavy: 'glass-heavy',
    frosted: 'glass backdrop-blur-xl',
  }

  return (
    <div
      className={cn(
        'rounded-2xl p-6',
        variantClasses[variant],
        hover && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  )
}
