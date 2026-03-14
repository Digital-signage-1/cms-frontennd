'use client'

import { useState, useEffect, useRef, CSSProperties } from 'react'

interface PowerBIURLConfig {
  embed_url: string
  theme?: 'dark' | 'light'
  refresh_interval?: number
}

interface PowerBIURLRendererProps {
  config: PowerBIURLConfig
}

export function PowerBIURLRenderer({ config }: PowerBIURLRendererProps) {
  const {
    embed_url,
    theme = 'dark',
    refresh_interval = 30,
  } = config

  const [refreshKey, setRefreshKey] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (refresh_interval > 0) {
      intervalRef.current = setInterval(() => {
        setRefreshKey((k) => k + 1)
      }, refresh_interval * 60 * 1000)
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [refresh_interval])

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: theme === 'dark' ? '#0f172a' : '#f8f9fa',
    overflow: 'hidden',
  }

  if (!embed_url) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#F2C811" />
          <rect x="7" y="12" width="3" height="6" rx="0.5" fill="white" />
          <rect x="11" y="8" width="3" height="10" rx="0.5" fill="white" />
          <rect x="15" y="5" width="3" height="13" rx="0.5" fill="white" />
        </svg>
        <span style={{ color: theme === 'dark' ? '#94a3b8' : '#666', fontSize: '14px' }}>
          No Power BI URL configured
        </span>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <iframe
        key={refreshKey}
        src={embed_url}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
        title="Power BI Report"
      />
    </div>
  )
}
