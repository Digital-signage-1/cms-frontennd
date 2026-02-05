'use client'

import { useEffect, useRef } from 'react'
import { ContentRenderer } from '@signage/renderer'
import { X } from 'lucide-react'
import type { App } from '@signage/types'
import { motion, AnimatePresence } from 'framer-motion'

interface AppQuickPreviewProps {
  app: App
  contentUrl?: string
  position: { x: number; y: number } | null
  onClose: () => void
}

export function AppQuickPreview({
  app,
  contentUrl,
  position,
  onClose,
}: AppQuickPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  if (!position) return null

  const appWithUrl = {
    ...app,
    preview_url: contentUrl || app.preview_url,
  }

  const safePosition = {
    left: Math.min(position.x, window.innerWidth - 270),
    top: position.y,
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={previewRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 bg-surface border border-border rounded-lg shadow-2xl overflow-hidden"
        style={{
          left: `${safePosition.left}px`,
          top: `${safePosition.top}px`,
          width: '250px',
        }}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-surface/80 backdrop-blur-sm border border-border hover:bg-surface-alt transition-colors"
            aria-label="Close preview"
          >
            <X className="h-3 w-3 text-text-secondary" />
          </button>

          <div className="p-3">
            <div
              className="relative bg-background rounded border border-border/50 overflow-hidden shadow-inner"
              style={{
                width: '100%',
                aspectRatio: '16 / 9',
              }}
            >
              <div className="absolute inset-0">
                {contentUrl ? (
                  <ContentRenderer
                    appId={app.app_id}
                    app={appWithUrl as any}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                    No content
                  </div>
                )}
              </div>

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1 left-1 right-1 h-1 bg-gradient-to-b from-black/20 to-transparent rounded-t" />
                <div className="absolute bottom-1 left-1 right-1 h-1 bg-gradient-to-t from-black/20 to-transparent rounded-b" />
                <div className="absolute top-1 bottom-1 left-1 w-1 bg-gradient-to-r from-black/20 to-transparent" />
                <div className="absolute top-1 bottom-1 right-1 w-1 bg-gradient-to-l from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
