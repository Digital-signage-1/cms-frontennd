'use client'

import { useState, useEffect, CSSProperties } from 'react'

// ---------------------------------------------------------------------------
// PowerBI icon SVG (shared across all PowerBI renderers)
// ---------------------------------------------------------------------------
export function PowerBIIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#F2C811" />
      <rect x="7" y="12" width="3" height="6" rx="0.5" fill="white" />
      <rect x="11" y="8" width="3" height="10" rx="0.5" fill="white" />
      <rect x="15" y="5" width="3" height="13" rx="0.5" fill="white" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Placeholder shown when no data is configured
// ---------------------------------------------------------------------------
interface PowerBIPlaceholderProps {
  message: string
  theme?: 'dark' | 'light'
}

export function PowerBIPlaceholder({ message, theme = 'dark' }: PowerBIPlaceholderProps) {
  return (
    <div
      style={{
        ...getContainerStyle(theme),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <PowerBIIcon />
      <span style={{ color: theme === 'dark' ? '#94a3b8' : '#666', fontSize: '14px' }}>
        {message}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Error state shown when embed token is missing
// ---------------------------------------------------------------------------
interface PowerBIErrorProps {
  message?: string
  theme?: 'dark' | 'light'
}

export function PowerBIError({ message, theme = 'dark' }: PowerBIErrorProps) {
  return (
    <div
      style={{
        ...getContainerStyle(theme),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '8px',
        padding: '24px',
      }}
    >
      <PowerBIIcon />
      <span
        style={{
          color: theme === 'dark' ? '#f87171' : '#dc2626',
          fontSize: '14px',
          textAlign: 'center',
        }}
      >
        {message || 'Embed token unavailable \u2014 check Power BI license (Pro or Premium required)'}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Offline badge overlay
// ---------------------------------------------------------------------------
export function OfflineBadge() {
  return (
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
  )
}

// ---------------------------------------------------------------------------
// Container style helper
// ---------------------------------------------------------------------------
export function getContainerStyle(theme: 'dark' | 'light' = 'dark'): CSSProperties {
  return {
    width: '100%',
    height: '100%',
    backgroundColor: theme === 'dark' ? '#0f172a' : '#f8f9fa',
    overflow: 'hidden',
    position: 'relative',
  }
}

// ---------------------------------------------------------------------------
// Shared localStorage cache hook
// ---------------------------------------------------------------------------
export function usePowerBICachedData<T>(
  cachePrefix: string,
  itemId: string,
  liveData: T | undefined,
): { embedData: T | null; isOffline: boolean } {
  const [cachedData, setCachedData] = useState<T | null>(null)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    if (liveData && (liveData as any)?.embed_url) {
      setIsOffline(false)
      try {
        localStorage.setItem(
          cachePrefix + itemId,
          JSON.stringify({ ...liveData, cached_at: Date.now() })
        )
      } catch { /* storage full */ }
    } else if (!liveData) {
      try {
        const cached = localStorage.getItem(cachePrefix + itemId)
        if (cached) {
          setCachedData(JSON.parse(cached))
          setIsOffline(true)
        }
      } catch { /* corrupt cache */ }
    }
  }, [liveData, itemId, cachePrefix])

  const embedData = (liveData as T) || cachedData
  return { embedData, isOffline }
}
