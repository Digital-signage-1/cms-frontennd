'use client'

import { useRef, useEffect, useState } from 'react'

interface DocumentConfig {
  url?: string
  auto_scroll?: boolean
  scroll_speed?: 'slow' | 'medium' | 'fast'
  background_color?: string
  text_color?: string
  font_size?: number
  padding?: number
}

interface DocumentRendererProps {
  config: DocumentConfig & Record<string, any>
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
  onEnded?: () => void
}

const SCROLL_SPEEDS: Record<string, number> = {
  slow: 30,
  medium: 60,
  fast: 120,
}

export function DocumentRenderer({
  config,
  contentUrl,
  onError,
  onLoad,
}: DocumentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const docUrl = config.url || contentUrl
  const autoScroll = config.auto_scroll !== false
  const scrollSpeed = SCROLL_SPEEDS[config.scroll_speed || 'medium'] || SCROLL_SPEEDS.medium
  const bgColor = config.background_color || '#ffffff'
  const textColor = config.text_color || '#1a1a1a'
  const fontSize = config.font_size || 16
  const padding = config.padding || 32

  // Fetch and convert .docx to HTML
  useEffect(() => {
    if (!docUrl) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(false)
    setErrorMessage(null)
    setHtml(null)

    const load = async () => {
      try {
        const res = await fetch(docUrl)
        if (cancelled) return

        if (res.status === 503) {
          setError(true)
          setErrorMessage('Content is still processing. Try again in a moment.')
          setLoading(false)
          return
        }

        if (!res.ok) {
          setError(true)
          setErrorMessage(`Failed to load document (${res.status})`)
          setLoading(false)
          onError?.(new Error(`Failed to load document: ${res.status}`))
          return
        }

        const arrayBuffer = await res.arrayBuffer()
        if (cancelled) return

        const mammoth = await import('mammoth')
        const result = await mammoth.default.convertToHtml(
          { arrayBuffer },
          {
            // Convert images to inline base64 data URIs
            convertImage: mammoth.default.images.imgElement(function (image: any) {
              return image.read('base64').then(function (imageBuffer: string) {
                return { src: `data:${image.contentType};base64,${imageBuffer}` }
              })
            }),
          }
        )

        if (cancelled) return

        setHtml(result.value)
        setLoading(false)
        onLoad?.()
      } catch (err) {
        if (cancelled) return
        setError(true)
        setErrorMessage('Failed to render document')
        setLoading(false)
        onError?.(err instanceof Error ? err : new Error('Failed to render document'))
      }
    }

    load()
    return () => { cancelled = true }
  }, [docUrl])

  // Auto-scroll for long documents
  useEffect(() => {
    if (!autoScroll || !containerRef.current || loading || !html) return

    const container = containerRef.current
    const cleanupRef = { current: () => {} }

    // Delay to let content render before measuring
    const startDelay = setTimeout(() => {
      const scrollHeight = container.scrollHeight - container.clientHeight
      if (scrollHeight <= 0) return

      let animId: number
      let lastTime = performance.now()
      let paused = false
      let pauseTimeout: ReturnType<typeof setTimeout>

      const scroll = (time: number) => {
        if (paused) {
          animId = requestAnimationFrame(scroll)
          return
        }

        const delta = (time - lastTime) / 1000
        lastTime = time
        container.scrollTop += scrollSpeed * delta

        if (container.scrollTop >= container.scrollHeight - container.clientHeight) {
          paused = true
          pauseTimeout = setTimeout(() => {
            container.scrollTop = 0
            paused = true
            pauseTimeout = setTimeout(() => { paused = false }, 1500)
          }, 2000)
        }

        animId = requestAnimationFrame(scroll)
      }

      // Initial pause at top
      container.scrollTop = 0
      pauseTimeout = setTimeout(() => {
        lastTime = performance.now()
        animId = requestAnimationFrame(scroll)
      }, 1500)

      cleanupRef.current = () => {
        cancelAnimationFrame(animId)
        clearTimeout(pauseTimeout)
      }
    }, 500)

    return () => {
      clearTimeout(startDelay)
      cleanupRef.current()
    }
  }, [autoScroll, loading, scrollSpeed, html])

  // No URL provided
  if (!docUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
        <span className="text-sm">No document URL</span>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-3"
        style={{ backgroundColor: bgColor }}
      >
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        <span className="text-sm" style={{ color: textColor, opacity: 0.5 }}>
          Loading document...
        </span>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-red-900/10 text-red-400 text-center px-4 gap-3">
        <svg className="w-12 h-12 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span className="text-sm">{errorMessage || 'Failed to load document'}</span>
        {docUrl && (
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline"
          >
            Download file instead
          </a>
        )}
      </div>
    )
  }

  // Rendered document
  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="docx-content"
        style={{
          color: textColor,
          fontSize: `${fontSize}px`,
          padding: `${padding}px`,
          lineHeight: 1.6,
        }}
        dangerouslySetInnerHTML={{ __html: html || '' }}
      />
      <style>{`
        .docx-content h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 0.67em 0;
        }
        .docx-content h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 0.75em 0;
        }
        .docx-content h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 0.8em 0;
        }
        .docx-content h4 {
          font-size: 1.1em;
          font-weight: 600;
          margin: 0.85em 0;
        }
        .docx-content p {
          margin: 0.5em 0;
        }
        .docx-content ul, .docx-content ol {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }
        .docx-content li {
          margin: 0.25em 0;
        }
        .docx-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        .docx-content th, .docx-content td {
          border: 1px solid currentColor;
          padding: 0.5em 0.75em;
          opacity: 0.8;
          text-align: left;
        }
        .docx-content th {
          font-weight: 600;
          opacity: 1;
        }
        .docx-content img {
          max-width: 100%;
          height: auto;
          margin: 0.5em 0;
        }
        .docx-content strong, .docx-content b {
          font-weight: 700;
        }
        .docx-content em, .docx-content i {
          font-style: italic;
        }
        .docx-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .docx-content blockquote {
          border-left: 3px solid currentColor;
          margin: 0.5em 0;
          padding: 0.25em 1em;
          opacity: 0.85;
        }
      `}</style>
    </div>
  )
}
