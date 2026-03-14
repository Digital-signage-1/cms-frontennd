'use client'

import { useMemo, CSSProperties } from 'react'

interface GoogleMapsConfig {
  location: string
  zoom?: number
  map_type?: 'roadmap' | 'satellite' | 'terrain' | 'hybrid'
  show_traffic?: boolean
  api_key?: string
}

interface GoogleMapsRendererProps {
  config: GoogleMapsConfig
}

export function GoogleMapsRenderer({ config }: GoogleMapsRendererProps) {
  const {
    location,
    zoom = 14,
    map_type = 'roadmap',
    api_key,
  } = config

  const embedUrl = useMemo(() => {
    if (!location) return ''
    const encoded = encodeURIComponent(location)
    if (api_key) {
      return `https://www.google.com/maps/embed/v1/place?key=${api_key}&q=${encoded}&zoom=${zoom}&maptype=${map_type}`
    }
    // Fallback to basic embed without API key
    return `https://www.google.com/maps?q=${encoded}&z=${zoom}&output=embed`
  }, [location, zoom, map_type, api_key])

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a2e',
    overflow: 'hidden',
  }

  if (!location) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        No location configured
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <iframe
        src={embedUrl}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
        loading="lazy"
        title="Google Maps"
      />
    </div>
  )
}
