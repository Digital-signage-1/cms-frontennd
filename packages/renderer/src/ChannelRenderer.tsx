'use client'

import { useCallback } from 'react'
import type { ChannelManifest } from '@signage/types'
import { ZoneRenderer } from './ZoneRenderer'

interface ChannelRendererProps {
  manifest: ChannelManifest
  onError?: (zoneId: string, error: Error) => void
  onAppChange?: (zoneId: string, appId: string) => void
  className?: string
  isPreview?: boolean
}

export function ChannelRenderer({
  manifest,
  onError,
  onAppChange,
  className = '',
  isPreview = false,
}: ChannelRendererProps) {
  const { channel, zones } = manifest

  const getBackgroundStyle = useCallback(() => {
    const bg = channel.background
    if (!bg) return {}
    
    switch (bg.type) {
      case 'color':
        return { backgroundColor: bg.value }
      case 'gradient':
        return { background: bg.value }
      case 'image':
        return { 
          backgroundImage: `url(${bg.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }
      case 'transparent':
      default:
        return { backgroundColor: 'transparent' }
    }
  }, [channel.background])

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={getBackgroundStyle()}
      data-channel-id={channel.channel_id}
    >
      {zones.map((zone) => (
        <div
          key={zone.zone_id}
          className="absolute"
          style={{
            left: `${zone.x_percent}%`,
            top: `${zone.y_percent}%`,
            width: `${zone.width_percent}%`,
            height: `${zone.height_percent}%`,
            zIndex: zone.z_index,
          }}
        >
          <ZoneRenderer
            zone={zone}
            apps={zone.apps}
            onError={(error) => onError?.(zone.zone_id, error)}
            onAppChange={(appId) => onAppChange?.(zone.zone_id, appId)}
            isPreview={isPreview}
          />
        </div>
      ))}
    </div>
  )
}
