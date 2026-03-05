'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'

interface SocialMediaRendererProps {
  config: {
    platform: 'instagram' | 'twitter' | 'facebook' | 'tiktok' | 'linkedin'
    embed_url: string
    display_mode?: 'post' | 'profile' | 'feed'
    theme?: 'dark' | 'light'
    show_header?: boolean
    show_footer?: boolean
    auto_refresh?: boolean
    refresh_interval?: number
    background_color?: string
    scale?: 'fit' | 'fill' | 'original'
  }
  onError?: (error: Error) => void
  onLoad?: () => void
}

/** oEmbed endpoint map — platforms that support oEmbed */
const OEMBED_ENDPOINTS: Record<string, string> = {
  instagram: 'https://api.instagram.com/oembed',
  twitter: 'https://publish.twitter.com/oembed',
  tiktok: 'https://www.tiktok.com/oembed',
}

/** Build a direct iframe URL for platforms without usable oEmbed */
function buildDirectIframeUrl(
  platform: string,
  url: string,
  theme: string,
): string | null {
  switch (platform) {
    case 'facebook': {
      const encoded = encodeURIComponent(url)
      return `https://www.facebook.com/plugins/post.php?href=${encoded}&width=500&show_text=true&appId=`
    }
    case 'linkedin': {
      // LinkedIn embed supports these URN formats:
      //   urn:li:activity:123456  — activity posts
      //   urn:li:ugcPost:123456   — user-generated content posts
      //   urn:li:share:123456     — shared posts
      //
      // User may paste:
      //   https://www.linkedin.com/feed/update/urn:li:ugcPost:123456
      //   https://www.linkedin.com/feed/update/urn:li:activity:123456
      //   https://www.linkedin.com/posts/username_slug-activity-123456-xxxx
      //   https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:123456
      //   or just the URN itself

      // 1. Direct feed/update URL — extract the URN
      const feedMatch = url.match(/\/feed\/update\/(urn:li:[^/?]+)/)
      if (feedMatch) {
        return `https://www.linkedin.com/embed/feed/update/${feedMatch[1]}`
      }

      // 2. Already an embed URL — use as-is
      const embedMatch = url.match(/\/embed\/feed\/update\/(urn:li:[^/?]+)/)
      if (embedMatch) {
        return `https://www.linkedin.com/embed/feed/update/${embedMatch[1]}`
      }

      // 3. Share-style post URL — extract activity ID from slug
      //    e.g. /posts/username_some-title-activity-7435077297268826113-xxxx
      const postSlugMatch = url.match(/\/posts\/[^/]+-activity-(\d+)/)
      if (postSlugMatch) {
        return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${postSlugMatch[1]}`
      }

      // 4. Raw URN pasted directly
      const rawUrnMatch = url.match(/(urn:li:(?:activity|ugcPost|share):\d+)/)
      if (rawUrnMatch) {
        return `https://www.linkedin.com/embed/feed/update/${rawUrnMatch[1]}`
      }

      // 5. Article/pulse URLs
      if (url.includes('/pulse/')) {
        return `https://www.linkedin.com/embed/feed/update/${encodeURIComponent(url)}`
      }

      // Profile/company pages can't be iframed — handled separately
      return null
    }
    case 'twitter': {
      // Fallback: use twitframe.com which wraps tweets in an iframe-friendly way
      const encoded = encodeURIComponent(url)
      return `https://twitframe.com/show?url=${encoded}&theme=${theme}`
    }
    case 'instagram': {
      // Fallback: Instagram's /embed suffix works for public posts
      const cleanUrl = url.replace(/\/$/, '')
      return `${cleanUrl}/embed`
    }
    case 'tiktok': {
      // Attempt to extract video ID and use TikTok's embed player
      const match = url.match(/\/video\/(\d+)/)
      if (match) {
        return `https://www.tiktok.com/embed/v2/${match[1]}`
      }
      return null
    }
    default:
      return null
  }
}

/** Inject platform embed scripts into oEmbed HTML so widgets render properly */
function injectPlatformScript(html: string, platform: string): string {
  switch (platform) {
    case 'twitter':
      if (!html.includes('platform.twitter.com/widgets.js')) {
        html += '<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>'
      }
      return html
    case 'instagram':
      if (!html.includes('instagram.com/embed.js')) {
        html += '<script async src="https://www.instagram.com/embed.js"></script>'
      }
      return html
    case 'tiktok':
      if (!html.includes('tiktok.com/embed.js')) {
        html += '<script async src="https://www.tiktok.com/embed.js"></script>'
      }
      return html
    default:
      return html
  }
}

export function SocialMediaRenderer({
  config,
  onError,
  onLoad,
}: SocialMediaRendererProps) {
  const {
    platform,
    embed_url: rawEmbedUrl,
    theme = 'dark',
    show_header = true,
    show_footer = true,
    auto_refresh = false,
    refresh_interval = 5,
    background_color = '#000000',
    scale = 'fit',
  } = config

  // Extract URL from iframe embed code if user pasted the full tag
  const embed_url = rawEmbedUrl?.includes('<iframe')
    ? (rawEmbedUrl.match(/src=["']([^"']+)["']/)?.[1] ?? rawEmbedUrl)
    : rawEmbedUrl

  const [embedHtml, setEmbedHtml] = useState<string | null>(null)
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // ---- Fetch oEmbed HTML ----
  const fetchOembed = useCallback(async () => {
    const endpoint = OEMBED_ENDPOINTS[platform]
    if (!endpoint) return null

    try {
      const params = new URLSearchParams({
        url: embed_url,
        format: 'json',
        maxwidth: '600',
      })
      // Twitter/X supports theme param
      if (platform === 'twitter') {
        params.set('theme', theme)
        params.set('hide_thread', 'false')
      }

      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch(`${endpoint}?${params.toString()}`, {
        signal: controller.signal,
      })

      if (!res.ok) return null
      const data = await res.json()
      return data.html as string | null
    } catch {
      return null
    }
  }, [platform, embed_url, theme])

  // ---- Main load effect ----
  useEffect(() => {
    if (!embed_url) {
      setError('No embed URL configured')
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setEmbedHtml(null)
    setIframeSrc(null)

    ;(async () => {
      // Try oEmbed first
      const html = await fetchOembed()

      if (cancelled) return

      if (html) {
        const enhanced = injectPlatformScript(html, platform)
        setEmbedHtml(enhanced)
        setLoading(false)
        return
      }

      // Fallback to direct iframe
      const directUrl = buildDirectIframeUrl(platform, embed_url, theme)
      if (directUrl) {
        setIframeSrc(directUrl)
        setLoading(false)
        return
      }

      // For LinkedIn profiles/company pages and other non-embeddable URLs,
      // show a branded link card instead of an error
      setError(`NOT_EMBEDDABLE`)
      setLoading(false)
    })()

    return () => {
      cancelled = true
      abortRef.current?.abort()
    }
  }, [embed_url, platform, theme, refreshKey, fetchOembed, onError])

  // ---- Auto-refresh ----
  useEffect(() => {
    if (!auto_refresh || refresh_interval <= 0) return

    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1)
    }, refresh_interval * 60 * 1000)

    return () => clearInterval(interval)
  }, [auto_refresh, refresh_interval])

  // ---- Build srcDoc for oEmbed HTML ----
  const srcDoc = useMemo(() => {
    if (!embedHtml) return undefined

    const isDark = theme === 'dark'
    const bg = background_color || (isDark ? '#000000' : '#ffffff')
    const textColor = isDark ? '#e5e7eb' : '#1f2937'

    // Optionally hide header/footer via CSS
    const hideStyles: string[] = []
    if (!show_header) {
      hideStyles.push(
        '.twitter-tweet-rendered .Tweet-header { display: none !important; }',
        '.instagram-media .Header { display: none !important; }',
      )
    }
    if (!show_footer) {
      hideStyles.push(
        '.twitter-tweet-rendered .Tweet-footer { display: none !important; }',
        '.instagram-media .Footer { display: none !important; }',
      )
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%; height: 100%;
      background: ${bg};
      color: ${textColor};
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    body > * {
      max-width: 100% !important;
      width: 100% !important;
    }
    ${hideStyles.join('\n')}
  </style>
</head>
<body>${embedHtml}</body>
</html>`
  }, [embedHtml, theme, background_color, show_header, show_footer])

  // ---- Scale style for the iframe container ----
  const scaleStyle = useMemo((): React.CSSProperties => {
    switch (scale) {
      case 'fill':
        return { width: '100%', height: '100%', objectFit: 'fill' as const }
      case 'original':
        return { width: '100%', height: '100%', overflow: 'auto' }
      case 'fit':
      default:
        return { width: '100%', height: '100%', objectFit: 'contain' as const }
    }
  }, [scale])

  // ---- No URL ----
  if (!embed_url) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1f2937',
          color: '#9ca3af',
        }}
      >
        <span style={{ fontSize: 14 }}>No social media URL configured</span>
      </div>
    )
  }

  // ---- Loading ----
  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: background_color || '#000000',
          color: theme === 'dark' ? '#e5e7eb' : '#374151',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '3px solid',
            borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
            borderTopColor: theme === 'dark' ? '#e5e7eb' : '#374151',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 13 }}>Loading {platform} embed...</span>
      </div>
    )
  }

  // ---- Non-embeddable URL → branded link card ----
  if (error === 'NOT_EMBEDDABLE') {
    const isDark = theme === 'dark'
    const bg = background_color || (isDark ? '#0a0a0a' : '#f8fafc')
    const brandColors: Record<string, { primary: string; icon: string }> = {
      linkedin:  { primary: '#0A66C2', icon: '🔗' },
      instagram: { primary: '#E1306C', icon: '📷' },
      twitter:   { primary: '#1DA1F2', icon: '🐦' },
      facebook:  { primary: '#1877F2', icon: '👤' },
      tiktok:    { primary: '#000000', icon: '🎵' },
    }
    const brand = brandColors[platform] || { primary: '#6366f1', icon: '🔗' }

    // Extract display name from URL
    const urlPath = embed_url.replace(/\/$/, '').split('/')
    const displayName = decodeURIComponent(urlPath[urlPath.length - 1] || urlPath[urlPath.length - 2] || platform)
    const isProfile = embed_url.includes('/in/') || embed_url.includes('/company/')
    const typeLabel = isProfile ? 'Profile' : 'Page'

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bg,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            padding: 40,
            maxWidth: 420,
            width: '90%',
            background: isDark ? '#1a1a2e' : '#ffffff',
            borderRadius: 16,
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.4)'
              : '0 8px 32px rgba(0,0,0,0.08)',
            border: `1px solid ${isDark ? '#2a2a3e' : '#e2e8f0'}`,
          }}
        >
          {/* Platform icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: brand.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              color: '#fff',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {displayName.charAt(0)}
          </div>

          {/* Name */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: isDark ? '#f1f5f9' : '#0f172a',
                marginBottom: 4,
                wordBreak: 'break-word',
              }}
            >
              {displayName.replace(/-/g, ' ')}
            </div>
            <div
              style={{
                fontSize: 13,
                color: isDark ? '#94a3b8' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: brand.primary,
                }}
              />
              {platform.charAt(0).toUpperCase() + platform.slice(1)} {typeLabel}
            </div>
          </div>

          {/* CTA button */}
          <a
            href={embed_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 24px',
              background: brand.primary,
              color: '#ffffff',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            View on {platform.charAt(0).toUpperCase() + platform.slice(1)} ↗
          </a>
        </div>
      </div>
    )
  }

  // ---- Error ----
  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1f2937',
          color: '#f87171',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600 }}>Embed Error</span>
        <span style={{ fontSize: 12, color: '#9ca3af', maxWidth: '80%', textAlign: 'center' }}>
          {error}
        </span>
      </div>
    )
  }

  // ---- oEmbed srcDoc render ----
  if (srcDoc) {
    return (
      <div style={{ ...scaleStyle, background: background_color || '#000000' }}>
        <iframe
          ref={iframeRef}
          key={refreshKey}
          srcDoc={srcDoc}
          title={`${platform} embed`}
          style={{
            width: '100%',
            height: '100%',
            border: 0,
            display: 'block',
          }}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          onLoad={() => onLoad?.()}
          onError={() => {
            setError('Failed to render embed')
            onError?.(new Error('Failed to render embed'))
          }}
        />
      </div>
    )
  }

  // ---- Direct iframe render ----
  if (iframeSrc) {
    return (
      <div style={{ ...scaleStyle, background: background_color || '#000000' }}>
        <iframe
          ref={iframeRef}
          key={refreshKey}
          src={iframeSrc}
          title={`${platform} embed`}
          style={{
            width: '100%',
            height: '100%',
            border: 0,
            display: 'block',
          }}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          onLoad={() => onLoad?.()}
          onError={() => {
            setError('Failed to load embed')
            onError?.(new Error('Failed to load embed'))
          }}
        />
      </div>
    )
  }

  // Should not reach here, but just in case
  return null
}
