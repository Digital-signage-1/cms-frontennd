'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { AppPreview } from './AppPreview'
import type { App } from '@signage/types'
import { X, Maximize2 } from 'lucide-react'

interface AppPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  app: App
  config: Record<string, any>
  contentUrl?: string
}

export function AppPreviewModal({ isOpen, onClose, app, config, contentUrl }: AppPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideClose className="!p-0 max-w-[95vw] max-h-[95vh] w-full overflow-hidden flex flex-col">
        {/* ── Header ── */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1E1E38', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(245,166,36,0.18)', border: '1px solid rgba(245,166,36,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Maximize2 className="h-4 w-4" style={{ color: '#F5A624' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.name}</p>
            <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>Fullscreen Preview</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid #2A2A45', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <X className="h-4 w-4" style={{ color: '#9CA3AF' }} />
          </button>
        </div>

        {/* ── Preview area ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, backgroundColor: '#0D0D1E' }}>
          <AppPreview
            app={app}
            config={config}
            contentUrl={contentUrl}
            className="max-w-7xl mx-auto"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
