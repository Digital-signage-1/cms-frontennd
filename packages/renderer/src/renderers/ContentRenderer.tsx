'use client'

import { useEffect, useState } from 'react'
import type { App } from '@signage/types'
import { ImageRenderer } from './ImageRenderer'
import { VideoRenderer } from './VideoRenderer'
import { WebRenderer } from './WebRenderer'
import { HtmlRenderer } from './HtmlRenderer'
import { ClockRenderer } from './ClockRenderer'
import { WeatherRenderer } from './WeatherRenderer'

interface ContentRendererProps {
  appId: string
  app?: App
  onError?: (error: Error) => void
  onLoad?: () => void
}

export function ContentRenderer({
  appId,
  app,
  onError,
  onLoad,
}: ContentRendererProps) {
  const [appData, setAppData] = useState<App | null>(app || null)
  const [loading, setLoading] = useState(!app)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (app) {
      setAppData(app)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
  }, [app, appId])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !appData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-900/20 text-red-400">
        <span className="text-sm">Failed to load content</span>
      </div>
    )
  }

  const renderContent = () => {
    switch (appData.template_type) {
      case 'image':
        return (
          <ImageRenderer
            config={appData.config as { url?: string; fit?: string; position?: string }}
            contentUrl={appData.preview_url}
            onError={onError}
            onLoad={onLoad}
          />
        )
      
      case 'video':
        return (
          <VideoRenderer
            config={appData.config as { url?: string; autoplay?: boolean; loop?: boolean; muted?: boolean }}
            contentUrl={appData.preview_url}
            onError={onError}
            onLoad={onLoad}
          />
        )
      
      case 'web':
        return (
          <WebRenderer
            config={appData.config as { url: string; refresh_interval?: number; scroll_enabled?: boolean }}
            onError={onError}
            onLoad={onLoad}
          />
        )
      
      case 'html':
        return (
          <HtmlRenderer
            config={appData.config as { html: string; css?: string }}
            onError={onError}
          />
        )
      
      case 'clock':
        return (
          <ClockRenderer
            config={appData.config as { format?: '12h' | '24h'; show_seconds?: boolean; show_date?: boolean; timezone?: string; theme?: 'light' | 'dark' | 'minimal' }}
          />
        )
      
      case 'weather':
        return (
          <WeatherRenderer
            config={appData.config as { location: string; units?: 'celsius' | 'fahrenheit'; show_forecast?: boolean }}
            onError={onError}
          />
        )
      
      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
            <span className="text-sm">Unsupported content type: {appData.template_type}</span>
          </div>
        )
    }
  }

  return (
    <div className="w-full h-full" data-app-id={appId}>
      {renderContent()}
    </div>
  )
}
