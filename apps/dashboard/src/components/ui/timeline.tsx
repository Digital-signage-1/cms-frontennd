'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface TimelineProps {
  children: ReactNode
  className?: string
}

interface TimelineItemProps {
  children: ReactNode
  icon?: ReactNode
  time?: string
  active?: boolean
  className?: string
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div className={cn('relative space-y-6', className)}>
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
      {children}
    </div>
  )
}

export function TimelineItem({ 
  children, 
  icon, 
  time, 
  active = false,
  className 
}: TimelineItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('relative pl-12', className)}
    >
      <div
        className={cn(
          'absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center',
          'border-2 transition-all duration-300',
          active
            ? 'bg-primary border-primary shadow-glow'
            : 'bg-surface border-border'
        )}
      >
        {icon}
      </div>
      {time && (
        <p className="text-xs text-text-muted mb-2">{time}</p>
      )}
      <div className={cn(
        'rounded-xl p-4 transition-all duration-300',
        active 
          ? 'bg-surface-alt border border-border shadow-md' 
          : 'bg-surface'
      )}>
        {children}
      </div>
    </motion.div>
  )
}
