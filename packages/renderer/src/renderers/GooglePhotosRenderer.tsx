'use client'

import { useState, useEffect, useRef, useMemo, CSSProperties } from 'react'

interface PhotoItem {
  url: string
  width?: number
  height?: number
  caption?: string
  filename?: string
}

interface GooglePhotosConfig {
  album_id: string
  transition?: 'fade' | 'slide' | 'zoom' | 'none'
  duration_seconds?: number
  shuffle?: boolean
  fit_mode?: 'cover' | 'contain'
  show_caption?: boolean
  refresh_interval?: number
  _data?: { photos: PhotoItem[] }
}

interface GooglePhotosRendererProps {
  config: GooglePhotosConfig
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function GooglePhotosRenderer({ config }: GooglePhotosRendererProps) {
  const {
    transition = 'fade',
    duration_seconds = 5,
    shuffle = false,
    fit_mode = 'cover',
    show_caption = false,
    _data,
  } = config

  const rawPhotos = _data?.photos || []
  const photos = useMemo(
    () => (shuffle ? shuffleArray(rawPhotos) : rawPhotos),
    [rawPhotos, shuffle]
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (photos.length <= 1) return
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % photos.length)
        setIsTransitioning(false)
      }, 600)
    }, duration_seconds * 1000)
    return () => clearInterval(interval)
  }, [photos.length, duration_seconds])

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  }

  if (!photos.length) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        No photos available
      </div>
    )
  }

  const photo = photos[currentIndex]
  const getTransitionStyle = (): CSSProperties => {
    switch (transition) {
      case 'fade':
        return { opacity: isTransitioning ? 0 : 1, transition: 'opacity 0.6s ease-in-out' }
      case 'zoom':
        return {
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'scale(1.1)' : 'scale(1)',
          transition: 'opacity 0.6s ease-in-out, transform 0.6s ease-in-out',
        }
      case 'slide':
        return {
          transform: isTransitioning ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.6s ease-in-out',
        }
      default:
        return {}
    }
  }

  return (
    <div style={containerStyle}>
      <img
        key={currentIndex}
        src={photo.url}
        alt={photo.caption || photo.filename || ''}
        style={{
          width: '100%',
          height: '100%',
          objectFit: fit_mode,
          position: 'absolute',
          top: 0,
          left: 0,
          ...getTransitionStyle(),
        }}
      />
      {show_caption && photo.caption && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1rem',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          color: '#fff',
          fontSize: '0.875rem',
        }}>
          {photo.caption}
        </div>
      )}
    </div>
  )
}
