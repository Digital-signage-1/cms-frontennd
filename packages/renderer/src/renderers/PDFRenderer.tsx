'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
// Use legacy build to avoid Object.defineProperty crash with webpack eval-source-map in dev
// See: https://github.com/mozilla/pdf.js/issues/20478
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

// Set worker source to CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

interface PDFRendererProps {
  config: {
    url?: string
    display_mode?: 'single' | 'cycle' | 'fit_all'
    page_duration?: number
    start_page?: number
    end_page?: number
    fit_mode?: 'width' | 'height' | 'page'
    zoom_level?: number
    show_page_numbers?: boolean
    background_color?: string
  }
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
  onEnded?: () => void
}

const SCROLL_SPEED = 60 // px/s for fit_all auto-scroll

export function PDFRenderer({
  config,
  contentUrl,
  onError,
  onLoad,
}: PDFRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map())
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  const pdfUrl = config.url || contentUrl
  const displayMode = config.display_mode || 'cycle'
  const pageDuration = config.page_duration || 10
  const startPage = Math.max(1, config.start_page || 1)
  const endPage = config.end_page || 0
  const fitMode = config.fit_mode || 'width'
  const zoomLevel = config.zoom_level || 1
  const showPageNumbers = config.show_page_numbers !== false
  const bgColor = config.background_color || '#000000'

  // Load PDF document
  useEffect(() => {
    if (!pdfUrl) return

    let cancelled = false
    setLoading(true)
    setError(false)

    const loadPdf = async () => {
      try {
        const doc = await pdfjsLib.getDocument(pdfUrl).promise
        if (cancelled) return
        setPdfDoc(doc)
        const numPages = doc.numPages
        setTotalPages(numPages)
        setCurrentPage(startPage)
        setLoading(false)
        onLoad?.()
      } catch (err) {
        if (cancelled) return
        setError(true)
        setLoading(false)
        onError?.(err instanceof Error ? err : new Error('Failed to load PDF'))
      }
    }

    loadPdf()
    return () => { cancelled = true }
  }, [pdfUrl, startPage])

  // Calculate effective page range
  const effectiveEnd = endPage > 0 ? Math.min(endPage, totalPages) : totalPages
  const pageCount = Math.max(0, effectiveEnd - startPage + 1)

  // Render a single page to canvas
  const renderPage = useCallback(async (pageNum: number, canvas: HTMLCanvasElement) => {
    if (!pdfDoc || !containerRef.current) return

    try {
      const page = await pdfDoc.getPage(pageNum)
      const container = containerRef.current
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      const unscaledViewport = page.getViewport({ scale: 1 })
      let scale: number

      if (fitMode === 'width') {
        scale = containerWidth / unscaledViewport.width
      } else if (fitMode === 'height') {
        scale = containerHeight / unscaledViewport.height
      } else {
        // 'page' - fit entire page
        scale = Math.min(
          containerWidth / unscaledViewport.width,
          containerHeight / unscaledViewport.height
        )
      }

      scale *= zoomLevel

      const viewport = page.getViewport({ scale })
      canvas.width = viewport.width
      canvas.height = viewport.height

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      await page.render({ canvasContext: ctx, viewport, canvas }).promise
    } catch {
      // Silently handle render errors for individual pages
    }
  }, [pdfDoc, fitMode, zoomLevel])

  // Render current page(s) based on display mode
  useEffect(() => {
    if (!pdfDoc || loading) return

    if (displayMode === 'fit_all') {
      // Render all pages in range
      for (let i = startPage; i <= effectiveEnd; i++) {
        const canvas = canvasRefs.current.get(i)
        if (canvas) renderPage(i, canvas)
      }
    } else {
      // Single page render
      const canvas = canvasRefs.current.get(currentPage)
      if (canvas) renderPage(currentPage, canvas)
    }
  }, [pdfDoc, currentPage, displayMode, loading, renderPage, startPage, effectiveEnd])

  // Cycle mode: auto-advance pages
  useEffect(() => {
    if (displayMode !== 'cycle' || !pdfDoc || loading || pageCount <= 1) return

    const timer = setInterval(() => {
      setFadingOut(true)
      setTimeout(() => {
        setCurrentPage(prev => {
          const next = prev >= effectiveEnd ? startPage : prev + 1
          return next
        })
        setFadingOut(false)
      }, 300)
    }, pageDuration * 1000)

    return () => clearInterval(timer)
  }, [displayMode, pdfDoc, loading, pageDuration, startPage, effectiveEnd, pageCount])

  // Fit-all mode: auto-scroll
  useEffect(() => {
    if (displayMode !== 'fit_all' || !containerRef.current || loading) return

    const container = containerRef.current
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
      container.scrollTop += SCROLL_SPEED * delta

      if (container.scrollTop >= scrollHeight) {
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
    pauseTimeout = setTimeout(() => {
      lastTime = performance.now()
      animId = requestAnimationFrame(scroll)
    }, 1500)

    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(pauseTimeout)
    }
  }, [displayMode, loading, totalPages])

  if (!pdfUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
        <span className="text-sm">No PDF URL</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-900/20 text-red-400">
        <span className="text-sm">Failed to load PDF</span>
      </div>
    )
  }

  if (displayMode === 'fit_all') {
    return (
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        <div className="flex flex-col items-center">
          {Array.from({ length: pageCount }, (_, i) => {
            const pageNum = startPage + i
            return (
              <canvas
                key={pageNum}
                ref={el => {
                  if (el) canvasRefs.current.set(pageNum, el)
                }}
                className="max-w-full"
                style={{ marginBottom: '4px' }}
              />
            )
          })}
        </div>
        {showPageNumbers && (
          <div className="fixed bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {pageCount} pages
          </div>
        )}
      </div>
    )
  }

  // Single or cycle mode
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
      style={{ backgroundColor: bgColor }}
    >
      <canvas
        ref={el => {
          if (el) canvasRefs.current.set(currentPage, el)
        }}
        className="max-w-full max-h-full"
        style={{
          opacity: fadingOut ? 0 : 1,
          transition: 'opacity 300ms ease-in-out',
        }}
      />
      {showPageNumbers && totalPages > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {currentPage} / {totalPages}
        </div>
      )}
    </div>
  )
}
