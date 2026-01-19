'use client'

import { useRef, useEffect, useState } from 'react'

interface VideoRendererProps {
  config: {
    url?: string
    autoplay?: boolean
    loop?: boolean
    muted?: boolean
    controls?: boolean
  }
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
  onEnded?: () => void
}

export function VideoRenderer({
  config,
  contentUrl,
  onError,
  onLoad,
  onEnded,
}: VideoRendererProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const videoUrl = config.url || contentUrl
  const autoplay = config.autoplay !== false
  const loop = config.loop !== false
  const muted = config.muted !== false
  const controls = config.controls === true

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlay = () => {
      setLoaded(true)
      onLoad?.()
      if (autoplay) {
        video.play().catch(() => {})
      }
    }

    const handleError = () => {
      setError(true)
      onError?.(new Error('Failed to load video'))
    }

    const handleEnded = () => {
      onEnded?.()
    }

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('ended', handleEnded)
    }
  }, [autoplay, onError, onLoad, onEnded])

  if (!videoUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
        <span className="text-sm">No video URL</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-900/20 text-red-400">
        <span className="text-sm">Failed to load video</span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-black">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline
        className="w-full h-full object-contain"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 300ms ease-in-out',
        }}
      />
    </div>
  )
}
