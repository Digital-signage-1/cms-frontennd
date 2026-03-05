'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

interface SlideshowConfig {
  image_urls?: string[]
  content_ids?: string[]
  duration_per_slide?: number
  transition?: 'fade' | 'slide_left' | 'slide_right' | 'slide_up' | 'slide_down' | 'zoom_in' | 'zoom_out' | 'flip' | 'none'
  transition_duration?: number
  fit_mode?: 'contain' | 'cover' | 'stretch'
  shuffle?: boolean
  loop?: boolean
  enable_ken_burns?: boolean
  background_color?: string
  show_progress?: boolean
  progress_style?: 'dots' | 'bar' | 'numbers'
}

interface SlideshowRendererProps {
  config: SlideshowConfig
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
  onEnded?: () => void
}

/** Fisher-Yates shuffle (returns new array). */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Ken Burns presets: each slide gets a random start/end transform
const KB_PRESETS = [
  { from: 'scale(1) translate(0%, 0%)', to: 'scale(1.15) translate(-2%, -1%)' },
  { from: 'scale(1.1) translate(-1%, 0%)', to: 'scale(1) translate(1%, 1%)' },
  { from: 'scale(1) translate(0%, 0%)', to: 'scale(1.12) translate(2%, -2%)' },
  { from: 'scale(1.15) translate(1%, 1%)', to: 'scale(1) translate(0%, 0%)' },
  { from: 'scale(1) translate(-1%, 1%)', to: 'scale(1.1) translate(1%, -1%)' },
]

export function SlideshowRenderer({
  config,
  onError,
  onLoad,
  onEnded,
}: SlideshowRendererProps) {
  const {
    image_urls = [],
    duration_per_slide = 10,
    transition = 'fade',
    transition_duration = 500,
    fit_mode = 'contain',
    shuffle = false,
    loop = true,
    enable_ken_burns = false,
    background_color = '#000000',
    show_progress = false,
    progress_style = 'dots',
  } = config

  // Build ordered URL list (shuffle once on mount if needed)
  const urls = useMemo(() => {
    if (!image_urls || image_urls.length === 0) return []
    return shuffle ? shuffleArray(image_urls) : [...image_urls]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image_urls.join(','), shuffle])

  const totalSlides = urls.length
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set())
  const [ended, setEnded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transitionMs = transition === 'none' ? 0 : transition_duration

  // Preload an image by index
  const preload = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= totalSlides) return
      if (loadedImages.has(idx) || failedImages.has(idx)) return
      const img = new Image()
      img.onload = () =>
        setLoadedImages((prev) => new Set(prev).add(idx))
      img.onerror = () =>
        setFailedImages((prev) => new Set(prev).add(idx))
      img.src = urls[idx]
    },
    [urls, totalSlides, loadedImages, failedImages],
  )

  // Preload current and next images
  useEffect(() => {
    preload(currentIndex)
    preload(currentIndex + 1)
  }, [currentIndex, preload])

  // Notify parent once first image loads
  useEffect(() => {
    if (loadedImages.has(0)) {
      onLoad?.()
    }
  }, [loadedImages, onLoad])

  // Advance to next slide on timer
  useEffect(() => {
    if (totalSlides <= 1 || ended) return

    timerRef.current = setTimeout(() => {
      const nextIndex = currentIndex + 1

      if (nextIndex >= totalSlides) {
        if (loop) {
          setIsTransitioning(true)
          setTimeout(() => {
            setCurrentIndex(0)
            setIsTransitioning(false)
          }, transitionMs)
        } else {
          setEnded(true)
          onEnded?.()
        }
        return
      }

      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(nextIndex)
        setIsTransitioning(false)
      }, transitionMs)
    }, duration_per_slide * 1000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentIndex, totalSlides, duration_per_slide, loop, ended, transitionMs, onEnded])

  // ---------- Transition style helpers ----------

  const getSlideStyle = (idx: number, isCurrent: boolean): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      transition: `all ${transitionMs}ms ease-in-out`,
    }

    if (transition === 'fade' || transition === 'none') {
      return {
        ...base,
        opacity: isCurrent && !isTransitioning ? 1 : 0,
        zIndex: isCurrent ? 2 : 1,
      }
    }

    if (transition === 'slide_left') {
      return {
        ...base,
        transform: isCurrent && !isTransitioning ? 'translateX(0)' : 'translateX(-100%)',
        opacity: 1,
        zIndex: isCurrent ? 2 : 1,
      }
    }

    if (transition === 'slide_right') {
      return {
        ...base,
        transform: isCurrent && !isTransitioning ? 'translateX(0)' : 'translateX(100%)',
        opacity: 1,
        zIndex: isCurrent ? 2 : 1,
      }
    }

    if (transition === 'slide_up') {
      return {
        ...base,
        transform: isCurrent && !isTransitioning ? 'translateY(0)' : 'translateY(-100%)',
        opacity: 1,
        zIndex: isCurrent ? 2 : 1,
      }
    }

    if (transition === 'slide_down') {
      return {
        ...base,
        transform: isCurrent && !isTransitioning ? 'translateY(0)' : 'translateY(100%)',
        opacity: 1,
        zIndex: isCurrent ? 2 : 1,
      }
    }

    if (transition === 'zoom_in') {
      return {
        ...base,
        transform: isCurrent && !isTransitioning ? 'scale(1)' : 'scale(0.5)',
        opacity: isCurrent && !isTransitioning ? 1 : 0,
        zIndex: isCurrent ? 2 : 1,
      }
    }

    if (transition === 'zoom_out') {
      return {
        ...base,
        transform: isCurrent && !isTransitioning ? 'scale(1)' : 'scale(1.5)',
        opacity: isCurrent && !isTransitioning ? 1 : 0,
        zIndex: isCurrent ? 2 : 1,
      }
    }

    if (transition === 'flip') {
      return {
        ...base,
        transform: isCurrent && !isTransitioning ? 'rotateY(0deg)' : 'rotateY(90deg)',
        opacity: isCurrent && !isTransitioning ? 1 : 0,
        zIndex: isCurrent ? 2 : 1,
        backfaceVisibility: 'hidden',
      }
    }

    // fallback
    return {
      ...base,
      opacity: isCurrent ? 1 : 0,
      zIndex: isCurrent ? 2 : 1,
    }
  }

  const getObjectFit = (): React.CSSProperties['objectFit'] => {
    if (fit_mode === 'stretch') return 'fill'
    return fit_mode // 'contain' | 'cover'
  }

  const getKenBurnsStyle = (idx: number): React.CSSProperties => {
    if (!enable_ken_burns) return {}
    const preset = KB_PRESETS[idx % KB_PRESETS.length]
    return {
      animation: `kenburns-${idx % KB_PRESETS.length} ${duration_per_slide}s ease-in-out forwards`,
    }
  }

  // ---------- Empty / error states ----------

  if (totalSlides === 0) {
    return (
      <div
        className="w-full h-full flex items-center justify-center text-gray-400"
        style={{ backgroundColor: background_color }}
      >
        <span className="text-sm">No images configured</span>
      </div>
    )
  }

  // Determine which indices to render (current + next for transition)
  const nextIndex = currentIndex + 1 < totalSlides ? currentIndex + 1 : (loop ? 0 : -1)
  const indicesToRender = [currentIndex]
  if (nextIndex >= 0 && nextIndex !== currentIndex) {
    indicesToRender.push(nextIndex)
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ backgroundColor: background_color, perspective: transition === 'flip' ? '1000px' : undefined }}
    >
      {/* Ken Burns keyframes */}
      {enable_ken_burns && (
        <style>{`
          ${KB_PRESETS.map(
            (p, i) => `
            @keyframes kenburns-${i} {
              0% { transform: ${p.from}; }
              100% { transform: ${p.to}; }
            }`
          ).join('\n')}
        `}</style>
      )}

      {/* Slides */}
      {indicesToRender.map((idx) => {
        const isCurrent = idx === currentIndex
        const url = urls[idx]
        const hasFailed = failedImages.has(idx)

        return (
          <div key={`slide-${idx}-${url}`} style={getSlideStyle(idx, isCurrent)}>
            {hasFailed ? (
              <div className="w-full h-full flex items-center justify-center bg-red-900/20 text-red-400">
                <span className="text-sm">Failed to load image</span>
              </div>
            ) : (
              <div className="w-full h-full overflow-hidden">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full"
                  style={{
                    objectFit: getObjectFit(),
                    objectPosition: 'center',
                    ...(enable_ken_burns && isCurrent ? getKenBurnsStyle(idx) : {}),
                  }}
                  onLoad={() =>
                    setLoadedImages((prev) => new Set(prev).add(idx))
                  }
                  onError={() => {
                    setFailedImages((prev) => new Set(prev).add(idx))
                    onError?.(new Error(`Failed to load slide image ${idx}`))
                  }}
                />
              </div>
            )}
          </div>
        )
      })}

      {/* Loading spinner for first image */}
      {!loadedImages.has(currentIndex) && !failedImages.has(currentIndex) && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Progress indicator */}
      {show_progress && totalSlides > 1 && (
        <ProgressIndicator
          style={progress_style}
          currentIndex={currentIndex}
          totalSlides={totalSlides}
          durationPerSlide={duration_per_slide}
          isTransitioning={isTransitioning}
        />
      )}
    </div>
  )
}

// ---------- Progress Indicator ----------

interface ProgressIndicatorProps {
  style: 'dots' | 'bar' | 'numbers'
  currentIndex: number
  totalSlides: number
  durationPerSlide: number
  isTransitioning: boolean
}

function ProgressIndicator({
  style,
  currentIndex,
  totalSlides,
  durationPerSlide,
  isTransitioning,
}: ProgressIndicatorProps) {
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef(Date.now())

  // Reset progress when slide changes
  useEffect(() => {
    startTimeRef.current = Date.now()
    setProgress(0)

    if (style !== 'bar') return

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const pct = Math.min(elapsed / (durationPerSlide * 1000), 1)
      setProgress(pct)
    }, 50)

    return () => clearInterval(interval)
  }, [currentIndex, durationPerSlide, style])

  if (style === 'dots') {
    return (
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
        {Array.from({ length: totalSlides }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'bg-white scale-125'
                : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    )
  }

  if (style === 'bar') {
    return (
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <div
          className="h-full bg-white"
          style={{
            width: `${progress * 100}%`,
            transition: isTransitioning ? 'none' : 'width 50ms linear',
          }}
        />
      </div>
    )
  }

  if (style === 'numbers') {
    return (
      <div className="absolute bottom-3 right-4 z-20 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {currentIndex + 1} / {totalSlides}
      </div>
    )
  }

  return null
}
