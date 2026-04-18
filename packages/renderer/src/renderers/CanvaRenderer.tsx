'use client'

import { useMemo, useState, useEffect, type CSSProperties } from 'react'
import type { RendererProps } from './registry'

export function CanvaRenderer({ config, contentUrl }: RendererProps) {
  const c = config as Record<string, unknown>
  const data = c._data as Record<string, unknown> | undefined
  const resource = data?.resource as Record<string, string> | undefined
  const [loaded, setLoaded] = useState(false)

  const publicUrl = (c.public_embed_url as string) || ''
  const embedFromApi = resource?.embed_url || resource?.view_url || ''
  const url = (publicUrl.trim() || embedFromApi || contentUrl || '').trim()

  const refreshMinutes = Number(c.refresh_interval) || 5
  const [key, setKey] = useState(0)
  useEffect(() => {
    if (!url) return
    const ms = Math.max(60_000, refreshMinutes * 60_000)
    const id = setInterval(() => setKey((k) => k + 1), ms)
    return () => clearInterval(id)
  }, [url, refreshMinutes])

  const fit = (c.fit_mode as string) || 'contain'
  const wrapperStyle: CSSProperties = useMemo(
    () => ({
      width: '100%',
      height: '100%',
      position: 'relative',
      background: '#0f0f0f',
      overflow: 'hidden',
      display: fit === 'stretch' ? 'block' : 'flex',
      alignItems: fit === 'stretch' ? undefined : 'center',
      justifyContent: fit === 'stretch' ? undefined : 'center',
    }),
    [fit],
  )

  const iframeStyle: CSSProperties =
    fit === 'stretch'
      ? { width: '100%', height: '100%', border: 0, display: 'block' }
      : {
          width: '100%',
          height: '100%',
          border: 0,
          maxWidth: '100%',
          maxHeight: '100%',
        }

  if (!url) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111',
          color: '#94a3b8',
          padding: 24,
          textAlign: 'center',
          fontSize: 14,
        }}
      >
        <div>
          <div style={{ marginBottom: 8 }}>No Canva URL available.</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            Reconnect your Canva account after the CMS update, or add a public Present / Website URL
            from Share in app settings.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapperStyle}>
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: '2px solid rgba(255,255,255,0.2)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'canvaSpin 0.7s linear infinite',
            }}
          />
        </div>
      )}
      <iframe
        key={key}
        title="Canva"
        src={url}
        style={{
          ...iframeStyle,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
        onLoad={() => setLoaded(true)}
        allow="fullscreen"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <style>{`@keyframes canvaSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
