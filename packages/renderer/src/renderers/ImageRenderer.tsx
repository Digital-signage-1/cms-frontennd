'use client'

import { useState } from 'react'

interface ImageRendererProps {
  config: {
    url?: string
    fit?: string
    position?: string
  }
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
}

export function ImageRenderer({
  config,
  contentUrl,
  onError,
  onLoad,
}: ImageRendererProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const imageUrl = config.url || contentUrl
  const fit = config.fit || 'contain'
  const position = config.position || 'center'

  const handleLoad = () => {
    setLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    onError?.(new Error('Failed to load image'))
  }

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
