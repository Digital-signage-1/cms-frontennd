'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface QuoteEntry {
  symbol?: string
  price?: number
  change?: number
  percent_change?: number
  error?: string
}

interface CryptoConfig {
  integration_id?: string
  symbols?: string
  display_mode?: string
  show_change?: boolean
  show_percent?: boolean
  refresh_interval?: number
  theme?: string
  api_base_url?: string
}

interface RendererProps {
  config: Record<string, any>
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
}

function getApiBase(config: CryptoConfig): string {
  if (config.api_base_url) return config.api_base_url.replace(/\/+$/, '')
  try {
    var viteUrl = (import.meta as any).env && (import.meta as any).env.VITE_API_URL
    if (viteUrl) return (viteUrl as string).replace(/\/api\/v1\/?$/, '')
  } catch (_) { /* */ }
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return ((window as any).__API_BASE_URL__ as string).replace(/\/+$/, '')
  }
  return ''
}

const THEMES: Record<string, { bg: string; text: string; up: string; down: string; card: string }> = {
  dark: { bg: '#0d1117', text: '#e6edf3', up: '#3fb950', down: '#f85149', card: 'rgba(255,255,255,0.07)' },
  light: { bg: '#f6f8fa', text: '#1f2328', up: '#1a7f37', down: '#cf222e', card: 'rgba(0,0,0,0.05)' },
  crypto: { bg: '#0a0015', text: '#e0cfff', up: '#00ff88', down: '#ff4466', card: 'rgba(120,80,255,0.15)' },
}

function formatPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (p >= 1) return p.toFixed(2)
  return p.toFixed(4)
}

function formatChange(c: number): string {
  return (c >= 0 ? '+' : '') + c.toFixed(2)
}

function formatPct(p: number): string {
  return (p >= 0 ? '+' : '') + p.toFixed(2) + '%'
}

export function CryptoTickerRenderer({ config, onError, onLoad }: RendererProps) {
  var cfg = config as unknown as CryptoConfig
  var theme = THEMES[cfg.theme || 'dark'] || THEMES['dark']
  var [quotes, setQuotes] = useState<QuoteEntry[]>([])
  var [loading, setLoading] = useState(true)
  var [error, setError] = useState<string | null>(null)
  var timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  var fetchQuotes = useCallback(function () {
    var symbols = cfg.symbols || 'BTCUSDT,ETHUSDT'
    var integrationId = cfg.integration_id || ''
    if (!integrationId) {
      setError('No Finnhub account connected')
      setLoading(false)
      return
    }
    var base = getApiBase(cfg)
    var url = base + '/api/v1/proxy/crypto?symbols=' + encodeURIComponent(symbols) + '&integration_id=' + encodeURIComponent(integrationId)

    var headers: Record<string, string> = {}
    if (typeof window !== 'undefined') {
      var token = localStorage.getItem('signage_access_token')
      if (token) headers['Authorization'] = 'Bearer ' + token
    }

    fetch(url, { headers: headers })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return r.json()
      })
      .then(function (json) {
        var q = (json.data && json.data.quotes) ? json.data.quotes : []
        setQuotes(q)
        setError(null)
        setLoading(false)
        if (onLoad) onLoad()
      })
      .catch(function (err) {
        var msg = err instanceof Error ? err.message : 'Failed to load prices'
        setError(msg)
        setLoading(false)
        if (onError) onError(err instanceof Error ? err : new Error(msg))
      })
  }, [cfg.symbols, cfg.integration_id])

  useEffect(function () { fetchQuotes() }, [fetchQuotes])

  useEffect(function () {
    var ms = (cfg.refresh_interval || 60) * 1000
    timerRef.current = setInterval(fetchQuotes, ms)
    return function () { if (timerRef.current) clearInterval(timerRef.current) }
  }, [fetchQuotes, cfg.refresh_interval])

  if (loading) {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: theme.text, opacity: 0.6, fontSize: 'clamp(0.9rem,1.5vw,1.8rem)' }}>Loading prices...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: theme.bg, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <div style={{ fontSize: 'clamp(2rem,4vw,5rem)' }}>📈</div>
        <div style={{ color: theme.text, opacity: 0.5, fontSize: 'clamp(0.8rem,1.3vw,1.6rem)', textAlign: 'center' as const, padding: '0 20px' }}>{error}</div>
      </div>
    )
  }

  var mode = cfg.display_mode || 'ticker-horizontal'
  var showChange = cfg.show_change !== false
  var showPct = cfg.show_percent !== false

  // Horizontal ticker
  if (mode === 'ticker-horizontal') {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: theme.bg, color: theme.text, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 'clamp(16px,3vw,40px)', padding: '0 clamp(12px,2vw,24px)', flexWrap: 'wrap' as const, alignItems: 'center', width: '100%', justifyContent: 'center' }}>
          {quotes.map(function (q, idx) {
            var up = (q.change || 0) >= 0
            return (
              <div key={q.symbol || idx} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px,1vw,12px)', minHeight: '8vh' }}>
                <span style={{ fontSize: 'clamp(0.9rem,1.6vw,2rem)', fontWeight: 700, opacity: 0.85 }}>{q.symbol || ''}</span>
                <span style={{ fontSize: 'clamp(1rem,2vw,2.5rem)', fontWeight: 700 }}>${formatPrice(q.price || 0)}</span>
                {showChange && (
                  <span style={{ fontSize: 'clamp(0.8rem,1.4vw,1.8rem)', color: up ? theme.up : theme.down, fontWeight: 600 }}>
                    {up ? '▲' : '▼'} {showPct ? formatPct(q.percent_change || 0) : formatChange(q.change || 0)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Cards mode
  if (mode === 'cards') {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: theme.bg, color: theme.text, overflow: 'auto', padding: 'clamp(8px,1.5vw,20px)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'clamp(8px,1.5vw,20px)', alignContent: 'flex-start' }}>
          {quotes.map(function (q, idx) {
            var up = (q.change || 0) >= 0
            return (
              <div key={q.symbol || idx} style={{ backgroundColor: theme.card, borderRadius: '10px', padding: 'clamp(10px,2vw,24px)', minWidth: 'clamp(120px,18vw,220px)', border: '1px solid rgba(255,255,255,0.08)', minHeight: '8vh' }}>
                <div style={{ fontSize: 'clamp(0.75rem,1.3vw,1.6rem)', opacity: 0.65, marginBottom: '4px' }}>{q.symbol || ''}</div>
                <div style={{ fontSize: 'clamp(1.1rem,2.2vw,2.8rem)', fontWeight: 700 }}>${formatPrice(q.price || 0)}</div>
                {showChange && (
                  <div style={{ fontSize: 'clamp(0.8rem,1.4vw,1.8rem)', color: up ? theme.up : theme.down, fontWeight: 600, marginTop: '4px' }}>
                    {up ? '▲' : '▼'} {showPct ? formatPct(q.percent_change || 0) : formatChange(q.change || 0)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Big board mode
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' }}>
      <div style={{ padding: 'clamp(8px,1.5vw,18px) clamp(12px,2vw,24px)', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(1rem,1.8vw,2.2rem)', fontWeight: 700, opacity: 0.8 }}>📈 Live Prices</h1>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {quotes.map(function (q, idx) {
          var up = (q.change || 0) >= 0
          return (
            <div key={q.symbol || idx} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 'clamp(8px,1.5vw,18px) clamp(12px,2vw,24px)',
              borderBottom: '1px solid rgba(255,255,255,0.07)', minHeight: '8vh',
            }}>
              <span style={{ fontSize: 'clamp(1rem,2vw,2.5rem)', fontWeight: 700 }}>{q.symbol || ''}</span>
              <div style={{ textAlign: 'right' as const }}>
                <div style={{ fontSize: 'clamp(1.2rem,2.5vw,3rem)', fontWeight: 700 }}>${formatPrice(q.price || 0)}</div>
                {showChange && (
                  <div style={{ fontSize: 'clamp(0.8rem,1.5vw,1.9rem)', color: up ? theme.up : theme.down, fontWeight: 600 }}>
                    {up ? '▲' : '▼'} {showPct ? formatPct(q.percent_change || 0) : formatChange(q.change || 0)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
