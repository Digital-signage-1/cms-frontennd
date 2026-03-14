'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { usePowerBIEmbed } from '../hooks/usePowerBIEmbed'
import {
  PowerBIPlaceholder,
  PowerBIError,
  OfflineBadge,
  getContainerStyle,
  usePowerBICachedData,
} from '../components/PowerBIShared'

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

export function PowerBIDashboardRenderer({ config }: PowerBIDashboardRendererProps) {
  const {
    dashboard_id,
    theme = 'dark',
    refresh_interval = 30,
    _data,
  } = config

  const [refreshKey, setRefreshKey] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { embedData, isOffline } = usePowerBICachedData('pbi_dashboard_', dashboard_id, _data)

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

  const containerStyle = getContainerStyle(theme)

  if (!embedUrl && !embedData?.embed_url) {
    return <PowerBIPlaceholder message="No Power BI dashboard configured" theme={theme} />
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
        {isOffline && <OfflineBadge />}
      </div>
    )
  }

  // Authenticated embed URL without token — show error
  const isAuthenticatedUrl = embedUrl.includes('reportEmbed') || embedUrl.includes('dashboardEmbed')
  if (isAuthenticatedUrl && !embedData?.embed_token) {
    return <PowerBIError message={(embedData as any)?.token_error} theme={theme} />
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
      {isOffline && <OfflineBadge />}
    </div>
  )
}
