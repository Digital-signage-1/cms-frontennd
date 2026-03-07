'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import type { ChannelZone, ZoneApp } from '@signage/types'
import { TransitionEngine, type TransitionType } from './TransitionEngine'
import { ContentRenderer } from './renderers'

interface ZoneRendererProps {
  zone: ChannelZone
  apps: ZoneApp[]
  onError?: (error: Error) => void
  onAppChange?: (appId: number | string) => void
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

  // Stable identity for the apps list — only changes when actual app IDs change
  const appsKey = useMemo(
    () => apps.map((a) => a.app_id).join(','),
    [apps]
  )

  // Keep a ref to apps so effects can read latest data without depending on the array reference
  const appsRef = useRef(apps)
  appsRef.current = apps

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

  // Stable ref for onAppChange to avoid re-firing effects when callback identity changes
  const onAppChangeRef = useRef(onAppChange)
  useEffect(() => {
    onAppChangeRef.current = onAppChange
  })

  const goToNext = useCallback(() => {
    const currentApps = appsRef.current
    if (currentApps.length <= 1) return

    const nextIndex = (currentIndex + 1) % currentApps.length
    setNextApp(currentApps[nextIndex])
    setIsTransitioning(true)

    setTimeout(() => {
      setCurrentIndex(nextIndex)
      setCurrentApp(currentApps[nextIndex])
      setNextApp(null)
      setIsTransitioning(false)
      onAppChangeRef.current?.(currentApps[nextIndex].app_id)
    }, transitionDuration)
  }, [currentIndex, transitionDuration])

  // Reset when the actual apps change (not just reference)
  useEffect(() => {
    const currentApps = appsRef.current
    if (currentApps.length === 0) return

    setCurrentApp(currentApps[0])
    setCurrentIndex(0)
    onAppChangeRef.current?.(currentApps[0].app_id)
  }, [appsKey])

  // App cycling timer
  useEffect(() => {
    if (!currentApp || appsRef.current.length <= 1 || isPreview) return

    const duration = currentApp.duration_seconds * 1000
    if (duration <= 0) return

    timerRef.current = setTimeout(goToNext, duration)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [currentApp, appsKey, isPreview, goToNext])

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
            appId={String(currentApp.app_id)}
            app={(currentApp as any).app}
            onError={onError}
          />
        </div>
        {nextApp && (
          <div className="absolute inset-0">
            <ContentRenderer
              appId={String(nextApp.app_id)}
              app={(nextApp as any).app}
              onError={onError}
            />
          </div>
        )}
      </TransitionEngine>
    </div>
  )
}
