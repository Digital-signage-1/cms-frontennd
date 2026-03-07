'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ContentRenderer } from '@signage/renderer'
import type { App } from '@signage/types'
import { X, Monitor, Smartphone } from 'lucide-react'

interface AppPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  app: App
  config: Record<string, any>
  contentUrl?: string
}

export function AppPreviewModal({ isOpen, onClose, app, config, contentUrl }: AppPreviewModalProps) {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape')

  const appWithUrl = useMemo(() => {
    const resolvedUrl = contentUrl || app.preview_url
    return { ...app, config, preview_url: resolvedUrl }
  }, [app, config, contentUrl])

  const isLandscape = orientation === 'landscape'
  const aspectW = isLandscape ? 16 : 9
  const aspectH = isLandscape ? 9 : 16

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideClose className="!p-0 !bg-transparent !border-0 !shadow-none max-w-[90vw] max-h-[92vh] w-fit overflow-visible flex flex-col items-center justify-center">
        {/* Backdrop click to close is handled by Dialog */}

        {/* ── Monitor frame ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

          {/* Top bar — app name + controls */}
          <div
            className="bg-surface-elevated border border-border"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 14px',
              borderRadius: '12px 12px 0 0',
              borderBottom: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}>
            <p className="text-text-primary" style={{ fontSize: 13, fontWeight: 600, margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {app.name}
            </p>
            <span className="text-text-muted" style={{ fontSize: 11, textTransform: 'capitalize', flexShrink: 0 }}>
              {app.template_type}
            </span>

            {/* Orientation toggle */}
            <button
              onClick={() => setOrientation(isLandscape ? 'portrait' : 'landscape')}
              title={isLandscape ? 'Switch to portrait' : 'Switch to landscape'}
              className="bg-surface-hover border border-border hover:bg-surface-elevated"
              style={{
                width: 28, height: 28, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              {isLandscape
                ? <Smartphone className="text-text-secondary" style={{ width: 14, height: 14 }} />
                : <Monitor className="text-text-secondary" style={{ width: 14, height: 14 }} />
              }
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="bg-surface-hover border border-border hover:bg-surface-elevated"
              style={{
                width: 28, height: 28, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <X className="text-text-secondary" style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Screen — the "display" */}
          <div
            className="border-[3px] border-border"
            style={{
              backgroundColor: '#000',
              borderRadius: '0 0 4px 4px',
              overflow: 'hidden',
              aspectRatio: `${aspectW} / ${aspectH}`,
              width: isLandscape ? 'min(80vw, 960px)' : undefined,
              height: isLandscape ? undefined : 'min(75vh, 700px)',
              maxHeight: '75vh',
              maxWidth: '80vw',
              position: 'relative',
              boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
            }}>
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <ContentRenderer
                appId={app.app_id}
                app={appWithUrl}
                onError={(error) => console.error('Preview render error:', error)}
                onLoad={() => {}}
              />
            </div>
          </div>

          {/* Stand — small decorative element */}
          <div className="bg-border" style={{
            width: 80,
            height: 6,
            borderRadius: '0 0 4px 4px',
            marginTop: 0,
          }} />
          <div className="bg-surface-alt border border-border" style={{
            width: 40,
            height: 20,
            borderRadius: '0 0 6px 6px',
            borderTop: 'none',
          }} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
