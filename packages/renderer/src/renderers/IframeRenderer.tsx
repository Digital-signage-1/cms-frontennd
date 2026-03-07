'use client'

import { useState, useEffect } from 'react'

interface IframeRendererProps {
  config: {
    url: string
    allow_scroll?: boolean
    refresh_interval?: number
    sandbox?: boolean
    background_color?: string
  }
  onError?: (error: Error) => void
  onLoad?: () => void
}

export function IframeRenderer({ config, onError, onLoad }: IframeRendererProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [key, setKey] = useState(0)

  const {
    url,
    allow_scroll = false,
    refresh_interval = 0,
    sandbox = true,
    background_color = '#000000',
  } = config

  useEffect(() => {
    if (!refresh_interval || refresh_interval <= 0) return
    const interval = setInterval(() => {
      setKey((prev) => prev + 1)
      setLoaded(false)
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
    onError?.(new Error('Failed to load iframe content'))
  }

  if (!url) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: background_color, color: '#6B7280' }}>
        <span style={{ fontSize: 14 }}>No URL configured</span>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: background_color }}>
      {!loaded && !error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      )}
      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
          <span style={{ fontSize: 14 }}>Failed to load content</span>
        </div>
      )}
      <iframe
        key={key}
        src={url}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%', height: '100%', border: 0,
          overflow: allow_scroll ? 'auto' : 'hidden',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 300ms',
        }}
        sandbox={sandbox ? 'allow-scripts allow-same-origin allow-forms allow-popups' : undefined}
        loading="eager"
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
