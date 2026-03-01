'use client'

import { useCallback, useMemo } from 'react'
import type { ChannelManifest, BackgroundConfig, ChannelZone, ZoneApp } from '@signage/types'
import { ZoneRenderer } from './ZoneRenderer'
import { useSlideScheduler } from './useSlideScheduler'

const fadeInKeyframes = `
@keyframes channelSlideFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`

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
  const channel = manifest.channel ?? {
    channel_id: manifest.channel_id,
    name: manifest.name,
    background: (manifest as unknown as { background?: BackgroundConfig }).background,
  }

  const slides = useMemo(() => {
    const raw = manifest.slides
    if (!raw || raw.length === 0) return null
    return [...raw].sort((a, b) => a.position - b.position)
  }, [manifest.slides])

  const fallbackZones = manifest.zones ?? []

  const { currentSlideIndex, currentSlide } = useSlideScheduler(slides, isPreview)

  const getBackgroundStyle = useCallback(() => {
    const bg = channel?.background as BackgroundConfig | undefined
    if (!bg || typeof bg !== 'object' || !('type' in bg)) return {}
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
  }, [channel?.background])

  const handleZoneError = useCallback(
    (zoneId: string) => (error: Error) => {
      onError?.(zoneId, error)
    },
    [onError]
  )

  const handleZoneAppChange = useCallback(
    (zoneId: string) => (appId: string) => {
      onAppChange?.(zoneId, appId)
    },
    [onAppChange]
  )

  if (!channel) {
    return null
  }

  const renderZones = (zones: Array<ChannelZone & { apps?: ZoneApp[] }>) => (
    <>
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
            apps={zone.apps ?? []}
            onError={handleZoneError(zone.zone_id)}
            onAppChange={handleZoneAppChange(zone.zone_id)}
            isPreview={isPreview}
          />
        </div>
      ))}
    </>
  )

  // Fallback: no slides, render flat zones directly (backward compat)
  if (!slides) {
    return (
      <div
        className={`relative w-full h-full overflow-hidden ${className}`}
        style={getBackgroundStyle()}
        data-channel-id={channel.channel_id ?? ''}
      >
        {renderZones(fallbackZones)}
      </div>
    )
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={getBackgroundStyle()}
      data-channel-id={channel.channel_id ?? ''}
      data-current-slide={currentSlideIndex}
    >
      <style>{fadeInKeyframes}</style>
      {currentSlide && (
        <div
          key={`slide-${currentSlideIndex}`}
          style={{ animation: 'channelSlideFadeIn 500ms ease-in-out' }}
          className="absolute inset-0"
        >
          {renderZones(currentSlide.zones)}
        </div>
      )}
    </div>
  )
}
