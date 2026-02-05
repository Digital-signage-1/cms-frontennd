'use client'

import { ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  description?: string
  width?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const widthClasses = {
  sm: 'w-full sm:w-[400px]',
  md: 'w-full sm:w-[600px]',
  lg: 'w-full sm:w-[800px]',
  xl: 'w-full sm:w-[1000px]',
}

const slideVariants = {
  hidden: {
    x: '100%',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as any,
    },
  },
  visible: {
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as any,
    },
  },
  exit: {
    x: '100%',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as any,
    },
  },
}

const backdropVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
}

export function Drawer({
  isOpen,
  onClose,
  children,
  title,
  description,
  width = 'md',
  className,
}: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'fixed top-0 right-0 h-full z-50 bg-surface border-l border-border shadow-2xl flex flex-col',
              widthClasses[width],
              className
            )}
          >
            {(title || description) && (
              <div className="flex-shrink-0 px-6 py-4 border-b border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {title && (
                      <h2 className="text-xl font-semibold text-text-primary mb-1">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="text-sm text-text-secondary">{description}</p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="flex-shrink-0 p-2 rounded-lg hover:bg-surface-alt transition-colors text-text-muted hover:text-text-primary"
                    aria-label="Close drawer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
            <div className="flex-1 min-h-0 flex flex-col">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function DrawerHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex-shrink-0 px-6 py-4 border-b border-border', className)}>
      {children}
    </div>
  )
}

export function DrawerContent({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex-1 min-h-0 overflow-y-auto px-6 py-6', className)}>
      {children}
    </div>
  )
}

export function DrawerFooter({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex-shrink-0 px-6 py-4 border-t border-border', className)}>
      {children}
    </div>
  )
}
