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
        'rounded-lg p-5',
        variantClasses[variant],
        hover && 'transition-colors duration-150 hover:border-primary/20',
        className
      )}
    >
      {children}
    </div>
  )
}
