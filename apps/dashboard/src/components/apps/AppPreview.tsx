'use client'

import { useState, useMemo, useEffect } from 'react'
import { ContentRenderer } from '@signage/renderer'
import { Monitor, Smartphone, Tablet, Maximize2, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui'
import type { App } from '@signage/types'
import { motion, AnimatePresence } from 'framer-motion'

type DeviceType = 'tv-landscape' | 'tv-portrait' | 'tablet' | 'custom'

interface DeviceConfig {
  name: string
  width: number
  height: number
  icon: typeof Monitor
}

const DEVICE_CONFIGS: Record<DeviceType, DeviceConfig> = {
  'tv-landscape': {
    name: 'TV Landscape',
    width: 1920,
    height: 1080,
    icon: Monitor,
  },
  'tv-portrait': {
    name: 'TV Portrait',
    width: 1080,
    height: 1920,
    icon: Smartphone,
  },
  'tablet': {
    name: 'Tablet',
    width: 1024,
    height: 768,
    icon: Tablet,
  },
  'custom': {
    name: 'Custom',
    width: 1920,
    height: 1080,
    icon: Monitor,
  },
}

interface AppPreviewProps {
  app: App
  config: Record<string, any>
  contentUrl?: string
  deviceType?: DeviceType
  onFullscreen?: () => void
  className?: string
}

export function AppPreview({
  app,
  config,
  contentUrl,
  deviceType = 'tv-landscape',
  onFullscreen,
  className = '',
}: AppPreviewProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(deviceType)
  const [isRotating, setIsRotating] = useState(false)

  useEffect(() => {
    setSelectedDevice(deviceType)
  }, [deviceType])

  const deviceConfig = DEVICE_CONFIGS[selectedDevice]
  const aspectRatio = deviceConfig.width / deviceConfig.height

  const appWithUrl = useMemo(() => {
    const resolvedUrl = contentUrl || app.preview_url
    
    if (!resolvedUrl && app.content_id) {
      console.log('AppPreview: No content URL available for content_id:', app.content_id)
    }
    
    return {
      ...app,
      config: config,
      preview_url: resolvedUrl,
    }
  }, [app, config, contentUrl])

  const handleRotate = () => {
    setIsRotating(true)
    if (selectedDevice === 'tv-landscape') {
      setSelectedDevice('tv-portrait')
    } else if (selectedDevice === 'tv-portrait') {
      setSelectedDevice('tv-landscape')
    }
    setTimeout(() => setIsRotating(false), 300)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Object.entries(DEVICE_CONFIGS).map(([key, device]) => {
            const Icon = device.icon
            const isActive = selectedDevice === key
            return (
              <button
                key={key}
                onClick={() => setSelectedDevice(key as DeviceType)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-surface border border-border text-text-secondary hover:bg-surface-alt'
                }`}
                title={device.name}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{device.name}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          {(selectedDevice === 'tv-landscape' || selectedDevice === 'tv-portrait') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
              className="gap-2"
              disabled={isRotating}
            >
              <RotateCw className={`h-4 w-4 ${isRotating ? 'animate-spin' : ''}`} />
              Rotate
            </Button>
          )}
          {onFullscreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={onFullscreen}
              className="gap-2"
            >
              <Maximize2 className="h-4 w-4" />
              Fullscreen
            </Button>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-2 text-center">
        <span className="text-sm text-text-muted">
          {deviceConfig.width} × {deviceConfig.height}px • {aspectRatio.toFixed(2)}:1
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDevice}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-gradient-to-br from-surface-alt/50 to-background border border-border rounded-xl p-4 sm:p-8"
        >
          <div className="mx-auto bg-black rounded-lg overflow-hidden shadow-2xl border-4 border-gray-800"
            style={{
              aspectRatio: `${deviceConfig.width} / ${deviceConfig.height}`,
              maxWidth: '100%',
              maxHeight: '70vh',
            }}
          >
            <div className="w-full h-full relative">
              <ContentRenderer
                appId={app.app_id}
                app={appWithUrl}
                onError={(error) => {
                  console.error('Preview render error:', error)
                }}
                onLoad={() => {
                  console.log('Preview loaded')
                }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="bg-surface border border-border rounded-lg p-4">
        <h4 className="text-sm font-medium text-text-primary mb-2">Preview Info</h4>
        <div className="space-y-2 text-xs text-text-secondary">
          <div className="flex justify-between">
            <span>App Type:</span>
            <span className="font-medium text-text-primary capitalize">{app.template_type}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-medium text-text-primary capitalize">{app.status}</span>
          </div>
          {contentUrl && (
            <div className="flex justify-between">
              <span>Content:</span>
              <span className="font-medium text-text-primary truncate max-w-[200px]" title={contentUrl}>
                Loaded
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
