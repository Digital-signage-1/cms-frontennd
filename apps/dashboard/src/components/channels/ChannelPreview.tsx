'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Play, Monitor, Smartphone, Tablet, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { ChannelRenderer } from '@signage/renderer'

interface ChannelPreviewProps {
  children: React.ReactNode
  channelManifest?: any
  workspaceId?: number | string
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

const ZONE_BG = ['#E8E6FF', '#E0EAFF', '#DDEEFF', '#EDE8FF', '#E0F0E8', '#E8E0F0', '#F0E0E8', '#E0E8F0']

export function ChannelPreview({ children, channelManifest, workspaceId, isOpen = false, onOpenChange }: ChannelPreviewProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceFrame>(deviceFrames[0])
  const [streamToken, setStreamToken] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined')
      setStreamToken(localStorage.getItem('signage_access_token'))
  }, [isOpen])

  const manifestWithAuth = streamToken && channelManifest?.slides?.length
    ? {
        ...channelManifest,
        channel: channelManifest.channel ?? {
          channel_id: channelManifest.channel_id,
          name: channelManifest.name,
          background: channelManifest.background,
        },
        slides: channelManifest.slides.map((slide: any) => ({
          ...slide,
          zones: slide.zones?.map((zone: any) => ({
            ...zone,
            apps: zone.apps?.map((za: any) => {
              const a = za?.app
              if (a?.template_type === 'pdf' && a?.preview_url) {
                return {
                  ...za,
                  app: {
                    ...a,
                    preview_url: a.preview_url + (a.preview_url.includes('?') ? '&' : '?') + 'access_token=' + encodeURIComponent(streamToken),
                  },
                }
              }
              return za
            }) ?? zone.apps,
          })) ?? slide.zones,
        })) ?? channelManifest.slides,
      }
    : channelManifest

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
          border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
          borderRadius: 4,
        }}
      >
        <div style={{ textAlign: 'center', padding: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
            {zone.name}
          </p>
          {zone.apps?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {zone.apps.slice(0, 2).map((app: any, idx: number) => (
                <div key={idx} style={{ fontSize: 9, backgroundColor: 'var(--color-primary-light)', borderRadius: 4, padding: '2px 6px', color: 'var(--color-text-secondary)' }}>
                  {app.app?.name || 'Unknown App'}
                </div>
              ))}
              {zone.apps.length > 2 && (
                <p style={{ fontSize: 9, color: 'var(--color-text-muted)', margin: 0 }}>+{zone.apps.length - 2} more</p>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 9, color: 'var(--color-text-muted)', margin: 0 }}>Empty</p>
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
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Channel Preview</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
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
                      style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: isActive ? '1px solid color-mix(in srgb, var(--color-primary) 50%, transparent)' : '1px solid var(--color-border)', backgroundColor: isActive ? 'var(--color-primary-light)' : '#FFFFFF', color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)', transition: 'all 0.15s' }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{frame.name}</span>
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => onOpenChange(false)}
                style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: 'var(--color-background)', overflow: 'auto' }}>
            <motion.div
              key={selectedDevice.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <div
                className={selectedDevice.aspectClass}
                style={{ width: selectedDevice.previewWidth, maxWidth: '100%', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 0 60px color-mix(in srgb, var(--color-primary) 10%, transparent)', position: 'relative' }}
              >
                {manifestWithAuth?.slides?.length ? (
                  <div style={{ position: 'absolute', inset: 0 }}>
                    <ChannelRenderer
                      manifest={{
                        channel: manifestWithAuth.channel ?? { channel_id: manifestWithAuth.channel_id, name: manifestWithAuth.name, background: manifestWithAuth.background },
                        slides: manifestWithAuth.slides,
                        zones: manifestWithAuth.zones,
                      }}
                      isPreview
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <>
                    {renderZones()}
                    {!channelManifest?.zones && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No zones configured</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 10 }}>{selectedDevice.name}</p>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return <DialogTrigger asChild>{children}</DialogTrigger>
}

export function ChannelPreviewButton({ channelManifest, workspaceId, disabled = false }: { channelManifest?: any; workspaceId?: number | string; disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 8, backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
      >
        <Play className="h-3.5 w-3.5" />
        Preview
      </button>
      <ChannelPreview channelManifest={channelManifest} workspaceId={workspaceId} isOpen={isOpen} onOpenChange={setIsOpen}>
        {null}
      </ChannelPreview>
    </>
  )
}
