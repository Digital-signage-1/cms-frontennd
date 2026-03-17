'use client'

import { useState, useEffect, useRef, useMemo } from 'react'

interface CanvaConfig {
  design_id?: string
  fit_mode?: string
  auto_refresh?: boolean
  refresh_interval?: number
  _data?: {
    embed_url?: string
    view_url?: string
    name?: string
  }
}

interface RendererProps {
  config: Record<string, any>
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
}

export function CanvaRenderer({ config, onLoad }: RendererProps) {
  var cfg = config as unknown as CanvaConfig
  var data = cfg._data || {}
  var embedUrl = data.embed_url || data.view_url || ''
  var autoRefresh = cfg.auto_refresh !== false
  var refreshMin = cfg.refresh_interval || 5
  var [refreshKey, setRefreshKey] = useState(0)
  var timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(function () {
    if (!autoRefresh || refreshMin <= 0) return
    timerRef.current = setInterval(function () {
      setRefreshKey(function (k) { return k + 1 })
    }, refreshMin * 60 * 1000)
    return function () { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoRefresh, refreshMin])

  var fitStyle = useMemo(function () {
    var fm = cfg.fit_mode || 'contain'
    if (fm === 'stretch') return { width: '100%', height: '100%' }
    return { width: '100%', height: '100%' }
  }, [cfg.fit_mode])

  if (!embedUrl) {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#e2e8f0' }}>
        <div style={{ fontSize: 'clamp(2rem,4vw,5rem)' }}>🎨</div>
        <div style={{ fontSize: 'clamp(0.9rem,1.5vw,1.8rem)', opacity: 0.6 }}>
          {cfg.design_id ? 'Loading Canva design...' : 'No design selected'}
        </div>
        {data.name && <div style={{ fontSize: 'clamp(0.75rem,1.2vw,1.5rem)', opacity: 0.45 }}>{data.name}</div>}
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
      <iframe
        key={refreshKey}
        src={embedUrl}
        style={{ ...fitStyle, border: 'none', display: 'block' }}
        allowFullScreen
        title={data.name || 'Canva Design'}
        onLoad={function () { if (onLoad) onLoad() }}
      />
    </div>
  )
}
