'use client'

import { useMemo, CSSProperties } from 'react'

interface GoogleSlidesConfig {
  presentation_id: string
  auto_advance?: boolean
  delay_ms?: number
  loop?: boolean
  start_slide?: number
}

interface GoogleSlidesRendererProps {
  config: GoogleSlidesConfig
}

function extractPresentationId(input: string): string {
  if (!input) return ''
  // Handle full URLs like https://docs.google.com/presentation/d/XXXX/edit
  const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return match[1]
  // Assume bare ID
  return input
}

export function GoogleSlidesRenderer({ config }: GoogleSlidesRendererProps) {
  const {
    presentation_id,
    auto_advance = true,
    delay_ms = 5000,
    loop = true,
    start_slide = 1,
  } = config

  const embedUrl = useMemo(() => {
    const id = extractPresentationId(presentation_id)
    if (!id) return ''
    const start = auto_advance ? 'true' : 'false'
    const lp = loop ? 'true' : 'false'
    let url = `https://docs.google.com/presentation/d/${id}/embed?start=${start}&loop=${lp}&delayms=${delay_ms}`
    if (start_slide > 1) {
      url += `&slide=${start_slide}`
    }
    return url
  }, [presentation_id, auto_advance, delay_ms, loop, start_slide])

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
  }

  const iframeStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    border: 'none',
  }

  if (!embedUrl) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        No presentation configured
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <iframe
        src={embedUrl}
        style={iframeStyle}
        allow="autoplay"
        allowFullScreen
        title="Google Slides"
      />
    </div>
  )
}
