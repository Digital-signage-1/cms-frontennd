'use client'

import { useState, useEffect, useMemo, CSSProperties } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QRCodeConfig {
  url?: string
  title?: string
  subtitle?: string
  size?: 'small' | 'medium' | 'large' | 'full'
  foreground_color?: string
  background_color?: string
  logo_content_id?: string
  show_url_text?: boolean
  error_correction?: 'L' | 'M' | 'Q' | 'H'
  theme?: 'light' | 'dark' | 'transparent'
  padding?: number
}

interface QRCodeRendererProps {
  config: QRCodeConfig
}

// ---------------------------------------------------------------------------
// Theme helpers
// ---------------------------------------------------------------------------

interface ThemeColors {
  bg: string
  text: string
  subtext: string
}

function resolveTheme(config: QRCodeConfig): ThemeColors {
  const { theme = 'light' } = config

  switch (theme) {
    case 'dark':
      return { bg: '#0f172a', text: '#f1f5f9', subtext: '#94a3b8' }
    case 'transparent':
      return { bg: 'transparent', text: '#ffffff', subtext: 'rgba(255,255,255,0.7)' }
    case 'light':
    default:
      return { bg: '#ffffff', text: '#111827', subtext: '#6b7280' }
  }
}

// ---------------------------------------------------------------------------
// Size mapping
// ---------------------------------------------------------------------------

function resolveQRSize(size: QRCodeConfig['size']): {
  qrPixels: number
  containerPercent: string
} {
  switch (size) {
    case 'small':
      return { qrPixels: 200, containerPercent: '35%' }
    case 'large':
      return { qrPixels: 500, containerPercent: '75%' }
    case 'full':
      return { qrPixels: 600, containerPercent: '90%' }
    case 'medium':
    default:
      return { qrPixels: 350, containerPercent: '55%' }
  }
}

// ---------------------------------------------------------------------------
// Build QR code image URL via goqr.me API
// ---------------------------------------------------------------------------

function buildQRCodeUrl(config: QRCodeConfig): string {
  const {
    url = '',
    foreground_color = '#000000',
    background_color = '#ffffff',
    error_correction = 'M',
    size = 'medium',
  } = config

  const { qrPixels } = resolveQRSize(size)

  // Strip '#' from hex colors for the API (expects hex without hash)
  const fg = foreground_color.replace('#', '')
  const bg = background_color.replace('#', '')

  const params = new URLSearchParams({
    size: `${qrPixels}x${qrPixels}`,
    data: url,
    color: fg,
    bgcolor: bg,
    ecc: error_correction,
    format: 'png',
    margin: '1',
  })

  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function QRCodeRenderer({ config }: QRCodeRendererProps) {
  const {
    url = '',
    title = '',
    subtitle = '',
    size = 'medium',
    show_url_text = true,
    padding = 40,
  } = config

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const colors = useMemo(() => resolveTheme(config), [config])
  const sizeInfo = useMemo(() => resolveQRSize(size), [size])
  const qrImageUrl = useMemo(() => buildQRCodeUrl(config), [config])

  // Reset loading/error states when the URL changes
  useEffect(() => {
    if (!url) return
    setLoading(true)
    setError(false)
  }, [qrImageUrl, url])

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily:
      "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    overflow: 'hidden',
    padding: `${padding}px`,
    boxSizing: 'border-box',
    gap: '1rem',
  }

  const titleStyle: CSSProperties = {
    fontSize: 'clamp(1.25rem, 3vw, 2.5rem)',
    fontWeight: 600,
    textAlign: 'center',
    lineHeight: 1.2,
    margin: 0,
    letterSpacing: '-0.01em',
  }

  const subtitleStyle: CSSProperties = {
    fontSize: 'clamp(0.875rem, 2vw, 1.5rem)',
    fontWeight: 400,
    color: colors.subtext,
    textAlign: 'center',
    lineHeight: 1.4,
    margin: 0,
  }

  const qrWrapperStyle: CSSProperties = {
    position: 'relative',
    maxWidth: sizeInfo.containerPercent,
    maxHeight: sizeInfo.containerPercent,
    aspectRatio: '1 / 1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  const qrImageStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: loading ? 'none' : 'block',
    borderRadius: '8px',
  }

  const urlTextStyle: CSSProperties = {
    fontSize: 'clamp(0.7rem, 1.5vw, 1rem)',
    color: colors.subtext,
    textAlign: 'center',
    wordBreak: 'break-all',
    maxWidth: '80%',
    lineHeight: 1.3,
    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
    opacity: 0.8,
  }

  const loadingStyle: CSSProperties = {
    width: `${sizeInfo.qrPixels * 0.5}px`,
    height: `${sizeInfo.qrPixels * 0.5}px`,
    maxWidth: sizeInfo.containerPercent,
    aspectRatio: '1 / 1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.subtext,
    fontSize: 'clamp(0.875rem, 2vw, 1.25rem)',
  }

  // ---------------------------------------------------------------------------
  // No URL state
  // ---------------------------------------------------------------------------

  if (!url) {
    return (
      <div style={containerStyle}>
        <div style={{ ...loadingStyle, flexDirection: 'column', gap: '0.5rem' }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.subtext}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="3" height="3" />
            <line x1="21" y1="14" x2="21" y2="17" />
            <line x1="14" y1="21" x2="17" y2="21" />
            <line x1="21" y1="21" x2="21" y2="21" />
          </svg>
          <span>No URL configured</span>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div style={containerStyle}>
      {/* Pulse animation for loading state */}
      <style>{`
        @keyframes qrPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>

      {/* Title */}
      {title && <p style={titleStyle}>{title}</p>}

      {/* QR Code */}
      <div style={qrWrapperStyle}>
        {loading && !error && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.bg === 'transparent' ? 'rgba(128,128,128,0.1)' : colors.bg,
              borderRadius: '8px',
              border: `2px dashed ${colors.subtext}`,
              animation: 'qrPulse 1.5s ease-in-out infinite',
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.subtext}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="3" height="3" />
              <line x1="21" y1="14" x2="21" y2="17" />
              <line x1="14" y1="21" x2="17" y2="21" />
            </svg>
          </div>
        )}

        {error && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: colors.subtext,
              fontSize: 'clamp(0.75rem, 1.5vw, 1rem)',
            }}
          >
            <span>Failed to generate QR code</span>
          </div>
        )}

        <img
          src={qrImageUrl}
          alt={`QR code for ${url}`}
          style={qrImageStyle}
          onLoad={() => {
            setLoading(false)
            setError(false)
          }}
          onError={() => {
            setLoading(false)
            setError(true)
          }}
        />
      </div>

      {/* Subtitle */}
      {subtitle && <p style={subtitleStyle}>{subtitle}</p>}

      {/* URL text */}
      {show_url_text && url && !error && (
        <div style={urlTextStyle}>{url}</div>
      )}
    </div>
  )
}
