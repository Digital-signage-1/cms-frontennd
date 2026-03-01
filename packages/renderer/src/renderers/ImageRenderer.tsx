'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface ImageRendererProps {
  config: {
    url?: string
    fit?: string
    fit_mode?: string
    position?: string
    object_position?: string
    auto_scroll?: boolean
    scroll_speed?: 'slow' | 'medium' | 'fast'
  }
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
}

const SCROLL_SPEEDS: Record<string, number> = {
  slow: 30,
  medium: 60,
  fast: 120,
}

export function ImageRenderer({
  config,
  contentUrl,
  onError,
  onLoad,
}: ImageRendererProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const imageUrl = config.url || contentUrl
  const fit = config.fit_mode || config.fit || 'contain'
  const position = config.object_position || config.position || 'center'
  const autoScroll = config.auto_scroll === true
  const scrollSpeed = SCROLL_SPEEDS[config.scroll_speed || 'medium'] || SCROLL_SPEEDS.medium

  const handleLoad = useCallback(() => {
    setLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setError(true)
    onError?.(new Error('Failed to load image'))
  }, [onError])

  // Auto-scroll animation
  useEffect(() => {
    if (!autoScroll || !loaded || !containerRef.current) return

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
      container.scrollTop += scrollSpeed * delta

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

    // Start after a brief pause at top
    container.scrollTop = 0
    pauseTimeout = setTimeout(() => {
      lastTime = performance.now()
      animId = requestAnimationFrame(scroll)
    }, 1500)

    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(pauseTimeout)
    }
  }, [autoScroll, loaded, scrollSpeed])

  if (!imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
        <span className="text-sm">No image URL</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-900/20 text-red-400">
        <span className="text-sm">Failed to load image</span>
      </div>
    )
  }

  // Auto-scroll mode: render image at natural width inside scrollable container
  if (autoScroll) {
    return (
      <div
        ref={containerRef}
        className="relative w-full h-full bg-black overflow-hidden"
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <img
          src={imageUrl}
          alt=""
          onLoad={handleLoad}
          onError={handleError}
          className="w-full"
          style={{
            objectFit: 'cover',
            objectPosition: 'top',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 300ms ease-in-out',
          }}
        />
      </div>
    )
  }

  // Standard mode: fit image to container
  return (
    <div className="relative w-full h-full bg-black">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <img
        src={imageUrl}
        alt=""
        onLoad={handleLoad}
        onError={handleError}
        className="w-full h-full"
        style={{
          objectFit: fit as 'contain' | 'cover' | 'fill' | 'none',
          objectPosition: position,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 300ms ease-in-out',
        }}
      />
    </div>
  )
}
