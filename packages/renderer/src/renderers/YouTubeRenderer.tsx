'use client'

import { useEffect, useMemo, useRef } from 'react'

interface YouTubeRendererProps {
  config: {
    video_url?: string
    url?: string
    start_time?: number
    end_time?: number
    muted?: boolean
    loop?: boolean
    autoplay?: boolean
  }
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
}

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

function extractVideoId(url: string): string | null {
  const match = url.match(YOUTUBE_REGEX)
  return match ? match[1] : null
}

export function YouTubeRenderer({
  config,
  contentUrl,
  onError,
  onLoad,
}: YouTubeRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const rawUrl = config.video_url || config.url || contentUrl
  const videoId = rawUrl ? extractVideoId(rawUrl) : null
  const loop = config.loop !== false

  useEffect(() => {
    if (!videoId) onError?.(new Error('Invalid YouTube URL'))
  }, [videoId, onError])

  const embedUrl = useMemo(() => {
    if (!videoId) return null
    const params = new URLSearchParams()
    params.set('autoplay', '1')
    params.set('mute', '1')
    params.set('controls', '0')
    params.set('rel', '0')
    params.set('modestbranding', '1')
    params.set('playsinline', '1')
    params.set('iv_load_policy', '3')
    params.set('disablekb', '1')
    params.set('fs', '0')
    // playlist=VIDEO_ID is the key: enables native loop AND hides end-screen suggestions
    params.set('playlist', videoId)
    if (loop) params.set('loop', '1')
    if (config.start_time && config.start_time > 0) {
      params.set('start', String(Math.floor(config.start_time)))
    }
    if (config.end_time && config.end_time > 0) {
      params.set('end', String(Math.floor(config.end_time)))
    }
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
  }, [videoId, loop, config.start_time, config.end_time])

  if (!rawUrl || !videoId || !embedUrl) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1f2937', color: '#9ca3af' }}>
        <span style={{ fontSize: 14 }}>Invalid or missing YouTube URL</span>
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      src={embedUrl}
      title="YouTube video"
      width="100%"
      height="100%"
      frameBorder="0"
      allow="autoplay; encrypted-media"
      allowFullScreen
      onLoad={() => onLoad?.()}
      style={{ border: 0, display: 'block' }}
    />
  )
}
