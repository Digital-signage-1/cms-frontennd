'use client'

import { useEffect, useState } from 'react'
import type { App } from '@signage/types'
import { getRenderer } from './registry'

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

  const contentUrl = appData.preview_url ?? (appData as any).content_url
  const Renderer = getRenderer(appData.template_type)

  if (!Renderer) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
        <span className="text-sm">Unsupported content type: {appData.template_type}</span>
      </div>
    )
  }

  return (
    <div className="w-full h-full" data-app-id={appId}>
      <Renderer
        config={appData.config as Record<string, any>}
        contentUrl={contentUrl}
        onError={onError}
        onLoad={onLoad}
      />
    </div>
  )
}
