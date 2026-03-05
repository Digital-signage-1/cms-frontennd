'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface RSSFeedConfig {
  feed_url: string
  max_items?: number
  display_mode?: 'ticker' | 'cards' | 'list' | 'headlines'
  scroll_speed?: 'slow' | 'medium' | 'fast'
  show_images?: boolean
  show_description?: boolean
  show_date?: boolean
  show_source?: boolean
  refresh_interval?: number
  theme?: 'dark' | 'light' | 'transparent'
  background_color?: string
  text_color?: string
  api_base_url?: string
}

interface FeedItem {
  title: string
  description: string
  link: string
  published: string
  image_url: string
  source_name: string
}

interface FeedData {
  feed_title: string
  feed_url: string
  items: FeedItem[]
}

/**
 * Resolve the backend API base URL.
 * Priority: config override > Vite env > window global > same-origin fallback
 */
function getApiBaseUrl(config: RSSFeedConfig): string {
  if (config.api_base_url) return config.api_base_url.replace(/\/+$/, '')
  // Vite player
  try {
    const viteUrl = (import.meta as any).env?.VITE_API_URL as string | undefined
    if (viteUrl) return viteUrl.replace(/\/api\/v1\/?$/, '')
  } catch { /* not in Vite */ }
  // Global override (host app can set window.__API_BASE_URL__)
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return ((window as any).__API_BASE_URL__ as string).replace(/\/+$/, '')
  }
  return ''
}

const SCROLL_SPEED_MAP = {
  slow: 40,
  medium: 25,
  fast: 12,
} as const

interface RSSFeedRendererProps {
  config: RSSFeedConfig
  onError?: (error: Error) => void
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`
    }
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function truncate(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '...'
}

export function RSSFeedRenderer({ config, onError }: RSSFeedRendererProps) {
  const [feedData, setFeedData] = useState<FeedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [headlineIndex, setHeadlineIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const headlineRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    feed_url,
    max_items = 5,
    display_mode = 'cards',
    scroll_speed = 'medium',
    show_images = true,
    show_description = true,
    show_date = true,
    show_source = true,
    refresh_interval = 5,
    theme = 'dark',
    background_color = '#0f172a',
    text_color = '#ffffff',
  } = config

  // Theme-based styling
  const getThemeStyles = (): React.CSSProperties => {
    if (theme === 'transparent') {
      return { backgroundColor: 'transparent', color: text_color }
    }
    if (theme === 'light') {
      return { backgroundColor: '#ffffff', color: '#1e293b' }
    }
    // dark (default)
    return { backgroundColor: background_color, color: text_color }
  }

  const themeStyles = getThemeStyles()
  const isDark = theme === 'dark' || theme === 'transparent'
  const mutedColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
  const hoverBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'

  const fetchFeed = useCallback(async () => {
    if (!feed_url) {
      setError('No feed URL configured')
      setLoading(false)
      return
    }

    try {
      const params = new URLSearchParams({
        url: feed_url,
        max_items: String(max_items),
      })

      const baseUrl = getApiBaseUrl(config)
      const headers: Record<string, string> = {}
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('signage_access_token')
        if (token) headers['Authorization'] = `Bearer ${token}`
      }
      const resp = await fetch(`${baseUrl}/api/v1/rss?${params}`, { headers })

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}))
        throw new Error(body.detail || `HTTP ${resp.status}`)
      }

      const json = await resp.json()
      setFeedData(json.data)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch feed'
      setError(message)
      onError?.(err instanceof Error ? err : new Error(message))
    } finally {
      setLoading(false)
    }
  }, [feed_url, max_items, config, onError])

  // Initial fetch
  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  // Refresh interval
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const ms = refresh_interval * 60 * 1000
    intervalRef.current = setInterval(fetchFeed, ms)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchFeed, refresh_interval])

  // Headline rotation for headlines mode
  useEffect(() => {
    if (display_mode !== 'headlines' || !feedData?.items.length) return
    if (headlineRef.current) clearInterval(headlineRef.current)
    const speedMs = scroll_speed === 'slow' ? 8000 : scroll_speed === 'fast' ? 3000 : 5000
    headlineRef.current = setInterval(() => {
      setHeadlineIndex(prev => (prev + 1) % (feedData?.items.length || 1))
    }, speedMs)
    return () => {
      if (headlineRef.current) clearInterval(headlineRef.current)
    }
  }, [display_mode, feedData?.items.length, scroll_speed])

  // Reset headline index when feed data changes
  useEffect(() => {
    setHeadlineIndex(0)
  }, [feedData])

  // --- Loading ---
  if (loading) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={themeStyles}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 border-3 rounded-full animate-spin"
            style={{
              borderColor: `${mutedColor}`,
              borderTopColor: themeStyles.color,
            }}
          />
          <span style={{ color: mutedColor, fontSize: '0.875rem' }}>Loading feed...</span>
        </div>
      </div>
    )
  }

  // --- Error ---
  if (error || !feedData) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-3"
        style={themeStyles}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={mutedColor} strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span style={{ color: mutedColor, fontSize: '0.875rem', textAlign: 'center', padding: '0 1rem' }}>
          {error || 'Unable to load feed'}
        </span>
        <button
          onClick={() => {
            setLoading(true)
            setError(null)
            fetchFeed()
          }}
          style={{
            marginTop: '0.5rem',
            padding: '0.375rem 1rem',
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '0.375rem',
            color: themeStyles.color,
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  const items = feedData.items

  if (items.length === 0) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={themeStyles}
      >
        <span style={{ color: mutedColor, fontSize: '0.875rem' }}>No items in feed</span>
      </div>
    )
  }

  // ==================== TICKER MODE ====================
  if (display_mode === 'ticker') {
    const duration = items.length * SCROLL_SPEED_MAP[scroll_speed]
    return (
      <div
        className="w-full h-full flex items-center overflow-hidden"
        style={{ ...themeStyles, position: 'relative' }}
      >
        <style>{`
          @keyframes rss-ticker-scroll {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
        <div
          style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            animation: `rss-ticker-scroll ${duration}s linear infinite`,
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          {items.map((item, i) => (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              {show_images && item.image_url && (
                <img
                  src={item.image_url}
                  alt=""
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.25rem',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</span>
              {show_source && item.source_name && (
                <span style={{ color: mutedColor, fontSize: '0.75rem' }}>
                  {item.source_name}
                </span>
              )}
              {show_date && item.published && (
                <span style={{ color: mutedColor, fontSize: '0.75rem' }}>
                  {formatDate(item.published)}
                </span>
              )}
              {i < items.length - 1 && (
                <span style={{ color: mutedColor, margin: '0 0.5rem' }}>|</span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ==================== HEADLINES MODE ====================
  if (display_mode === 'headlines') {
    const currentItem = items[headlineIndex] || items[0]
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-8"
        style={themeStyles}
      >
        {/* Feed title */}
        {show_source && feedData.feed_title && (
          <div style={{ color: mutedColor, fontSize: '0.875rem', marginBottom: '1.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {feedData.feed_title}
          </div>
        )}

        {/* Image */}
        {show_images && currentItem.image_url && (
          <img
            src={currentItem.image_url}
            alt=""
            style={{
              maxWidth: '80%',
              maxHeight: '40%',
              objectFit: 'cover',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 3rem)',
            fontWeight: 700,
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '80%',
            transition: 'opacity 0.5s ease-in-out',
          }}
        >
          {currentItem.title}
        </h1>

        {/* Description */}
        {show_description && currentItem.description && (
          <p
            style={{
              color: mutedColor,
              fontSize: 'clamp(0.875rem, 1.5vw, 1.25rem)',
              textAlign: 'center',
              maxWidth: '70%',
              marginTop: '1rem',
              lineHeight: 1.5,
            }}
          >
            {truncate(currentItem.description, 200)}
          </p>
        )}

        {/* Meta */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
          {show_source && currentItem.source_name && (
            <span style={{ color: mutedColor, fontSize: '0.8rem' }}>{currentItem.source_name}</span>
          )}
          {show_date && currentItem.published && (
            <span style={{ color: mutedColor, fontSize: '0.8rem' }}>{formatDate(currentItem.published)}</span>
          )}
        </div>

        {/* Dots indicator */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem' }}>
          {items.map((_, i) => (
            <div
              key={i}
              style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                backgroundColor: i === headlineIndex ? themeStyles.color : mutedColor,
                opacity: i === headlineIndex ? 1 : 0.4,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  // ==================== LIST MODE ====================
  if (display_mode === 'list') {
    return (
      <div
        className="w-full h-full overflow-auto"
        style={{ ...themeStyles, padding: '1rem' }}
      >
        {show_source && feedData.feed_title && (
          <div style={{
            fontSize: '0.75rem',
            color: mutedColor,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
            paddingBottom: '0.5rem',
            borderBottom: `1px solid ${borderColor}`,
          }}>
            {feedData.feed_title}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.625rem 0',
                borderBottom: i < items.length - 1 ? `1px solid ${borderColor}` : 'none',
              }}
            >
              {show_images && item.image_url && (
                <img
                  src={item.image_url}
                  alt=""
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '0.375rem',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3 }}>
                  {item.title}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                  {show_date && item.published && (
                    <span style={{ color: mutedColor, fontSize: '0.7rem' }}>
                      {formatDate(item.published)}
                    </span>
                  )}
                  {show_source && item.source_name && show_date && item.published && (
                    <span style={{ color: mutedColor, fontSize: '0.7rem' }}>-</span>
                  )}
                  {show_source && item.source_name && (
                    <span style={{ color: mutedColor, fontSize: '0.7rem' }}>
                      {item.source_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ==================== CARDS MODE (default) ====================
  return (
    <div
      className="w-full h-full overflow-auto"
      style={{ ...themeStyles, padding: '1rem' }}
    >
      {show_source && feedData.feed_title && (
        <div style={{
          fontSize: '0.8rem',
          color: mutedColor,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.75rem',
        }}>
          {feedData.feed_title}
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: '0.75rem',
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              backgroundColor: cardBg,
              borderRadius: '0.75rem',
              overflow: 'hidden',
              border: `1px solid ${borderColor}`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Card image */}
            {show_images && item.image_url && (
              <div style={{ width: '100%', height: '140px', overflow: 'hidden' }}>
                <img
                  src={item.image_url}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    const parent = (e.target as HTMLImageElement).parentElement
                    if (parent) parent.style.display = 'none'
                  }}
                />
              </div>
            )}

            {/* Card body */}
            <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                lineHeight: 1.3,
                margin: 0,
                marginBottom: '0.5rem',
              }}>
                {item.title}
              </h3>

              {show_description && item.description && (
                <p style={{
                  fontSize: '0.8rem',
                  color: mutedColor,
                  lineHeight: 1.4,
                  margin: 0,
                  marginBottom: '0.5rem',
                  flex: 1,
                }}>
                  {truncate(item.description, 120)}
                </p>
              )}

              {/* Meta row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                {show_source && item.source_name && (
                  <span style={{ color: mutedColor, fontSize: '0.7rem', fontWeight: 500 }}>
                    {item.source_name}
                  </span>
                )}
                {show_date && item.published && (
                  <span style={{ color: mutedColor, fontSize: '0.7rem' }}>
                    {formatDate(item.published)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
