'use client'

import { useState, useEffect, useMemo, useRef, CSSProperties } from 'react'

interface LookerStudioConfig {
  report_url: string
  page_number?: number
  auto_refresh?: boolean
  refresh_interval?: number
}

interface LookerStudioRendererProps {
  config: LookerStudioConfig
}

export function LookerStudioRenderer({ config }: LookerStudioRendererProps) {
  const {
    report_url,
    page_number = 1,
    auto_refresh = true,
    refresh_interval = 5,
  } = config

  const [refreshKey, setRefreshKey] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null as unknown as ReturnType<typeof setInterval>)

  useEffect(() => {
    if (auto_refresh && refresh_interval > 0) {
      intervalRef.current = setInterval(() => {
        setRefreshKey((k) => k + 1)
      }, refresh_interval * 60 * 1000)
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [auto_refresh, refresh_interval])

  const embedUrl = useMemo(() => {
    if (!report_url) return ''
    let url = report_url
    // Ensure it's an embed URL
    if (!url.includes('/embed/')) {
      url = url.replace('/reporting/', '/embed/reporting/')
    }
    // Add page number
    if (page_number > 1) {
      const separator = url.includes('?') ? '&' : '?'
      url += `${separator}page=${page_number}`
    }
    return url
  }, [report_url, page_number])

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  }

  if (!embedUrl) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', backgroundColor: '#0f172a' }}>
        No report URL configured
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <iframe
        key={refreshKey}
        src={embedUrl}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
        title="Looker Studio Report"
      />
    </div>
  )
}
