'use client'

import { useRef, useEffect, useState } from 'react'

interface WebRendererProps {
  config: {
    url: string
    refresh_interval?: number
    scroll_enabled?: boolean
  }
  onError?: (error: Error) => void
  onLoad?: () => void
}

export function WebRenderer({
  config,
  onError,
  onLoad,
}: WebRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [key, setKey] = useState(0)

  const { url, refresh_interval, scroll_enabled = false } = config

  useEffect(() => {
    if (!refresh_interval || refresh_interval <= 0) return

    const interval = setInterval(() => {
      setKey((prev: number) => prev + 1)
    }, refresh_interval * 1000)

    return () => clearInterval(interval)
  }, [refresh_interval])

  const handleLoad = () => {
    setLoaded(true)
    setError(false)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    onError?.(new Error('Failed to load webpage'))
  }

  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
        <span className="text-sm">No URL configured</span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-white">
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-500">
          <span className="text-sm">Failed to load webpage</span>
        </div>
      )}
      <iframe
        key={key}
        ref={iframeRef}
        src={url}
        onLoad={handleLoad}
        onError={handleError}
        className="w-full h-full border-0"
        style={{
          overflow: scroll_enabled ? 'auto' : 'hidden',
          opacity: loaded ? 1 : 0,
        }}
        sandbox="allow-scripts allow-same-origin allow-forms"
        loading="eager"
      />
    </div>
  )
}
