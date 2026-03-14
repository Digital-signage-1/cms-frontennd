'use client'

import { useState, useEffect, useRef, useMemo, CSSProperties } from 'react'
import { usePowerBIEmbed } from '../hooks/usePowerBIEmbed'

interface PowerBIDashboardConfig {
  integration_id: string
  workspace_id: string
  dashboard_id: string
  theme?: 'dark' | 'light'
  refresh_interval?: number
  _data?: {
    embed_url: string
    embed_token?: string
    token_type?: 'embed' | 'aad'
    dashboard_id: string
    token_expiry?: string
    token_error?: string
  }
}

interface PowerBIDashboardRendererProps {
  config: PowerBIDashboardConfig
}

const CACHE_PREFIX = 'pbi_dashboard_'

export function PowerBIDashboardRenderer({ config }: PowerBIDashboardRendererProps) {
  const {
    dashboard_id,
    theme = 'dark',
    refresh_interval = 30,
    _data,
  } = config

  const [refreshKey, setRefreshKey] = useState(0)
  const [cachedData, setCachedData] = useState<PowerBIDashboardConfig['_data'] | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const embedData = _data || cachedData

  // SDK embed hook
  const { sdkAvailable, sdkLoading, containerRef } = usePowerBIEmbed({
    type: 'dashboard',
    embedUrl: embedData?.embed_url || '',
    embedToken: embedData?.embed_token,
    tokenType: embedData?.token_type,
    id: embedData?.dashboard_id || dashboard_id,
    tokenExpiry: embedData?.token_expiry,
  })

  const useSDK = sdkAvailable && !!embedData?.embed_token

  // Cache successful data to localStorage
  useEffect(() => {
    if (_data?.embed_url) {
      setIsOffline(false)
      try {
        localStorage.setItem(
          CACHE_PREFIX + dashboard_id,
          JSON.stringify({ ..._data, cached_at: Date.now() })
        )
      } catch { /* storage full */ }
    } else if (!_data) {
      try {
        const cached = localStorage.getItem(CACHE_PREFIX + dashboard_id)
        if (cached) {
          setCachedData(JSON.parse(cached))
          setIsOffline(true)
        }
      } catch { /* corrupt cache */ }
    }
  }, [_data, dashboard_id])

  // Auto-refresh (iframe path only)
  useEffect(() => {
    if (useSDK || refresh_interval <= 0) return
    intervalRef.current = setInterval(() => {
      setRefreshKey((k) => k + 1)
    }, refresh_interval * 60 * 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [refresh_interval, useSDK])

  const embedUrl = useMemo(() => {
    return embedData?.embed_url || ''
  }, [embedData?.embed_url])

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: theme === 'dark' ? '#0f172a' : '#f8f9fa',
    overflow: 'hidden',
    position: 'relative',
  }

  if (!embedUrl && !embedData?.embed_url) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#F2C811" />
          <rect x="7" y="12" width="3" height="6" rx="0.5" fill="white" />
          <rect x="11" y="8" width="3" height="10" rx="0.5" fill="white" />
          <rect x="15" y="5" width="3" height="13" rx="0.5" fill="white" />
        </svg>
        <span style={{ color: theme === 'dark' ? '#94a3b8' : '#666', fontSize: '14px' }}>
          No Power BI dashboard configured
        </span>
      </div>
    )
  }

  // SDK path
  if (useSDK) {
    return (
      <div style={containerStyle}>
        <div
          ref={containerRef}
          style={{ width: '100%', height: '100%' }}
        />
        {sdkLoading && (
          <div style={{ ...containerStyle, position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: theme === 'dark' ? '#94a3b8' : '#666', fontSize: '14px' }}>
              Loading Power BI dashboard...
            </span>
          </div>
        )}
        {isOffline && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              padding: '3px 8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(234,179,8,0.15)',
              color: '#eab308',
              fontSize: '10px',
              fontWeight: 500,
            }}
          >
            Offline — cached data
          </div>
        )}
      </div>
    )
  }

  // Authenticated embed URL without token — show error instead of spinning iframe
  const isAuthenticatedUrl = embedUrl.includes('reportEmbed') || embedUrl.includes('dashboardEmbed')
  if (isAuthenticatedUrl && !embedData?.embed_token) {
    const tokenError = (embedData as any)?.token_error
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', padding: '24px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#F2C811" />
          <rect x="7" y="12" width="3" height="6" rx="0.5" fill="white" />
          <rect x="11" y="8" width="3" height="10" rx="0.5" fill="white" />
          <rect x="15" y="5" width="3" height="13" rx="0.5" fill="white" />
        </svg>
        <span style={{ color: theme === 'dark' ? '#f87171' : '#dc2626', fontSize: '14px', textAlign: 'center' }}>
          {tokenError || 'Embed token unavailable — check Power BI license (Pro or Premium required)'}
        </span>
      </div>
    )
  }

  // Iframe fallback (Publish to Web URLs)
  return (
    <div style={containerStyle}>
      <iframe
        key={refreshKey}
        src={embedUrl}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
        title="Power BI Dashboard"
      />
      {isOffline && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            padding: '3px 8px',
            borderRadius: '8px',
            backgroundColor: 'rgba(234,179,8,0.15)',
            color: '#eab308',
            fontSize: '10px',
            fontWeight: 500,
          }}
        >
          Offline — cached data
        </div>
      )}
    </div>
  )
}
