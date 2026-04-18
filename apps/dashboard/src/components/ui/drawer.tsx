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
  hidden: { x: '100%', transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as any } },
  visible: { x: 0,     transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as any } },
  exit:    { x: '100%', transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as any } },
}

const backdropVariants = {
  hidden:  { opacity: 0, transition: { duration: 0.2 } },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

export function Drawer({ isOpen, onClose, children, title, description, width = 'md', className }: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
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
            className="fixed inset-0 z-40 bg-black/65 backdrop-blur-[2px]"
          />

          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'fixed top-0 right-0 z-50 flex h-full flex-col border-l border-border bg-surface shadow-2xl',
              widthClasses[width],
              className
            )}
            style={{ boxShadow: 'var(--shadow-elevated)' }}
          >
            {(title || description) && (
              <div className="flex-shrink-0 border-b border-border-subtle px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {title && (
                      <h2 className="mb-0.5 text-lg font-semibold text-text-primary">{title}</h2>
                    )}
                    {description && (
                      <p className="text-sm text-text-secondary">{description}</p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    aria-label="Close drawer"
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-surface-alt text-text-muted transition-colors hover:text-text-primary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            <div className="flex min-h-0 flex-1 flex-col">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function DrawerHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex-shrink-0 border-b border-border-subtle px-6 py-4', className)}>
      {children}
    </div>
  )
}

export function DrawerContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('min-h-0 flex-1 overflow-y-auto px-6 py-6', className)}>
      {children}
    </div>
  )
}

export function DrawerFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex-shrink-0 border-t border-border-subtle px-6 py-4', className)}>
      {children}
    </div>
  )
}
