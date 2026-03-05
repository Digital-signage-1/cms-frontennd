'use client'

import { useState } from 'react'

interface MapsRendererProps {
  config: {
    location: string
    map_type?: 'roadmap' | 'satellite' | 'terrain' | 'hybrid'
    zoom_level?: number
    show_markers?: boolean
    show_traffic?: boolean
    theme?: 'standard' | 'dark' | 'retro'
  }
  onError?: (error: Error) => void
  onLoad?: () => void
}

export function MapsRenderer({ config, onError, onLoad }: MapsRendererProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const {
    location,
    map_type = 'roadmap',
    zoom_level = 14,
    theme = 'dark',
  } = config

  if (!location) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a2e', color: '#6B7280' }}>
        <span style={{ fontSize: 14 }}>No location configured</span>
      </div>
    )
  }

  // Use Google Maps embed (free, no API key required)
  const q = encodeURIComponent(location)
  const mapUrl = `https://maps.google.com/maps?q=${q}&t=${
    map_type === 'satellite' ? 'k' : map_type === 'terrain' ? 'p' : map_type === 'hybrid' ? 'h' : 'm'
  }&z=${zoom_level}&output=embed`

  // OpenStreetMap fallback (always free, no key)
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${q}&layer=mapnik`

  const handleLoad = () => {
    setLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    onError?.(new Error('Failed to load map'))
  }

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      backgroundColor: theme === 'dark' ? '#1a1a2e' : '#f0f0f0',
    }}>
      {!loaded && !error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      )}
      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
          <span style={{ fontSize: 14 }}>Failed to load map</span>
        </div>
      )}
      <iframe
        src={mapUrl}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%', height: '100%', border: 0,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 300ms',
          filter: theme === 'dark' ? 'invert(90%) hue-rotate(180deg) brightness(0.95) contrast(0.9)' : 'none',
        }}
        loading="eager"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
