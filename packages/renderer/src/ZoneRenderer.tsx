'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { ChannelZone, ZoneApp } from '@signage/types'
import { TransitionEngine, type TransitionType } from './TransitionEngine'
import { ContentRenderer } from './renderers'

interface ZoneRendererProps {
  zone: ChannelZone
  apps: ZoneApp[]
  onError?: (error: Error) => void
  onAppChange?: (appId: string) => void
  isPreview?: boolean
  transitionType?: TransitionType
  transitionDuration?: number
}

export function ZoneRenderer({
  zone,
  apps,
  onError,
  onAppChange,
  isPreview = false,
  transitionType = 'fade',
  transitionDuration = 500,
}: ZoneRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentApp, setCurrentApp] = useState<ZoneApp | null>(apps[0] || null)
  const [nextApp, setNextApp] = useState<ZoneApp | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const getBackgroundStyle = useCallback(() => {
    const bg = zone.background
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
      default:
        return {}
    }
  }, [zone.background])

  const goToNext = useCallback(() => {
    if (apps.length <= 1) return
    
    const nextIndex = (currentIndex + 1) % apps.length
    setNextApp(apps[nextIndex])
    setIsTransitioning(true)
    
    setTimeout(() => {
      setCurrentIndex(nextIndex)
      setCurrentApp(apps[nextIndex])
      setNextApp(null)
      setIsTransitioning(false)
      onAppChange?.(apps[nextIndex].app_id)
    }, transitionDuration)
  }, [apps, currentIndex, transitionDuration, onAppChange])

  useEffect(() => {
    if (apps.length === 0) return
    
    setCurrentApp(apps[0])
    setCurrentIndex(0)
    onAppChange?.(apps[0].app_id)
  }, [apps, onAppChange])

  useEffect(() => {
    if (!currentApp || apps.length <= 1 || isPreview) return
    
    const duration = currentApp.duration_seconds * 1000
    if (duration <= 0) return
    
    timerRef.current = setTimeout(goToNext, duration)
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [currentApp, apps.length, isPreview, goToNext])

  if (!currentApp) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500"
        style={getBackgroundStyle()}
      >
        <span className="text-sm">No content</span>
      </div>
    )
  }

  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      style={getBackgroundStyle()}
      data-zone-id={zone.zone_id}
    >
      <TransitionEngine
        type={transitionType}
        duration={transitionDuration}
        isTransitioning={isTransitioning}
      >
        <div className="absolute inset-0">
          <ContentRenderer
            appId={currentApp.app_id}
            onError={onError}
          />
        </div>
        {nextApp && (
          <div className="absolute inset-0">
            <ContentRenderer
              appId={nextApp.app_id}
              onError={onError}
            />
          </div>
        )}
      </TransitionEngine>
    </div>
  )
}
