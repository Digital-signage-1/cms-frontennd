'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface BentoGridProps {
  children: ReactNode
  className?: string
}

interface BentoCardProps {
  children: ReactNode
  size?: 'small' | 'medium' | 'large' | 'wide' | 'tall'
  className?: string
  glass?: boolean
  gradient?: boolean
  onClick?: () => void
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn('bento-grid', className)}>
      {children}
    </div>
  )
}

export function BentoCard({ 
  children, 
  size = 'medium', 
  className, 
  glass = false,
  gradient = false,
  onClick 
}: BentoCardProps) {
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 row-span-1 md:col-span-2',
    large: 'col-span-1 row-span-2 md:col-span-2',
    wide: 'col-span-1 md:col-span-2 row-span-1',
    tall: 'col-span-1 row-span-2',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className={cn(
        'rounded-lg p-5 overflow-hidden relative',
        glass ? 'glass-light' : 'bg-surface',
        gradient && 'bg-gradient-to-br from-surface via-surface to-surface-alt',
        !glass && 'border border-border',
        'transition-colors duration-150',
        onClick && 'cursor-pointer hover:border-primary/20',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </motion.div>
  )
}
