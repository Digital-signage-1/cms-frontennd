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
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-[2px] z-40"
          />

          {/* Panel */}
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl',
              'bg-white border-l border-[#bae6fd] shadow-[-8px_0_32px_rgba(14,165,233,0.10)]',
              widthClasses[width],
              className
            )}
          >
            {(title || description) && (
              <div className="flex-shrink-0 px-6 py-4 border-b border-[#e0f2fe]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {title && (
                      <h2 className="text-lg font-semibold mb-0.5" style={{ color: '#0c4a6e' }}>{title}</h2>
                    )}
                    {description && (
                      <p className="text-sm" style={{ color: '#0369a1' }}>{description}</p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    aria-label="Close drawer"
                    className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all"
                    style={{ backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', color: '#6b7280' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e0f2fe'; (e.currentTarget as HTMLButtonElement).style.color = '#0c4a6e' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e0f2fe'; (e.currentTarget as HTMLButtonElement).style.color = '#6b7280' }}
                  >
                    <X className="h-4 w-4" />
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

export function DrawerHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex-shrink-0 px-6 py-4 border-b border-[#e0f2fe]', className)}>
      {children}
    </div>
  )
}

export function DrawerContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex-1 min-h-0 overflow-y-auto px-6 py-6', className)}>
      {children}
    </div>
  )
}

export function DrawerFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex-shrink-0 px-6 py-4 border-t border-[#e0f2fe]', className)}>
      {children}
    </div>
  )
}
