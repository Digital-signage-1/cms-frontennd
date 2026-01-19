'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
  width: number
  height: number
  icon: any
  className: string
}

const deviceFrames: DeviceFrame[] = [
  {
    id: 'desktop',
    name: 'Desktop (1920×1080)',
    width: 1920,
    height: 1080,
    icon: Monitor,
    className: 'aspect-video'
  },
  {
    id: 'tablet',
    name: 'Tablet (1024×768)',
    width: 1024,
    height: 768,
    icon: Tablet,
    className: 'aspect-[4/3]'
  },
  {
    id: 'mobile',
    name: 'Mobile (390×844)',
    width: 390,
    height: 844,
    icon: Smartphone,
    className: 'aspect-[9/19]'
  }
]

export function ChannelPreview({
  children,
  channelManifest,
  isOpen = false,
  onOpenChange
}: ChannelPreviewProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceFrame>(deviceFrames[0])

  const renderZones = () => {
    if (!channelManifest?.zones) return null

    return channelManifest.zones.map((zone: any, i: number) => (
      <div
        key={zone.zone_id}
        className="absolute border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center"
        style={{
          left: `${zone.x_percent}%`,
          top: `${zone.y_percent}%`,
          width: `${zone.width_percent}%`,
          height: `${zone.height_percent}%`,
          zIndex: zone.z_index || 1,
        }}
      >
        <div className="text-center p-2">
          <p className="font-semibold text-xs text-primary mb-1">
            {zone.name}
          </p>
          {zone.apps && zone.apps.length > 0 ? (
            <div className="space-y-1">
              {zone.apps.slice(0, 2).map((app: any, appIndex: number) => (
                <div
                  key={appIndex}
                  className="text-xs bg-surface/80 rounded px-2 py-1 text-text-primary"
                >
                  {app.app?.name || 'Unknown App'}
                </div>
              ))}
              {zone.apps.length > 2 && (
                <div className="text-xs text-text-muted">
                  +{zone.apps.length - 2} more
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-text-muted">Empty</p>
          )}
        </div>
      </div>
    ))
  }

  if (onOpenChange) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[80vh] p-0">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Channel Preview</DialogTitle>
                <p className="text-sm text-text-secondary mt-1">
                  {channelManifest?.name || 'Preview your channel layout'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {deviceFrames.map((frame) => {
                  const Icon = frame.icon
                  return (
                    <Button
                      key={frame.id}
                      variant={selectedDevice.id === frame.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDevice(frame)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{frame.name.split(' ')[0]}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex items-center justify-center p-8 bg-surface-alt">
            <motion.div
              key={selectedDevice.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div
                className={`bg-surface border border-border shadow-xl rounded-lg overflow-hidden max-w-full max-h-full ${selectedDevice.className}`}
                style={{
                  width: selectedDevice.id === 'desktop' ? '800px' :
                         selectedDevice.id === 'tablet' ? '400px' : '200px'
                }}
              >
                <div className="relative w-full h-full bg-gradient-to-br from-background to-surface-alt">
                  {renderZones()}
                </div>
              </div>
              <p className="text-center text-xs text-text-muted mt-3">
                {selectedDevice.name}
              </p>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <DialogTrigger asChild>
      {children}
    </DialogTrigger>
  )
}

// Simple preview button component
export function ChannelPreviewButton({
  channelManifest,
  disabled = false
}: {
  channelManifest?: any
  disabled?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        className="gap-2"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
      >
        <Play className="h-4 w-4" />
        Preview
      </Button>

      <ChannelPreview
        channelManifest={channelManifest}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        {null}
      </ChannelPreview>
    </>
  )
}