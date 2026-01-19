'use client'

import { cn } from '@/lib/utils'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useState } from 'react'

interface StatRingProps {
  value: number
  max: number
  size?: 'small' | 'medium' | 'large'
  label?: string
  sublabel?: string
  color?: 'primary' | 'success' | 'warning' | 'error'
  showValue?: boolean
  className?: string
  animated?: boolean
}

export function StatRing({ 
  value, 
  max, 
  size = 'medium',
  label,
  sublabel,
  color = 'primary',
  showValue = true,
  className,
  animated = true
}: StatRingProps) {
  const [mounted, setMounted] = useState(false)
  const motionValue = useMotionValue(0)
  const percentage = Math.min((value / max) * 100, 100)

  useEffect(() => {
    setMounted(true)
    if (animated && mounted) {
      const animation = animate(motionValue, value, {
        duration: 1.5,
        ease: 'easeOut'
      })
      return () => animation.stop()
    }
  }, [value, motionValue, animated, mounted])

  const displayValue = useTransform(motionValue, (latest) => Math.round(latest))

  const sizes = {
    small: { outer: 80, stroke: 6, text: 'text-lg' },
    medium: { outer: 120, stroke: 8, text: 'text-2xl' },
    large: { outer: 160, stroke: 10, text: 'text-3xl' },
  }

  const colors = {
    primary: { fill: 'stroke-primary', bg: 'stroke-primary/20' },
    success: { fill: 'stroke-success', bg: 'stroke-success/20' },
    warning: { fill: 'stroke-warning', bg: 'stroke-warning/20' },
    error: { fill: 'stroke-error', bg: 'stroke-error/20' },
  }

  const { outer, stroke, text } = sizes[size]
  const radius = (outer - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className="relative" style={{ width: outer, height: outer }}>
        <svg
          width={outer}
          height={outer}
          className="transform -rotate-90"
        >
          <circle
            cx={outer / 2}
            cy={outer / 2}
            r={radius}
            className={colors[color].bg}
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            cx={outer / 2}
            cy={outer / 2}
            r={radius}
            className={colors[color].fill}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span className={cn('font-bold text-text-primary', text)}>
              {mounted && animated ? (
                <motion.span>{displayValue}</motion.span>
              ) : (
                value
              )}
            </motion.span>
          </div>
        )}
      </div>
      {label && (
        <div className="text-center">
          <p className="text-sm font-medium text-text-primary">{label}</p>
          {sublabel && (
            <p className="text-xs text-text-muted mt-0.5">{sublabel}</p>
          )}
        </div>
      )}
    </div>
  )
}
