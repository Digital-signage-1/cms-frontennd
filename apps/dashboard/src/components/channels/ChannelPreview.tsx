'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Play, Monitor, Smartphone, Tablet, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface ChannelPreviewProps {
  children: React.ReactNode
  channelManifest?: any
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

interface DeviceFrame {
  id: string
  name: string
  icon: any
  previewWidth: string
  aspectClass: string
}

const deviceFrames: DeviceFrame[] = [
  { id: 'desktop', name: 'Desktop',  icon: Monitor,    previewWidth: '800px', aspectClass: 'aspect-video' },
  { id: 'tablet',  name: 'Tablet',   icon: Tablet,     previewWidth: '400px', aspectClass: 'aspect-[4/3]' },
  { id: 'mobile',  name: 'Mobile',   icon: Smartphone, previewWidth: '200px', aspectClass: 'aspect-[9/19]' },
]

const ZONE_BG = ['#1A1A2E', '#162040', '#0F2044', '#1C1A2E', '#1A2520', '#1A1520', '#1C1015', '#0D1A2A']

export function ChannelPreview({ children, channelManifest, isOpen = false, onOpenChange }: ChannelPreviewProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceFrame>(deviceFrames[0])

  const renderZones = () => {
    if (!channelManifest?.zones) return null
    return channelManifest.zones.map((zone: any, i: number) => (
      <div
        key={zone.zone_id}
        className="absolute flex items-center justify-center"
        style={{
          left: `${zone.x_percent}%`, top: `${zone.y_percent}%`,
          width: `${zone.width_percent}%`, height: `${zone.height_percent}%`,
          zIndex: zone.z_index || 1,
          backgroundColor: ZONE_BG[i % ZONE_BG.length],
          border: '1px solid rgba(245,166,36,0.20)',
          borderRadius: 4,
        }}
      >
        <div style={{ textAlign: 'center', padding: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#F5A624', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
            {zone.name}
          </p>
          {zone.apps?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {zone.apps.slice(0, 2).map((app: any, idx: number) => (
                <div key={idx} style={{ fontSize: 9, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '2px 6px', color: '#9CA3AF' }}>
                  {app.app?.name || 'Unknown App'}
                </div>
              ))}
              {zone.apps.length > 2 && (
                <p style={{ fontSize: 9, color: '#6B7280', margin: 0 }}>+{zone.apps.length - 2} more</p>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 9, color: '#6B7280', margin: 0 }}>Empty</p>
          )}
        </div>
      </div>
    ))
  }

  if (onOpenChange) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent hideClose className="!p-0 max-w-6xl overflow-hidden flex flex-col" style={{ height: '82vh' }}>
          {/* Header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #1E1E38', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Channel Preview</p>
              <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>
                {channelManifest?.name || 'Preview your channel layout'}
              </p>
            </div>

            {/* Device toggles + close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {deviceFrames.map(frame => {
                  const Icon = frame.icon
                  const isActive = selectedDevice.id === frame.id
                  return (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedDevice(frame)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: isActive ? '1px solid rgba(245,166,36,0.50)' : '1px solid #2A2A40', backgroundColor: isActive ? 'rgba(245,166,36,0.12)' : '#0D0D1E', color: isActive ? '#F5A624' : '#9CA3AF', transition: 'all 0.15s' }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{frame.name}</span>
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => onOpenChange(false)}
                style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid #2A2A45', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X className="h-4 w-4" style={{ color: '#9CA3AF' }} />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#0A0A1A', overflow: 'auto' }}>
            <motion.div
              key={selectedDevice.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <div
                className={selectedDevice.aspectClass}
                style={{ width: selectedDevice.previewWidth, maxWidth: '100%', backgroundColor: '#141420', border: '1px solid #2A2A45', borderRadius: 10, overflow: 'hidden', boxShadow: '0 0 60px rgba(0,0,0,0.6)', position: 'relative' }}
              >
                {renderZones()}
                {!channelManifest?.zones && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: 13, color: '#6B7280' }}>No zones configured</p>
                  </div>
                )}
              </div>
              <p style={{ textAlign: 'center', fontSize: 11, color: '#6B7280', marginTop: 10 }}>{selectedDevice.name}</p>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return <DialogTrigger asChild>{children}</DialogTrigger>
}

// ── Standalone preview button ─────────────────────────────────────────────────
export function ChannelPreviewButton({ channelManifest, disabled = false }: { channelManifest?: any; disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid #2A2A45', color: '#9CA3AF', fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
      >
        <Play className="h-3.5 w-3.5" />
        Preview
      </button>
      <ChannelPreview channelManifest={channelManifest} isOpen={isOpen} onOpenChange={setIsOpen}>
        {null}
      </ChannelPreview>
    </>
  )
}
