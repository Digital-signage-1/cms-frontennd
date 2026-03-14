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

interface PowerBIRealtimeReportConfig {
  integration_id: string
  workspace_id: string
  report_id: string
  show_filter_pane?: boolean
  show_nav_pane?: boolean
  auto_rotate_pages?: boolean
  page_duration?: number
  theme?: 'dark' | 'light'
  refresh_interval?: number
  _data?: {
    embed_url: string
    embed_token?: string
    token_type?: 'embed' | 'aad'
    report_id: string
    token_expiry?: string
    token_error?: string
  }
}

interface PowerBIRealtimeReportRendererProps {
  config: PowerBIRealtimeReportConfig
}

export function PowerBIRealtimeReportRenderer({ config }: PowerBIRealtimeReportRendererProps) {
  const {
    report_id,
    show_filter_pane = false,
    show_nav_pane = false,
    auto_rotate_pages = true,
    page_duration = 15,
    theme = 'dark',
    refresh_interval = 30,
    _data,
  } = config

  const [refreshKey, setRefreshKey] = useState(0)
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { embedData, isOffline } = usePowerBICachedData('pbi_realtime_report_', report_id, _data)

  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // SDK embed hook
  const { sdkAvailable, sdkLoading, loaded, containerRef, reportRef } = usePowerBIEmbed({
    type: 'report',
    embedUrl: embedData?.embed_url || '',
    embedToken: embedData?.embed_token,
    tokenType: embedData?.token_type,
    id: embedData?.report_id || report_id,
    tokenExpiry: embedData?.token_expiry,
    filterPaneEnabled: show_filter_pane,
    navContentPaneEnabled: show_nav_pane,
  })

  const useSDK = sdkAvailable && !!embedData?.embed_token

  // Page auto-rotation using SDK APIs
  useEffect(() => {
    if (!loaded || !auto_rotate_pages || !page_duration || page_duration <= 0) return
    if (!reportRef.current) return

    const report = reportRef.current
    let intervalId: ReturnType<typeof setInterval> | null = null
    let pages: Array<{ name: string; displayName: string }> = []
    let pageIndex = 0
    let cancelled = false

    report.getPages().then((allPages: Array<{ name: string; displayName: string; visibility?: number }>) => {
      if (cancelled) return
      // visibility 0 = visible (HiddenPage = 1)
      pages = allPages.filter((p: any) => p.visibility == null || p.visibility === 0)
      setTotalPages(pages.length)
      setCurrentPage(0)

      if (pages.length <= 1) return

      intervalId = setInterval(() => {
        pageIndex = (pageIndex + 1) % pages.length
        report.setPage(pages[pageIndex].name).catch(() => { /* best effort */ })
        setCurrentPage(pageIndex)
      }, page_duration * 1000)
    }).catch(() => { /* report not ready yet */ })

    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
  }, [loaded, auto_rotate_pages, page_duration, reportRef])

  // Auto-refresh embed token (only for iframe path — SDK handles token refresh via setAccessToken)
  useEffect(() => {
    if (useSDK || refresh_interval <= 0) return
    refreshIntervalRef.current = setInterval(() => {
      setRefreshKey((k) => k + 1)
    }, refresh_interval * 60 * 1000)
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current)
    }
  }, [refresh_interval, useSDK])

  // Build iframe URL (only used when SDK is not available)
  const embedUrl = useMemo(() => {
    if (!embedData?.embed_url) return ''
    let url = embedData.embed_url
    const params = new URLSearchParams()
    if (!show_filter_pane) params.set('filterPaneEnabled', 'false')
    if (!show_nav_pane) params.set('navContentPaneEnabled', 'false')
    const separator = url.includes('?') ? '&' : '?'
    const qs = params.toString()
    if (qs) url += `${separator}${qs}`
    return url
  }, [embedData?.embed_url, show_filter_pane, show_nav_pane])

  const containerStyle = getContainerStyle(theme)

  // No data at all
  if (!embedData?.embed_url) {
    return <PowerBIPlaceholder message="No Power BI report configured" theme={theme} />
  }

  // SDK path: render a container div that the SDK manages
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
              Loading Power BI report...
            </span>
          </div>
        )}
        {auto_rotate_pages && totalPages > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              padding: '3px 8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 500,
              pointerEvents: 'none',
            }}
          >
            {currentPage + 1} / {totalPages}
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

  // Iframe fallback (Publish to Web URLs, or Chrome 38 player)
  return (
    <div style={containerStyle}>
      <iframe
        key={refreshKey}
        src={embedUrl}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
        title="Power BI Report"
      />
      {isOffline && <OfflineBadge />}
    </div>
  )
}
