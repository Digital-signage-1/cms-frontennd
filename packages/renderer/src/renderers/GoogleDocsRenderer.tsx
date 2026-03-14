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

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)

  const embedUrl = useMemo(() => {
    const id = extractDocumentId(document_id)
    if (!id) return ''
    return `https://docs.google.com/document/d/${id}/preview`
  }, [document_id])

  // Auto-scroll: we scroll the outer container that wraps the tall iframe
  useEffect(() => {
    if (!auto_scroll || !scrollContainerRef.current) return

    const el = scrollContainerRef.current
    const speed = SCROLL_SPEEDS[scroll_speed] || 1

    const scroll = () => {
      el.scrollTop += speed
      // Reset to top when we've scrolled to the bottom
      if (el.scrollTop >= el.scrollHeight - el.clientHeight - 1) {
        // Pause at bottom for 3 seconds, then reset
        setTimeout(() => {
          el.scrollTop = 0
        }, 3000)
      }
      animFrameRef.current = requestAnimationFrame(scroll)
    }

    // Wait for iframe to load before starting scroll
    const timer = setTimeout(() => {
      animFrameRef.current = requestAnimationFrame(scroll)
    }, 2000)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [auto_scroll, scroll_speed])

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    overflow: 'hidden',
  }

  // The iframe is made tall (5x viewport) so the outer container can scroll it
  const iframeWrapperStyle: CSSProperties = auto_scroll
    ? { width: '100%', height: '100%', overflow: 'hidden' }
    : { width: '100%', height: '100%', overflow: 'hidden' }

  const iframeStyle: CSSProperties = {
    width: `${(10000 / zoom_level)}%`,
    height: auto_scroll ? '500%' : `${(10000 / zoom_level)}%`,
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
      <div ref={scrollContainerRef} style={{ ...iframeWrapperStyle, overflowY: auto_scroll ? 'scroll' : 'hidden', scrollbarWidth: 'none' }}>
        <iframe
          src={embedUrl}
          style={iframeStyle}
          title="Google Docs"
        />
      </div>
    </div>
  )
}
