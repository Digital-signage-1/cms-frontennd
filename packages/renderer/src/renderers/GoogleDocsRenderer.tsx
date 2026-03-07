'use client'

import { useMemo, useEffect, useRef, CSSProperties } from 'react'

interface GoogleDocsConfig {
  document_id: string
  auto_scroll?: boolean
  scroll_speed?: 'slow' | 'medium' | 'fast'
  zoom_level?: number
}

interface GoogleDocsRendererProps {
  config: GoogleDocsConfig
}

function extractDocumentId(input: string): string {
  if (!input) return ''
  const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return match[1]
  return input
}

const SCROLL_SPEEDS: Record<string, number> = {
  slow: 0.5,
  medium: 1,
  fast: 2,
}

export function GoogleDocsRenderer({ config }: GoogleDocsRendererProps) {
  const {
    document_id,
    auto_scroll = false,
    scroll_speed = 'medium',
    zoom_level = 100,
  } = config

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const embedUrl = useMemo(() => {
    const id = extractDocumentId(document_id)
    if (!id) return ''
    return `https://docs.google.com/document/d/${id}/preview`
  }, [document_id])

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    overflow: 'hidden',
  }

  const iframeStyle: CSSProperties = {
    width: `${(10000 / zoom_level)}%`,
    height: `${(10000 / zoom_level)}%`,
    border: 'none',
    transform: `scale(${zoom_level / 100})`,
    transformOrigin: 'top left',
  }

  if (!embedUrl) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', backgroundColor: '#0f172a' }}>
        No document configured
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        style={iframeStyle}
        title="Google Docs"
      />
    </div>
  )
}
