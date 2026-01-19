'use client'

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AppPreview } from './AppPreview'
import type { App } from '@signage/types'
import { X } from 'lucide-react'
import { Button } from '@/components/ui'

interface AppPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  app: App
  config: Record<string, any>
  contentUrl?: string
}

export function AppPreviewModal({
  isOpen,
  onClose,
  app,
  config,
  contentUrl,
}: AppPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full p-0 overflow-hidden">
        <div className="relative h-[95vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
            <div>
              <DialogTitle className="text-lg font-semibold text-text-primary">{app.name}</DialogTitle>
              <DialogDescription className="text-sm text-text-secondary">Fullscreen Preview</DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <AppPreview
              app={app}
              config={config}
              contentUrl={contentUrl}
              className="max-w-7xl mx-auto"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
