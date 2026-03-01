'use client'

import { useState, useEffect } from 'react'

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
  const [loaded, setLoaded] = useState(false)

  const rawUrl = config.video_url || config.url || contentUrl
  const videoId = rawUrl ? extractVideoId(rawUrl) : null

  const autoplay = config.autoplay !== false
  const muted = config.muted !== false
  const loop = config.loop !== false

  useEffect(() => {
    if (!videoId) {
      onError?.(new Error('Invalid YouTube URL'))
    }
  }, [videoId, onError])

  if (!rawUrl || !videoId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
        <span className="text-sm">Invalid or missing YouTube URL</span>
      </div>
    )
  }

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: muted ? '1' : '0',
    loop: loop ? '1' : '0',
    controls: '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  })

  if (loop) {
    params.set('playlist', videoId)
  }
  if (config.start_time != null && config.start_time > 0) {
    params.set('start', String(Math.floor(config.start_time)))
  }
  if (config.end_time != null && config.end_time > 0) {
    params.set('end', String(Math.floor(config.end_time)))
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`

  return (
    <div className="relative w-full h-full bg-black">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <iframe
        src={embedUrl}
        title="YouTube video"
        allow="autoplay; encrypted-media"
        allowFullScreen
        onLoad={() => {
          setLoaded(true)
          onLoad?.()
        }}
        className="w-full h-full border-0"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 300ms ease-in-out',
        }}
      />
    </div>
  )
}
