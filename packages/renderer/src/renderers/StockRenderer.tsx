'use client'

import { useState, useEffect, useRef } from 'react'

interface StockQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume?: number
}

interface StockRendererProps {
  config: {
    symbols: string
    display_mode?: 'ticker' | 'cards' | 'table'
    show_change?: boolean
    show_percent?: boolean
    show_volume?: boolean
    scroll_speed?: 'slow' | 'medium' | 'fast'
    refresh_interval?: number
    theme?: 'dark' | 'light'
    background_color?: string
    text_color?: string
    api_base_url?: string
  }
  onError?: (error: Error) => void
}

const SCROLL_SPEED_MAP = { slow: 50, medium: 30, fast: 15 } as const

// Generate mock data for demo/when API unavailable
function generateMockQuotes(symbols: string[]): StockQuote[] {
  return symbols.map((symbol) => {
    const basePrice = Math.random() * 400 + 20
    const change = (Math.random() - 0.45) * basePrice * 0.05
    return {
      symbol: symbol.toUpperCase(),
      price: Math.round(basePrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round((change / basePrice) * 10000) / 100,
      volume: Math.floor(Math.random() * 50000000),
    }
  })
}

export function StockRenderer({ config, onError }: StockRendererProps) {
  const {
    symbols = '',
    display_mode = 'ticker',
    show_change = true,
    show_percent = true,
    show_volume = false,
    scroll_speed = 'medium',
    refresh_interval = 1,
    theme = 'dark',
    background_color,
    text_color,
  } = config

  const [quotes, setQuotes] = useState<StockQuote[]>([])
  const tickerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const offsetRef = useRef(0)

  const isDark = theme === 'dark'
  const bg = background_color || (isDark ? '#0f172a' : '#ffffff')
  const text = text_color || (isDark ? '#e2e8f0' : '#1e293b')

  const symbolList = symbols.split(',').map((s) => s.trim()).filter(Boolean)

  // Fetch/generate quotes
  useEffect(() => {
    if (symbolList.length === 0) return

    const fetchQuotes = () => {
      // Use mock data — real stock API integration requires API keys
      setQuotes(generateMockQuotes(symbolList))
    }

    fetchQuotes()
    const interval = setInterval(fetchQuotes, (refresh_interval || 1) * 60 * 1000)
    return () => clearInterval(interval)
  }, [symbols, refresh_interval])

  // Ticker scroll animation
  useEffect(() => {
    if (display_mode !== 'ticker' || quotes.length === 0) return

    const el = tickerRef.current
    if (!el) return

    const speed = SCROLL_SPEED_MAP[scroll_speed] || 30
    let lastTime = 0

    const animate = (time: number) => {
      if (lastTime) {
        const delta = (time - lastTime) / speed
        offsetRef.current -= delta
        const contentWidth = el.scrollWidth / 2
        if (Math.abs(offsetRef.current) >= contentWidth) {
          offsetRef.current = 0
        }
        el.style.transform = `translateX(${offsetRef.current}px)`
      }
      lastTime = time
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [display_mode, quotes, scroll_speed])

  if (symbolList.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bg, color: '#6B7280' }}>
        <span style={{ fontSize: 14 }}>No stock symbols configured</span>
      </div>
    )
  }

  const formatPrice = (n: number) => `$${n.toFixed(2)}`
  const formatChange = (q: StockQuote) => {
    const sign = q.change >= 0 ? '+' : ''
    const parts: string[] = []
    if (show_change) parts.push(`${sign}${q.change.toFixed(2)}`)
    if (show_percent) parts.push(`${sign}${q.changePercent.toFixed(2)}%`)
    return parts.join(' / ')
  }
  const changeColor = (q: StockQuote) => q.change >= 0 ? '#22C55E' : '#EF4444'
  const formatVolume = (v?: number) => {
    if (!v) return '—'
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
    if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`
    return v.toString()
  }

  // ── Ticker mode ──
  if (display_mode === 'ticker') {
    const items = [...quotes, ...quotes] // duplicate for seamless loop
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: bg, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div ref={tickerRef} style={{ display: 'flex', whiteSpace: 'nowrap', willChange: 'transform' }}>
          {items.map((q, i) => (
            <div key={`${q.symbol}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px', borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: text }}>{q.symbol}</span>
              <span style={{ fontSize: 15, color: text }}>{formatPrice(q.price)}</span>
              {(show_change || show_percent) && (
                <span style={{ fontSize: 13, fontWeight: 600, color: changeColor(q) }}>{formatChange(q)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Cards mode ──
  if (display_mode === 'cards') {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {quotes.map((q) => (
            <div key={q.symbol} style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 10, padding: '14px 20px', minWidth: 140, textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: text, marginBottom: 4 }}>{q.symbol}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: text, marginBottom: 4 }}>{formatPrice(q.price)}</div>
              {(show_change || show_percent) && (
                <div style={{ fontSize: 13, fontWeight: 600, color: changeColor(q) }}>{formatChange(q)}</div>
              )}
              {show_volume && (
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>Vol: {formatVolume(q.volume)}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Table mode ──
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: bg, padding: 20, boxSizing: 'border-box', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}` }}>
            <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6B7280', fontWeight: 600 }}>Symbol</th>
            <th style={{ textAlign: 'right', padding: '8px 12px', color: '#6B7280', fontWeight: 600 }}>Price</th>
            {show_change && <th style={{ textAlign: 'right', padding: '8px 12px', color: '#6B7280', fontWeight: 600 }}>Change</th>}
            {show_percent && <th style={{ textAlign: 'right', padding: '8px 12px', color: '#6B7280', fontWeight: 600 }}>%</th>}
            {show_volume && <th style={{ textAlign: 'right', padding: '8px 12px', color: '#6B7280', fontWeight: 600 }}>Volume</th>}
          </tr>
        </thead>
        <tbody>
          {quotes.map((q) => (
            <tr key={q.symbol} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
              <td style={{ padding: '10px 12px', fontWeight: 700, color: text }}>{q.symbol}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: text }}>{formatPrice(q.price)}</td>
              {show_change && <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: changeColor(q) }}>{q.change >= 0 ? '+' : ''}{q.change.toFixed(2)}</td>}
              {show_percent && <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: changeColor(q) }}>{q.change >= 0 ? '+' : ''}{q.changePercent.toFixed(2)}%</td>}
              {show_volume && <td style={{ padding: '10px 12px', textAlign: 'right', color: '#6B7280' }}>{formatVolume(q.volume)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
