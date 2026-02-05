'use client'

import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'
import { X } from 'lucide-react'

interface FloatingPanelProps {
  children: ReactNode
  isOpen: boolean
  onClose?: () => void
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  className?: string
  glass?: boolean
}

export function FloatingPanel({
  children,
  isOpen,
  onClose,
  position = 'center',
  className,
  glass = true
}: FloatingPanelProps) {
  const positionClasses = {
    top: 'top-4 left-1/2 -translate-x-1/2',
    bottom: 'bottom-4 left-1/2 -translate-x-1/2',
    left: 'left-4 top-1/2 -translate-y-1/2',
    right: 'right-4 top-1/2 -translate-y-1/2',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  }

  const animationVariants: any = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: position === 'top' ? -20 : position === 'bottom' ? 20 : 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: position === 'top' ? -20 : position === 'bottom' ? 20 : 0,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            variants={animationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'fixed z-50 rounded-2xl p-6',
              glass ? 'glass-heavy' : 'bg-surface border border-border',
              'shadow-2xl',
              positionClasses[position],
              className
            )}
          >
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <X className="h-4 w-4 text-text-muted" />
              </button>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
