'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface EventEntry {
  id?: string
  name?: string
  description?: string
  start?: string
  url?: string
  image_url?: string
  venue?: string
  is_free?: boolean
  price_from?: number | null
}

interface EventbriteConfig {
  integration_id?: string
  location?: string
  keyword?: string
  category?: string
  max_items?: number
  show_image?: boolean
  show_price?: boolean
  show_date?: boolean
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

function getApiBase(config: EventbriteConfig): string {
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

function formatEventDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    var d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch (_) {
    return dateStr
  }
}

export function EventbriteEventsRenderer({ config, onError, onLoad }: RendererProps) {
  var cfg = config as unknown as EventbriteConfig
  var isDark = (cfg.theme || 'dark') !== 'light'
  var bg = isDark ? '#111827' : '#f9fafb'
  var text = isDark ? '#f9fafb' : '#111827'
  var accent = isDark ? '#8b5cf6' : '#7c3aed'
  var cardBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'

  var [events, setEvents] = useState<EventEntry[]>([])
  var [loading, setLoading] = useState(true)
  var [error, setError] = useState<string | null>(null)
  var timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  var fetchEvents = useCallback(function () {
    var integrationId = cfg.integration_id || ''
    var location = cfg.location || ''
    if (!integrationId) { setError('No Eventbrite account connected'); setLoading(false); return }
    if (!location) { setError('No location configured'); setLoading(false); return }

    var base = getApiBase(cfg)
    var params = 'location=' + encodeURIComponent(location) + '&integration_id=' + encodeURIComponent(integrationId)
    if (cfg.keyword) params += '&keyword=' + encodeURIComponent(cfg.keyword)
    if (cfg.category) params += '&category=' + encodeURIComponent(cfg.category)
    params += '&max_items=' + (cfg.max_items || 6)

    var headers: Record<string, string> = {}
    if (typeof window !== 'undefined') {
      var token = localStorage.getItem('signage_access_token')
      if (token) headers['Authorization'] = 'Bearer ' + token
    }

    fetch(base + '/api/v1/proxy/events?' + params, { headers: headers })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return r.json()
      })
      .then(function (json) {
        setEvents((json.data && json.data.events) ? json.data.events : [])
        setError(null)
        setLoading(false)
        if (onLoad) onLoad()
      })
      .catch(function (err) {
        var msg = err instanceof Error ? err.message : 'Failed to load events'
        setError(msg)
        setLoading(false)
        if (onError) onError(err instanceof Error ? err : new Error(msg))
      })
  }, [cfg.integration_id, cfg.location, cfg.keyword, cfg.category, cfg.max_items])

  useEffect(function () { fetchEvents() }, [fetchEvents])

  useEffect(function () {
    var ms = (cfg.refresh_interval || 30) * 60 * 1000
    timerRef.current = setInterval(fetchEvents, ms)
    return function () { if (timerRef.current) clearInterval(timerRef.current) }
  }, [fetchEvents, cfg.refresh_interval])

  if (loading) {
    return <div style={{ width: '100%', height: '100%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: text, opacity: 0.6, fontSize: 'clamp(0.9rem,1.5vw,1.8rem)' }}>Loading events...</div>
  }

  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: bg, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: '12px', color: text }}>
        <div style={{ fontSize: 'clamp(2rem,4vw,5rem)' }}>🎟️</div>
        <div style={{ opacity: 0.5, fontSize: 'clamp(0.8rem,1.3vw,1.6rem)', textAlign: 'center' as const, padding: '0 20px' }}>{error}</div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: bg, color: text, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' }}>
      <div style={{ padding: 'clamp(8px,1.5vw,18px) clamp(12px,2vw,24px)', borderBottom: '1px solid rgba(128,128,128,0.2)', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(1rem,2vw,2.5rem)', fontWeight: 700, color: accent }}>
          🎟️ Events {cfg.location ? 'in ' + cfg.location : 'Near You'}
        </h1>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(8px,1.5vw,18px) clamp(12px,2vw,24px)', display: 'flex', flexDirection: 'column' as const, gap: 'clamp(8px,1.5vw,18px)' }}>
        {events.length === 0 && (
          <div style={{ textAlign: 'center' as const, opacity: 0.4, marginTop: '10%', fontSize: 'clamp(0.9rem,1.5vw,1.9rem)' }}>No upcoming events found</div>
        )}
        {events.map(function (ev, idx) {
          return (
            <div key={ev.id || idx} style={{ backgroundColor: cardBg, borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(128,128,128,0.15)', display: 'flex', minHeight: '8vh' }}>
              {cfg.show_image !== false && ev.image_url && (
                <div style={{ width: 'clamp(60px,12vw,140px)', flexShrink: 0, overflow: 'hidden' }}>
                  <img src={ev.image_url} alt={ev.name} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} onError={function (e) { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
              <div style={{ flex: 1, padding: 'clamp(8px,1.5vw,16px)' }}>
                <div style={{ fontSize: 'clamp(0.85rem,1.6vw,2rem)', fontWeight: 700, lineHeight: 1.2 }}>{ev.name || ''}</div>
                {cfg.show_date !== false && ev.start && (
                  <div style={{ fontSize: 'clamp(0.7rem,1.1vw,1.4rem)', color: accent, marginTop: '4px' }}>{formatEventDate(ev.start)}</div>
                )}
                {ev.venue && (
                  <div style={{ fontSize: 'clamp(0.65rem,1vw,1.3rem)', opacity: 0.6, marginTop: '2px' }}>📍 {ev.venue}</div>
                )}
                {cfg.show_price !== false && (
                  <div style={{ fontSize: 'clamp(0.7rem,1.1vw,1.4rem)', marginTop: '6px', fontWeight: 600, color: ev.is_free ? '#22c55e' : text }}>
                    {ev.is_free ? 'FREE' : (ev.price_from !== null && ev.price_from !== undefined ? 'From $' + ev.price_from.toFixed(2) : 'Check price')}
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
